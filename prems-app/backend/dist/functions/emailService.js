"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const MessageType_1 = require("./MessageType");
// Carrega especificamente o arquivo email.env
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '../configs/email.env') });
// Verifica se as variáveis estão definidas
const { EMAIL_USER, EMAIL_PASS } = process.env;
if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('❌ As variáveis EMAIL_USER e/ou EMAIL_PASS não estão definidas no arquivo email.env.');
}
async function sendEmail({ to, tipo, link }) {
    const { subject, html } = (0, MessageType_1.gerarMensagem)(tipo, link);
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });
    const mailOptions = {
        from: EMAIL_USER,
        to,
        subject,
        html,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ E-mail enviado:', info.response);
    }
    catch (error) {
        console.error('❌ Erro ao enviar e-mail:', error);
        throw error;
    }
}
