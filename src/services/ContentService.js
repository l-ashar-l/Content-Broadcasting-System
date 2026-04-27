import { Content, ContentSlot, ContentSchedule } from '../models/index.js';
import AppError from '../utils/AppError.js';
import Validator from '../utils/Validator.js';
import ScheduleCalculator from '../utils/ScheduleCalculator.js';

/**
 * ContentService - Handles content operations
 * Follows SRP: Only responsible for content business logic
 * Follows DIP: Depends on injected models
 */
export default class ContentService {
  /**
   * Upload content
   * @param {Object} contentData - {title, subject, description, userId}
   * @param {Object} file - Uploaded file object
   * @returns {Promise<Object>} Created content
   * @throws {AppError} If validation fails
   */
  async uploadContent(contentData, file) {
    const { title, subject, description, userId, start_time, end_time, rotation_duration } =
      contentData;

    // Validate input
    Validator.validateRequiredFields({ title, subject, userId }, ['title', 'subject', 'userId']);

    if (!file) {
      throw new AppError('No file provided', 400);
    }

    // Validate schedule if provided
    if (start_time || end_time) {
      ScheduleCalculator.validateScheduleData({ start_time, end_time, rotation_duration });
    }

    // Create content
    const content = await Content.create({
      title,
      subject,
      description,
      file_path: file.filename,
      file_type: file.mimetype,
      file_size: file.size,
      uploaded_by: userId,
      status: 'pending',
      start_time: start_time || null,
      end_time: end_time || null,
      rotation_duration: rotation_duration || 5,
    });

    // Auto-create or update subject slot if needed
    await this.ensureSubjectSlot(subject);

    return content;
  }

  /**
   * Get content by ID
   * @param {number} contentId - Content ID
   * @returns {Promise<Object>} Content object
   * @throws {AppError} If content not found
   */
  async getContentById(contentId) {
    Validator.validateId(contentId, 'Content ID');

    const content = await Content.findByPk(contentId, {
      include: [
        { association: 'uploader', attributes: ['id', 'name', 'email'] },
        { association: 'approver', attributes: ['id', 'name', 'email'] },
        { association: 'schedules', as: 'schedules' },
      ],
    });

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    return content;
  }

  /**
   * Get content by teacher
   * @param {number} userId - Teacher user ID
   * @param {Object} options - {page, limit}
   * @returns {Promise<Object>} {contents, total, page, limit}
   */
  async getContentByTeacher(userId, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Content.findAndCountAll({
      where: { uploaded_by: userId },
      include: [
        { association: 'uploader', attributes: ['id', 'name', 'email'] },
        { association: 'approver', attributes: ['id', 'name', 'email'] },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      contents: rows,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Get all pending content (for principal approval)
   * @param {Object} options - {page, limit}
   * @returns {Promise<Object>} {contents, total}
   */
  async getPendingContent(options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await Content.findAndCountAll({
      where: { status: 'pending' },
      include: [
        { association: 'uploader', attributes: ['id', 'name', 'email'] },
      ],
      limit,
      offset,
      order: [['created_at', 'ASC']],
    });

    return {
      contents: rows,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Get approved content
   * @param {Object} options - {subject, page, limit}
   * @returns {Promise<Object>} {contents, total}
   */
  async getApprovedContent(options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;

    const where = { status: 'approved' };
    if (options.subject) {
      where.subject = options.subject;
    }

    const { rows, count } = await Content.findAndCountAll({
      where,
      include: [
        { association: 'uploader', attributes: ['id', 'name', 'email'] },
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return {
      contents: rows,
      total: count,
      page,
      limit,
    };
  }

  /**
   * Ensure subject slot exists
   * @param {string} subject - Subject name
   * @returns {Promise<Object>} Content slot
   */
  async ensureSubjectSlot(subject) {
    let slot = await ContentSlot.findOne({ where: { subject } });
    if (!slot) {
      slot = await ContentSlot.create({ subject });
    }
    return slot;
  }

  /**
   * Get content for live broadcasting
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Object>} Active content or null
   */
  async getLiveContent(teacherId) {
    // Get all approved content for this teacher
    const content = await Content.findAll({
      where: {
        uploaded_by: teacherId,
        status: 'approved',
      },
      include: [
        {
          association: 'schedules',
          as: 'schedules',
          include: [{ association: 'slot', as: 'slot' }],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    if (content.length === 0) {
      return null;
    }

    // Group by subject
    const bySubject = {};
    content.forEach((item) => {
      if (!bySubject[item.subject]) {
        bySubject[item.subject] = [];
      }
      bySubject[item.subject].push(item);
    });

    // Get active content for each subject
    const activeContent = {};
    for (const [subject, items] of Object.entries(bySubject)) {
      const active = ScheduleCalculator.getActiveContent(items);
      if (active) {
        activeContent[subject] = active;
      }
    }

    return Object.keys(activeContent).length > 0 ? activeContent : null;
  }
}
