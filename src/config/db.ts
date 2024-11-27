import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar las variables de entorno
dotenv.config();

// Validación de la variable de entorno necesaria
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en el archivo .env');
}

// Crear la instancia del pool de conexiones a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Usar la URL completa
  ssl: {
    rejectUnauthorized: false, // Requerido para la conexión en Render
  },
});

// Función para verificar la conexión a la base de datos (opcional)
const connectDb = async () => {
  try {
    const client = await pool.connect(); // Conectar al pool de base de datos
    console.log('Conectado a la base de datos con éxito');
    client.release(); // Liberar el cliente una vez que no sea necesario
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    process.exit(1); // Terminar el proceso si no se puede conectar
  }
};

// Verificar la conexión solo si estamos en un entorno de desarrollo (opcional)
if (process.env.NODE_ENV === 'development') {
  connectDb(); // Llamada para verificar la conexión solo en desarrollo
}

// Función para obtener el pool de conexiones
const getDb = () => pool; // Retorna la instancia del pool para usarla en otras partes del proyecto

// Exportar tanto getDb como pool
export { getDb };
export default pool;
