import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

// Middleware para validar el cuerpo de la solicitud según el esquema Zod
export const validateSchema = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar si el cuerpo de la solicitud existe
      if (!req.body) {
        return res.status(400).json({
          message: 'El cuerpo de la solicitud está vacío.',
        });
      }

      // Validación del cuerpo de la solicitud con el esquema Zod
      schema.parse(req.body);

      // Si la validación es exitosa, pasamos al siguiente middleware
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Si Zod arroja un error de validación, estructuramos los detalles del error
        const errors = error.errors.map((err) => ({
          message: err.message, // Mensaje de error de Zod
          path: err.path.join('.'), // Ruta del error (como un string, ej. "field.subfield")
          // Detalle adicional para indicar el tipo de error (tipo incorrecto o campo obligatorio)
          code: err.code,  // Esto incluye el tipo de error como 'invalid_type', 'missing_required', etc.
          // Añadimos un mensaje extra si el error está relacionado con el tipo de datos o campos faltantes
          errorDetail: err.code === 'invalid_type'
            ? `Se esperaba un tipo de dato ${err.expected}, pero se recibió ${err.received}.`
            : err.code === 'too_small'
            ? `El valor es demasiado pequeño, se requiere al menos ${err.minimum}.`
            : err.message
        }));

        // Responder con el error de validación, estado 400 (Bad Request)
        return res.status(400).json({
          message: 'Datos inválidos', // Mensaje genérico de error
          errors: errors, // Detalles de los errores de validación
        });
      }

      // Si el error no es de Zod, lo pasamos al siguiente middleware de manejo de errores
      next(error);
    }
  };
};
