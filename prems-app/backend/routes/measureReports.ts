import express, { Request, Response } from 'express';
import MeasureReport from '../models/measureReport';

const router = express.Router();

// GET /api/measurereports - Retorna todos os measure reports para a dashboard
router.get('/', async (req: Request, res: Response) => {
  try {
    // Buscar os measure reports mais recentes
    const measureReports = await MeasureReport.find()
      .sort({ date: -1 });

    res.json(measureReports);
  } catch (error) {
    console.error('Erro ao buscar measure reports:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível carregar os dados da dashboard'
    });
  }
});

export default router;