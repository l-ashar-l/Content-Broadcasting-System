import { Content, ContentSlot, ContentSchedule } from '../models/index.js';
import ScheduleCalculator from '../utils/ScheduleCalculator.js';
import AppError from '../utils/AppError.js';

export default class RotationService {

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

  async removeFromRotation(scheduleId) {
    const schedule = await ContentSchedule.findByPk(scheduleId);
    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    await schedule.destroy();
  }
}
