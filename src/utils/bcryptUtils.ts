import bcrypt from 'bcrypt';

// Interfaz para los errores relacionados con bcrypt
interface BcryptError {
  message: string;
  statusCode: number;
}

// Función para encriptar una contraseña
export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10); // Número de rondas de encriptación (ajustable)
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw createBcryptError('Error al generar el hash de la contraseña', 500);
  }
};

// Función para verificar una contraseña
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hash); // Compara la contraseña con el hash almacenado
  } catch (error) {
    throw createBcryptError('Error al comparar la contraseña', 500);
  }
};

// Función para generar errores más estructurados
export const createBcryptError = (message: string, statusCode: number): BcryptError => {
  return { message, statusCode };
};

// Manejo de errores
export const handleBcryptError = (error: BcryptError): void => {
  console.error(`Error: ${error.message} (StatusCode: ${error.statusCode})`);
  // Puedes agregar lógica adicional aquí, como registrar el error en una base de datos o enviar alertas
};
