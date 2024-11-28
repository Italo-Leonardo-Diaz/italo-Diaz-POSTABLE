import bcrypt from 'bcrypt';

interface BcryptError {
  message: string;
  statusCode: number;
}

export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10); 
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw createBcryptError('Error al generar el hash de la contraseña', 500);
  }
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash); 
  } catch (error) {
    throw createBcryptError('Error al comparar la contraseña', 500);
  }
};

export const createBcryptError = (message: string, statusCode: number): BcryptError => {
  return { message, statusCode };
};

export const handleBcryptError = (error: BcryptError): void => {
  console.error(`Error: ${error.message} (StatusCode: ${error.statusCode})`);
};
