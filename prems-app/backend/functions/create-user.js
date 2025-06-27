"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user")); // ajuste o caminho se necessário
// Substitua pela sua URI real
var MONGODB_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/HL7_FHIR';
const [, , email, password] = process.argv;
if (!email || !password) {
    console.error('❌ Uso: npm run create-user <email> <senha>');
    process.exit(1);
}
const createUser = async () => {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = new user_1.default({
            email,
            password: hashedPassword,
            remember: true
        });
        await user.save();
        console.log(`✅ Usuário "${email}" criado com sucesso!`);
    }
    catch (err) {
        console.error('❌ Erro ao criar usuário:', err);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('🔌 Conexão encerrada');
    }
};
createUser();
