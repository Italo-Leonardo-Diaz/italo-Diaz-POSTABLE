import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import userRoutes from './routers/userRoutes';
import authRoutes from './routers/authRoutes';
import db from './config/db';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import winston, { transports, format } from 'winston';  // Usamos winston para mejorar los logs
import 'winston-daily-rotate-file';

// Cargar variables de entorno
dotenv.config();

// Configuración de logs con Winston (incluye rotación de logs)
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

// Crear instancia de la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear el cuerpo de la solicitud como JSON
app.use(express.json());

// Configuración de CORS (permitiendo múltiples orígenes si es necesario)
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

// Middleware de seguridad
app.use(helmet());

// Middleware para logs con Morgan
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Middleware de validación de datos (ejemplo básico)
app.use((req: Request, res: Response, next: NextFunction) => {
  if (!req.body.username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido.' });
  }
  next();
});

// Rutas con control de versiones (V1)
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);

// Conexión a la base de datos con manejo de reconexión
let attempts = 0;
const maxAttempts = 5;  // Intentos máximos de reconexión
const dbConnectionTimeout = 5000;  // Timeout entre reintentos

const connectDb = async () => {
  try {
    await db.query('SELECT NOW()');  // Verifica si la base de datos está disponible
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
      setTimeout(connectDb, dbConnectionTimeout); // Reintenta después de 5 segundos
    } else {
      logger.error('No se pudo conectar a la base de datos después de varios intentos.');
      process.exit(1);  // Salir después de varios intentos fallidos
    }
  }
};

// Intentamos conectar a la base de datos al iniciar el servidor
connectDb();

// Middleware de manejo de errores
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  // Manejo de errores específicos
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

// Iniciar el servidor
app.listen(PORT, () => {
  logger.info(`Servidor corriendo en el puerto ${PORT}`);
});
