import { Router } from 'express';

/**
 * createAuthRoutes - Factory function to create auth routes
 * Follows DIP: Routes depend on injected controller and middleware
 * Follows SRP: Only responsible for route definitions
 * @param {AuthController} authController - Injected auth controller
 * @param {AuthMiddleware} authMiddleware - Injected auth middleware
 * @returns {Router} Express router
 */
export function createAuthRoutes(authController, authMiddleware) {
  const router = Router();

  /**
   * POST /auth/register
   * Public endpoint - Register new user
   */
  router.post('/register', (req, res, next) =>
    authController.register(req, res, next)
  );

  /**
   * POST /auth/login
   * Public endpoint - Login user
   */
  router.post('/login', (req, res, next) =>
    authController.login(req, res, next)
  );

  /**
   * GET /auth/me
   * Protected endpoint - Get current user info
   */
  router.get(
    '/me',
    authMiddleware.verifyToken(),
    (req, res, next) => authController.getCurrentUser(req, res, next)
  );

  return router;
}
