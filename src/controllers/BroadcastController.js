import ResponseFormatter from '../utils/ResponseFormatter.js';
import { s3StorageManager } from '../utils/s3singletons.js';

/**
 * BroadcastController - Handles public broadcast endpoints
 * Follows SRP: Only responsible for HTTP request/response handling
 * Follows DIP: Depends on injected RotationService
 * This controller serves the public API for students
 */
export default class BroadcastController {
  constructor(rotationService) {
    this.rotationService = rotationService;
  }

  /**
   * Get live content for a teacher endpoint handler
   * GET /content/live/:teacherId
   * Public API endpoint - No authentication required
   * Returns currently active content based on rotation schedule
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  async getLiveContent(req, res, next) {
    try {
      const { teacherId } = req.params;

      const activeContents = await this.rotationService.getLiveContent(teacherId);

      if (!activeContents || activeContents.length === 0) {
        return res
          .status(200)
          .json(ResponseFormatter.success([], 'No content available'));
      }

      // Generate signed URLs for all contents
      const contentsWithUrls = await Promise.all(
        activeContents.map(async (content) => {
          let downloadUrl = null;
          if (content.file_path) {
            try {
              downloadUrl = await s3StorageManager.getSignedUrl(content.file_path, 3600);
            } catch (error) {
              console.error('Failed to generate signed URL:', error);
            }
          }

          return {
            ...content.toJSON(),
            download_url: downloadUrl,
            url_expires_in: 3600,
            url_expires_at: downloadUrl ? new Date(Date.now() + 3600 * 1000).toISOString() : null,
          };
        })
      );

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            contentsWithUrls,
            'Live content retrieved successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get live content for specific subject endpoint handler
   * GET /content/live/:teacherId/subject/:subject
   * Public API endpoint - No authentication required
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  async getLiveContentBySubject(req, res, next) {
    try {
      const { teacherId, subject } = req.params;

      const activeContent = await this.rotationService.getActiveContentBySubject(
        teacherId,
        subject
      );

      if (!activeContent) {
        return res
          .status(200)
          .json(ResponseFormatter.success(null, 'No content available'));
      }

      // Generate signed URL for file download
      let downloadUrl = null;
      if (activeContent.file_path) {
        try {
          downloadUrl = await s3StorageManager.getSignedUrl(activeContent.file_path, 3600);
        } catch (error) {
          console.error('Failed to generate signed URL:', error);
        }
      }

      const contentData = {
        ...activeContent.toJSON(),
        download_url: downloadUrl,
        url_expires_in: 3600,
        url_expires_at: downloadUrl ? new Date(Date.now() + 3600 * 1000).toISOString() : null,
      };

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            contentData,
            'Live content retrieved successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get rotation schedule for a subject endpoint handler
   * GET /content/schedule/:teacherId/subject/:subject
   * Public API endpoint - No authentication required
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  async getRotationSchedule(req, res, next) {
    try {
      const { teacherId, subject } = req.params;

      const schedule = await this.rotationService.getRotationSchedule(
        teacherId,
        subject
      );

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            schedule,
            'Rotation schedule retrieved successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
