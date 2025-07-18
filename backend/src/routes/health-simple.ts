/**
 * Rotas de registros de saúde - Versão simplificada
 */

import express from 'express';
import { authenticate } from '@/middleware/auth';
import { healthService } from '@/services/healthService-simple';

const router = express.Router();

/**
 * POST /api/health/pets/:petId
 * Criar novo registro de saúde para um pet
 */
router.post('/pets/:petId', authenticate, async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;
    const recordData = req.body;

    const record = await healthService.createHealthRecord(petId, userId, recordData);
    
    res.status(201).json({
      success: true,
      data: record,
      message: 'Registro de saúde criado com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Erro ao criar registro de saúde'
    });
  }
});

/**
 * GET /api/health/pets/:petId
 * Obter registros de saúde de um pet
 */
router.get('/pets/:petId', authenticate, async (req, res) => {
  try {
    const { petId } = req.params;
    const userId = req.user.id;

    const records = await healthService.getPetHealthRecords(petId, userId);
    
    res.json({
      success: true,
      data: records,
      message: 'Registros de saúde obtidos com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Erro ao obter registros de saúde'
    });
  }
});

/**
 * GET /api/health/:recordId
 * Obter registro de saúde por ID
 */
router.get('/:recordId', authenticate, async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;

    const record = await healthService.getHealthRecordById(recordId, userId);
    
    res.json({
      success: true,
      data: record,
      message: 'Registro de saúde obtido com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Erro ao obter registro de saúde'
    });
  }
});

/**
 * PUT /api/health/:recordId
 * Atualizar registro de saúde
 */
router.put('/:recordId', authenticate, async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const record = await healthService.updateHealthRecord(recordId, userId, updateData);
    
    res.json({
      success: true,
      data: record,
      message: 'Registro de saúde atualizado com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Erro ao atualizar registro de saúde'
    });
  }
});

/**
 * DELETE /api/health/:recordId
 * Deletar registro de saúde
 */
router.delete('/:recordId', authenticate, async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;

    await healthService.deleteHealthRecord(recordId, userId);
    
    res.json({
      success: true,
      message: 'Registro de saúde deletado com sucesso'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Erro ao deletar registro de saúde'
    });
  }
});

export default router;