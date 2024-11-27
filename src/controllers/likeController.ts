import { Request, Response } from 'express';
import { likeModel } from '../models/likeModel';
import { isUUID } from 'validator';

// Type guard para verificar si un error es de tipo CustomError
const isCustomError = (error: unknown): error is { code: string; message: string } =>
  typeof error === 'object' && error !== null && 'code' in error && 'message' in error;

// Agregar un like
export const addLike = async (req: Request, res: Response) => {
  const { postId, userId } = req.body;

  // Validar que los datos requeridos estén presentes, sean válidos y sean UUID
  if (!postId || !userId || typeof postId !== 'string' || typeof userId !== 'string' || !postId.trim() || !userId.trim()) {
    return res.status(400).json({ message: 'Datos inválidos o incompletos (postId o userId)' });
  }

  if (!isUUID(postId) || !isUUID(userId)) {
    return res.status(400).json({ message: 'postId o userId no son UUID válidos' });
  }

  try {
    // Intentar agregar el like
    const result = await likeModel.create({ postId, userId });
    return res.status(201).json(result); // Retornar el mensaje del modelo
  } catch (error) {
    if (isCustomError(error)) {
      // Manejar errores personalizados (ejemplo: like duplicado)
      return res.status(409).json({
        message: error.message,
        code: error.code,
        errorDetails: true, // Renombrado 'error' a 'errorDetails'
      });
    }

    // Manejar errores generales
    return res.status(500).json({
      message: 'Error al agregar el like',
      errorMessage: error instanceof Error ? error.message : 'Error desconocido', // Renombrado 'error' a 'errorMessage'
      errorDetails: true, // Renombrado 'error' a 'errorDetails'
    });
  }
};

// Eliminar un like
export const removeLike = async (req: Request, res: Response) => {
  const { postId, userId } = req.body;

  // Validar que los datos requeridos estén presentes, sean válidos y sean UUID
  if (!postId || !userId || typeof postId !== 'string' || typeof userId !== 'string' || !postId.trim() || !userId.trim()) {
    return res.status(400).json({ message: 'Datos inválidos o incompletos (postId o userId)' });
  }

  if (!isUUID(postId) || !isUUID(userId)) {
    return res.status(400).json({ message: 'postId o userId no son UUID válidos' });
  }

  try {
    // Intentar eliminar el like
    const result = await likeModel.remove({ postId, userId });
    return res.status(200).json(result); // Retornar el mensaje del modelo
  } catch (error) {
    if (isCustomError(error)) {
      // Manejar errores personalizados (ejemplo: like no encontrado)
      return res.status(404).json({
        message: error.message,
        code: error.code,
        errorDetails: true, // Renombrado 'error' a 'errorDetails'
      });
    }

    // Manejar errores generales
    return res.status(500).json({
      message: 'Error al eliminar el like',
      errorMessage: error instanceof Error ? error.message : 'Error desconocido', // Renombrado 'error' a 'errorMessage'
      errorDetails: true, // Renombrado 'error' a 'errorDetails'
    });
  }
};
