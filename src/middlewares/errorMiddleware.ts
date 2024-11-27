import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Definimos una interfaz personalizada para los errores con código de estado
interface CustomError extends Error {
  statusCode?: number;
}

const errorMiddleware = (err: Error | ZodError | CustomError, req: Request, res: Response, next: NextFunction) => {
  // Manejo de errores de validación (por ejemplo, ZodError)
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: err.errors.map(e => ({
        message: e.message,
        path: e.path.join('.'),
      })),
    });
  }

  // Verificamos si el error es un CustomError y tiene la propiedad statusCode
  if ('statusCode' in err) {
    const statusCode = err.statusCode || 500; // Si no existe, usamos 500 por defecto
    console.error(err.stack);  // En producción podrías usar otro tipo de logging
    return res.status(statusCode).json({
      message: err.message || 'Error inesperado',
      // Si estamos en un entorno de desarrollo, también agregamos el stack trace
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Si el error es de tipo Error pero no es CustomError
  if (err instanceof Error) {
    console.error(err.stack);
    const statusCode = 500;  // Usamos 500 como valor por defecto para errores genéricos
    return res.status(statusCode).json({
      message: err.message || 'Error inesperado',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Si el error no es de tipo conocido, pasamos al siguiente middleware
  next(err);
};

export default errorMiddleware;
