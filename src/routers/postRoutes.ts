import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from '../controllers/postController';
import { validateSchema } from '../middlewares/validationMiddleware'; 
import { postSchema } from '../schemas/postSchema'; 
import { authenticateToken } from '../middlewares/authMiddleware'; 
import { checkOwnershipOrAdmin } from '../middlewares/authMiddleware'; 

const router = Router();

router.post(
  '/',
  authenticateToken,
  validateSchema(postSchema), 
  createPost
);

router.put(
  '/:postId',
  authenticateToken, 
  checkOwnershipOrAdmin, 
  validateSchema(postSchema), 
  updatePost
);

router.delete(
  '/:postId',
  authenticateToken, 
  checkOwnershipOrAdmin, 
  deletePost
);

router.get('/', getPosts); 
router.get('/:postId', getPost); 

export default router;
