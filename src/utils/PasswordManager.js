import bcrypt from 'bcrypt';

/**
 * PasswordManager - Handles password hashing and comparison
 * Follows SRP: Only responsible for password operations
 * Follows DIP: Abstracted from implementation details
 */
export default class PasswordManager {
  constructor(saltRounds = 10) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hash plain text password
   * @param {string} plainPassword - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, this.saltRounds);
  }

  /**
   * Compare plain password with hashed password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<boolean>} True if passwords match
   */
  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
