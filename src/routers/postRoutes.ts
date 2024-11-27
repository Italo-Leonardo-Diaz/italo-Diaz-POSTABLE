import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from '../controllers/postController';
import { validateSchema } from '../middlewares/validationMiddleware'; // Middleware de validación
import { postSchema } from '../schemas/postSchema'; // Esquema de validación para los posts
import { authenticateToken } from '../middlewares/authMiddleware'; // Middleware de autenticación
import { checkOwnershipOrAdmin } from '../middlewares/authMiddleware'; // Middleware para verificar propietario o administrador

const router = Router();

// Ruta para crear un post (protegida por autenticación y validación)
router.post(
  '/',
  authenticateToken,
  validateSchema(postSchema), // Valida los datos del cuerpo antes de crear el post
  createPost
);

// Ruta para actualizar un post (protegida por autenticación, verificación de propiedad o admin, y validación)
router.put(
  '/:postId',
  authenticateToken, // Verifica que el usuario esté autenticado
  checkOwnershipOrAdmin, // Verifica que el usuario sea el propietario o admin
  validateSchema(postSchema), // Valida los datos del cuerpo antes de actualizar el post
  updatePost
);

// Ruta para eliminar un post (protegida por autenticación y verificación de propietario o administrador)
router.delete(
  '/:postId',
  authenticateToken, // Verifica que el usuario esté autenticado
  checkOwnershipOrAdmin, // Verifica que el usuario sea el propietario o admin
  deletePost
);

// Rutas públicas para obtener posts
router.get('/', getPosts); // Obtener todos los posts
router.get('/:postId', getPost); // Obtener un post específico

export default router;
