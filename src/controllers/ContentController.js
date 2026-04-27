import ResponseFormatter from '../utils/ResponseFormatter.js';
import { s3StorageManager } from '../utils/s3singletons.js';

export default class ContentController {
  constructor(contentService, fileManager) {
    this.contentService = contentService;
    this.fileManager = fileManager;
  }

  /**
   * Upload content endpoint handler
   * POST /content/upload
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
   */
  async getContentById(req, res, next) {
    try {
      const { id } = req.params;

      const content = await this.contentService.getContentById(id);

      // Generate signed URL for file download
      let downloadUrl = null;
      if (content.file_path) {
        try {
          downloadUrl = await s3StorageManager.getSignedUrl(content.file_path, 3600);
        } catch (error) {
          console.error('Failed to generate signed URL:', error);
        }
      }

      const contentData = {
        ...content.toJSON(),
        download_url: downloadUrl,
        url_expires_in: 3600,
        url_expires_at: downloadUrl ? new Date(Date.now() + 3600 * 1000).toISOString() : null,
      };

      res
        .status(200)
        .json(ResponseFormatter.success(contentData, 'Content retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get signed URL for content file
   * GET /content/:id/download-url
   */
  async getContentDownloadUrl(req, res, next) {
    try {
      const { id } = req.params;
      const expiresIn = parseInt(req.query.expiresIn) || 3600;

      const content = await this.contentService.getContentById(id);

      if (!content || !content.file_path) {
        throw new Error('Content or file not found');
      }

      const signedUrl = await s3StorageManager.getSignedUrl(
        content.file_path,
        expiresIn
      );

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            {
              url: signedUrl,
              contentId: id,
              fileName: content.title,
              expiresIn,
              expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
            },
            'Download URL generated successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get teacher's content endpoint handler
   * GET /content/teacher/my-content
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
