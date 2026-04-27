/**
 * AppError - Custom application error class
 * Follows SRP: Only responsible for error representation
 * Enables consistent error handling across the application
 */
export default class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
