import { Router } from 'express';
import { login } from '../controllers/authController';
import { validateSchema } from '../middlewares/validationMiddleware';
import { loginSchema } from '../schemas/authSchema';

const router = Router();

router.post('/login', validateSchema(loginSchema), login);

export default router;
