import QuestionnaireModel from '../models/statistics';
import mongoose from 'mongoose';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

export const generateMonthlyStatistics = async () => {
    console.log('🔄 Iniciando geração de Estatisticas deste mês...');

    const respostaCollection = mongoose.connection.collection('respostas');

    const agora = new Date();
    const inicioMesAnterior = startOfMonth(subMonths(agora, 1));
    const fimMesAnterior = endOfMonth(subMonths(agora, 1));

    const respostas = await respostaCollection.find({
      dataSubmissao: {
        $gte: inicioMesAnterior,
        $lte: fimMesAnterior,
      },
    }).sort({ dataSubmissao: 1 }).toArray();

    console.log(`🔍 Encontradas ${respostas.length} respostas do mês anterior`);



}