import { createClient } from 'redis';

/**
 * RedisManager: Handles all Redis cache operations
 * Singleton pattern to maintain one Redis connection
 */
export default class RedisManager {
  constructor() {
    this.client = null;
    this.connected = false;
  }

  /**
   * Initialize Redis connection
   * @param {string} host - Redis host (default: localhost)
   * @param {number} port - Redis port (default: 6379)
   */
  async connect(host = process.env.REDIS_HOST || 'localhost', port = process.env.REDIS_PORT || 6379) {
    try {
      this.client = createClient({
        socket: {
          host,
          port,
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
        password: process.env.REDIS_PASSWORD,
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Connected');
        this.connected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      this.connected = false;
    }
  }

  /**
   * Set a key-value pair with optional TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be JSON stringified)
   * @param {number} ttl - Time to live in seconds (optional)
   */
  async set(key, value, ttl = null) {
    if (!this.connected || !this.client) return;
    try {
      const data = typeof value === 'string' ? value : JSON.stringify(value);
      if (ttl) {
        await this.client.setEx(key, ttl, data);
      } else {
        await this.client.set(key, data);
      }
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error);
    }
  }

  /**
   * Get a cached value
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  async get(key) {
    if (!this.connected || !this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete a key
   * @param {string} key - Cache key
   */
  async delete(key) {
    if (!this.connected || !this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Redis DELETE error for key ${key}:`, error);
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async flushAll() {
    if (!this.connected || !this.client) return;
    try {
      await this.client.flushAll();
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
    }
  }

  /**
   * Check if Redis is connected
   */
  isConnected() {
    return this.connected;
  }
}
