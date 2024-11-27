import { Router } from 'express';
import { login } from '../controllers/authController';
import { validateSchema } from '../middlewares/validationMiddleware';
import { loginSchema } from '../schemas/authSchema';

const router = Router();

// Ruta de inicio de sesión con validación del esquema
router.post('/login', validateSchema(loginSchema), login);

export default router;
