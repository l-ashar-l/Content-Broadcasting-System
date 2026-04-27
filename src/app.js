import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';

// Utilities
import ResponseFormatter from './utils/ResponseFormatter.js';
import { ErrorHandler, RequestLogger } from './middlewares/error.middleware.js';
import RedisManager from './utils/RedisManager.js';

// Models and Database
import sequelize from './config/database.js';
import { User, Content, ContentSlot, ContentSchedule } from './models/index.js';

// Middleware classes
import AuthMiddleware from './middlewares/auth.middleware.js';
import S3UploadMiddleware from './middlewares/s3upload.middleware.js';
import {
  contentLiveLimiter,
} from './middlewares/rate-limit.middleware.js';

// Manager classes
import JwtManager from './utils/JwtManager.js';
import PasswordManager from './utils/PasswordManager.js';
import S3FileManager from './utils/S3FileManager.js';

// Service classes
import AuthService from './services/AuthService.js';
import ContentService from './services/ContentService.js';
import ApprovalService from './services/ApprovalService.js';
import RotationService from './services/RotationService.js';
import AnalyticsService from './services/AnalyticsService.js';

// Controller classes
import AuthController from './controllers/AuthController.js';
import ContentController from './controllers/ContentController.js';
import ApprovalController from './controllers/ApprovalController.js';
import BroadcastController from './controllers/BroadcastController.js';
import AnalyticsController from './controllers/AnalyticsController.js';

// Route factory functions
import { createAuthRoutes } from './routes/auth.routes.js';
import { createContentRoutes } from './routes/content.routes.js';
import { createApprovalRoutes } from './routes/approval.routes.js';
import { createAnalyticsRoutes } from './routes/analytics.routes.js';

dotenv.config();

class ApplicationFactory {
  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeDependencies();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Initialize global middlewares
   */
  initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(RequestLogger.log);
  }

  /**
   * Initialize all dependencies using dependency injection
   * Follows DIP: All dependencies are injected at app initialization
   */
  initializeDependencies() {
    // Managers (utilities)
    const jwtManager = new JwtManager(
      process.env.JWT_SECRET || 'your-secret-key',
      process.env.JWT_EXPIRE || '7d'
    );
    const passwordManager = new PasswordManager(10);
    const s3FileManager = new S3FileManager(
      parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
    );
    this.redisManager = new RedisManager();

    // Middleware instances
    this.authMiddleware = new AuthMiddleware(jwtManager);
    this.uploadMiddleware = new S3UploadMiddleware(
      parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
    );

    // Services (business logic)
    const authService = new AuthService(passwordManager, jwtManager);
    const contentService = new ContentService();
    const approvalService = new ApprovalService();
    const rotationService = new RotationService();
    const analyticsService = new AnalyticsService();

    // Controllers (request handlers)
    this.authController = new AuthController(authService);
    this.contentController = new ContentController(contentService, s3FileManager);
    this.approvalController = new ApprovalController(approvalService);
    this.broadcastController = new BroadcastController(rotationService, this.redisManager);
    this.analyticsController = new AnalyticsController(analyticsService);
  }

  /**
   * Initialize routes
   */
  initializeRoutes() {
    // Swagger API Documentation
    this.app.use('/api-docs', swaggerUi.serve);
    this.app.get('/api-docs', swaggerUi.setup(specs, { explorer: true }));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json(ResponseFormatter.success({ status: 'ok' }, 'Server is running'));
    });

    // API Routes
    this.app.use(
      '/api/auth',
      createAuthRoutes(this.authController, this.authMiddleware)
    );

    this.app.use(
      '/api/content',
      createContentRoutes(
        this.contentController,
        this.broadcastController,
        this.authMiddleware,
        this.uploadMiddleware,
        contentLiveLimiter
      )
    );

    this.app.use(
      '/api/approval',
      createApprovalRoutes(this.approvalController, this.authMiddleware)
    );

    this.app.use(
      '/api/analytics',
      createAnalyticsRoutes(
        this.analyticsController,
        this.authMiddleware
      )
    );

    // 404 handler
    this.app.use((req, res) => {
      res
        .status(404)
        .json(ResponseFormatter.error('Route not found', 404));
    });
  }

  /**
   * Initialize error handling
   */
  initializeErrorHandling() {
    this.app.use((err, req, res, next) => {
      ErrorHandler.handle(err, req, res, next);
    });
  }

  /**
   * Get the Express app instance
   */
  getApp() {
    return this.app;
  }

  /**
   * Initialize database
   */
  async initializeDatabase() {
    try {
      await sequelize.authenticate();
      console.log('Database connection established');
      await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
      console.log('Database synchronized');
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  /**
   * Initialize Redis cache
   */
  async initializeRedis() {
    try {
      await this.redisManager.connect();
      console.log('Redis cache initialized');
    } catch (error) {
      console.warn('Redis initialization warning (non-critical):', error);
      // Redis is optional - app can work without it
    }
  }

  /**
   * Get Redis manager
   */
  getRedisManager() {
    return this.redisManager;
  }
}

// Create and export the application
const appFactory = new ApplicationFactory();
export default appFactory;