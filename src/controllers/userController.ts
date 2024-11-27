import { Request, Response } from 'express';
import { createUser, getUserByUsername } from '../models/userModel';
import bcrypt from 'bcrypt';
import Joi from 'joi';

// Esquema de validación para la creación de un usuario
const userSchema = Joi.object({
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
  email: Joi.string().email().required().messages({
    'string.base': 'El correo electrónico debe ser una cadena de texto',
    'string.email': 'El correo electrónico no tiene un formato válido',
    'any.required': 'El correo electrónico es obligatorio',
  }),
  firstName: Joi.string().min(1).max(100).required().messages({
    'string.base': 'El nombre debe ser una cadena de texto',
    'string.min': 'El nombre debe tener al menos 1 carácter',
    'string.max': 'El nombre no puede exceder los 100 caracteres',
    'any.required': 'El nombre es obligatorio',
  }),
  lastName: Joi.string().min(1).max(100).required().messages({
    'string.base': 'El apellido debe ser una cadena de texto',
    'string.min': 'El apellido debe tener al menos 1 carácter',
    'string.max': 'El apellido no puede exceder los 100 caracteres',
    'any.required': 'El apellido es obligatorio',
  }),
});

export const registerUser = async (req: Request, res: Response) => {
  try {
    // Validación de los datos de entrada utilizando Joi
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Datos inválidos',
        details: error.details.map(detail => detail.message) 
      });
    }

    // Desestructuramos y sanitizamos los datos de la solicitud
    const { username, password, email, firstName, lastName } = req.body;
    const sanitizedUsername = username.trim();
    const sanitizedEmail = email.trim().toLowerCase();

    // Verificar si el nombre de usuario ya existe en la base de datos
    const existingUser = await getUserByUsername(sanitizedUsername);
    if (existingUser) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe.' });
    }

    // Hashear la contraseña antes de guardarla en la base de datos
    const saltRounds = 10; // Número de rondas para el hash
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el nuevo usuario en la base de datos
    const newUser = await createUser(
      sanitizedUsername,
      hashedPassword,
      sanitizedEmail,
      firstName,
      lastName
    );

    // Excluir la contraseña del objeto que será devuelto en la respuesta
    const { password: _, ...newUserResponse } = newUser;

    // Responder con el nuevo usuario, excluyendo la contraseña
    return res.status(201).json({
      message: 'Usuario registrado con éxito.',
      user: newUserResponse
    });

  } catch (error) {
    // Manejo de errores y comprobación del tipo de error
    const isProduction = process.env.NODE_ENV === 'production';
    const errorMessage = isProduction
      ? 'Error al registrar el usuario.'
      : error instanceof Error
      ? error.message
      : 'Error desconocido al registrar el usuario.';

    return res.status(500).json({ message: errorMessage });
  }
};
