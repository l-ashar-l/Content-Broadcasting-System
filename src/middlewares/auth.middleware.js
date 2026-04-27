import JwtManager from '../utils/JwtManager.js';
import AppError from '../utils/AppError.js';

/**
 * AuthMiddleware - Handles JWT authentication
 * Follows SRP: Only responsible for authentication verification
 * Follows DIP: Depends on injected JwtManager
 */
export default class AuthMiddleware {
  constructor(jwtManager) {
    this.jwtManager = jwtManager;
  }

  /**
   * Verify JWT token middleware
   * @returns {Function} Express middleware
   */
  verifyToken() {
    return (req, res, next) => {
      try {
        const token = this.jwtManager.extractTokenFromHeader(
          req.headers.authorization
        );

        if (!token) {
          throw new AppError('Authorization token required', 401);
        }

        const decoded = this.jwtManager.verifyToken(token);
        req.user = decoded;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Verify user role middleware
   * @param {...string} allowedRoles - Allowed user roles
   * @returns {Function} Express middleware
   */
  verifyRole(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }

      if (!allowedRoles.includes(req.user.role)) {
        return next(
          new AppError(
            `Access denied. Required role: ${allowedRoles.join(', ')}`,
            403
          )
        );
      }

      next();
    };
  }

  /**
   * Verify principal access middleware
   * @returns {Function} Express middleware
   */
  verifyPrincipal() {
    return this.verifyRole('principal');
  }

  /**
   * Verify teacher access middleware
   * @returns {Function} Express middleware
   */
  verifyTeacher() {
    return this.verifyRole('teacher');
  }

  /**
   * Verify teacher or principal access middleware
   * @returns {Function} Express middleware
   */
  verifyAuthenticatedUser() {
    return this.verifyRole('principal', 'teacher');
  }
}