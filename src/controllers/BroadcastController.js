import ResponseFormatter from '../utils/ResponseFormatter.js';

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

      const activeContent = await this.rotationService.getLiveContent(teacherId);

      if (!activeContent) {
        return res
          .status(200)
          .json(ResponseFormatter.success(null, 'No content available'));
      }

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            activeContent,
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

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            activeContent,
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
