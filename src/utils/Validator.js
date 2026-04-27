import AppError from './AppError.js';

export default class Validator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }
  }

  static validatePassword(password) {
    if (!password || password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }
  }

  static validateRequiredFields(data, fields) {
    const missing = fields.filter((field) => !data[field]);
    if (missing.length > 0) {
      throw new AppError(
        `Missing required fields: ${missing.join(', ')}`,
        400
      );
    }
  }

  static validateEnum(value, allowedValues, fieldName) {
    if (!allowedValues.includes(value)) {
      throw new AppError(
        `Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`,
        400
      );
    }
  }

  static validateRole(role) {
    this.validateEnum(role, ['principal', 'teacher'], 'role');
  }

  static validateSubject(subject) {
    // Add valid subjects here
    const validSubjects = ['Maths', 'Science', 'English', 'History', 'Geography'];
    this.validateEnum(subject, validSubjects, 'subject');
  }

  static validateContentStatus(status) {
    this.validateEnum(status, ['uploaded', 'pending', 'approved', 'rejected'], 'status');
  }

  static validateId(id, fieldName = 'ID') {
    if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
      throw new AppError(`Invalid ${fieldName} format`, 400);
    }
  }
}
