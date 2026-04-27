import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Content Broadcasting System API',
      version: '1.0.0',
      description: 'API for managing content broadcasting with S3 integration, teacher content upload, principal approval, and student content streaming',
      contact: {
        name: 'API Support',
        email: 'support@contentbroadcasting.com',
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token from login endpoint',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            role: { type: 'string', enum: ['teacher', 'principal', 'student'], example: 'teacher' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Content: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Mathematics Lesson 1' },
            subject: { type: 'string', example: 'Mathematics' },
            description: { type: 'string', example: 'Introduction to Algebra' },
            file_path: { type: 'string', example: '1704067200000-a1b2c3d4.pdf' },
            file_type: { type: 'string', example: 'application/pdf' },
            file_size: { type: 'integer', example: 2048576 },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'approved' },
            uploaded_by: { type: 'integer', example: 1 },
            download_url: { type: 'string', example: 'https://s3.amazonaws.com/bucket/key?...' },
            url_expires_in: { type: 'integer', example: 3600 },
            url_expires_at: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            statusCode: { type: 'integer', example: 400 },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

export const specs = swaggerJsdoc(options);
