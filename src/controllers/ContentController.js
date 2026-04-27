import ResponseFormatter from '../utils/ResponseFormatter.js';

/**
 * ContentController - Handles content endpoints
 * Follows SRP: Only responsible for HTTP request/response handling
 * Follows DIP: Depends on injected ContentService and FileManager
 */
export default class ContentController {
  constructor(contentService, fileManager) {
    this.contentService = contentService;
    this.fileManager = fileManager;
  }

  /**
   * Upload content endpoint handler
   * POST /content/upload
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  async uploadContent(req, res, next) {
    try {
      // Validate file
      this.fileManager.validateFile(req.file);

      const { title, subject, description, start_time, end_time, rotation_duration } =
        req.body;

      const content = await this.contentService.uploadContent(
        {
          title,
          subject,
          description,
          userId: req.user.id,
          start_time,
          end_time,
          rotation_duration,
        },
        req.file
      );

      res
        .status(201)
        .json(
          ResponseFormatter.success(content, 'Content uploaded successfully', 201)
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get content by ID endpoint handler
   * GET /content/:id
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  async getContentById(req, res, next) {
    try {
      const { id } = req.params;

      const content = await this.contentService.getContentById(id);

      res
        .status(200)
        .json(ResponseFormatter.success(content, 'Content retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get teacher's content endpoint handler
   * GET /content/teacher/my-content
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  async getMyContent(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.contentService.getContentByTeacher(req.user.id, {
        page,
        limit,
      });

      res
        .status(200)
        .json(
          ResponseFormatter.paginated(
            result.contents,
            result.total,
            page,
            limit,
            'Content retrieved successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending content endpoint handler (for principal)
   * GET /content/pending
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  async getPendingContent(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await this.contentService.getPendingContent({ page, limit });

      res
        .status(200)
        .json(
          ResponseFormatter.paginated(
            result.contents,
            result.total,
            page,
            limit,
            'Pending content retrieved successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get approved content endpoint handler
   * GET /content/approved
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next
   */
  async getApprovedContent(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const subject = req.query.subject || null;

      const result = await this.contentService.getApprovedContent({
        subject,
        page,
        limit,
      });

      res
        .status(200)
        .json(
          ResponseFormatter.paginated(
            result.contents,
            result.total,
            page,
            limit,
            'Approved content retrieved successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
