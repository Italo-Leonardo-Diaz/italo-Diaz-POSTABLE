import { z } from 'zod';

export const userSchema = z.object({
  username: z
    .string()
    .min(1, 'El nombre de usuario es obligatorio')
    .max(50, 'El nombre de usuario no puede exceder los 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'El nombre de usuario solo puede contener letras, números y guiones bajos'),

  email: z
    .string()
    .email('El correo electrónico no es válido')
    .min(1, 'El correo electrónico es obligatorio'),

  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(128, 'La contraseña no puede exceder los 128 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'La contraseña debe contener al menos un carácter especial'),

  role: z.enum(['admin', 'user'], {
    errorMap: () => {
      return { message: 'El rol debe ser "admin" o "user"' };
    }
  })
});
