import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

class DatabaseInitializer {
  async createDatabaseIfNotExists() {
    const client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'admin',

      // connect to default postgres DB first
      database: 'postgres',
    });

    try {
      await client.connect();

      const dbName =
        process.env.DB_NAME || 'content_broadcasting';

      const checkDbQuery = `
        SELECT 1
        FROM pg_database
        WHERE datname = $1
      `;

      const result = await client.query(
        checkDbQuery,
        [dbName]
      );

      if (result.rowCount === 0) {
        console.log(`Creating database: ${dbName}`);

        await client.query(
          `CREATE DATABASE "${dbName}"`
        );

        console.log(
          `✓ Database "${dbName}" created successfully`
        );
      } else {
        console.log(
          `✓ Database "${dbName}" already exists`
        );
      }
    } catch (error) {
      console.error(
        'Database initialization failed:',
        error.message
      );
      throw error;
    } finally {
      await client.end();
    }
  }
}

export default new DatabaseInitializer();