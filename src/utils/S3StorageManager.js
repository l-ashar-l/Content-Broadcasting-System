import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import AppError from './AppError.js';

export default class S3StorageManager {
  constructor({
    accessKeyId,
    secretAccessKey,
    region,
    bucket,
  }) {
    this.bucket = bucket;
    
    // Create S3 client with credentials from environment variables
    this.s3 = new S3Client({
      region,
      credentials: accessKeyId && secretAccessKey ? {
        accessKeyId,
        secretAccessKey,
      } : undefined,
    });
  }

  async uploadFile(buffer, originalName, mimetype) {
    const ext = path.extname(originalName);
    const key = `${Date.now()}-${uuidv4()}${ext}`;
    
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });
    
    try {
      await this.s3.send(command);
      return key;
    } catch (error) {
      throw new AppError('Failed to upload file to S3', 500);
    }
  }

  async deleteFile(key) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    try {
      await this.s3.send(command);
    } catch (error) {
      console.error('S3 deletion error:', error);
    }
  }

  async getSignedUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    try {
      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      throw new AppError('Failed to generate signed URL', 500);
    }
  }
}
