"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestionnairesForYesterday = void 0;
const crypto_1 = require("crypto");
const data_1 = __importDefault(require("../models/data"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const generateQuestionnairesForYesterday = async () => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    console.log('🔄 Iniciando geração de Questionnaires para o dia anterior via API FHIR...');
    const now = new Date();
    const startOfYesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 0, 0, 0, 0));
    const endOfYesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 23, 59, 59, 999));
    console.log(startOfYesterday + "-" + endOfYesterday);
    const existing = await data_1.default.findOne({
        DataEvento: {
            $gte: startOfYesterday,
            $lte: endOfYesterday
        }
    });
    if (existing) {
        console.log('⛔ Já existem questionarios criados para o dia anterior.');
        return;
    }
    try {
        // 1. Buscar todos os encounters finalizados
        const res = await (0, node_fetch_1.default)('http://localhost:8081/fhir/Encounter?status=finished');
        const bundle = await res.json();
        if (!bundle.entry) {
            console.log('⚠️ Nenhum Encounter encontrado.');
            return;
        }
        const encounters = bundle.entry
            .map((entry) => entry.resource)
            .filter((enc) => {
            var _a;
            const end = (_a = enc === null || enc === void 0 ? void 0 : enc.location[0].period) === null || _a === void 0 ? void 0 : _a.end;
            if (!end)
                return false;
            const endDate = new Date(end);
            return endDate >= startOfYesterday && endDate <= endOfYesterday;
        });
        console.log(`🔍 Encontrados ${encounters.length} Encounters finalizados ontem.`);
        for (const encounter of encounters) {
            if (!((_a = encounter === null || encounter === void 0 ? void 0 : encounter.class) === null || _a === void 0 ? void 0 : _a.code) || !((_b = encounter === null || encounter === void 0 ? void 0 : encounter.location[0].period) === null || _b === void 0 ? void 0 : _b.end)) {
                console.warn(`⚠️ Encounter ${encounter.id} sem class.code ou period.end. Ignorado.`);
                continue;
            }
            const endDate = new Date(encounter.location[0].period.end);
            if (isNaN(endDate.getTime())) {
                console.warn(`⚠️ period.end inválido no Encounter ${encounter.id}.`);
                continue;
            }
            const profissionais = [];
            for (const p of encounter.participant || []) {
                const ref = ((_c = p.individual) === null || _c === void 0 ? void 0 : _c.reference) || '';
                const profissionalId = ref.split('/')[1] || ref;
                let area = 'UNK';
                if (profissionalId) {
                    try {
                        const res = await (0, node_fetch_1.default)(`http://localhost:8081/fhir/${ref}`);
                        if (!res.ok) {
                            console.error(`❌ Erro ao buscar Practitioner ${ref}: ${res.statusText}`);
                            return null;
                        }
                        const practitioner = await res.json();
                        area = ((_h = (_g = (_f = (_e = (_d = practitioner === null || practitioner === void 0 ? void 0 : practitioner.qualification) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.code) === null || _f === void 0 ? void 0 : _f.coding) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.code) || 'UNK';
                    }
                    catch (error) {
                        console.error(`❌ Erro ao buscar Practitioner ${profissionalId}:`, error);
                    }
                }
                profissionais.push({ profissionalId, area });
            }
            let pacienteEmail = undefined;
            const patientId = (_k = (_j = encounter.subject) === null || _j === void 0 ? void 0 : _j.reference) === null || _k === void 0 ? void 0 : _k.split('/')[1];
            if (patientId) {
                try {
                    const res = await (0, node_fetch_1.default)(`http://localhost:8081/fhir/Patient/${patientId}`);
                    const patient = await res.json();
                    const telecom = patient.telecom || [];
                    const emailEntry = telecom.find((t) => t.system === 'email');
                    if (emailEntry) {
                        pacienteEmail = emailEntry.value;
                        console.log(`📧 Email do paciente ${patientId}: ${pacienteEmail}`);
                    }
                    else {
                        console.log(`ℹ️ Paciente ${patientId} sem email.`);
                    }
                }
                catch (error) {
                    console.error(`❌ Erro ao buscar paciente ${patientId}:`, error);
                }
            }
            try {
                const newDoc = new data_1.default({
                    id: (0, crypto_1.randomUUID)(),
                    code: encounter.class.code,
                    profissionais,
                    DataEvento: endDate,
                    pacienteEmail,
                    enviado: false,
                    reforco: false,
                    respondido: false
                });
                await newDoc.save();
                console.log(`✅ Questionnaire criado: ${newDoc.id}`);
            }
            catch (error) {
                console.error(`❌ Erro ao salvar Questionnaire para Encounter ${encounter.id}:`, error);
            }
        }
    }
    catch (error) {
        console.error('❌ Erro geral ao buscar/processar Encounters:', error);
    }
};
exports.generateQuestionnairesForYesterday = generateQuestionnairesForYesterday;
