import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios'; 

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string }; 
    }
  }
}

interface Post {
  userId: string;  
  title: string;
  content: string;
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET no está configurado.' });
    }

    const decoded = jwt.verify(token, jwtSecret) as { id: string; role: string };
    req.user = decoded; 

    next(); 
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({ message: 'Token expirado.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: 'Token inválido.' });
    }
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const checkOwnershipOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId; 
  const userId = req.user?.id; 

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    const response = await axios.get(`https://your-api-endpoint.com/posts/${postId}`); 

    if (!response.data) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    const post: Post = response.data as Post; 

    if (post.userId === userId || req.user?.role === 'admin') {
      return next();
    }

    return res.status(403).json({ message: 'No tienes permisos para eliminar este post' });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Error al verificar la propiedad del post', error: error.message });
    }
    return res.status(500).json({ message: 'Error desconocido al verificar la propiedad del post', error: 'Error desconocido' });
  }
};
