import { z } from 'zod';

export const postSchema = z.object({
  // Validación del userId
  userId: z
    .string()
    .uuid('El userId debe ser un UUID válido'), // Asegura que el userId sea un UUID válido

  // Validación del título
  title: z
    .string()
    .min(1, 'El título es obligatorio') // El título no puede estar vacío
    .max(100, 'El título no puede exceder los 100 caracteres') // Longitud máxima de 100 caracteres
    .transform((val) => val.trim()), // Asegura que no haya espacios al inicio o al final

  // Validación del contenido
  content: z
    .string()
    .min(10, 'El contenido debe tener al menos 10 caracteres') // Longitud mínima del contenido
    .max(1000, 'El contenido no puede exceder los 1000 caracteres') // Longitud máxima del contenido
    .regex(/[^<>]/, 'El contenido no puede contener etiquetas HTML') // Evita la inserción de etiquetas HTML
    .transform((val) => val.trim()), // Elimina espacios al inicio y final del contenido

});
