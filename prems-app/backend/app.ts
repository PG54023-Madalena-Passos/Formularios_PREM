import express, { Application } from 'express';
import cors from 'cors';
import connectDB from './bd';
import mongoose from 'mongoose';
import colecoesRoutes from './functions/encounters';
import patientRoutes from './routes/patient';
import respostasRoutes from './routes/registerAnswers';
import { generateQuestionnairesForYesterday } from './functions/createQuestionnaire';
import questionariosRoutes from './routes/questionnaireType';
import { sendSecondEmails } from './functions/sendSecondEmail';
import { SendFirstEmails } from './functions/sendFirstEmail';
import statistics from './routes/statistics';
import measureReports from './routes/measureReports';
import { generateAndSaveMeasureReports } from './functions/generateMeasureReports';
import { generateOrUpdateMonthlyMeasureReports } from './functions/generateMonthlyMeasureReports';
import authRoutes from './routes/auth';
import cookieParser from 'cookie-parser';
import cron, { ScheduledTask } from 'node-cron';
import settingsRoutes from './routes/settings';
import usersRoutes from './routes/users';
import Settings from './models/settings';
import cronRoutes from './routes/cron';

const app: Application = express();

// ────────────────────────────── Middleware ──────────────────────────────
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true // Permite o envio de cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

// ────────────────────────────── Conectar BD ──────────────────────────────
connectDB();
console.log("Successful connection to BD!");


// ────────────────────────────── Rotas ──────────────────────────────
app.use('/api/patient', patientRoutes);
app.use('/api/respostas', respostasRoutes);
app.use('/api/questionnaire', questionariosRoutes);
app.use('/api', statistics);
app.use('/api/measurereports', measureReports);
app.use('/api/settings', settingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cron', cronRoutes);

// ────────────────────────────── Iniciar servidor ──────────────────────────────
app.listen(5000, () => {
  console.log('Server listening on port 5000');
});
