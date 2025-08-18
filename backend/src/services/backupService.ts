import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { RedisService } from '../config/redis';

// Backup Service for MongoDB
export class BackupService {
  private static readonly BACKUP_RETENTION_DAYS = 30;
  private static readonly BACKUP_COLLECTION = 'backups';

  // Create backup metadata record
  static async createBackupRecord(type: 'manual' | 'scheduled', collections: string[]) {
    try {
      const backupData = {
        type,
        collections,
        timestamp: new Date(),
        status: 'in_progress',
        size: 0,
        duration: 0
      };

      const db = mongoose.connection.db;
      const result = await db.collection(this.BACKUP_COLLECTION).insertOne(backupData);
      
      return result.insertedId;
    } catch (error) {
      logger.error('Backup record creation failed:', error);
      throw error;
    }
  }

  // Update backup record
  static async updateBackupRecord(backupId: any, updates: any) {
    try {
      const db = mongoose.connection.db;
      await db.collection(this.BACKUP_COLLECTION).updateOne(
        { _id: backupId },
        { $set: updates }
      );
    } catch (error) {
      logger.error('Backup record update failed:', error);
    }
  }

  // Export collection data
  static async exportCollection(collectionName: string) {
    try {
      const db = mongoose.connection.db;
      const collection = db.collection(collectionName);
      
      // Get all documents
      const documents = await collection.find({}).toArray();
      
      return {
        collection: collectionName,
        count: documents.length,
        data: documents,
        timestamp: new Date(),
        size: JSON.stringify(documents).length
      };
    } catch (error) {
      logger.error(`Failed to export collection ${collectionName}:`, error);
      throw error;
    }
  }

