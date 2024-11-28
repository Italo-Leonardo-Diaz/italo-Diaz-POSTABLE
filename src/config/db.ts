import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en el archivo .env');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false, 
  },
});

const connectDb = async () => {
  try {
    const client = await pool.connect(); 
    console.log('Conectado a la base de datos con éxito');
    client.release(); 
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1); 
  }
};

if (process.env.NODE_ENV === 'development') {
  connectDb(); 
}

const getDb = () => pool; 

export { getDb };
export default pool;
