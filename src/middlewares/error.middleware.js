import ResponseFormatter from '../utils/ResponseFormatter.js';
import AppError from '../utils/AppError.js';

/**
 * ErrorHandler - Global error handling middleware
 * Follows SRP: Only responsible for error handling
 * Centralizes error responses for all endpoints
 */
export class ErrorHandler {
  /**
   * Express error handler middleware
   * @param {Error} error - Error object
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  static handle(error, req, res, next) {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors = null;

    if (error instanceof AppError) {
      statusCode = error.statusCode;
      message = error.message;
    } else if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Error';
      errors = error.details || error.message;
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401;
      message = 'Unauthorized';
    } else {
      console.error('Unexpected error:', error);
    }

    const response = ResponseFormatter.error(message, statusCode, errors);
    res.status(statusCode).json(response);
  }
}

/**
 * RequestLogger - Logs incoming requests
 * Follows SRP: Only responsible for logging
 */
export class RequestLogger {
  /**
   * Express middleware for logging
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  static log(req, res, next) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    if (Object.keys(req.query).length > 0) {
      console.log('Query:', req.query);
    }
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', req.body);
    }
    next();
  }
}
