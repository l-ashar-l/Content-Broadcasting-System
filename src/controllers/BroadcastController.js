import ResponseFormatter from '../utils/ResponseFormatter.js';
import { s3StorageManager } from '../utils/s3singletons.js';
import ScheduleCalculator from '../utils/ScheduleCalculator.js';

export default class BroadcastController {
  constructor(rotationService, redisManager = null) {
    this.rotationService = rotationService;
    this.redisManager = redisManager;
  }

  /**
   * Calculate cache TTL based on rotation schedule
   * Returns how long until the next content rotation
   * This ensures cache expires exactly when content should change
   */
  _calculateRotationTTL(activeContents, currentTime = new Date()) {
    if (!activeContents || activeContents.length === 0) {
      return 300; // Default 5 minutes
    }

    // Get earliest start time
    const earliestStartTime = Math.min(
      ...activeContents.map((c) => new Date(c.start_time).getTime())
    );

    const elapsedMs = currentTime.getTime() - earliestStartTime;

    // Calculate total cycle duration in milliseconds
    const totalDuration = activeContents.reduce(
      (sum, content) => sum + (content.rotation_duration || 5),
      0
    );
    const totalDurationMs = totalDuration * 60 * 1000;

    // Time within current cycle
    let timeInCycle = elapsedMs % totalDurationMs;

    // Find which content is current and how much time left in that content
    let cumulativeTime = 0;
    for (let i = 0; i < activeContents.length; i++) {
      const durationMs = (activeContents[i].rotation_duration || 5) * 60 * 1000;
      const nextCumulativeTime = cumulativeTime + durationMs;

      if (timeInCycle < nextCumulativeTime) {
        // Time until this content ends (in milliseconds)
        const msUntilNextRotation = nextCumulativeTime - timeInCycle;
        // Add 10 seconds buffer to ensure fresh data
        const ttlInSeconds = Math.ceil(msUntilNextRotation / 1000) + 10;
        // Cap at 5 minutes maximum
        return Math.min(ttlInSeconds, 300);
      }

      cumulativeTime = nextCumulativeTime;
    }

    return 300; // Default 5 minutes
  }

  /**
   * Get live content for a teacher endpoint handler
   * GET /content/live/:teacherId
   * Public API endpoint - No authentication required
   * Returns currently active content based on rotation schedule
   * Cache TTL dynamically calculated based on next rotation time
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

      // Calculate rotation-aware cache TTL
      const dynamicTTL = this._calculateRotationTTL(activeContents);

      // Cache with dynamic TTL based on rotation timing
      if (this.redisManager && this.redisManager.isConnected()) {
        await this.redisManager.set(cacheKey, contentsWithUrls, dynamicTTL);
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
   * Cache TTL based on rotation timing for that subject
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

      // For subject-specific content, calculate TTL based on rotation duration
      const rotationDuration = activeContent.rotation_duration || 5;
      const ttlInSeconds = (rotationDuration * 60) + 10; // Content duration + 10s buffer
      const dynamicTTL = Math.min(ttlInSeconds, 300); // Cap at 5 minutes

      // Cache with dynamic TTL
      if (this.redisManager && this.redisManager.isConnected()) {
        await this.redisManager.set(cacheKey, contentData, dynamicTTL);
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
   * Cached based on total rotation cycle duration
   */
  async getRotationSchedule(req, res, next) {
    try {
      const { teacherId, subject } = req.params;
      const cacheKey = `rotation_schedule_${teacherId}_${subject}`;

      // Try to get from cache
      if (this.redisManager && this.redisManager.isConnected()) {
        const cachedSchedule = await this.redisManager.get(cacheKey);
        if (cachedSchedule) {
          return res
            .status(200)
            .json(
              ResponseFormatter.success(
                cachedSchedule,
                'Rotation schedule retrieved from cache'
              )
            );
        }
      }

      const schedule = await this.rotationService.getRotationSchedule(
        teacherId,
        subject
      );

      if (!schedule || schedule.length === 0) {
        return res
          .status(200)
          .json(ResponseFormatter.success([], 'No content in rotation for this subject'));
      }

      // Calculate cache TTL based on total cycle duration
      // Sum all rotation durations to get total cycle time
      const totalDurationMinutes = schedule.reduce(
        (sum, item) => sum + (item.duration || 5),
        0
      );
      const ttlInSeconds = Math.min((totalDurationMinutes * 60) + 10, 300); // Cap at 5 minutes

      // Cache with rotation cycle duration
      if (this.redisManager && this.redisManager.isConnected()) {
        await this.redisManager.set(cacheKey, schedule, ttlInSeconds);
      }

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
