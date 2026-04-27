import { User } from '../models/index.js';
import PasswordManager from '../utils/PasswordManager.js';
import JwtManager from '../utils/JwtManager.js';
import AppError from '../utils/AppError.js';
import Validator from '../utils/Validator.js';

export default class AuthService {
  constructor(passwordManager, jwtManager) {
    this.passwordManager = passwordManager;
    this.jwtManager = jwtManager;
  }

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

  async getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return this.formatUserResponse(user);
  }

  formatUserResponse(user) {
    const { password_hash, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }
}
