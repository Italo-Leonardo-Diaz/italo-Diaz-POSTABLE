import { Request, Response } from 'express';
import Joi from 'joi';  
import { getDb } from '../config/db';  
import { CustomError } from '../utils/errors';  
import { isUUID } from 'validator';  

const pool = getDb();  

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

export interface Post {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: Date;
  updated_at?: Date;
}

export const createPost = async (req: Request, res: Response) => {
  try {
    const { error } = postSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    const { title, content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new CustomError('Usuario no autenticado', 'UNAUTHORIZED');
    }

    const post = {
      title,
      content,
      user_id: userId,  
      created_at: new Date(),  
    };

    const result = await pool.query<Post>(
      'INSERT INTO posts (title, content, user_id, created_at) VALUES ($1, $2, $3, $4) RETURNING id, title, content, created_at, updated_at',
      [post.title, post.content, post.user_id, post.created_at]
    );

    res.status(201).json({
      message: 'Post creado exitosamente',
      post: result.rows[0],  
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (limit > 100) {
      return res.status(400).json({ message: 'El límite de posts no puede ser mayor a 100' });
    }

    const result = await pool.query<Post>(
      'SELECT id, title, content, user_id, created_at, updated_at FROM posts ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, (page - 1) * limit]
    );

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

export const getPost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;

    if (!postId || !isUUID(postId)) {
      throw new CustomError('ID de post inválido', 'INVALID_ID');
    }

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

export const updatePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const { title, content } = req.body;
    const userId = req.user?.id;

    if (!postId || !isUUID(postId)) {
      throw new CustomError('ID de post inválido', 'INVALID_ID');
    }

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

    const { error } = postSchema.validate({ title, content });
    if (error) {
      return res.status(400).json({ errors: error.details });
    }

    await pool.query(
      'UPDATE posts SET title = $1, content = $2, updated_at = $3 WHERE id = $4',
      [title, content, new Date(), postId]
    );

    res.status(200).json({ message: 'Post actualizado exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const userId = req.user?.id;

    if (!postId || !isUUID(postId)) {
      throw new CustomError('ID de post inválido', 'INVALID_ID');
    }

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

    await pool.query(
      'DELETE FROM posts WHERE id = $1',
      [postId]
    );

    res.status(200).json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    handleError(res, error);
  }
};

const handleError = (res: Response, error: any) => {
  if (error instanceof CustomError) {
    return res.status(400).json({ message: error.message, code: error.code });
  }
  console.error(error);
  res.status(500).json({ message: 'Error interno del servidor' });
};
