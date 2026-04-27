import { Content, ContentSlot, ContentSchedule } from '../models/index.js';
import ScheduleCalculator from '../utils/ScheduleCalculator.js';
import AppError from '../utils/AppError.js';

/**
 * RotationService - Manages content rotation and scheduling
 * Follows SRP: Only responsible for rotation logic
 * Follows DIP: Depends on injected models and ScheduleCalculator
 * CRITICAL: This service implements the core scheduling feature
 */
export default class RotationService {
  /**
   * Get live content for a teacher with rotation
   * This is the core API endpoint logic
   * @param {number} teacherId - Teacher ID
   * @returns {Promise<Array|null>} Array of active contents or null
   */
  async getLiveContent(teacherId) {
    const contents = await Content.findAll({
      where: {
        uploaded_by: teacherId,
        status: 'approved',
      },
      include: [
        {
          association: 'schedules',
          as: 'schedules',
        },
      ],
      order: [['created_at', 'ASC']],
    });

    if (!contents.length) {
      return null;
    }

    // Group by subject
    const bySubject = {};
    contents.forEach((content) => {
      if (!bySubject[content.subject]) {
        bySubject[content.subject] = [];
      }
      bySubject[content.subject].push(content);
    });

    // Get active content for each subject
    const activeContents = [];
    for (const [subject, items] of Object.entries(bySubject)) {
      const active = ScheduleCalculator.getActiveContent(items);
      if (active) {
        activeContents.push(active);
      }
    }

    return activeContents.length > 0 ? activeContents : null;
  }

  /**
   * Get active content for specific subject
   * @param {number} teacherId - Teacher ID
   * @param {string} subject - Subject name
   * @returns {Promise<Object|null>} Active content or null
   */
  async getActiveContentBySubject(teacherId, subject) {
    const contents = await Content.findAll({
      where: {
        uploaded_by: teacherId,
        status: 'approved',
        subject,
      },
      include: [
        {
          association: 'schedules',
          as: 'schedules',
        },
      ],
      order: [['created_at', 'ASC']],
    });

    if (contents.length === 0) {
      return null;
    }

    return ScheduleCalculator.getActiveContent(contents) || null;
  }

  /**
   * Get rotation schedule for a subject
   * @param {number} teacherId - Teacher ID
   * @param {string} subject - Subject name
   * @returns {Promise<Array>} Rotation schedule
   */
  async getRotationSchedule(teacherId, subject) {
    const contents = await Content.findAll({
      where: {
        uploaded_by: teacherId,
        status: 'approved',
        subject,
      },
      include: [
        {
          association: 'schedules',
          as: 'schedules',
        },
      ],
      order: [['created_at', 'ASC']],
    });

    return ScheduleCalculator.getRotationSchedule(contents);
  }

  /**
   * Add content to rotation
   * @param {number} contentId - Content ID
   * @param {string} subject - Subject name
   * @param {number} rotationOrder - Order in rotation
   * @param {number} duration - Duration in minutes
   * @returns {Promise<Object>} Schedule record
   */
  async addToRotation(contentId, subject, rotationOrder, duration) {
    const content = await Content.findByPk(contentId);
    if (!content) {
      throw new AppError('Content not found', 404);
    }

    if (content.status !== 'approved') {
      throw new AppError('Only approved content can be added to rotation', 400);
    }

    // Get or create slot
    let slot = await ContentSlot.findOne({ where: { subject } });
    if (!slot) {
      slot = await ContentSlot.create({ subject });
    }

    // Create schedule
    const schedule = await ContentSchedule.create({
      content_id: contentId,
      slot_id: slot.id,
      rotation_order: rotationOrder || 0,
      duration: duration || 5,
    });

    return schedule;
  }

  /**
   * Update rotation schedule
   * @param {number} scheduleId - Schedule ID
   * @param {Object} updates - {rotation_order, duration}
   * @returns {Promise<Object>} Updated schedule
   */
  async updateRotationSchedule(scheduleId, updates) {
    const schedule = await ContentSchedule.findByPk(scheduleId);
    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    if (updates.rotation_order !== undefined) {
      schedule.rotation_order = updates.rotation_order;
    }
    if (updates.duration !== undefined) {
      schedule.duration = updates.duration;
    }

    await schedule.save();
    return schedule;
  }

  /**
   * Remove content from rotation
   * @param {number} scheduleId - Schedule ID
   * @returns {Promise<void>}
   */
  async removeFromRotation(scheduleId) {
    const schedule = await ContentSchedule.findByPk(scheduleId);
    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    await schedule.destroy();
  }
}
