export class CustomError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = this.constructor.name; // Usar el nombre de la clase de forma dinámica
  }
}
