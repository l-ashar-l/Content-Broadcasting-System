import JwtManager from '../utils/JwtManager.js';
import AppError from '../utils/AppError.js';

export default class AuthMiddleware {
  constructor(jwtManager) {
    this.jwtManager = jwtManager;
  }

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

  verifyPrincipal() {
    return this.verifyRole('principal');
  }

  verifyTeacher() {
    return this.verifyRole('teacher');
  }

  verifyAuthenticatedUser() {
    return this.verifyRole('principal', 'teacher');
  }
}