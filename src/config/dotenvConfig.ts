import dotenv from 'dotenv';

dotenv.config(); // Carga las variables del archivo .env

// Verificar que las variables críticas estén definidas
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL']; // Ajuste para Render: usamos DATABASE_URL en lugar de múltiples variables

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} no está definido en el archivo .env`);
  }
});
