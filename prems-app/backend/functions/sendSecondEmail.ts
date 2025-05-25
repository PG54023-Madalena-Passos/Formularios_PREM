import mongoose from 'mongoose';
import QuestionnaireModel from '../models/questionnaire';
import { sendEmail } from './emailService';


export const sendSecondEmails = async () => {
    const questionnaireCollection = mongoose.connection.collection('Questionnaire');

    const umaSemanaAtras = new Date();
    umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);

    const duasSemanasAtras = new Date();
    duasSemanasAtras.setDate(duasSemanasAtras.getDate() - 14);

    try{
        const questionnaires = await questionnaireCollection.find({
            DataEvento: {
            $gte: duasSemanasAtras,
            $lte: umaSemanaAtras
            },
            respondido: false,
            reforco: false  // Garante que é enviado apenas um email de reforço
        }).toArray();

        console.log("🕓 Enviar email de reforço...")

        console.log(`📬 ${questionnaires.length} e-mails a serem enviados`);

        for (const questionnaire of questionnaires) {
        const email = questionnaire.pacienteEmail;
        const q_id = questionnaire.id;

        if (email && q_id) {
            const link = `http://localhost:3000/${q_id}`;
            try {
            // Enviar o email
            await sendEmail({ to: email, tipo: 'reforco', link });
            console.log(`✅ E-mail de reforço enviado para ${email}`);

            // Coloca a flag reforco a true, para que não seja enviado outro email de reforço
            await questionnaireCollection.updateOne(
                { _id: questionnaire._id },
                { $set: { reforco: true } }
                );
            } catch (error) {
            console.error(`❌ Falha ao enviar para ${email}:`, error);
            }
        }
        }
    } catch (error) {
        console.error('❌ Erro ao encontrar questionários:', error);
    }
};