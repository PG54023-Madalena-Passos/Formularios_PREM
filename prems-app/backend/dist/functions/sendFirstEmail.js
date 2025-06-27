"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendFirstEmails = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const emailService_1 = require("./emailService");
const SendFirstEmails = async () => {
    const dataCollection = mongoose_1.default.connection.collection('Necessary_data');
    const now = new Date();
    const startOfYesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0, 0));
    const endOfYesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 23, 59, 59, 999));
    try {
        const data = await dataCollection.find({
            DataEvento: {
                $gte: startOfYesterday,
                $lte: endOfYesterday
            },
            respondido: false,
            enviado: false
        }).toArray();
        console.log("🕓 Enviar primeiro email ...");
        console.log(`📬 ${data.length} e-mails a serem enviados`);
        for (const questionnaire of data) {
            const email = questionnaire.pacienteEmail;
            const q_id = questionnaire.id;
            if (email && q_id) {
                const link = `http://localhost:3000/${q_id}`;
                try {
                    // Enviar o email
                    await (0, emailService_1.sendEmail)({ to: email, tipo: 'envio', link });
                    console.log(`✅ E-mail enviado para ${email}`);
                    // Coloca a flag enviado a true, para que não seja enviado outro email repetido
                    await dataCollection.updateOne({ _id: questionnaire._id }, { $set: { enviado: true } });
                }
                catch (error) {
                    console.error(`❌ Falha ao enviar para ${email}:`, error);
                }
            }
        }
    }
    catch (error) {
        console.error('❌ Erro ao encontrar questionários:', error);
    }
};
exports.SendFirstEmails = SendFirstEmails;
