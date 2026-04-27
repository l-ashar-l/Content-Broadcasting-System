import jwt from 'jsonwebtoken';
import AppError from './AppError.js';

export default class JwtManager {
  constructor(secret, expiration) {
    this.secret = secret;
    this.expiration = expiration;
  }

  generateToken(payload) {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiration,
    });
  }

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

  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.slice(7);
  }
}
