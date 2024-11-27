import { Router } from 'express';
import { addLike, removeLike } from '../controllers/likeController';
import { validateSchema } from '../middlewares/validationMiddleware'; // Middleware de validación
import { authenticateToken } from '../middlewares/authMiddleware'; // Middleware de autenticación
import { likeSchema } from '../schemas/likeSchema'; // Esquema de validación para like

const router = Router();

// Ruta para agregar un "like" a un post específico
router.post('/posts/:postId/like', authenticateToken, validateSchema(likeSchema), addLike);

// Ruta para eliminar un "like" de un post específico
router.delete('/posts/:postId/like', authenticateToken, validateSchema(likeSchema), removeLike);

export default router;
