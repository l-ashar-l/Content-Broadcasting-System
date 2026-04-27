import multer from 'multer';
import path from 'path';
import AppError from '../utils/AppError.js';

/**
 * UploadMiddleware - Configures file upload handling
 * Follows SRP: Only responsible for upload configuration
 * Follows DIP: Storage strategy can be injected/modified
 */
export default class UploadMiddleware {
  constructor(uploadPath, maxFileSize) {
    this.uploadPath = uploadPath;
    this.maxFileSize = maxFileSize || 10 * 1024 * 1024; // 10MB default
    this.allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    this.storage = this.configureStorage();
    this.upload = multer({
      storage: this.storage,
      limits: {
        fileSize: this.maxFileSize,
      },
      fileFilter: this.fileFilter.bind(this),
    });
  }

  /**
   * Configure multer storage
   * @returns {multer.StorageEngine} Configured storage
   */
  configureStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadPath);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1e9);
        cb(null, `${timestamp}-${random}${ext}`);
      },
    });
  }

  /**
   * File filter callback
   * @param {Object} req - Express request
   * @param {Object} file - File object
   * @param {Function} cb - Callback
   */
  fileFilter(req, file, cb) {
    if (!this.allowedMimes.includes(file.mimetype)) {
      return cb(
        new AppError(
          `File type not allowed. Allowed types: ${this.allowedMimes.join(', ')}`,
          400
        )
      );
    }
    cb(null, true);
  }

  /**
   * Get single file upload middleware
   * @param {string} fieldName - Form field name
   * @returns {Function} Express middleware
   */
  single(fieldName = 'file') {
    return this.upload.single(fieldName);
  }

  /**
   * Get multiple file upload middleware
   * @param {string} fieldName - Form field name
   * @param {number} maxCount - Maximum file count
   * @returns {Function} Express middleware
   */
  multiple(fieldName = 'files', maxCount = 5) {
    return this.upload.array(fieldName, maxCount);
  }
}
