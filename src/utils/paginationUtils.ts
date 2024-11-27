// Función para calcular los parámetros de paginación
export const getPaginationParams = (page: number = 1, limit: number = 10) => {
  // Validar si los parámetros son válidos
  const pageNumber = Math.max(1, page); // Si page es menor que 1, se asigna 1 como valor predeterminado
  const limitNumber = Math.max(1, Math.min(limit, 100)); // Limita el `limit` entre 1 y 100

  const offset = (pageNumber - 1) * limitNumber;

  return { offset, limit: limitNumber };
};
