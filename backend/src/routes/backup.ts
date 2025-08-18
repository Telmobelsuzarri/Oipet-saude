import { Router } from 'express';
import { BackupService } from '../services/backupService';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// All backup routes require admin access
router.use(authMiddleware);
router.use((req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Acesso negado - Admin requerido' });
  }
  next();
});

// Create manual backup
router.post('/create', async (req, res) => {
  try {
    logger.info(`Admin ${req.user?.email} initiated manual backup`);
    
    const backup = await BackupService.createFullBackup('manual');
    
    res.json({
      success: true,
      message: 'Backup criado com sucesso',
      backup
    });
  } catch (error) {
    logger.error('Manual backup creation failed:', error);
    res.status(500).json({ 
      error: 'Falha ao criar backup',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Backup specific collection
router.post('/collection/:collectionName', async (req, res) => {
  try {
    const { collectionName } = req.params;
    
    logger.info(`Admin ${req.user?.email} initiated backup for collection: ${collectionName}`);
    
    const backup = await BackupService.backupCollection(collectionName);
    
    res.json({
      success: true,
      message: `Backup da coleção ${collectionName} criado com sucesso`,
      backup
    });
  } catch (error) {
    logger.error(`Collection backup failed for ${req.params.collectionName}:`, error);
    res.status(500).json({ 
      error: 'Falha ao criar backup da coleção',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get backup history
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const history = await BackupService.getBackupHistory(limit);
    
    res.json({
      success: true,
      backups: history,
      count: history.length
    });
  } catch (error) {
    logger.error('Failed to get backup history:', error);
    res.status(500).json({ error: 'Falha ao obter histórico de backups' });
  }
});

// Get backup statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await BackupService.getBackupStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Failed to get backup stats:', error);
    res.status(500).json({ error: 'Falha ao obter estatísticas de backup' });
  }
});

// Clean old backups
router.delete('/cleanup', async (req, res) => {
  try {
    logger.info(`Admin ${req.user?.email} initiated backup cleanup`);
    
    const deletedCount = await BackupService.cleanOldBackups();
    
    res.json({
      success: true,
      message: `${deletedCount} backups antigos removidos`,
      deletedCount
    });
  } catch (error) {
    logger.error('Backup cleanup failed:', error);
    res.status(500).json({ error: 'Falha na limpeza de backups' });
  }
});

// Restore from backup (DANGEROUS!)
router.post('/restore/:backupId', async (req, res) => {
  try {
    const { backupId } = req.params;
    const { confirmRestore } = req.body;
    
    if (!confirmRestore) {
      return res.status(400).json({ 
        error: 'Confirmação necessária',
        message: 'Envie { "confirmRestore": true } para confirmar a operação de restore'
      });
    }
    
    logger.warn(`⚠️ RESTORE INITIATED by admin ${req.user?.email} for backup ${backupId}`);
    
    const result = await BackupService.restoreFromBackup(backupId);
    
    res.json({
      success: true,
      message: 'Restore realizado com sucesso',
      result
    });
  } catch (error) {
    logger.error('Restore failed:', error);
    res.status(500).json({ 
      error: 'Falha no restore',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test backup system
router.get('/test', async (req, res) => {
  try {
    // Create a small test backup
    const testBackup = await BackupService.backupCollection('users');
    
    res.json({
      success: true,
      message: 'Sistema de backup funcionando',
      testBackup: {
        collection: testBackup.collection,
        count: testBackup.count,
        size: testBackup.size
      }
    });
  } catch (error) {
    logger.error('Backup test failed:', error);
    res.status(500).json({ error: 'Teste de backup falhou' });
  }
});

export default router;