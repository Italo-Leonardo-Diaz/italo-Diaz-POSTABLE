import fs from 'fs';
import { Client } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const migrate = async () => {
  try {
    await client.connect();
    console.log('Conectado a la base de datos con éxito');

    const createMigrationsTable = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(createMigrationsTable);
    console.log('Tabla migrations creada (si no existía)');

    const migrations = [
      '/home/dark/codeable-advanced/node/postable-Italo-Leonardo-Diaz/src/migrations/create_users_table.sql',
      '/home/dark/codeable-advanced/node/postable-Italo-Leonardo-Diaz/src/migrations/create_posts_table.sql',
      '/home/dark/codeable-advanced/node/postable-Italo-Leonardo-Diaz/src/migrations/create_likes_table.sql',
    ];

    for (const migrationPath of migrations) {
      const sql = fs.readFileSync(migrationPath, 'utf-8');

      const migrationExecuted = await client.query(
        'SELECT * FROM migrations WHERE name = $1', [migrationPath]
      );

      if (migrationExecuted.rows.length > 0) {
        console.log(`La migración ${migrationPath} ya ha sido ejecutada. Saltando...`);
        continue;
      }

      console.log(`Ejecutando migración: ${migrationPath}`);

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');

      await client.query('INSERT INTO migrations (name) VALUES ($1)', [migrationPath]);
    }

    console.log('Migraciones completadas con éxito');
  } catch (err) {
    console.error('Error al ejecutar migraciones:', err);
    if (err instanceof Error) {
      console.error('Mensaje de error:', err.message);
    }
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Error al hacer rollback:', rollbackErr);
    }
  } finally {
    try {
      await client.end();
      console.log('Conexión cerrada con éxito');
    } catch (err) {
      console.error('Error al cerrar la conexión a la base de datos:', err);
    }
  }
};

migrate();
