import jwt from 'jsonwebtoken';
import AppError from './AppError.js';

/**
 * JwtManager - Handles JWT token generation and validation
 * Follows SRP: Only responsible for JWT operations
 * Follows DIP: Depends on abstractions (config injected)
 */
export default class JwtManager {
  constructor(secret, expiration) {
    this.secret = secret;
    this.expiration = expiration;
  }

  /**
   * Generate JWT token
   * @param {Object} payload - Token payload
   * @returns {string} JWT token
   */
  generateToken(payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiration,
    });
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   * @throws {AppError} If token is invalid
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new AppError('Token has expired', 401);
      }
      throw new AppError('Invalid token', 401);
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header
   * @returns {string|null} Token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.slice(7);
  }
}
