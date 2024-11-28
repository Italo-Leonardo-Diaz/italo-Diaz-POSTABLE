import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validateSchema = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body) {
        return res.status(400).json({
          message: 'El cuerpo de la solicitud está vacío.',
        });
      }

      schema.parse(req.body);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          message: err.message, 
          path: err.path.join('.'), 
          code: err.code, 
          errorDetail: err.code === 'invalid_type'
            ? `Se esperaba un tipo de dato ${err.expected}, pero se recibió ${err.received}.`
            : err.code === 'too_small'
            ? `El valor es demasiado pequeño, se requiere al menos ${err.minimum}.`
            : err.message
        }));

        return res.status(400).json({
          message: 'Datos inválidos', 
          errors: errors, 
        });
      }

      next(error);
    }
  };
};
