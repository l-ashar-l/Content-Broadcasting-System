import ResponseFormatter from '../utils/ResponseFormatter.js';
import AnalyticsService from '../services/AnalyticsService.js';

export default class AnalyticsController {
  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Record content usage event (public endpoint)
   */
  async recordUsage(req, res, next) {
    try {
      const { contentId, action } = req.body;

      if (!contentId) {
        return res.status(400).json(ResponseFormatter.error('contentId is required', 400));
      }

      const userId = req.user ? req.user.id : null;
      const ip = req.ip || req.headers['x-forwarded-for'] || null;

      const usage = await this.analyticsService.recordUsage(contentId, action || 'view', {
        userId,
        ip,
      });

      res.status(201).json(ResponseFormatter.success(usage, 'Usage recorded', 201));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get most active subjects (protected)
   */
  async getMostActiveSubjects(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const results = await this.analyticsService.getMostActiveSubjects(limit);

      res.status(200).json(
        ResponseFormatter.success(results, 'Most active subjects retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get content-specific usage statistics (protected)
   */
  async getContentUsage(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(ResponseFormatter.error('Content ID is required', 400));
      }

      const stats = await this.analyticsService.getContentUsage(id);

      res.status(200).json(ResponseFormatter.success(stats, 'Content usage stats retrieved'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get overall subject-wise analytics (protected)
   */
  async getSubjectAnalytics(req, res, next) {
    try {
      const results = await this.analyticsService.getSubjectAnalytics();

      res.status(200).json(
        ResponseFormatter.success(results, 'Subject-wise analytics retrieved successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get usage trend over time (protected)
   */
  async getUsageTrend(req, res, next) {
    try {
      const { contentId, subject, days } = req.query;
      const trendData = await this.analyticsService.getUsageTrend(
        contentId ? parseInt(contentId) : null,
        subject,
        days ? parseInt(days) : 7
      );

      res.status(200).json(ResponseFormatter.success(trendData, 'Usage trend retrieved'));
    } catch (error) {
      next(error);
    }
  }
}
