import ResponseFormatter from '../utils/ResponseFormatter.js';
import { s3StorageManager } from '../utils/s3singletons.js';

export default class BroadcastController {
  constructor(rotationService, redisManager = null) {
    this.rotationService = rotationService;
    this.redisManager = redisManager;
  }

  /**
   * Get live content for a teacher endpoint handler
   * GET /content/live/:teacherId
   * Public API endpoint - No authentication required
   * Returns currently active content based on rotation schedule
   * Cached for 5 minutes (300 seconds)
   */
  async getLiveContent(req, res, next) {
    try {
      const { teacherId } = req.params;
      const cacheKey = `live_content_${teacherId}`;

      // Try to get from cache
      if (this.redisManager && this.redisManager.isConnected()) {
        const cachedData = await this.redisManager.get(cacheKey);
        if (cachedData) {
          return res
            .status(200)
            .json(
              ResponseFormatter.success(
                cachedData,
                'Live content retrieved from cache'
              )
            );
        }
      }

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

      // Cache for 5 minutes
      if (this.redisManager && this.redisManager.isConnected()) {
        await this.redisManager.set(cacheKey, contentsWithUrls, 300);
      }

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
   * Cached for 5 minutes (300 seconds)
   */
  async getLiveContentBySubject(req, res, next) {
    try {
      const { teacherId, subject } = req.params;
      const cacheKey = `live_content_${teacherId}_${subject}`;

      // Try to get from cache
      if (this.redisManager && this.redisManager.isConnected()) {
        const cachedData = await this.redisManager.get(cacheKey);
        if (cachedData) {
          return res
            .status(200)
            .json(
              ResponseFormatter.success(
                cachedData,
                'Live content retrieved from cache'
              )
            );
        }
      }

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

      // Cache for 5 minutes
      if (this.redisManager && this.redisManager.isConnected()) {
        await this.redisManager.set(cacheKey, contentData, 300);
      }

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
