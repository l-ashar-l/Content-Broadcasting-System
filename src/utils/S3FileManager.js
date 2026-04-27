import path from 'path';
import AppError from './AppError.js';

export default class S3FileManager {
  constructor(maxFileSize = 10 * 1024 * 1024) {
    this.maxFileSize = maxFileSize;
    this.allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
    this.allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  }

  validateFile(file) {
    if (!file) {
      throw new AppError('No file provided', 400);
    }

    if (!file.buffer && !file.path) {
      throw new AppError('File has no data', 400);
    }

    if (file.size && file.size > this.maxFileSize) {
      throw new AppError(`File is too large. Max size is ${this.maxFileSize} bytes`, 400);
    }

    if (file.buffer && file.buffer.length > this.maxFileSize) {
      throw new AppError(`File is too large. Max size is ${this.maxFileSize} bytes`, 400);
    }

    if (file.mimetype && !this.allowedMimes.includes(file.mimetype)) {
      throw new AppError(`Invalid file type. Allowed types: ${this.allowedMimes.join(', ')}`, 400);
    }

    const ext = path.extname(file.originalname || file.filename || '').replace('.', '').toLowerCase();
    if (ext && !this.allowedExtensions.includes(ext)) {
      throw new AppError(`Invalid file extension. Allowed extensions: ${this.allowedExtensions.join(', ')}`, 400);
    }

    return true;
  }
}
