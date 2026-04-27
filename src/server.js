import dotenv from 'dotenv';
import appFactory from './app.js';

dotenv.config();

async function startServer() {
  try {
    const port = process.env.PORT || 5000;
    const app = appFactory.getApp();

    // Initialize database
    await appFactory.initializeDatabase();

    // Start server
    app.listen(port, () => {
      console.log(`✓ Server running on port ${port}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API Base URL: http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();