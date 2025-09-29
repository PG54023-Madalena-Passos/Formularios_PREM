import express from 'express';
import cron, { ScheduledTask } from 'node-cron';
import Settings from '../models/settings';
import { generateQuestionnairesForYesterday } from '../functions/createQuestionnaire';
import { sendSecondEmails } from '../functions/sendSecondEmail';
import { SendFirstEmails } from '../functions/sendFirstEmail';
import { generateAndSaveMeasureReports } from '../functions/generateMeasureReports';

const router = express.Router();
let cronTask: ScheduledTask | null = null;

async function startOrUpdateCron() {
  const settings = await Settings.findOne({});
  if (!settings) return;

  const cronTime = `${parseInt(settings.minutes)} ${parseInt(settings.hour)} * * *`;
  console.log(cronTime);


  // Parar cron anterior
  if (cronTask) cronTask.stop();

  // Criar cron novo
  cronTask = cron.schedule(
    cronTime,
    async () => {
      console.log('⏰ Executando tarefa diária...');
      await generateQuestionnairesForYesterday();
      await SendFirstEmails();
      await sendSecondEmails();
      await generateAndSaveMeasureReports();
    },
    { timezone: 'Europe/Lisbon' }
  );

  console.log(`Cron atualizado para: ${cronTime}`);
}

// Rota para forçar atualização do cron
router.post('/update-cron', async (req, res) => {
  try {
    console.log('Entrou no update-cron')
    await startOrUpdateCron();
    res.json({ message: 'Cron atualizado com sucesso!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar cron' });
  }
});

export default router;
