import { Request, Response } from 'express';
import { likeModel } from '../models/likeModel';
import { isUUID } from 'validator';

const isCustomError = (error: unknown): error is { code: string; message: string } =>
  typeof error === 'object' && error !== null && 'code' in error && 'message' in error;

export const addLike = async (req: Request, res: Response) => {
  const { postId, userId } = req.body;

  if (!postId || !userId || typeof postId !== 'string' || typeof userId !== 'string' || !postId.trim() || !userId.trim()) {
    return res.status(400).json({ message: 'Datos inválidos o incompletos (postId o userId)' });
  }

  if (!isUUID(postId) || !isUUID(userId)) {
    return res.status(400).json({ message: 'postId o userId no son UUID válidos' });
  }

  try {
    const result = await likeModel.create({ postId, userId });
    return res.status(201).json(result);
  } catch (error) {
    if (isCustomError(error)) {
      return res.status(409).json({
        message: error.message,
        code: error.code,
        errorDetails: true, 
      });
    }

    return res.status(500).json({
      message: 'Error al agregar el like',
      errorMessage: error instanceof Error ? error.message : 'Error desconocido', 
      errorDetails: true, 
    });
  }
};

export const removeLike = async (req: Request, res: Response) => {
  const { postId, userId } = req.body;

  if (!postId || !userId || typeof postId !== 'string' || typeof userId !== 'string' || !postId.trim() || !userId.trim()) {
    return res.status(400).json({ message: 'Datos inválidos o incompletos (postId o userId)' });
  }

  if (!isUUID(postId) || !isUUID(userId)) {
    return res.status(400).json({ message: 'postId o userId no son UUID válidos' });
  }

  try {
    const result = await likeModel.remove({ postId, userId });
    return res.status(200).json(result); 
  } catch (error) {
    if (isCustomError(error)) {
      return res.status(404).json({
        message: error.message,
        code: error.code,
        errorDetails: true, 
      });
    }

    return res.status(500).json({
      message: 'Error al eliminar el like',
      errorMessage: error instanceof Error ? error.message : 'Error desconocido', 
      errorDetails: true, 
    });
  }
};
