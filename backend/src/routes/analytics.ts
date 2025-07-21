import { Router, Request, Response } from 'express'
import { auth, adminAuth } from '../middleware/auth'
import { AnalyticsService } from '../services/analyticsService'

const router = Router()

/**
 * @route   POST /api/analytics/track
 * @desc    Rastrear evento de analytics
 * @access  Private
 */
router.post('/track', auth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const { event, data } = req.body

    if (!event) {
      return res.status(400).json({
        success: false,
        message: 'Event name é obrigatório'
      })
    }

    const result = await AnalyticsService.trackEvent(userId, event, data)

    res.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error tracking event:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao rastrear evento'
    })
  }
})

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Obter métricas do dashboard (admin only)
 * @access  Private/Admin
 */
router.get('/dashboard', adminAuth, async (req: Request, res: Response) => {
  try {
    const metrics = await AnalyticsService.getDashboardMetrics()

    res.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Error getting dashboard metrics:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao obter métricas do dashboard'
    })
  }
})

/**
 * @route   GET /api/analytics/report/:type
 * @desc    Gerar relatório de analytics
 * @access  Private/Admin
 */
router.get('/report/:type', adminAuth, async (req: Request, res: Response) => {
  try {
    const { type } = req.params

    if (!['daily', 'weekly', 'monthly'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de relatório inválido. Use: daily, weekly ou monthly'
      })
    }

    const report = await AnalyticsService.generateReport(type as 'daily' | 'weekly' | 'monthly')

    res.json({
      success: true,
      data: report
    })
  } catch (error) {
    console.error('Error generating report:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório'
    })
  }
})

/**
 * @route   GET /api/analytics/summary
 * @desc    Obter resumo rápido de métricas (versão simplificada para usuários)
 * @access  Private
 */
router.get('/summary', auth, async (req: Request, res: Response) => {
  try {
    const metrics = await AnalyticsService.getDashboardMetrics()

    // Retornar apenas dados públicos para usuários normais
    const summary = {
      totalUsers: metrics.users.total,
      totalPets: metrics.pets.total,
      totalHealthRecords: metrics.health.totalRecords,
      petsBySpecies: metrics.pets.bySpecies
    }

    res.json({
      success: true,
      data: summary
    })
  } catch (error) {
    console.error('Error getting analytics summary:', error)
    res.status(500).json({
      success: false,
      message: 'Erro ao obter resumo de analytics'
    })
  }
})

export default router