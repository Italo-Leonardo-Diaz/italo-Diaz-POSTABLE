import { Router } from 'express';
import { addLike, removeLike } from '../controllers/likeController';
import { validateSchema } from '../middlewares/validationMiddleware'; 
import { authenticateToken } from '../middlewares/authMiddleware'; 
import { likeSchema } from '../schemas/likeSchema'; 

const router = Router();

router.post('/posts/:postId/like', authenticateToken, validateSchema(likeSchema), addLike);

router.delete('/posts/:postId/like', authenticateToken, validateSchema(likeSchema), removeLike);

export default router;
