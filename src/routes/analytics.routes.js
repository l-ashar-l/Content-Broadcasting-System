import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Subject-wise analytics and content usage tracking
 */

/**
 * @swagger
 * /api/analytics/usage:
 *   post:
 *     summary: Record content usage event (public)
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contentId]
 *             properties:
 *               contentId:
 *                 type: integer
 *                 example: 1
 *               action:
 *                 type: string
 *                 enum: [view, download, share]
 *                 example: view
 *     responses:
 *       201:
 *         description: Usage recorded successfully
 *       400:
 *         description: Invalid request body
 */

/**
 * @swagger
 * /api/analytics/subjects/most-active:
 *   get:
 *     summary: Get most active subjects by usage (protected)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *           example: 5
 *     responses:
 *       200:
 *         description: Most active subjects
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/analytics/subjects:
 *   get:
 *     summary: Get overall subject-wise analytics (protected)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subject-wise analytics
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/analytics/content/{id}/usage:
 *   get:
 *     summary: Get content-specific usage statistics (protected)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Usage stats for the content
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /api/analytics/trend:
 *   get:
 *     summary: Get usage trend over time (protected)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: contentId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Usage trend data
 *       401:
 *         description: Unauthorized
 */

export function createAnalyticsRoutes(analyticsController, authMiddleware) {
  const router = Router();

  // Public endpoint
  router.post('/usage', (req, res, next) =>
    analyticsController.recordUsage(req, res, next)
  );

  // Protected endpoints
  router.get('/subjects/most-active', authMiddleware.verifyToken(), (req, res, next) =>
    analyticsController.getMostActiveSubjects(req, res, next)
  );

  router.get('/subjects', authMiddleware.verifyToken(), (req, res, next) =>
    analyticsController.getSubjectAnalytics(req, res, next)
  );

  router.get('/content/:id/usage', authMiddleware.verifyToken(), (req, res, next) =>
    analyticsController.getContentUsage(req, res, next)
  );

  router.get('/trend', authMiddleware.verifyToken(), (req, res, next) =>
    analyticsController.getUsageTrend(req, res, next)
  );

  return router;
}
