"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bd_1 = __importDefault(require("./bd"));
const mongoose_1 = __importDefault(require("mongoose"));
const patient_1 = __importDefault(require("./routes/patient"));
const registerAnswers_1 = __importDefault(require("./routes/registerAnswers"));
const createQuestionnaire_1 = require("./functions/createQuestionnaire");
const questionnaireType_1 = __importDefault(require("./routes/questionnaireType"));
const sendSecondEmail_1 = require("./functions/sendSecondEmail");
const sendFirstEmail_1 = require("./functions/sendFirstEmail");
const statistics_1 = __importDefault(require("./routes/statistics"));
const measureReports_1 = __importDefault(require("./routes/measureReports"));
const generateMeasureReports_1 = require("./functions/generateMeasureReports");
const auth_1 = __importDefault(require("./routes/auth"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true // Permite o envio de cookies
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/api/auth', auth_1.default);
// Conectar à base de dados
(0, bd_1.default)();
console.log("Successful connection to BD!");
mongoose_1.default.connection.once('open', async () => {
    console.log('✅ Conexão aberta, gerando Questionnaires do dia anterior...');
    await (0, createQuestionnaire_1.generateQuestionnairesForYesterday)();
    console.log('✅ Questionnaires do dia anterior gerados!');
    await (0, sendFirstEmail_1.SendFirstEmails)();
    console.log('✅ Emails enviados com sucesso!');
    await (0, sendSecondEmail_1.sendSecondEmails)();
    console.log('✅ Reforço a funcionar!');
    await (0, generateMeasureReports_1.generateAndSaveMeasureReports)();
});
/*
// Verificação de questionários e envio de emails a cada 24h (às 09h)
cron.schedule('0 9 * * *', async () => {
  console.log('⏰ Executando tarefa diária para gerar Questionnaires...');
  await generateQuestionnairesForYesterday();
  console.log('✅ Questionnaires do dia anterior gerados!');
  await SendFirstEmails();
  console.log('✅ Emails enviados com sucesso!');
  await sendSecondEmails();
  console.log('✅ Reforço a funcionar!');
  await generateAndSaveMeasureReports();
});
*/
// Rotas
app.use('/api/patient', patient_1.default);
app.use('/api/respostas', registerAnswers_1.default);
//app.use('/api/colecoes', colecoesRoutes);
app.use('/api/questionnaire', questionnaireType_1.default);
app.use('/api', statistics_1.default);
app.use('/api/measurereports', measureReports_1.default);
// Iniciar servidor
app.listen(5000, () => {
    console.log('Server listening on port 5000');
});
