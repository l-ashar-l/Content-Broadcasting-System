import { User } from '../models/index.js';
import PasswordManager from '../utils/PasswordManager.js';
import JwtManager from '../utils/JwtManager.js';
import AppError from '../utils/AppError.js';
import Validator from '../utils/Validator.js';

/**
 * AuthService - Handles authentication operations
 * Follows SRP: Only responsible for auth business logic
 * Follows DIP: Depends on injected PasswordManager and JwtManager
 */
export default class AuthService {
  constructor(passwordManager, jwtManager) {
    this.passwordManager = passwordManager;
    this.jwtManager = jwtManager;
  }

  /**
   * Register new user
   * @param {Object} userData - User data {name, email, password, role}
   * @returns {Promise<Object>} Created user without password
   * @throws {AppError} If user already exists or validation fails
   */
  async register(userData) {
    const { name, email, password, role } = userData;

    // Validate input
    Validator.validateRequiredFields(userData, ['name', 'email', 'password', 'role']);
    Validator.validateEmail(email);
    Validator.validatePassword(password);
    Validator.validateRole(role);

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await this.passwordManager.hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      role,
    });

    return this.formatUserResponse(user);
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} {user, token}
   * @throws {AppError} If credentials are invalid
   */
  async login(email, password) {
    Validator.validateEmail(email);
    Validator.validateRequiredFields({ password }, ['password']);

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await this.passwordManager.comparePassword(
      password,
      user.password_hash
    );
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = this.jwtManager.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: this.formatUserResponse(user),
      token,
    };
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User object
   * @throws {AppError} If user not found
   */
  async getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.formatUserResponse(user);
  }

  /**
   * Format user response (remove sensitive data)
   * @param {Object} user - User object
   * @returns {Object} Formatted user
   */
  formatUserResponse(user) {
    const { password_hash, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }
}
