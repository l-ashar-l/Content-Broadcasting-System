import AppError from './AppError.js';

export default class ScheduleCalculator {
  static isWithinTimeWindow(content, currentTime = new Date()) {
    if (!content.start_time || !content.end_time) {
      return false;
    }

    const startTime = new Date(content.start_time);
    const endTime = new Date(content.end_time);

    return currentTime >= startTime && currentTime <= endTime;
  }

  static getActiveContent(contentList, currentTime = new Date()) {
    if (!contentList || contentList.length === 0) {
      return null;
    }

    // Filter approved content within time window
    const activeContent = contentList.filter(
      (content) =>
        content.status === 'approved' &&
        this.isWithinTimeWindow(content, currentTime)
    );

    if (activeContent.length === 0) {
      return null;
    }

    // Sort by schedule creation time to maintain order
    activeContent.sort((a, b) => {
      const scheduleA = a.schedule || { created_at: a.created_at };
      const scheduleB = b.schedule || { created_at: b.created_at };
      return (
        new Date(scheduleA.created_at) - new Date(scheduleB.created_at)
      );
    });

    // Calculate which content should be active based on time and duration
    const rotationIndex = this.calculateRotationIndex(
      activeContent,
      currentTime
    );

    return activeContent[rotationIndex];
  }

  static calculateRotationIndex(contentList, currentTime = new Date()) {
    if (contentList.length === 0) return 0;

    // Get the earliest start time across all content
    const earliestStartTime = Math.min(
      ...contentList.map((c) => new Date(c.start_time).getTime())
    );

    // Calculate time elapsed since earliest start
    const elapsedMs = currentTime.getTime() - earliestStartTime;

    // Calculate total cycle duration
    const totalDuration = contentList.reduce(
      (sum, content) =>
        sum + (content.schedule?.duration || content.rotation_duration || 5),
      0
    );

    // Ensure we loop through the rotation
    let timeInCycle = elapsedMs % (totalDuration * 60 * 1000); // Convert minutes to ms

    let cumulativeTime = 0;
    for (let i = 0; i < contentList.length; i++) {
      const duration = (contentList[i].schedule?.duration ||
        contentList[i].rotation_duration ||
        5) * 60 * 1000; // Convert to ms
      cumulativeTime += duration;

      if (timeInCycle < cumulativeTime) {
        return i;
      }
    }

    return 0;
  }

  static getRotationSchedule(contentList) {
    return contentList.map((content, index) => ({
      index,
      contentId: content.id,
      title: content.title,
      duration: content.schedule?.duration || content.rotation_duration || 5,
      startMs: index === 0 ? 0 : null,
    }));
  }

  static validateScheduleData(scheduleData) {
    const { start_time, end_time, rotation_duration } = scheduleData;

    if (start_time && end_time) {
      const startTime = new Date(start_time);
      const endTime = new Date(end_time);

      if (startTime >= endTime) {
        throw new AppError(
          'Start time must be before end time',
          400
        );
      }

      if (startTime < new Date()) {
        throw new AppError(
          'Start time cannot be in the past',
          400
        );
      }
    }

    if (rotation_duration && rotation_duration < 1) {
      throw new AppError(
        'Rotation duration must be at least 1 minute',
        400
      );
    }
  }
}
