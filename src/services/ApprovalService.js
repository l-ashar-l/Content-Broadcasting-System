import { Content } from '../models/index.js';
import AppError from '../utils/AppError.js';
import Validator from '../utils/Validator.js';

export default class ApprovalService {

  async approveContent(contentId, principalId) {
    Validator.validateId(contentId, 'Content ID');
    Validator.validateId(principalId, 'Principal ID');

    const content = await Content.findByPk(contentId);
    if (!content) {
      throw new AppError('Content not found', 404);
    }

    if (content.status !== 'pending') {
      throw new AppError(
        `Content cannot be approved. Current status: ${content.status}`,
        400
      );
    }

    // Update content status
    content.status = 'approved';
    content.approved_by = principalId;
    content.approved_at = new Date();
    await content.save();

    return content;
  }

  async rejectContent(contentId, principalId, reason) {
    Validator.validateId(contentId, 'Content ID');
    Validator.validateId(principalId, 'Principal ID');
    Validator.validateRequiredFields({ reason }, ['reason']);

    if (!reason || reason.trim().length === 0) {
      throw new AppError('Rejection reason is required', 400);
    }

    const content = await Content.findByPk(contentId);
    if (!content) {
      throw new AppError('Content not found', 404);
    }

    if (content.status !== 'pending') {
      throw new AppError(
        `Content cannot be rejected. Current status: ${content.status}`,
        400
      );
    }

    // Update content status
    content.status = 'rejected';
    content.rejection_reason = reason;
    content.approved_by = principalId;
    await content.save();

    return content;
  }

  async getApprovalStatus(contentId) {
    Validator.validateId(contentId, 'Content ID');

    const content = await Content.findByPk(contentId, {
      include: [
        { association: 'uploader', attributes: ['id', 'name', 'email'] },
        { association: 'approver', attributes: ['id', 'name', 'email'] },
      ],
    });

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    return {
      id: content.id,
      title: content.title,
      status: content.status,
      uploadedBy: content.uploader,
      uploadedAt: content.created_at,
      approvedBy: content.approver,
      approvedAt: content.approved_at,
      rejectionReason: content.rejection_reason,
    };
  }

  async getApprovalStats() {
    const stats = {};

    // Get counts by status
    for (const status of ['pending', 'approved', 'rejected']) {
      stats[status] = await Content.count({ where: { status } });
    }

    stats.total = stats.pending + stats.approved + stats.rejected;

    return stats;
  }
}
