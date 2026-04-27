import { Router } from 'express';

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Content management and broadcasting endpoints
 */

/**
 * @swagger
 * /api/content/upload:
 *   post:
 *     summary: Upload content (Teachers only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - title
 *               - subject
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (jpg, png, gif)
 *               title:
 *                 type: string
 *                 example: "Mathematics Lesson 1"
 *               subject:
 *                 type: string
 *                 example: "Mathematics"
 *               description:
 *                 type: string
 *                 example: "Introduction to Algebra"
 *               start_time:
 *                 type: string
 *                 format: date-time
 *               end_time:
 *                 type: string
 *                 format: date-time
 *               rotation_duration:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Content uploaded successfully
 *       400:
 *         description: Invalid file or missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a teacher
 */

/**
 * @swagger
 * /api/content/teacher/my-content:
 *   get:
 *     summary: Get teacher's own content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Teacher's content retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a teacher
 */

/**
 * @swagger
 * /api/content/pending:
 *   get:
 *     summary: Get pending content for approval (Principal only)
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending content list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not a principal
 */

/**
 * @swagger
 * /api/content/approved:
 *   get:
 *     summary: Get all approved content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approved content list
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/content/live/{teacherId}:
 *   get:
 *     summary: Get live content for a teacher
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Live content array with download URLs (one active content per subject)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       subject:
 *                         type: string
 *                       file_path:
 *                         type: string
 *                       download_url:
 *                         type: string
 *                       url_expires_in:
 *                         type: integer
 *                       url_expires_at:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: No content available
 */

/**
 * @swagger
 * /api/content/live/{teacherId}/subject/{subject}:
 *   get:
 *     summary: Get live content for specific subject
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: subject
 *         required: true
 *         schema:
 *           type: string
 *           example: "Mathematics"
 *     responses:
 *       200:
 *         description: Live content for subject with download URL
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
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     subject:
 *                       type: string
 *                     file_path:
 *                       type: string
 *                     download_url:
 *                       type: string
 *                     url_expires_in:
 *                       type: integer
 *                     url_expires_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: No content available
 */

/**
 * @swagger
 * /api/content/schedule/{teacherId}/subject/{subject}:
 *   get:
 *     summary: Get rotation schedule
 *     tags: [Content]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: subject
 *         required: true
 *         schema:
 *           type: string
 *           example: "Mathematics"
 *     responses:
 *       200:
 *         description: Rotation schedule
 */

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Get content by ID with download URL
 *     tags: [Content]
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
 *         description: Content details with download URL and expiration info
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */

/**
 * @swagger
 * /api/content/{id}/download-url:
 *   get:
 *     summary: Get signed download URL for content file
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: integer
 *           example: 3600
 *           description: URL expiration time in seconds (default 3600)
 *     responses:
 *       200:
 *         description: Signed download URL
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
 *                     url:
 *                       type: string
 *                       example: "https://s3.amazonaws.com/bucket/key?X-Amz-Signature=..."
 *                     contentId:
 *                       type: integer
 *                       example: 1
 *                     fileName:
 *                       type: string
 *                       example: "Mathematics Lesson 1"
 *                     expiresIn:
 *                       type: integer
 *                       example: 3600
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content not found
 */

export function createContentRoutes(
  contentController,
  broadcastController,
  authMiddleware,
  uploadMiddleware,
  contentLiveLimiter
) {
  const router = Router();

  router.post(
    '/upload',
    authMiddleware.verifyToken(),
    authMiddleware.verifyTeacher(),
    uploadMiddleware.single('file'),
    (req, res, next) => contentController.uploadContent(req, res, next)
  );

  router.get(
    '/teacher/my-content',
    authMiddleware.verifyToken(),
    authMiddleware.verifyTeacher(),
    (req, res, next) => contentController.getMyContent(req, res, next)
  );

  router.get(
    '/pending',
    authMiddleware.verifyToken(),
    authMiddleware.verifyPrincipal(),
    (req, res, next) => contentController.getPendingContent(req, res, next)
  );

  router.get(
    '/approved',
    authMiddleware.verifyToken(),
    (req, res, next) => contentController.getApprovedContent(req, res, next)
  );

  router.get(
    '/live/:teacherId',
    contentLiveLimiter,
    (req, res, next) => broadcastController.getLiveContent(req, res, next)
  );

  router.get(
    '/live/:teacherId/subject/:subject',
    contentLiveLimiter,
    (req, res, next) => broadcastController.getLiveContentBySubject(req, res, next)
  );

  router.get(
    '/schedule/:teacherId/subject/:subject',
    (req, res, next) => broadcastController.getRotationSchedule(req, res, next)
  );

  router.get(
    '/:id/download-url',
    authMiddleware.verifyToken(),
    (req, res, next) => contentController.getContentDownloadUrl(req, res, next)
  );

  router.get(
    '/:id',
    authMiddleware.verifyToken(),
    (req, res, next) => contentController.getContentById(req, res, next)
  );

  return router;
}