  // Full database backup
  static async createFullBackup(type: 'manual' | 'scheduled' = 'manual') {
    const startTime = Date.now();
    let backupId: any = null;

    try {
      logger.info('🔄 Starting full database backup...');

      // Get all collections
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      const collectionNames = collections
        .map(c => c.name)
        .filter(name => !name.startsWith('system.') && name !== this.BACKUP_COLLECTION);

      // Create backup record
      backupId = await this.createBackupRecord(type, collectionNames);

      const backupData: any = {
        metadata: {
          timestamp: new Date(),
          version: '1.0.0',
          database: db.databaseName,
          collections: collectionNames,
          type
        },
        collections: {}
      };

      let totalSize = 0;

      // Export each collection
      for (const collectionName of collectionNames) {
        try {
          const exportData = await this.exportCollection(collectionName);
          backupData.collections[collectionName] = exportData;
          totalSize += exportData.size;
          
          logger.info(`✅ Exported ${collectionName}: ${exportData.count} documents`);
        } catch (error) {
          logger.error(`❌ Failed to export ${collectionName}:`, error);
          backupData.collections[collectionName] = {
            error: error instanceof Error ? error.message : 'Export failed'
          };
        }
      }

      const duration = Date.now() - startTime;

      // Store backup in Redis (temporary) and log success
      const backupKey = `backup:${new Date().toISOString().split('T')[0]}:${backupId}`;
      await RedisService.set(backupKey, backupData, 86400); // 24 hours

      // Update backup record
      await this.updateBackupRecord(backupId, {
        status: 'completed',
        size: totalSize,
        duration,
        completedAt: new Date()
      });

      logger.info(`✅ Backup completed in ${Math.round(duration / 1000)}s (${Math.round(totalSize / 1024)} KB)`);

      return {
        id: backupId,
        status: 'completed',
        collections: collectionNames.length,
        size: totalSize,
        duration,
        timestamp: new Date()
      };

    } catch (error) {
      logger.error('❌ Backup failed:', error);

      if (backupId) {
        await this.updateBackupRecord(backupId, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        });
      }

      throw error;
    }
  }

  // Collection-specific backup
  static async backupCollection(collectionName: string) {
    try {
      logger.info(`🔄 Backing up collection: ${collectionName}`);

      const exportData = await this.exportCollection(collectionName);
      
      // Store in Redis
      const backupKey = `backup:collection:${collectionName}:${Date.now()}`;
      await RedisService.set(backupKey, exportData, 86400); // 24 hours

      logger.info(`✅ Collection backup completed: ${collectionName}`);
      return exportData;

    } catch (error) {
      logger.error(`❌ Collection backup failed: ${collectionName}:`, error);
      throw error;
    }
  }

  // Get backup history
  static async getBackupHistory(limit = 20) {
    try {
      const db = mongoose.connection.db;
      const backups = await db.collection(this.BACKUP_COLLECTION)
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return backups;
    } catch (error) {
      logger.error('Failed to get backup history:', error);
      return [];
    }
  }

  // Clean old backups
  static async cleanOldBackups() {
    try {
      logger.info('🧹 Cleaning old backups...');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.BACKUP_RETENTION_DAYS);

      const db = mongoose.connection.db;
      const result = await db.collection(this.BACKUP_COLLECTION).deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      // Clean Redis backup keys
      const redisKeys = await RedisService.get('backup:*') as string[];
      if (Array.isArray(redisKeys)) {
        for (const key of redisKeys) {
          const keyDate = key.split(':')[1];
          if (keyDate && new Date(keyDate) < cutoffDate) {
            await RedisService.del(key);
          }
        }
      }

      logger.info(`🗑️ Cleaned ${result.deletedCount} old backup records`);
      return result.deletedCount;

    } catch (error) {
      logger.error('Backup cleanup failed:', error);
      return 0;
    }
  }

  // Restore from backup (basic implementation)
  static async restoreFromBackup(backupId: string) {
    try {
      logger.warn('⚠️ RESTORE OPERATION STARTED - This will overwrite current data!');

      // Get backup data from Redis first
      const backupKey = `backup:${backupId}`;
      const backupData = await RedisService.get(backupKey);

      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Backup data not found in Redis');
      }

      const db = mongoose.connection.db;
      const collections = (backupData as any).collections;

      let restoredCount = 0;

      for (const [collectionName, collectionData] of Object.entries(collections)) {
        try {
          const data = collectionData as any;
          if (data.error) {
            logger.warn(`⚠️ Skipping ${collectionName} (had errors during backup)`);
            continue;
          }

          // Drop existing collection
          await db.collection(collectionName).drop().catch(() => {
            // Collection might not exist, ignore error
          });

          // Insert backup data
          if (data.data && data.data.length > 0) {
            await db.collection(collectionName).insertMany(data.data);
            restoredCount++;
            logger.info(`✅ Restored ${collectionName}: ${data.count} documents`);
          }

        } catch (error) {
          logger.error(`❌ Failed to restore ${collectionName}:`, error);
        }
      }

      logger.info(`✅ Restore completed: ${restoredCount} collections restored`);
      return { restoredCollections: restoredCount };

    } catch (error) {
      logger.error('❌ Restore failed:', error);
      throw error;
    }
  }

  // Schedule automatic backups
  static scheduleBackups() {
    // Daily backup at 2 AM
    const scheduleDaily = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(2, 0, 0, 0); // 2 AM

      // If 2 AM has passed today, schedule for tomorrow
      if (now > scheduledTime) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const timeUntilBackup = scheduledTime.getTime() - now.getTime();

      setTimeout(async () => {
        try {
          await this.createFullBackup('scheduled');
          await this.cleanOldBackups();
        } catch (error) {
          logger.error('Scheduled backup failed:', error);
        }

        // Schedule next backup (24 hours later)
        scheduleDaily();
      }, timeUntilBackup);

      logger.info(`📅 Next backup scheduled for: ${scheduledTime.toISOString()}`);
    };

    scheduleDaily();
  }

  // Get backup statistics
  static async getBackupStats() {
    try {
      const db = mongoose.connection.db;
      
      const stats = await db.collection(this.BACKUP_COLLECTION).aggregate([
        {
          $group: {
            _id: null,
            totalBackups: { $sum: 1 },
            successfulBackups: { 
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } 
            },
            failedBackups: { 
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } 
            },
            avgSize: { $avg: '$size' },
            avgDuration: { $avg: '$duration' },
            lastBackup: { $max: '$timestamp' }
          }
        }
      ]).toArray();

      return stats[0] || {
        totalBackups: 0,
        successfulBackups: 0,
        failedBackups: 0,
        avgSize: 0,
        avgDuration: 0,
        lastBackup: null
      };

    } catch (error) {
      logger.error('Failed to get backup stats:', error);
      return null;
    }
  }

  // Initialize backup system
  static async initialize() {
    try {
      logger.info('🔧 Initializing backup system...');

      // Ensure backup collection exists
      const db = mongoose.connection.db;
      const collections = await db.listCollections({ name: this.BACKUP_COLLECTION }).toArray();
      
      if (collections.length === 0) {
        await db.createCollection(this.BACKUP_COLLECTION);
        logger.info('✅ Backup collection created');
      }

      // Schedule automatic backups
      this.scheduleBackups();

      logger.info('✅ Backup system initialized');

    } catch (error) {
      logger.error('❌ Backup system initialization failed:', error);
    }
  }
}