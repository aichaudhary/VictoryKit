/**
 * Database Service
 * Manages MongoDB connection with pooling, health checks, and graceful shutdown
 */

import mongoose, { Connection } from 'mongoose';
import { logger } from '../utils/logger.js';

export interface DatabaseConfig {
  uri: string;
  options?: mongoose.ConnectOptions;
}

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  connected: boolean;
  readyState: string;
  host?: string;
  name?: string;
  latencyMs?: number;
  collections?: number;
  error?: string;
}

export interface DatabaseStats {
  collections: number;
  documents: number;
  dataSize: number;
  storageSize: number;
  indexes: number;
  indexSize: number;
  avgObjSize: number;
}

class DatabaseService {
  private static instance: DatabaseService;
  private connection: Connection | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 5000;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Connect to MongoDB with retry logic
   */
  public async connect(config: DatabaseConfig): Promise<Connection> {
    const defaultOptions: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
      retryWrites: true,
      retryReads: true,
    };

    const options = { ...defaultOptions, ...config.options };

    try {
      logger.info('Connecting to MongoDB...', { 
        uri: config.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') // Hide credentials
      });

      await mongoose.connect(config.uri, options);
      this.connection = mongoose.connection;
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Set up event handlers
      this.setupEventHandlers();

      // Start health check interval
      this.startHealthCheck();

      logger.info('✅ Connected to MongoDB', {
        host: this.connection.host,
        name: this.connection.name,
        readyState: this.getReadyStateString(),
      });

      return this.connection;
    } catch (error: any) {
      logger.error('❌ MongoDB connection failed', { error: error.message });
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        logger.info(`Retrying connection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        await this.delay(this.reconnectInterval);
        return this.connect(config);
      }
      
      throw error;
    }
  }

  /**
   * Set up MongoDB event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    this.connection.on('connected', () => {
      logger.info('MongoDB connected');
      this.isConnected = true;
    });

    this.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      this.isConnected = false;
    });

    this.connection.on('error', (error) => {
      logger.error('MongoDB error', { error: error.message });
      this.isConnected = false;
    });

    this.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      this.isConnected = true;
    });

    // Handle process termination
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
  }

  /**
   * Start periodic health check
   */
  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      const health = await this.checkHealth();
      if (health.status === 'unhealthy') {
        logger.error('Database health check failed', { health });
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check database health
   */
  public async checkHealth(): Promise<DatabaseHealth> {
    if (!this.connection || !this.isConnected) {
      return {
        status: 'unhealthy',
        connected: false,
        readyState: this.getReadyStateString(),
        error: 'Not connected to database',
      };
    }

    try {
      const startTime = Date.now();
      
      // Ping the database
      await this.connection.db?.admin().ping();
      
      const latencyMs = Date.now() - startTime;
      const collections = await this.connection.db?.listCollections().toArray();

      // Determine health status based on latency
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      if (latencyMs > 1000) status = 'degraded';
      if (latencyMs > 5000) status = 'unhealthy';

      return {
        status,
        connected: true,
        readyState: this.getReadyStateString(),
        host: this.connection.host,
        name: this.connection.name,
        latencyMs,
        collections: collections?.length || 0,
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        connected: false,
        readyState: this.getReadyStateString(),
        error: error.message,
      };
    }
  }

  /**
   * Get database statistics
   */
  public async getStats(): Promise<DatabaseStats | null> {
    if (!this.connection?.db) return null;

    try {
      const stats = await this.connection.db.stats();
      return {
        collections: stats.collections,
        documents: stats.objects,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        indexes: stats.indexes,
        indexSize: stats.indexSize,
        avgObjSize: stats.avgObjSize,
      };
    } catch (error) {
      logger.error('Failed to get database stats', { error });
      return null;
    }
  }

  /**
   * Get collection stats
   */
  public async getCollectionStats(collectionName: string): Promise<any> {
    if (!this.connection?.db) return null;

    try {
      const collection = this.connection.db.collection(collectionName);
      const count = await collection.countDocuments();
      return { name: collectionName, count };
    } catch (error) {
      logger.error(`Failed to get stats for collection ${collectionName}`, { error });
      return null;
    }
  }

  /**
   * Create indexes for all models
   */
  public async ensureIndexes(): Promise<void> {
    logger.info('Ensuring database indexes...');
    
    try {
      // Import all models to ensure indexes are created
      const models = mongoose.modelNames();
      
      for (const modelName of models) {
        const model = mongoose.model(modelName);
        await model.createIndexes();
        logger.info(`✅ Indexes ensured for ${modelName}`);
      }
      
      logger.info('All indexes ensured');
    } catch (error) {
      logger.error('Failed to ensure indexes', { error });
      throw error;
    }
  }

  /**
   * Run aggregation pipeline
   */
  public async aggregate(collectionName: string, pipeline: any[]): Promise<any[]> {
    if (!this.connection?.db) {
      throw new Error('Database not connected');
    }

    return this.connection.db.collection(collectionName).aggregate(pipeline).toArray();
  }

  /**
   * Get ready state as string
   */
  private getReadyStateString(): string {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    return states[this.connection?.readyState ?? 0] || 'unknown';
  }

  /**
   * Graceful shutdown
   */
  public async gracefulShutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal}. Closing MongoDB connection...`);

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    try {
      await mongoose.disconnect();
      logger.info('MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection', { error });
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      this.isConnected = false;
      logger.info('Disconnected from MongoDB');
    }
  }

  /**
   * Get connection instance
   */
  public getConnection(): Connection | null {
    return this.connection;
  }

  /**
   * Check if connected
   */
  public isConnectedToDb(): boolean {
    return this.isConnected;
  }

  /**
   * Helper delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
export default databaseService;
