"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMonthlyStatistics = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const date_fns_1 = require("date-fns");
const generateMonthlyStatistics = async () => {
    console.log('🔄 Iniciando geração de Estatisticas deste mês...');
    const respostaCollection = mongoose_1.default.connection.collection('respostas');
    const agora = new Date();
    const inicioMesAnterior = (0, date_fns_1.startOfMonth)((0, date_fns_1.subMonths)(agora, 1));
    const fimMesAnterior = (0, date_fns_1.endOfMonth)((0, date_fns_1.subMonths)(agora, 1));
    const respostas = await respostaCollection.find({
        dataSubmissao: {
            $gte: inicioMesAnterior,
            $lte: fimMesAnterior,
        },
    }).sort({ dataSubmissao: 1 }).toArray();
    console.log(`🔍 Encontradas ${respostas.length} respostas do mês anterior`);
};
exports.generateMonthlyStatistics = generateMonthlyStatistics;
