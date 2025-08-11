/**
 * Rotas de pets
 */

import express from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { auth as authenticate, requireAdmin } from '@/middleware/auth';
import { validate, petValidators } from '@/utils/validators';
import { petService } from '@/services/petService';

const router = express.Router();

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Listar pets do usuário
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nome
 *     responses:
 *       200:
 *         description: Lista de pets
 *       401:
 *         description: Token inválido
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  
  const result = await petService.getUserPets(req.user._id, page, limit, search);
  
  res.json({
    success: true,
    message: 'Pets obtidos com sucesso',
    data: result
  });
}));

/**
 * @swagger
 * /api/pets:
 *   post:
 *     summary: Criar novo pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *                 enum: [dog, cat, other]
 *               breed:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *               isNeutered:
 *                 type: boolean
 *               avatar:
 *                 type: string
 *               microchipId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pet criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', authenticate, validate(petValidators.create), asyncHandler(async (req, res) => {
  const pet = await petService.createPet(req.user._id, req.body);
  
  res.status(201).json({
    success: true,
    message: 'Pet criado com sucesso',
    data: { pet }
  });
}));

/**
 * @swagger
 * /api/pets/{id}:
 *   get:
 *     summary: Obter pet por ID
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do pet
 *       404:
 *         description: Pet não encontrado
 */
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const pet = await petService.getPetById(req.params.id, req.user._id);
  
  res.json({
    success: true,
    message: 'Pet obtido com sucesso',
    data: { pet }
  });
}));

/**
 * @swagger
 * /api/pets/{id}:
 *   put:
 *     summary: Atualizar pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               weight:
 *                 type: number
 *               height:
 *                 type: number
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pet atualizado com sucesso
 *       404:
 *         description: Pet não encontrado
 */
router.put('/:id', authenticate, validate(petValidators.update), asyncHandler(async (req, res) => {
  const pet = await petService.updatePet(req.params.id, req.user._id, req.body);
  
  res.json({
    success: true,
    message: 'Pet atualizado com sucesso',
    data: { pet }
  });
}));

/**
 * @swagger
 * /api/pets/{id}:
 *   delete:
 *     summary: Deletar pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pet deletado com sucesso
 *       404:
 *         description: Pet não encontrado
 */
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await petService.deletePet(req.params.id, req.user._id);
  
  res.json({
    success: true,
    message: 'Pet deletado com sucesso'
  });
}));

/**
 * @swagger
 * /api/pets/{id}/imc:
 *   get:
 *     summary: Calcular IMC do pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: IMC calculado com sucesso
 */
router.get('/:id/imc', authenticate, asyncHandler(async (req, res) => {
  const pet = await petService.getPetById(req.params.id, req.user._id);
  const imc = petService.calculatePetIMC(pet.weight, pet.height);
  
  res.json({
    success: true,
    message: 'IMC calculado com sucesso',
    data: { ...imc, pet: { name: pet.name, weight: pet.weight, height: pet.height } }
  });
}));

// Rotas administrativas
/**
 * @swagger
 * /api/pets/admin/all:
 *   get:
 *     summary: Listar todos os pets (Admin)
 *     tags: [Pets, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *           enum: [dog, cat, other]
 *     responses:
 *       200:
 *         description: Lista de todos os pets
 */
router.get('/admin/all', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const species = req.query.species as string;
  
  const result = await petService.getAllPets(page, limit, search, species);
  
  res.json({
    success: true,
    message: 'Pets obtidos com sucesso',
    data: result
  });
}));

/**
 * @swagger
 * /api/pets/admin/stats:
 *   get:
 *     summary: Estatísticas de pets (Admin)
 *     tags: [Pets, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas dos pets
 */
router.get('/admin/stats', authenticate, requireAdmin, asyncHandler(async (req, res) => {
  const stats = await petService.getPetStats();
  
  res.json({
    success: true,
    message: 'Estatísticas obtidas com sucesso',
    data: stats
  });
}));

export default router;
