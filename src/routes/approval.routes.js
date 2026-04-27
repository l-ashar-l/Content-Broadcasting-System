import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Approval
 *   description: Content approval endpoints (Principal only)
 */

/**
 * @swagger
 * /api/approval/approve/{contentId}:
 *   post:
 *     summary: Approve content (Principal only)
 *     tags: [Approval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remarks:
 *                 type: string
 *                 example: "Approved - Good content"
 *     responses:
 *       200:
 *         description: Content approved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a principal
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /api/approval/reject/{contentId}:
 *   post:
 *     summary: Reject content (Principal only)
 *     tags: [Approval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Content does not meet quality standards"
 *     responses:
 *       200:
 *         description: Content rejected successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a principal
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /api/approval/status/{contentId}:
 *   get:
 *     summary: Get content approval status
 *     tags: [Approval]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Approval status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     contentId:
 *                       type: integer
 *                       example: 1
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, rejected]
 *                       example: "approved"
 *                     approvedBy:
 *                       type: integer
 *                       example: 5
 *                     remarks:
 *                       type: string
 *                       example: "Approved - Good content"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /api/approval/stats:
 *   get:
 *     summary: Get approval statistics (Principal only)
 *     tags: [Approval]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approval statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     pending:
 *                       type: integer
 *                       example: 15
 *                     approved:
 *                       type: integer
 *                       example: 70
 *                     rejected:
 *                       type: integer
 *                       example: 15
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a principal
 */

export function createApprovalRoutes(approvalController, authMiddleware) {
  const router = Router();

  router.post(
    '/approve/:contentId',
    authMiddleware.verifyToken(),
    authMiddleware.verifyPrincipal(),
    (req, res, next) => approvalController.approveContent(req, res, next)
  );

  router.post(
    '/reject/:contentId',
    authMiddleware.verifyToken(),
    authMiddleware.verifyPrincipal(),
    (req, res, next) => approvalController.rejectContent(req, res, next)
  );

  router.get(
    '/status/:contentId',
    authMiddleware.verifyToken(),
    (req, res, next) => approvalController.getApprovalStatus(req, res, next)
  );

  router.get(
    '/stats',
    authMiddleware.verifyToken(),
    authMiddleware.verifyPrincipal(),
    (req, res, next) => approvalController.getApprovalStats(req, res, next)
  );

  return router;
}
