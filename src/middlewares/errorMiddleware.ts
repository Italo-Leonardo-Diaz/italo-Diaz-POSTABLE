import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

interface CustomError extends Error {
  statusCode?: number;
}

const errorMiddleware = (err: Error | ZodError | CustomError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Datos inválidos',
      errors: err.errors.map(e => ({
        message: e.message,
        path: e.path.join('.'),
      })),
    });
  }

  if ('statusCode' in err) {
    const statusCode = err.statusCode || 500; 
    console.error(err.stack); 
    return res.status(statusCode).json({
      message: err.message || 'Error inesperado',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  if (err instanceof Error) {
    console.error(err.stack);
    const statusCode = 500; 
    return res.status(statusCode).json({
      message: err.message || 'Error inesperado',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  next(err);
};

export default errorMiddleware;
