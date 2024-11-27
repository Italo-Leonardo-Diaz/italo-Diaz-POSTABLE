import { Request, Response } from 'express';
import Joi from 'joi';  // Importamos Joi para la validación
import { getDb } from '../config/db';  // Accedemos a la base de datos PostgreSQL
import { CustomError } from '../utils/errors';  // Error personalizado
import { isUUID } from 'validator';  // Usamos validator para comprobar si el ID es un UUID válido

// Obtener la conexión al pool de PostgreSQL
const pool = getDb();  // Accedemos al pool para hacer las consultas

// Esquema de validación para la creación y actualización de un post
const postSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.base': 'El título debe ser una cadena de texto',
    'string.min': 'El título debe tener al menos 3 caracteres',
    'string.max': 'El título no puede exceder los 255 caracteres',
    'any.required': 'El título es obligatorio',
  }),
  content: Joi.string().min(10).required().messages({
    'string.base': 'El contenido debe ser una cadena de texto',
    'string.min': 'El contenido debe tener al menos 10 caracteres',
    'any.required': 'El contenido es obligatorio',
  }),
});

// Define la interfaz Post si no está ya declarada
export interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: Date;
  updated_at?: Date;
}

// Crear un nuevo post
export const createPost = async (req: Request, res: Response) => {
  try {
    // Validación con Joi
    const { error } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    const { title, content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new CustomError('Usuario no autenticado', 'UNAUTHORIZED');
    }

    // Crear el post sin la propiedad `id` (esto es generado por la base de datos)
    const post = {
      title,
      content,
      user_id: userId,  // Cambié 'userId' a 'user_id'
      created_at: new Date(),  // Cambié 'createdAt' a 'created_at'
    };

    // Usar el pool para hacer una consulta SQL
    const result = await pool.query<Post>(
      'INSERT INTO posts (title, content, user_id, created_at) VALUES ($1, $2, $3, $4) RETURNING id, title, content, created_at, updated_at',
      [post.title, post.content, post.user_id, post.created_at]
    );

    // Devuelve el post completo creado con el id generado por la base de datos
    res.status(201).json({
      message: 'Post creado exitosamente',
      post: result.rows[0],  // Incluye el post completo, que ahora tiene el 'id' generado
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Obtener posts con paginación
export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Asegurar que el límite no sea mayor de 100
    if (limit > 100) {
      return res.status(400).json({ message: 'El límite de posts no puede ser mayor a 100' });
    }

    // Consulta SQL con paginación
    const result = await pool.query<Post>(
      'SELECT id, title, content, user_id, created_at, updated_at FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, (page - 1) * limit]
    );

    // Obtener el total de posts para saber cuántas páginas hay
    const totalPostsResult = await pool.query('SELECT COUNT(*) FROM posts');
    const totalPosts = parseInt(totalPostsResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      posts: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Obtener un solo post por ID
export const getPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    // Validación de ID
    if (!postId || !isUUID(postId)) {
      throw new CustomError('ID de post inválido', 'INVALID_ID');
    }

    // Consulta SQL para obtener el post
    const result = await pool.query<Post>(
      'SELECT id, title, content, user_id, created_at, updated_at FROM posts WHERE id = $1',
      [postId]
    );

    const post = result.rows[0];

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    res.status(200).json(post);
  } catch (error) {
    handleError(res, error);
  }
};

// Actualizar un post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const { title, content } = req.body;
    const userId = req.user?.id;

    if (!postId || !isUUID(postId)) {
      throw new CustomError('ID de post inválido', 'INVALID_ID');
    }

    // Verificar si el post existe y si el usuario tiene permiso para editarlo
    const result = await pool.query<Post>(
      'SELECT id, title, content, user_id, created_at, updated_at FROM posts WHERE id = $1',
      [postId]
    );

    const post = result.rows[0];

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar este post' });
    }

    // Actualización del esquema con Joi
    const { error } = postSchema.validate({ title, content });
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    // Actualizar el post
    await pool.query(
      'UPDATE posts SET title = $1, content = $2, updated_at = $3 WHERE id = $4',
      [title, content, new Date(), postId]
    );

    res.status(200).json({ message: 'Post actualizado exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

// Eliminar un post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const userId = req.user?.id;

    if (!postId || !isUUID(postId)) {
      throw new CustomError('ID de post inválido', 'INVALID_ID');
    }

    // Verificar si el post existe y si el usuario tiene permiso para eliminarlo
    const result = await pool.query<Post>(
      'SELECT id, title, content, user_id, created_at FROM posts WHERE id = $1',
      [postId]
    );

    const post = result.rows[0];

    if (!post) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este post' });
    }

    // Eliminar el post
    await pool.query(
      'DELETE FROM posts WHERE id = $1',
      [postId]
    );

    res.status(200).json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

// Función de manejo de errores
const handleError = (res: Response, error: any) => {
  if (error instanceof CustomError) {
    return res.status(400).json({ message: error.message, code: error.code });
  }
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor' });
};
