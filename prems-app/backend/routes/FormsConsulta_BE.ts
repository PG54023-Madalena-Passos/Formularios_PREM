import express from 'express';
import mongoose, { Document, Model } from 'mongoose';

const router = express.Router();

// Interface opcional para tipagem do documento
interface IResposta extends Document {
  tipo: string;
  item: any;
}

// Schema genérico que aceita qualquer estrutura
const respostaSchema = new mongoose.Schema({}, { strict: false });

// Modelo Mongoose
const Resposta: Model<IResposta> = mongoose.model<IResposta>('Resposta', respostaSchema);

// Rota para salvar respostas
router.post('/', async (req, res): Promise<void> => {
  try {
    const { tipo, item } = req.body;

    if (!tipo || !item) {
      res.status(400).send({ error: 'Estrutura inválida de resposta' });
      return;
    }

    const novaResposta = new Resposta({ tipo, item });
    await novaResposta.save();

    res.status(201).send({ message: 'Respostas guardadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao guardar:', error);
    res.status(500).send({ error: 'Erro ao guardar respostas' });
  }
});

export default router;
