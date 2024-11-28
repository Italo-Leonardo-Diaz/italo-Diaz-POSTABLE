import dotenv from 'dotenv';

dotenv.config(); 

const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL']; 

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} no está definido en el archivo .env`);
  }
});
