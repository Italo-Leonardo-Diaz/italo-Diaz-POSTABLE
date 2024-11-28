import { Router } from 'express';
import { registerUser } from '../controllers/userController';
import { validateSchema } from '../middlewares/validationMiddleware';
import { z } from 'zod'; 

const router = Router();

const registerValidationSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  email: z.string().email('El correo electrónico no es válido'),
  firstName: z.string().min(2, 'El primer nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
});

router.post(
  '/register',
  validateSchema(registerValidationSchema), 
  registerUser 
);

export default router;
