import nodemailer from 'nodemailer';
import { config } from 'dotenv';
import { join } from 'path';
import { TipoMensagem, gerarMensagem } from './MessageType'; 



// Carrega especificamente o arquivo email.env
config({ path: join(__dirname, '../configs/email.env') });


// Verifica se as variáveis estão definidas
const { EMAIL_USER, EMAIL_PASS } = process.env;
if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error('❌ As variáveis EMAIL_USER e/ou EMAIL_PASS não estão definidas no arquivo email.env.');
}


interface EmailOptions {
  to: string;
  tipo: TipoMensagem;
  link: string;
}

export async function sendEmail({ to, tipo, link }: EmailOptions): Promise<void> {
  const { subject, html } = gerarMensagem(tipo, link);

  const transporter = nodemailer.createTransport({
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
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    throw error;
  }
}

