import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const encounterCollection = db.collection('Encounter');

    // Buscamos somente o campo 'period.end'
    const documentos = await encounterCollection
      .find({}, { projection: { 'period.end': 1, _id: 0 } })
      .toArray();

    res.json({ periodEnds: documentos.map(doc => doc.period?.end) });
  } catch (error) {
    console.error('Erro ao listar period.end:', (error as Error).message);
    res.status(500).json({ error: 'Erro ao listar period.end' });
  }
});

export default router;
