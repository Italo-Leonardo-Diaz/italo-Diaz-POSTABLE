import db from '../config/db';

// Definimos una clase de error personalizada
class CustomError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'CustomError';
  }
}

export const likeModel = {
  create: async ({ postId, userId }: { postId: string, userId: string }) => {
    const client = await db.connect(); // Conectamos al cliente de la base de datos

    try {
      await client.query('BEGIN'); // Iniciamos una transacción

      // Utilizamos ON CONFLICT para evitar duplicados
      const query = `
        INSERT INTO likes (postId, userId)
        VALUES ($1, $2)
        ON CONFLICT (postId, userId) DO NOTHING
        RETURNING *;
      `;
      const result = await client.query(query, [postId, userId]);

      if (result.rows.length === 0) {
        // Si no se insertó ningún like (conflicto), lanzamos un error
        throw new CustomError('DUPLICATE_LIKE', 'El like ya existe');
      }

      await client.query('COMMIT'); // Confirmamos la transacción

      return { message: 'Like agregado', like: result.rows[0] };
    } catch (error: unknown) {
      await client.query('ROLLBACK'); // Si hay un error, revertimos la transacción

      // Comprobamos si el error es una instancia de CustomError
      if (error instanceof CustomError) {
        console.error('Error al crear el like:', error.message);
        throw error; // Lanzamos el error personalizado
      }

      // Si el error es un objeto estándar de JavaScript Error
      if (error instanceof Error) {
        console.error('Error al crear el like:', error.message);
        throw new Error(error.message);
      }

      // Manejo de errores desconocidos
      console.error('Error desconocido al crear el like:', error);
      throw new Error('Error al crear el like');
    } finally {
      client.release(); // Liberamos el cliente de la base de datos
    }
  },

  remove: async ({ postId, userId }: { postId: string, userId: string }) => {
    const client = await db.connect(); // Conectamos al cliente de la base de datos

    try {
      await client.query('BEGIN'); // Iniciamos una transacción

      const query = 'DELETE FROM likes WHERE postId = $1 AND userId = $2 RETURNING *';
      const result = await client.query(query, [postId, userId]);

      if (result.rows.length === 0) {
        // Si no se encontró el like a eliminar, lanzamos un error personalizado
        throw new CustomError('LIKE_NOT_FOUND', 'Like no encontrado');
      }

      await client.query('COMMIT'); // Confirmamos la transacción

      return { message: 'Like eliminado', like: result.rows[0] };
    } catch (error: unknown) {
      await client.query('ROLLBACK'); // Si hay un error, revertimos la transacción

      // Comprobamos si el error es una instancia de CustomError
      if (error instanceof CustomError) {
        console.error('Error al eliminar el like:', error.message);
        throw error; // Lanzamos el error personalizado
      }

      // Si el error es un objeto estándar de JavaScript Error
      if (error instanceof Error) {
        console.error('Error al eliminar el like:', error.message);
        throw new Error(error.message);
      }

      // Manejo de errores desconocidos
      console.error('Error desconocido al eliminar el like:', error);
      throw new Error('Error al eliminar el like');
    } finally {
      client.release(); // Liberamos el cliente de la base de datos
    }
  },
};

// Asegúrate de tener los índices en la base de datos para optimizar las consultas
// CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(postId, userId);
