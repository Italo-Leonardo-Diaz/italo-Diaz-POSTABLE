import db from '../config/db';

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
    const client = await db.connect(); 

    try {
      await client.query('BEGIN'); 

      const query = `
        INSERT INTO likes (postId, userId)
        VALUES ($1, $2)
        ON CONFLICT (postId, userId) DO NOTHING
        RETURNING *;
      `;
      const result = await client.query(query, [postId, userId]);

      if (result.rows.length === 0) {
        throw new CustomError('DUPLICATE_LIKE', 'El like ya existe');
      }

      await client.query('COMMIT'); 

      return { message: 'Like agregado', like: result.rows[0] };
    } catch (error: unknown) {
      await client.query('ROLLBACK'); 

      if (error instanceof CustomError) {
        console.error('Error al crear el like:', error.message);
        throw error; 
      }

      if (error instanceof Error) {
        console.error('Error al crear el like:', error.message);
        throw new Error(error.message);
      }

      console.error('Error desconocido al crear el like:', error);
      throw new Error('Error al crear el like');
    } finally {
      client.release(); 
    }
  },

  remove: async ({ postId, userId }: { postId: string, userId: string }) => {
    const client = await db.connect(); 

    try {
      await client.query('BEGIN'); 

      const query = 'DELETE FROM likes WHERE postId = $1 AND userId = $2 RETURNING *';
      const result = await client.query(query, [postId, userId]);

      if (result.rows.length === 0) {
        throw new CustomError('LIKE_NOT_FOUND', 'Like no encontrado');
      }

      await client.query('COMMIT'); 

      return { message: 'Like eliminado', like: result.rows[0] };
    } catch (error: unknown) {
      await client.query('ROLLBACK'); 

      if (error instanceof CustomError) {
        console.error('Error al eliminar el like:', error.message);
        throw error; 
      }

      if (error instanceof Error) {
        console.error('Error al eliminar el like:', error.message);
        throw new Error(error.message);
      }

      console.error('Error desconocido al eliminar el like:', error);
      throw new Error('Error al eliminar el like');
    } finally {
      client.release(); 
    }
  },
};

