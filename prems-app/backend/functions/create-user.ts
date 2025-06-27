import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../models/user'; // ajuste o caminho se necessário

// Substitua pela sua URI real
var MONGODB_URI = 'mongodb://mongo:27017/HL7_FHIR';

const [,, email, password] = process.argv;

if (!email || !password) {
  console.error('❌ Uso: npm run create-user <email> <senha>');
  process.exit(1);
}

const createUser = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      email,
      password: hashedPassword,
      remember: true
    });

    await user.save();
    console.log(`✅ Usuário "${email}" criado com sucesso!`);
  } catch (err) {
    console.error('❌ Erro ao criar usuário:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexão encerrada');
  }
};

createUser();
