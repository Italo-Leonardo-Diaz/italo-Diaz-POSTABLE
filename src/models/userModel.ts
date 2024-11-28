import pool from '../config/db';
import bcrypt from 'bcrypt';
import { CustomError } from '../utils/errors';

const validateEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
};

export const createUser = async (
  username: string,
  password: string,
  email: string,
  firstName: string,
  lastName: string
) => {
  if (!username || !password || !email || !firstName || !lastName) {
    throw new CustomError('INVALID_INPUT', 'Todos los campos son requeridos.');
  }

  if (!validateEmail(email)) {
    throw new CustomError('INVALID_EMAIL', 'El formato del correo electrónico es inválido.');
  }

  try {
    const userExists = await getUserByUsername(username);
    if (userExists) {
      throw new CustomError('USER_EXISTS', 'El nombre de usuario ya está en uso.');
    }

    const emailExists = await getUserByEmail(email);
    if (emailExists) {
      throw new CustomError('EMAIL_EXISTS', 'El correo electrónico ya está registrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, password, email, firstName, lastName)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [username, hashedPassword, email, firstName, lastName];
    const result = await pool.query(query, values);

    const { password: _, ...userWithoutPassword } = result.rows[0];
    return userWithoutPassword;

  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }

    console.error('Error en la creación de usuario:', error);
    throw new CustomError('USER_CREATION_ERROR', 'Hubo un error al crear el usuario. Inténtalo de nuevo más tarde.');
  }
};

export const getUserByUsername = async (username: string) => {
  try {
    const query = `SELECT * FROM users WHERE username = $1;`;
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error al consultar el nombre de usuario:', error);
    throw new CustomError('DATABASE_ERROR', 'Error al consultar el nombre de usuario. Inténtalo de nuevo más tarde.');
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const query = `SELECT * FROM users WHERE email = $1;`;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error al consultar el correo electrónico:', error);
    throw new CustomError('DATABASE_ERROR', 'Error al consultar el correo electrónico. Inténtalo de nuevo más tarde.');
  }
};

export const updateUserPassword = async (userId: string, newPassword: string) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE users
      SET password = $1
      WHERE id = $2
      RETURNING id, username, email, firstName, lastName;
    `;
    const values = [hashedPassword, userId];
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    throw new CustomError('PASSWORD_UPDATE_ERROR', 'Hubo un error al actualizar la contraseña.');
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const query = `DELETE FROM users WHERE id = $1 RETURNING id;`;
    const result = await pool.query(query, [userId]);
    return result.rows[0] ? true : false;
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    throw new CustomError('USER_DELETION_ERROR', 'Hubo un error al eliminar el usuario.');
  }
};
