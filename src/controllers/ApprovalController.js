import ResponseFormatter from '../utils/ResponseFormatter.js';

export default class ApprovalController {
  constructor(approvalService) {
    this.approvalService = approvalService;
  }

  /**
   * Approve content endpoint handler
   * POST /approval/approve/:contentId
   */
  async approveContent(req, res, next) {
    try {
      const { contentId } = req.params;

      const content = await this.approvalService.approveContent(
        contentId,
        req.user.id
      );

      res
        .status(200)
        .json(
          ResponseFormatter.success(content, 'Content approved successfully')
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject content endpoint handler
   * POST /approval/reject/:contentId
   */
  async rejectContent(req, res, next) {
    try {
      const { contentId } = req.params;
      const { reason } = req.body;

      const content = await this.approvalService.rejectContent(
        contentId,
        req.user.id,
        reason
      );

      res
        .status(200)
        .json(
          ResponseFormatter.success(content, 'Content rejected successfully')
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get approval status endpoint handler
   * GET /approval/status/:contentId
   */
  async getApprovalStatus(req, res, next) {
    try {
      const { contentId } = req.params;

      const status = await this.approvalService.getApprovalStatus(contentId);

      res
        .status(200)
        .json(
          ResponseFormatter.success(status, 'Approval status retrieved successfully')
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get approval statistics endpoint handler
   * GET /approval/stats
   */
  async getApprovalStats(req, res, next) {
    try {
      const stats = await this.approvalService.getApprovalStats();

      res
        .status(200)
        .json(
          ResponseFormatter.success(
            stats,
            'Approval statistics retrieved successfully'
          )
        );
    } catch (error) {
      next(error);
    }
  }
}
