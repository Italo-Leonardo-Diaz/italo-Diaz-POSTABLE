// postModel.ts

import db from '../config/db'; // Asegúrate de que db esté configurado correctamente

// Definimos una clase de error personalizada
class CustomError extends Error {
  code: string;
  statusCode: number; // Añadimos el código de estado HTTP para mejor manejo

  constructor(code: string, message: string, statusCode: number = 500) {
    super(message);
    this.code = code;
    this.name = 'CustomError';
    this.statusCode = statusCode;
  }
}

// Definimos la interfaz Post
export interface Post {
  _id: string; // Usamos string para UUID
  title: string;
  content: string;
  userId: string; // Usamos string para UUID
  createdAt: Date;
  updatedAt: Date; // Fecha de actualización
}

export const postModel = {
  // Crear un nuevo post
  create: async (postData: { title: string, content: string, userId: string }) => {
    const { title, content, userId } = postData;

    // Validaciones básicas
    if (!title || !content || !userId) {
      throw new CustomError('INVALID_INPUT', 'El título, contenido y userId son requeridos.', 400);
    }

    // Validación adicional para el contenido y título
    if (title.length < 3) {
      throw new CustomError('INVALID_INPUT', 'El título debe tener al menos 3 caracteres.', 400);
    }

    if (content.length < 10) {
      throw new CustomError('INVALID_INPUT', 'El contenido debe tener al menos 10 caracteres.', 400);
    }

    const createdAt = new Date(); // Fecha de creación
    const updatedAt = createdAt; // La fecha de actualización es la misma que la de creación

    const query = 'INSERT INTO posts (title, content, userId, createdAt, updatedAt) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    try {
      const result = await db.query(query, [title, content, userId, createdAt, updatedAt]);
      return result.rows[0]; // Retorna el post creado
    } catch (error) {
      throw new CustomError('DB_ERROR', 'Error al crear el post: ' + (error as Error).message, 500);
    }
  },

  // Obtener todos los posts
  getAll: async () => {
    const query = 'SELECT * FROM posts';
    try {
      const result = await db.query(query);
      return result.rows; // Retorna todos los posts
    } catch (error) {
      throw new CustomError('DB_ERROR', 'Error al obtener los posts: ' + (error as Error).message, 500);
    }
  },

  // Obtener un post por su ID
  getById: async (id: string) => { // Usamos string para UUID
    const query = 'SELECT * FROM posts WHERE id = $1';
    try {
      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        // Si no se encuentra el post, lanzamos un error
        throw new CustomError('POST_NOT_FOUND', 'El post no fue encontrado.', 404);
      }

      return result.rows[0]; // Retorna el post si existe
    } catch (error) {
      if (error instanceof CustomError) {
        throw error; // Lanzamos el error personalizado
      }
      throw new CustomError('DB_ERROR', 'Error al obtener el post: ' + (error as Error).message, 500);
    }
  },

  // Actualizar un post, solo los campos que se envíen en el body
  update: async (id: string, updateData: { title?: string, content?: string }) => { // Usamos string para UUID
    const { title, content } = updateData;

    // Validaciones
    if (!title && !content) {
      throw new CustomError('INVALID_INPUT', 'No se enviaron datos para actualizar.', 400);
    }

    let query = 'UPDATE posts SET';
    const values: (string | number | Date)[] = [];
    let index = 1;

    // Agregamos dinámicamente los campos a actualizar
    if (title) {
      query += ` title = $${index++},`;
      values.push(title);
    }
    if (content) {
      query += ` content = $${index++},`;
      values.push(content);
    }

    // Fecha de actualización
    query += ` updatedAt = $${index++},`;
    values.push(new Date()); // Establecemos la fecha de actualización

    // Eliminar la coma final
    query = query.slice(0, -1);
    query += ` WHERE id = $${index} RETURNING *`;
    values.push(id);

    try {
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        // Si no se encuentra el post a actualizar, lanzamos un error
        throw new CustomError('POST_NOT_FOUND', 'El post no fue encontrado.', 404);
      }

      return result.rows[0]; // Retorna el post actualizado
    } catch (error) {
      if (error instanceof CustomError) {
        throw error; // Lanzamos el error personalizado
      }
      throw new CustomError('DB_ERROR', 'Error al actualizar el post: ' + (error as Error).message, 500);
    }
  },

  // Eliminar un post
  delete: async (id: string) => { // Usamos string para UUID
    const query = 'DELETE FROM posts WHERE id = $1 RETURNING *';
    try {
      const result = await db.query(query, [id]);

      if (result.rows.length === 0) {
        // Si no se encuentra el post a eliminar, lanzamos un error
        throw new CustomError('POST_NOT_FOUND', 'El post no fue encontrado.', 404);
      }

      return result.rows[0]; // Retorna el post eliminado
    } catch (error) {
      throw new CustomError('DB_ERROR', 'Error al eliminar el post: ' + (error as Error).message, 500);
    }
  }
};

export default postModel;
