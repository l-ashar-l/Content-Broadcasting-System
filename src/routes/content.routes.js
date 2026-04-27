import { Router } from 'express';

/**
 * createContentRoutes - Factory function to create content routes
 * Follows DIP: Routes depend on injected controllers and middleware
 * Follows SRP: Only responsible for route definitions
 * @param {ContentController} contentController - Injected content controller
 * @param {BroadcastController} broadcastController - Injected broadcast controller
 * @param {AuthMiddleware} authMiddleware - Injected auth middleware
 * @param {UploadMiddleware} uploadMiddleware - Injected upload middleware
 * @returns {Router} Express router
 */
export function createContentRoutes(
  contentController,
  broadcastController,
  authMiddleware,
  uploadMiddleware
) {
  const router = Router();

  /**
   * POST /content/upload
   * Protected endpoint - Teachers only - Upload content
   */
  router.post(
    '/upload',
    authMiddleware.verifyToken(),
    authMiddleware.verifyTeacher(),
    uploadMiddleware.single('file'),
    (req, res, next) => contentController.uploadContent(req, res, next)
  );

  /**
   * GET /content/:id
   * Protected endpoint - Get content by ID
   */
  router.get(
    '/:id',
    authMiddleware.verifyToken(),
    (req, res, next) => contentController.getContentById(req, res, next)
  );

  /**
   * GET /content/teacher/my-content
   * Protected endpoint - Teachers only - Get their own content
   */
  router.get(
    '/teacher/my-content',
    authMiddleware.verifyToken(),
    authMiddleware.verifyTeacher(),
    (req, res, next) => contentController.getMyContent(req, res, next)
  );

  /**
   * GET /content/pending
   * Protected endpoint - Principal only - Get pending content for approval
   */
  router.get(
    '/pending',
    authMiddleware.verifyToken(),
    authMiddleware.verifyPrincipal(),
    (req, res, next) => contentController.getPendingContent(req, res, next)
  );

  /**
   * GET /content/approved
   * Protected endpoint - Get all approved content
   */
  router.get(
    '/approved',
    authMiddleware.verifyToken(),
    (req, res, next) => contentController.getApprovedContent(req, res, next)
  );

  /**
   * GET /content/live/:teacherId
   * Public endpoint - Get live content for a teacher (for students)
   * Returns currently active content based on rotation
   */
  router.get(
    '/live/:teacherId',
    (req, res, next) => broadcastController.getLiveContent(req, res, next)
  );

  /**
   * GET /content/live/:teacherId/subject/:subject
   * Public endpoint - Get live content for specific subject
   */
  router.get(
    '/live/:teacherId/subject/:subject',
    (req, res, next) => broadcastController.getLiveContentBySubject(req, res, next)
  );

  /**
   * GET /content/schedule/:teacherId/subject/:subject
   * Public endpoint - Get rotation schedule
   */
  router.get(
    '/schedule/:teacherId/subject/:subject',
    (req, res, next) => broadcastController.getRotationSchedule(req, res, next)
  );

  return router;
}
