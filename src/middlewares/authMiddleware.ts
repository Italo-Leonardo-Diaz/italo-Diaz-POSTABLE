import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios'; // No se importa AxiosError directamente en versiones recientes de axios

// Extender la interfaz Request para incluir 'user' con el tipo adecuado
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string }; // Asegúrate de que el tipo coincida con lo que se guarda en el token
    }
  }
}

// Interfaz para el post
interface Post {
  userId: string;  // El 'userId' del post debe coincidir con el tipo del ID de usuario (string, según tu ejemplo)
  title: string;
  content: string;
  // Agregar aquí otras propiedades del post que necesites
}

// Middleware de autenticación para verificar el token JWT
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extraer el token del encabezado Authorization

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET no está configurado.' });
    }

    // Verificar el token con la clave secreta
    const decoded = jwt.verify(token, jwtSecret) as { id: string; role: string };
    req.user = decoded; // Almacenar los datos decodificados en 'user' en la solicitud

    next(); // Continuar con el siguiente middleware o ruta
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

// Middleware para verificar si el usuario es propietario o administrador
export const checkOwnershipOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId; // ID del post desde los parámetros de la URL
  const userId = req.user?.id; // ID del usuario autenticado desde la solicitud

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  try {
    // Lógica para verificar la propiedad del post desde la API de Render
    const response = await axios.get(`https://your-api-endpoint.com/posts/${postId}`); // Aquí va el endpoint de Render para obtener un post

    if (!response.data) {
      return res.status(404).json({ message: 'Post no encontrado' });
    }

    // Asegurarnos de que la respuesta se ajusta al tipo de 'Post'
    const post: Post = response.data as Post; // Aseguramos que los datos coinciden con la interfaz Post

    // Verificar si el usuario es el propietario o un administrador
    if (post.userId === userId || req.user?.role === 'admin') {
      return next(); // Si el usuario es el propietario o un administrador, permite continuar
    }

    return res.status(403).json({ message: 'No tienes permisos para eliminar este post' });
  } catch (error) {
    // Manejar el error de tipo unknown
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Error al verificar la propiedad del post', error: error.message });
    }
    return res.status(500).json({ message: 'Error desconocido al verificar la propiedad del post', error: 'Error desconocido' });
  }
};
