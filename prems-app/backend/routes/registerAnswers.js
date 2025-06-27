"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const questionnaireResponse_1 = __importDefault(require("../models/questionnaireResponse"));
const data_1 = __importDefault(require("../models/data"));
const emailService_1 = require("../functions/emailService");
const generateMeasureReports_1 = require("../functions/generateMeasureReports");
const generateMonthlyMeasureReports_1 = require("../functions/generateMonthlyMeasureReports");
const router = express_1.default.Router();
// Rota para salvar respostas
router.post('/', async (req, res) => {
    try {
        const { tipo, q_id, item } = req.body;
        if (!tipo || !q_id || !item || !Array.isArray(item)) {
            res.status(400).send({ error: 'Estrutura inválida de resposta' });
            return;
        }
        let questionnaireURL = '';
        if (tipo === 'AMB') {
            questionnaireURL = 'http://example.org/fhir/Questionnaire/europep-questionnaire';
        }
        else if (tipo === 'IMP') {
            questionnaireURL = 'http://example.org/fhir/Questionnaire/hcahps-questionnaire';
        }
        else {
            res.status(400).send({ error: 'Tipo de questionário desconhecido' });
            return;
        }
        // Obter dados do questionário da base de dados
        const data = await data_1.default.findOne({ id: q_id });
        const dataEvento = (data === null || data === void 0 ? void 0 : data.DataEvento) || new Date();
        // Montar estrutura FHIR válida
        const authored = new Date().toISOString();
        const responseFHIR = {
            resourceType: 'QuestionnaireResponse',
            questionnaire: questionnaireURL,
            status: 'completed',
            authored,
            extension: [
                {
                    url: 'http://example.org/fhir/StructureDefinition/necessaryData-q_id',
                    valueString: q_id
                },
                ...((data === null || data === void 0 ? void 0 : data.profissionais)
                    ? data.profissionais.map(p => ({
                        url: 'http://hl7.org/fhir/StructureDefinition/practitioner',
                        valueReference: {
                            reference: `Practitioner/${p.profissionalId}`,
                            display: p.area
                        }
                    }))
                    : [])
            ],
            item: item.map(grupo => ({
                linkId: grupo.linkId,
                item: Object.entries(grupo)
                    .filter(([key]) => key !== 'linkId')
                    .map(([linkId, answer]) => {
                    const pergunta = {
                        linkId,
                        answer: typeof answer === 'number'
                            ? [{ valueInteger: answer }]
                            : typeof answer === 'string'
                                ? [{ valueString: answer }]
                                : []
                    };
                    return pergunta; // 👈 sem item: []
                })
            }))
        };
        // Guardar no MongoDB
        await questionnaireResponse_1.default.create(responseFHIR);
        // Enviar email e atualizar estado
        if (data === null || data === void 0 ? void 0 : data.pacienteEmail) {
            await (0, emailService_1.sendEmail)({ to: data.pacienteEmail, tipo: 'sucesso', link: '' });
        }
        await data_1.default.updateOne({ id: q_id }, {
            $set: { respondido: true },
            $unset: { pacienteEmail: '' }
        });
        await (0, generateMeasureReports_1.generateAndSaveMeasureReports)();
        (0, generateMonthlyMeasureReports_1.generateOrUpdateMonthlyMeasureReports)(dataEvento);
        console.log('✅ Estatisticas Guardadas!');
        res.status(201).json({ message: 'Respostas guardadas com sucesso!' });
    }
    catch (error) {
        console.error('Erro ao guardar resposta:', error);
        res.status(500).json({ error: 'Erro ao guardar respostas' });
    }
});
exports.default = router;
