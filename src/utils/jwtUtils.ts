import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
}

interface JwtError {
  message: string;
  statusCode: number;
}

export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload; 
    return decoded; 
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw createJwtError('El token ha expirado', 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw createJwtError('Token no válido', 401);
    } else {
      throw createJwtError('Error desconocido al verificar el token', 500);
    }
  }
};

export const createJwtError = (message: string, statusCode: number): JwtError => {
  return { message, statusCode };
};

export const handleJwtError = (error: JwtError): void => {
  console.error(`Error: ${error.message} (StatusCode: ${error.statusCode})`);
};
