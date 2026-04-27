import AppError from './AppError.js';

/**
 * Validator - Input validation utility
 * Follows SRP: Only responsible for validation logic
 * Follows OCP: Can be extended with new validators
 */
export default class Validator {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @throws {AppError} If email is invalid
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @throws {AppError} If password is weak
   */
  static validatePassword(password) {
    if (!password || password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }
  }

  /**
   * Validate required fields
   * @param {Object} data - Data object
   * @param {Array<string>} fields - Required field names
   * @throws {AppError} If any required field is missing
   */
  static validateRequiredFields(data, fields) {
    const missing = fields.filter((field) => !data[field]);
    if (missing.length > 0) {
      throw new AppError(
        `Missing required fields: ${missing.join(', ')}`,
        400
      );
    }
  }

  /**
   * Validate enum values
   * @param {*} value - Value to check
   * @param {Array} allowedValues - Allowed values
   * @param {string} fieldName - Field name for error message
   * @throws {AppError} If value not in allowed list
   */
  static validateEnum(value, allowedValues, fieldName) {
    if (!allowedValues.includes(value)) {
      throw new AppError(
        `Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`,
        400
      );
    }
  }

  /**
   * Validate role
   * @param {string} role - Role to validate
   * @throws {AppError} If role is invalid
   */
  static validateRole(role) {
    this.validateEnum(role, ['principal', 'teacher'], 'role');
  }

  /**
   * Validate subject
   * @param {string} subject - Subject to validate
   * @throws {AppError} If subject is invalid
   */
  static validateSubject(subject) {
    // Add valid subjects here
    const validSubjects = ['Maths', 'Science', 'English', 'History', 'Geography'];
    this.validateEnum(subject, validSubjects, 'subject');
  }

  /**
   * Validate content status
   * @param {string} status - Status to validate
   * @throws {AppError} If status is invalid
   */
  static validateContentStatus(status) {
    this.validateEnum(status, ['uploaded', 'pending', 'approved', 'rejected'], 'status');
  }

  /**
   * Validate ID format (should be number or valid UUID)
   * @param {*} id - ID to validate
   * @param {string} fieldName - Field name for error message
   * @throws {AppError} If ID format is invalid
   */
  static validateId(id, fieldName = 'ID') {
    if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
      throw new AppError(`Invalid ${fieldName} format`, 400);
    }
  }
}
