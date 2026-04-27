import { Router } from 'express';

/**
 * createApprovalRoutes - Factory function to create approval routes
 * Follows DIP: Routes depend on injected controllers and middleware
 * Follows SRP: Only responsible for route definitions
 * @param {ApprovalController} approvalController - Injected approval controller
 * @param {AuthMiddleware} authMiddleware - Injected auth middleware
 * @returns {Router} Express router
 */
export function createApprovalRoutes(approvalController, authMiddleware) {
  const router = Router();

  /**
   * POST /approval/approve/:contentId
   * Protected endpoint - Principal only - Approve content
   */
  router.post(
    '/approve/:contentId',
    authMiddleware.verifyToken(),
    authMiddleware.verifyPrincipal(),
    (req, res, next) => approvalController.approveContent(req, res, next)
  );

  /**
   * POST /approval/reject/:contentId
   * Protected endpoint - Principal only - Reject content
   */
  router.post(
    '/reject/:contentId',
    authMiddleware.verifyToken(),
    authMiddleware.verifyPrincipal(),
    (req, res, next) => approvalController.rejectContent(req, res, next)
  );

  /**
   * GET /approval/status/:contentId
   * Protected endpoint - Get content approval status
   */
  router.get(
    '/status/:contentId',
    authMiddleware.verifyToken(),
    (req, res, next) => approvalController.getApprovalStatus(req, res, next)
  );

  /**
   * GET /approval/stats
   * Protected endpoint - Principal only - Get approval statistics
   */
  router.get(
    '/stats',
    authMiddleware.verifyToken(),
    authMiddleware.verifyPrincipal(),
    (req, res, next) => approvalController.getApprovalStats(req, res, next)
  );

  return router;
}
