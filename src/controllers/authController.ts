import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { getUserByUsername } from '../models/userModel';

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.base': 'El nombre de usuario debe ser una cadena de texto',
    'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
    'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
    'string.max': 'El nombre de usuario no puede exceder los 30 caracteres',
    'any.required': 'El nombre de usuario es obligatorio',
  }),
  password: Joi.string().min(8).required().messages({
    'string.base': 'La contraseña debe ser una cadena de texto',
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'any.required': 'La contraseña es obligatoria',
  }),
});

export const login = async (req: Request, res: Response) => {
  try {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Datos inválidos',
        details: error.details.map((detail) => detail.message),
      });
    }

    const { username, password } = req.body;

    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET no está configurado.'); 
      return res.status(500).json({ message: 'Error del servidor. Falta configuración del token.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '1h', algorithm: 'HS256' } 
    );

    return res.status(200).json({
      token,
      message: 'Inicio de sesión exitoso.',
    });
  } catch (error) {
    console.error('Error en el controlador de autenticación:', error);

    return res.status(500).json({
      message: 'Error en el inicio de sesión.',
      error: error instanceof Error ? error.message : 'Error desconocido.',
    });
  }
};
