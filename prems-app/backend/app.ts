// Importante: Implementar a verificação de questionários em 24h em vez de quando inicia o servidor
/*

!npm install node-cron

import cron from 'node-cron';

// Rodar todos os dias às 09:00 da manhã
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Executando tarefa diária para gerar Questionnaires...');
  await generateQuestionnairesForYesterday();
});

*/

import express, { Application } from 'express';
import cors from 'cors';
import connectDB from './bd';
import mongoose from 'mongoose';
import colecoesRoutes from './functions/encounters'
import patientRoutes from './routes/patient';
import respostasRoutes from './routes/registerAnswers';
import { generateQuestionnairesForYesterday } from './functions/createQuestionnaire';
import questionariosRoutes from './routes/questionnaireType';
import { sendSecondEmails } from './functions/sendSecondEmail';
import { SendFirstEmails } from './functions/sendFirstEmail';
import statistics from './routes/statistics';
import measureReports from './routes/measureReports';
import {generateAndSaveMeasureReports} from './functions/generateMeasureReports';
import { generateOrUpdateMonthlyMeasureReports } from './functions/generateMonthlyMeasureReports';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar à base de dados
connectDB();
console.log("Successful connection to BD!");
mongoose.connection.once('open', async () => {
  console.log('✅ Conexão aberta, gerando Questionnaires do dia anterior...');
  await generateQuestionnairesForYesterday();
  console.log('✅ Questionnaires do dia anterior gerados!');
  await SendFirstEmails();
  console.log('✅ Emails enviados com sucesso!');
  await sendSecondEmails();
  console.log('✅ Reforço a funcionar!');
  await generateAndSaveMeasureReports();
  
});


// Rotas
app.use('/api/patient', patientRoutes);
app.use('/api/respostas', respostasRoutes);
//app.use('/api/colecoes', colecoesRoutes);
app.use('/api/questionnaire', questionariosRoutes);
app.use('/api', statistics);
app.use('/api/measurereports', measureReports);


// Iniciar servidor
app.listen(5000, () => {
  console.log('Server listening on port 5000');
});
