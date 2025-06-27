"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSecondEmails = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const emailService_1 = require("./emailService");
const sendSecondEmails = async () => {
    const dataCollection = mongoose_1.default.connection.collection('Necessary_data');
    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
    const duasSemanasAtras = new Date();
    duasSemanasAtras.setDate(duasSemanasAtras.getDate() - 14);
    try {
        const questionnaires = await dataCollection.find({
            DataEvento: {
                $gte: duasSemanasAtras,
                $lte: umaSemanaAtras
            },
            respondido: false,
            reforco: false // Garante que é enviado apenas um email de reforço
        }).toArray();
        console.log("🕓 Enviar email de reforço...");
        console.log(`📬 ${questionnaires.length} e-mails a serem enviados`);
        for (const questionnaire of questionnaires) {
            const email = questionnaire.pacienteEmail;
            const q_id = questionnaire.id;
            if (email && q_id) {
                const link = `http://localhost:3000/${q_id}`;
                try {
                    // Enviar o email
                    await (0, emailService_1.sendEmail)({ to: email, tipo: 'reforco', link });
                    console.log(`✅ E-mail de reforço enviado para ${email}`);
                    // Coloca a flag reforco a true, para que não seja enviado outro email de reforço
                    await dataCollection.updateOne({ _id: questionnaire._id }, { $set: { reforco: true } });
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
exports.sendSecondEmails = sendSecondEmails;
