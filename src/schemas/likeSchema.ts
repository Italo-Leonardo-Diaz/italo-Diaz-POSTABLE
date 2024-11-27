import { z } from 'zod';

export const likeSchema = z.object({
  postId: z
    .string()
    .uuid('El postId debe ser un UUID válido')
    .min(1, 'El postId no puede estar vacío'), // Asegura que no esté vacío

  userId: z
    .string()
    .uuid('El userId debe ser un UUID válido')
    .min(1, 'El userId no puede estar vacío'), // Asegura que no esté vacío
});
