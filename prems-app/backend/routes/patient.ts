import express, { Request, Response } from 'express';
import Patient from '../models/patient';
const router = express.Router();

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const patient = await Patient.findOne({ id: id});
    // Do something async here, like a DB query
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
