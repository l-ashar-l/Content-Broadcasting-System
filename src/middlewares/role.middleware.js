import AppError from '../utils/AppError.js';

export default class RoleMiddleware {
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

  static verifyPrincipal() {
    return this.verifyRole('principal');
  }

  static verifyTeacher() {
    return this.verifyRole('teacher');
  }

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