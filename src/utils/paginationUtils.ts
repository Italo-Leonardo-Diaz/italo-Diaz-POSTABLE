export const getPaginationParams = (page: number = 1, limit: number = 10) => {
  const pageNumber = Math.max(1, page); 
  const limitNumber = Math.max(1, Math.min(limit, 100)); 

  const offset = (pageNumber - 1) * limitNumber;

  return { offset, limit: limitNumber };
};
