import { z } from 'zod';

export const postSchema = z.object({
  userId: z
    .string()
    .uuid('El userId debe ser un UUID válido'), 

  title: z
    .string()
    .min(1, 'El título es obligatorio') 
    .max(100, 'El título no puede exceder los 100 caracteres') 
    .transform((val) => val.trim()), 

  content: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres') 
    .max(1000, 'El contenido no puede exceder los 1000 caracteres') 
    .regex(/[^<>]/, 'El contenido no puede contener etiquetas HTML') 
    .transform((val) => val.trim()), 

});
