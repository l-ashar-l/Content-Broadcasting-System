import AppError from '../utils/AppError.js';

/**
 * RoleMiddleware - Role-based access control
 * Follows SRP: Only responsible for role verification
 * Follows OCP: Can be extended with more sophisticated authorization
 */
export default class RoleMiddleware {
  /**
   * Create middleware to verify specific role
   * @param {string} requiredRole - Required role
   * @returns {Function} Express middleware
   */
  static verifyRole(requiredRole) {
    return (req, res, next) => {
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }

      if (req.user.role !== requiredRole) {
        return next(
          new AppError(
            `Access denied. Required role: ${requiredRole}`,
            403
          )
        );
      }

      next();
    };
  }

  /**
   * Create middleware to verify principal role
   * @returns {Function} Express middleware
   */
  static verifyPrincipal() {
    return this.verifyRole('principal');
  }

  /**
   * Create middleware to verify teacher role
   * @returns {Function} Express middleware
   */
  static verifyTeacher() {
    return this.verifyRole('teacher');
  }

  /**
   * Create middleware to verify multiple roles
   * @param {...string} allowedRoles - Allowed roles
   * @returns {Function} Express middleware
   */
  static verifyAnyRole(...allowedRoles) {
    return (req, res, next) => {
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }

      if (!allowedRoles.includes(req.user.role)) {
        return next(
          new AppError(
            `Access denied. Required roles: ${allowedRoles.join(', ')}`,
            403
          )
        );
      }

      next();
    };
  }
}