import multer from 'multer';
import AppError from '../utils/AppError.js';

/**
 * S3UploadMiddleware - uses memory storage so uploaded files are available
 * as buffers for direct upload to S3. Validates mime types and file size.
 */
export default class S3UploadMiddleware {
  constructor(maxFileSize = 10 * 1024 * 1024) {
    this.maxFileSize = maxFileSize;
    this.allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];

    this.storage = multer.memoryStorage();
    this.upload = multer({
      storage: this.storage,
      limits: { fileSize: this.maxFileSize },
      fileFilter: this.fileFilter.bind(this),
    });
  }

  fileFilter(req, file, cb) {
    if (!file) return cb(new AppError('No file provided', 400));
    if (!this.allowedMimes.includes(file.mimetype)) {
      return cb(new AppError(`File type not allowed. Allowed types: ${this.allowedMimes.join(', ')}`, 400));
    }
    cb(null, true);
  }

  single(fieldName = 'file') {
    return this.upload.single(fieldName);
  }

  multiple(fieldName = 'files', maxCount = 5) {
    return this.upload.array(fieldName, maxCount);
  }
}
