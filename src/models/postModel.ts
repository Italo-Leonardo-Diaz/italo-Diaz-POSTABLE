import db from '../config/db'; 

class CustomError extends Error {
  code: string;
  statusCode: number; 

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.name = 'CustomError';
    this.statusCode = statusCode;
  }
}

export interface Post {
  _id: string; 
  title: string;
  content: string;
  userId: string; 
  createdAt: Date;
  updatedAt: Date; 
}

export const postModel = {
  create: async (postData: { title: string, content: string, userId: string }) => {
    const { title, content, userId } = postData;

    if (!title || !content || !userId) {
      throw new CustomError('INVALID_INPUT', 'El título, contenido y userId son requeridos.', 400);
    }

    if (title.length < 3) {
      throw new CustomError('INVALID_INPUT', 'El título debe tener al menos 3 caracteres.', 400);
    }

    if (content.length < 10) {
      throw new CustomError('INVALID_INPUT', 'El contenido debe tener al menos 10 caracteres.', 400);
    }

    const createdAt = new Date(); 
    const updatedAt = createdAt; 

    const query = 'INSERT INTO posts (title, content, userId, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    try {
      const result = await db.query(query, [title, content, userId, createdAt, updatedAt]);
      return result.rows[0]; 
    } catch (error) {
      throw new CustomError('DB_ERROR', 'Error al crear el post: ' + (error as Error).message, 500);
    }
  },

  getAll: async () => {
    const query = 'SELECT * FROM posts';
    try {
      const result = await db.query(query);
      return result.rows; 
    } catch (error) {
      throw new CustomError('DB_ERROR', 'Error al obtener los posts: ' + (error as Error).message, 500);
    }
  },

  getById: async (id: string) => { 
    const query = 'SELECT * FROM posts WHERE id = $1';
    try {
      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        throw new CustomError('POST_NOT_FOUND', 'El post no fue encontrado.', 404);
      }

      return result.rows[0]; 
    } catch (error) {
      if (error instanceof CustomError) {
        throw error; 
      }
      throw new CustomError('DB_ERROR', 'Error al obtener el post: ' + (error as Error).message, 500);
    }
  },

  update: async (id: string, updateData: { title?: string, content?: string }) => { 
    const { title, content } = updateData;

    if (!title && !content) {
      throw new CustomError('INVALID_INPUT', 'No se enviaron datos para actualizar.', 400);
    }

    let query = 'UPDATE posts SET';
    const values: (string | number | Date)[] = [];
    let index = 1;

    if (title) {
      query += ` title = $${index++},`;
      values.push(title);
    }
    if (content) {
      query += ` content = $${index++},`;
      values.push(content);
    }

    query += ` updatedAt = $${index++},`;
    values.push(new Date());

    query = query.slice(0, -1);
    query += ` WHERE id = $${index} RETURNING *`;
    values.push(id);

    try {
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        throw new CustomError('POST_NOT_FOUND', 'El post no fue encontrado.', 404);
      }

      return result.rows[0]; 
    } catch (error) {
      if (error instanceof CustomError) {
        throw error; 
      }
      throw new CustomError('DB_ERROR', 'Error al actualizar el post: ' + (error as Error).message, 500);
    }
  },

  delete: async (id: string) => { 
    const query = 'DELETE FROM posts WHERE id = $1 RETURNING *';
    try {
      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        throw new CustomError('POST_NOT_FOUND', 'El post no fue encontrado.', 404);
      }

      return result.rows[0]; 
    } catch (error) {
      throw new CustomError('DB_ERROR', 'Error al eliminar el post: ' + (error as Error).message, 500);
    }
  }
};

export default postModel;
