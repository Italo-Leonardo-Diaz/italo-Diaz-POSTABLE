import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import userRoutes from './routers/userRoutes';
import authRoutes from './routers/authRoutes';
import db from './config/db';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import winston, { transports, format } from 'winston';  
import 'winston-daily-rotate-file';

dotenv.config();

const dailyRotateFileTransport = new transports.DailyRotateFile({
  filename: 'logs/server-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
});

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }: winston.Logform.TransformableInfo) => {
      if (typeof message !== 'string') {
        message = String(message);
      }
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    dailyRotateFileTransport
  ],
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin || origin === 'https://tudominio.com' || origin === 'https://otrodominio.com') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
};
app.use(cors(corsOptions));

app.use(helmet());

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.body.username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido.' });
  }
  next();
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);

let attempts = 0;
const maxAttempts = 5;  
const dbConnectionTimeout = 5000;  

const connectDb = async () => {
  try {
    await db.query('SELECT NOW()');  
    logger.info('Conexión a la base de datos exitosa');
  } catch (err) {
    attempts += 1;
    if (err instanceof Error) {
      logger.error(`Error de conexión a la base de datos: ${err.message}`);
    } else {
      logger.error('Error desconocido de conexión a la base de datos');
    }

    if (attempts < maxAttempts) {
      logger.info('Reintentando conexión a la base de datos...');
      setTimeout(connectDb, dbConnectionTimeout); 
    } else {
      logger.error('No se pudo conectar a la base de datos después de varios intentos.');
      process.exit(1);  
    }
  }
};

connectDb();

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error && err.message.includes('ECONNREFUSED')) {
    logger.error('No se puede conectar a la base de datos');
    return res.status(500).json({
      message: 'No se puede conectar a la base de datos, por favor intente más tarde.'
    });
  }

  if (err instanceof Error) {
    logger.error(`Error interno: ${err.stack}`);
  } else {
    logger.error('Error desconocido');
  }

  res.status(500).json({ message: 'Algo salió mal en el servidor.' });
});

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en el puerto ${PORT}`);
});
