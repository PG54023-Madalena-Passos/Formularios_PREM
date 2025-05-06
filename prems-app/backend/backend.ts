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
import patientRoutes from './routes/patient';
import respostasConsultasRoutes from './routes/FormsConsulta_BE';
import { generateQuestionnairesForYesterday } from './gestao_questionarios';
import colecoesRoutes from './encounters'
import mongoose from 'mongoose';

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
});


// Rotas
app.use('/api/patient', patientRoutes);
app.use('/api/respostas', respostasConsultasRoutes);
app.use('/api/colecoes', colecoesRoutes);

// Iniciar servidor
app.listen(5000, () => {
  console.log('Server listening on port 5000');
});
