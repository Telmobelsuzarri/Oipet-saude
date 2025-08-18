import { Router } from 'express';
import { upload, StorageService } from '../config/storage';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Upload single file
router.post('/single', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const metadata = await StorageService.saveFileMetadata(
      req.file, 
      req.user!.id,
      req.body.entityId
    );

    const fileUrl = StorageService.getFileUrl(req.file.filename, 'temp');

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: 'Erro no upload do arquivo' });
  }
});

// Upload multiple files
router.post('/multiple', authMiddleware, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const metadata = await StorageService.saveFileMetadata(
        file,
        req.user!.id,
        req.body.entityId
      );

      const fileUrl = StorageService.getFileUrl(file.filename, 'temp');

      uploadedFiles.push({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: fileUrl
      });
    }

    res.json({
      success: true,
      files: uploadedFiles
    });
  } catch (error) {
    logger.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Erro no upload dos arquivos' });
  }
});

// Upload pet photo
router.post('/pet/:petId', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Foto do pet é obrigatória' });
    }

    const { petId } = req.params;
    
    const metadata = await StorageService.saveFileMetadata(
      req.file,
      req.user!.id,
      petId
    );

    const fileUrl = StorageService.getFileUrl(req.file.filename, 'pets');

    res.json({
      success: true,
      petId,
      photo: {
        filename: req.file.filename,
        url: fileUrl
      }
    });
  } catch (error) {
    logger.error('Pet photo upload error:', error);
    res.status(500).json({ error: 'Erro no upload da foto do pet' });
  }
});

// Upload user avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Avatar é obrigatório' });
    }

    const metadata = await StorageService.saveFileMetadata(
      req.file,
      req.user!.id
    );

    const fileUrl = StorageService.getFileUrl(req.file.filename, 'users');

    res.json({
      success: true,
      avatar: {
        filename: req.file.filename,
        url: fileUrl
      }
    });
  } catch (error) {
    logger.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Erro no upload do avatar' });
  }
});

// Upload food scan
router.post('/food-scan', authMiddleware, upload.single('food'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Foto do alimento é obrigatória' });
    }

    const metadata = await StorageService.saveFileMetadata(
      req.file,
      req.user!.id,
      req.body.petId
    );

    const fileUrl = StorageService.getFileUrl(req.file.filename, 'food-scans');

    res.json({
      success: true,
      foodScan: {
        filename: req.file.filename,
        url: fileUrl,
        petId: req.body.petId
      }
    });
  } catch (error) {
    logger.error('Food scan upload error:', error);
    res.status(500).json({ error: 'Erro no upload da foto do alimento' });
  }
});

// Delete file
router.delete('/:filename', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;
    const { category = 'temp' } = req.query;

    // Security: only allow deletion of files uploaded by the user
    // In a real app, you'd verify ownership via database
    
    const filePath = `${process.env.UPLOAD_DIR}/${category}/${filename}`;
    const deleted = await StorageService.deleteFile(filePath);

    if (deleted) {
      res.json({ success: true, message: 'Arquivo deletado com sucesso' });
    } else {
      res.status(404).json({ error: 'Arquivo não encontrado' });
    }
  } catch (error) {
    logger.error('File deletion error:', error);
    res.status(500).json({ error: 'Erro ao deletar arquivo' });
  }
});

// Get storage info (admin only)
router.get('/info', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user!.isAdmin) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const info = StorageService.getStorageInfo();
    res.json(info);
  } catch (error) {
    logger.error('Storage info error:', error);
    res.status(500).json({ error: 'Erro ao obter informações do storage' });
  }
});

export default router;