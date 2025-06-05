import express from 'express';
import mongoose, { Document, Model } from 'mongoose';
import QuestionnaireResponse from '../models/questionnaireResponse';
import DataModel from '../models/data';
import { sendEmail } from '../functions/emailService';
import { generateAndSaveMeasureReports } from '../functions/generateMeasureReports';
import { generateOrUpdateMonthlyMeasureReports } from '../functions/generateMonthlyMeasureReports';

const router = express.Router();

// Rota para salvar respostas
router.post('/', async (req, res): Promise<void> => {
  try {
    const { tipo, q_id, item } = req.body;

    if (!tipo || !q_id || !item || !Array.isArray(item)) {
      res.status(400).send({ error: 'Estrutura inválida de resposta' });
      return;
    }

    let questionnaireURL = '';
    if (tipo === 'AMB') {
      questionnaireURL = 'http://example.org/fhir/Questionnaire/europep-questionnaire';
    } else if (tipo === 'IMP') {
      questionnaireURL = 'http://example.org/fhir/Questionnaire/hcahps-questionnaire';
    } else {
      res.status(400).send({ error: 'Tipo de questionário desconhecido' });
      return;
    }

    // Obter dados do questionário da base de dados
    const data = await DataModel.findOne({ id: q_id });
    const dataEvento = data?.DataEvento || new Date();

    // Montar estrutura FHIR válida
    const authored = new Date().toISOString();
    const responseFHIR = {
      resourceType: 'QuestionnaireResponse',
      questionnaire: questionnaireURL,
      status: 'completed',
      authored,
      extension: [
        {
          url: 'http://example.org/fhir/StructureDefinition/necessaryData-q_id',
          valueString: q_id
        },
        ...(data?.profissionais
          ? data.profissionais.map(p => ({
              url: 'http://hl7.org/fhir/StructureDefinition/practitioner',
              valueReference: {
                reference: `Practitioner/${p.profissionalId}`,
                display: p.area
              }
            }))
          : [])
      ],
      item: item.map(grupo => ({
        linkId: grupo.linkId,
        item: Object.entries(grupo)
          .filter(([key]) => key !== 'linkId')
          .map(([linkId, answer]) => {
            const pergunta: any = {
              linkId,
              answer: typeof answer === 'number'
                ? [{ valueInteger: answer }]
                : typeof answer === 'string'
                ? [{ valueString: answer }]
                : []
            };

            return pergunta; // 👈 sem item: []
          })
      }))
    };

    // Guardar no MongoDB
    await QuestionnaireResponse.create(responseFHIR);

     // Enviar email e atualizar estado
    if (data?.pacienteEmail) {
      await sendEmail({ to: data.pacienteEmail, tipo: 'sucesso', link: '' });
    }

    await DataModel.updateOne(
      { id: q_id },
      {
        $set: { respondido: true },
        $unset: { pacienteEmail: '' }
      }
    );

    await generateAndSaveMeasureReports();
    generateOrUpdateMonthlyMeasureReports(dataEvento);
    console.log('✅ Estatisticas Guardadas!');

    res.status(201).json({ message: 'Respostas guardadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao guardar resposta:', error);
    res.status(500).json({ error: 'Erro ao guardar respostas' });
  }
});

export default router;
