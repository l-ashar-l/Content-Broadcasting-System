import path from 'path';
import fs from 'fs/promises';
import AppError from './AppError.js';

/**
 * FileManager - Handles file operations
 * Follows SRP: Only responsible for file management
 * Follows OCP: Can be extended for different storage backends
 */
export default class FileManager {
  constructor(uploadPath, maxFileSize = 10 * 1024 * 1024) {
    this.uploadPath = uploadPath;
    this.maxFileSize = maxFileSize;
    this.allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
  }

  /**
   * Validate file before upload
   * @param {Object} file - Express multer file object
   * @throws {AppError} If file is invalid
   */
  validateFile(file) {
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    if (file.size > this.maxFileSize) {
      throw new AppError(
        `File size exceeds limit of ${this.maxFileSize / 1024 / 1024}MB`,
        400
      );
    }

    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    if (!this.allowedExtensions.includes(ext)) {
      throw new AppError(
        `File type not allowed. Allowed types: ${this.allowedExtensions.join(', ')}`,
        400
      );
    }
  }

  /**
   * Generate unique filename
   * @param {Object} file - Express multer file object
   * @returns {string} Unique filename
   */
  generateFilename(file) {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Get file path
   * @param {string} filename - Filename
   * @returns {string} Full file path
   */
  getFilePath(filename) {
    return path.join(this.uploadPath, filename);
  }

  /**
   * Delete file
   * @param {string} filename - Filename
   * @throws {AppError} If deletion fails
   */
  async deleteFile(filename) {
    try {
      const filePath = this.getFilePath(filename);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('File deletion error:', error);
      // Don't throw error for deletion failures
    }
  }

  /**
   * Ensure upload directory exists
   * @throws {AppError} If directory creation fails
   */
  async ensureUploadDirectory() {
    try {
      await fs.mkdir(this.uploadPath, { recursive: true });
    } catch (error) {
      throw new AppError('Failed to create upload directory', 500);
    }
  }
}
