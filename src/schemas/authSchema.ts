import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'El nombre de usuario es requerido.')
    .max(50, 'El nombre de usuario no puede tener más de 50 caracteres.')
    .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos.'),

  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.')
    .max(128, 'La contraseña no puede tener más de 128 caracteres.') // Agregada longitud máxima
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula.')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula.') // Agregada validación de minúsculas
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número.')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'La contraseña debe contener al menos un carácter especial.')
});
