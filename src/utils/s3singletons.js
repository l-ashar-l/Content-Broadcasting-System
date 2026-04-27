import S3StorageManager from './S3StorageManager.js';
import S3FileManager from './S3FileManager.js';
import dotenv from 'dotenv';

dotenv.config();

const s3StorageManager = new S3StorageManager({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
  bucket: process.env.AWS_BUCKET_NAME,
});

const s3FileManager = new S3FileManager(
  parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
);

export { s3StorageManager, s3FileManager };
