import jwt from 'jsonwebtoken';

// Interfaz para el payload del token
interface JwtPayload {
  userId: string;
}

// Función para manejar errores de JWT de manera estructurada
interface JwtError {
  message: string;
  statusCode: number;
}

// Generar un token JWT
export const generateToken = (userId: string): string => {
  // Asegúrate de que el JWT_SECRET esté presente en el entorno
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
  }

  // Generación del token con una expiración de 1 hora
  return jwt.sign({ userId }, secret, { expiresIn: '1h' });
};

// Verificar un token JWT
export const verifyToken = (token: string): JwtPayload => {
  try {
    // Asegúrate de que el JWT_SECRET esté presente en el entorno
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }

    // Verificación del token
    const decoded = jwt.verify(token, secret) as JwtPayload; // Decodificamos el payload
    return decoded; // Retornamos el payload decodificado
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

// Función para generar errores más estructurados
export const createJwtError = (message: string, statusCode: number): JwtError => {
  return { message, statusCode };
};

// Tipado de error genérico para su uso en el manejo de errores
export const handleJwtError = (error: JwtError): void => {
  console.error(`Error: ${error.message} (StatusCode: ${error.statusCode})`);
  // Puedes agregar lógica adicional aquí, como registrar el error en una base de datos o enviar alertas
};
