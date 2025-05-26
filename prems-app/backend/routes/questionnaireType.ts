// Verifica qual o estado do processo para mostrar o questionario através do link, ou não

import express from 'express';
import { Request, Response, NextFunction } from 'express';
import DataModel from '../models/data';

const router = express.Router();

router.get('/:id', (req: Request, res: Response, next: NextFunction): void => {
  (async () => {
    try {
      const id = req.params.id;

      if (!id) {
        res.status(400).json({ message: 'ID do questionário é obrigatório.' });
        return;
      }

      const questionnaire = await DataModel.findOne({ id: id });
      console.log(questionnaire)

      if (!questionnaire) {
        res.status(404).json({ message: 'Questionário não encontrado.' });
        return;
      }

      console.log('📄 DataEvento:', questionnaire.DataEvento);

      // O formulário só fica válido durante 2 semanas

      const duasSemanasAtras = new Date();
      duasSemanasAtras.setDate(duasSemanasAtras.getDate() - 14);

      console.log('🕓 Comparação:', questionnaire.DataEvento < duasSemanasAtras);

      const dataEvento = new Date(questionnaire.DataEvento);

      if (isNaN(dataEvento.getTime())) {
        res.status(400).json({ message: 'DataEvento inválida.' });
        return;
      }

      // Caso a pessoa aceda ao link depois de 2 semanas, este estará indisponível
      if (dataEvento < duasSemanasAtras) {
        console.log("Link Expirado")
        res.status(410).json({ message: 'Link indisponível.', motivo:'expirado' });
        return;
      }

      if (questionnaire.respondido==true){
        console.log("Questionario já respondido")
        res.status(410).json({ message: 'Link indisponível.', motivo:'respondido' });
        return;
      }

      res.status(200).json({ tipo: questionnaire.code });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro ao obter o tipo de questionário.' });
    }
  })().catch(next);
});

export default router;
