"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAndSaveMeasureReports = generateAndSaveMeasureReports;
const questionnaireResponse_1 = __importDefault(require("../models/questionnaireResponse"));
const measureReport_1 = __importDefault(require("../models/measureReport"));
const average = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
const round2 = (val) => val === null ? null : Math.round(val * 100) / 100;
function extractAnswers(items, groupId) {
    const group = items.find(i => i.linkId === groupId);
    if (!(group === null || group === void 0 ? void 0 : group.item))
        return [];
    return group.item
        .flatMap((q) => { var _a, _b; return (_b = (_a = q.answer) === null || _a === void 0 ? void 0 : _a.map((a) => a.valueInteger).filter((v) => typeof v === 'number')) !== null && _b !== void 0 ? _b : []; });
}
function extractAnswersOnly(items, groupId, only) {
    const group = items.find(i => i.linkId === groupId);
    if (!(group === null || group === void 0 ? void 0 : group.item))
        return [];
    return group.item
        .filter((q) => only.includes(q.linkId))
        .flatMap((q) => { var _a, _b; return (_b = (_a = q.answer) === null || _a === void 0 ? void 0 : _a.map((a) => a.valueInteger).filter((v) => typeof v === 'number')) !== null && _b !== void 0 ? _b : []; });
}
const surveyTypes = ['europep', 'hcahps', 'combined'];
const periodLabels = {
    last3Months: 'Ultimos 3 Meses',
    last12Months: 'Ultimo Ano'
};
function emptyStatsGroup() {
    return {
        enfermagem: [],
        medico: [],
        ambiente: [],
        satisfacao: [],
        recomendacao: [],
        alta: [],
        cuidadosPrestados: [],
        enfCortesiaRespeito: [],
        medCortesiaRespeito: [],
        enfEscuta: [],
        medEscuta: [],
        enfComunicacao: [],
        medComunicacao: [],
        enfTempo: [],
        medTempo: [],
        limpeza: [],
        confortoDescanso: [],
        taxaRecPos: [],
        taxaRecNeg: []
    };
}
function initSurveyStats() {
    return {
        europep: emptyStatsGroup(),
        hcahps: emptyStatsGroup(),
        combined: emptyStatsGroup()
    };
}
async function generateAndSaveMeasureReports() {
    var _a, _b;
    const responses = await questionnaireResponse_1.default.find();
    const now = new Date();
    const periodStats = {
        last3Months: initSurveyStats(),
        last12Months: initSurveyStats()
    };
    const isInPeriod = {
        last3Months: (d) => {
            const past = new Date(now);
            past.setMonth(past.getMonth() - 3);
            return d >= past && d <= now;
        },
        last12Months: (d) => {
            const past = new Date(now);
            past.setFullYear(past.getFullYear() - 1);
            return d >= past && d <= now;
        }
    };
    for (const resItem of responses) {
        const authored = new Date(resItem.authored);
        const applicablePeriods = Object.keys(isInPeriod).filter(period => isInPeriod[period](authored));
        if (applicablePeriods.length === 0)
            continue;
        const isEuropep = resItem.questionnaire.includes('europep');
        const isHcahps = resItem.questionnaire.includes('hcahps');
        const surveyType = isEuropep ? 'europep' : 'hcahps';
        const practitionerExt = (_a = resItem.extension) === null || _a === void 0 ? void 0 : _a.find((e) => e.url === 'http://hl7.org/fhir/StructureDefinition/practitioner');
        const areaCode = ((_b = practitionerExt === null || practitionerExt === void 0 ? void 0 : practitionerExt.valueReference) === null || _b === void 0 ? void 0 : _b.display) || 'UNK';
        const isMedico = areaCode === 'MD';
        const isEnfermeiro = areaCode === 'RN';
        for (const period of applicablePeriods) {
            const groupCombined = periodStats[period].combined;
            const groupSpecific = periodStats[period][surveyType];
            if (isEuropep) {
                const enf = extractAnswers(resItem.item, 'grp1');
                const med = extractAnswers(resItem.item, 'grp1');
                const amb = extractAnswersOnly(resItem.item, 'grp3', ['22', '23']);
                const sat = extractAnswersOnly(resItem.item, 'grp3', ['24']).map(val => val * 10 / 5);
                const cuip = extractAnswers(resItem.item, 'grp2');
                const CR = extractAnswersOnly(resItem.item, 'grp1', ['2', '3']);
                const escA = extractAnswersOnly(resItem.item, 'grp1', ['5']);
                const com = extractAnswersOnly(resItem.item, 'grp1', ['4']);
                const tempo = extractAnswersOnly(resItem.item, 'grp1', ['1']);
                const limp = extractAnswersOnly(resItem.item, 'grp3', ['23']);
                const confDesc = extractAnswersOnly(resItem.item, 'grp3', ['22']);
                if (isEnfermeiro) {
                    groupSpecific.enfermagem.push(...enf);
                    groupCombined.enfermagem.push(...enf);
                    groupSpecific.enfCortesiaRespeito.push(...CR);
                    groupCombined.enfCortesiaRespeito.push(...CR);
                    groupSpecific.enfEscuta.push(...escA);
                    groupCombined.enfEscuta.push(...escA);
                    groupSpecific.enfComunicacao.push(...com);
                    groupCombined.enfComunicacao.push(...com);
                    groupSpecific.enfTempo.push(...tempo);
                    groupCombined.enfTempo.push(...tempo);
                }
                if (isMedico) {
                    groupSpecific.medico.push(...med);
                    groupCombined.medico.push(...med);
                    groupSpecific.medCortesiaRespeito.push(...CR);
                    groupCombined.medCortesiaRespeito.push(...CR);
                    groupSpecific.medEscuta.push(...escA);
                    groupCombined.medEscuta.push(...escA);
                    groupSpecific.medComunicacao.push(...com);
                    groupCombined.medComunicacao.push(...com);
                    groupSpecific.medTempo.push(...tempo);
                    groupCombined.medTempo.push(...tempo);
                }
                groupSpecific.ambiente.push(...amb);
                groupCombined.ambiente.push(...amb);
                groupSpecific.limpeza.push(...limp);
                groupCombined.limpeza.push(...limp);
                groupSpecific.confortoDescanso.push(...confDesc);
                groupCombined.confortoDescanso.push(...confDesc);
                groupSpecific.satisfacao.push(...sat);
                groupCombined.satisfacao.push(...sat);
                groupSpecific.cuidadosPrestados.push(...cuip);
                groupCombined.cuidadosPrestados.push(...cuip);
            }
            if (isHcahps) {
                const enf = extractAnswers(resItem.item, 'grp1').map(val => val * 5 / 4);
                const med = extractAnswers(resItem.item, 'grp2').map(val => val * 5 / 4);
                const amb = extractAnswers(resItem.item, 'grp3').map(val => val * 5 / 4);
                const sat = extractAnswersOnly(resItem.item, 'grp6', ['24']);
                const rec = extractAnswersOnly(resItem.item, 'grp6', ['25']);
                const alt1 = extractAnswersOnly(resItem.item, 'grp5', ['19', '20']).map(val => val * 5 / 3);
                const alt2 = extractAnswersOnly(resItem.item, 'grp5', ['22', '23']).map(val => val * 5 / 2);
                const cui1 = extractAnswersOnly(resItem.item, 'grp4', ['10', '11', '13', '14', '16', '17']).map(val => val * 5 / 4);
                const cui2 = extractAnswersOnly(resItem.item, 'grp4', ['18']).map(val => val * 5 / 3);
                const enfCR = extractAnswersOnly(resItem.item, 'grp1', ['1']).map(val => val * 5 / 4);
                const medCR = extractAnswersOnly(resItem.item, 'grp2', ['4']).map(val => val * 5 / 4);
                const enfEsc = extractAnswersOnly(resItem.item, 'grp1', ['2']).map(val => val * 5 / 4);
                const medEsc = extractAnswersOnly(resItem.item, 'grp2', ['5']).map(val => val * 5 / 4);
                const enfCom = extractAnswersOnly(resItem.item, 'grp1', ['3']).map(val => val * 5 / 4);
                const medCom = extractAnswersOnly(resItem.item, 'grp2', ['6']).map(val => val * 5 / 4);
                const limp2 = extractAnswersOnly(resItem.item, 'grp3', ['7']).map(val => val * 5 / 4);
                const confDesc = extractAnswersOnly(resItem.item, 'grp3', ['8', '9']).map(val => val * 5 / 4);
                const tRN = extractAnswersOnly(resItem.item, 'grp6', ['25']).filter(value => value === 1 || value === 2);
                const tRP = extractAnswersOnly(resItem.item, 'grp6', ['25']).filter(value => value === 3 || value === 4);
                groupSpecific.enfermagem.push(...enf);
                groupCombined.enfermagem.push(...enf);
                groupSpecific.medico.push(...med);
                groupCombined.medico.push(...med);
                groupSpecific.ambiente.push(...amb);
                groupCombined.ambiente.push(...amb);
                groupSpecific.satisfacao.push(...sat);
                groupCombined.satisfacao.push(...sat);
                groupSpecific.recomendacao.push(...rec);
                groupCombined.recomendacao.push(...rec);
                groupSpecific.alta.push(...alt1, ...alt2);
                groupCombined.alta.push(...alt1, ...alt2);
                groupSpecific.cuidadosPrestados.push(...cui1, ...cui2);
                groupCombined.cuidadosPrestados.push(...cui1, ...cui2);
                groupSpecific.enfCortesiaRespeito.push(...enfCR);
                groupCombined.enfCortesiaRespeito.push(...enfCR);
                groupSpecific.medCortesiaRespeito.push(...medCR);
                groupCombined.medCortesiaRespeito.push(...medCR);
                groupSpecific.enfEscuta.push(...enfEsc);
                groupCombined.enfEscuta.push(...enfEsc);
                groupSpecific.medEscuta.push(...medEsc);
                groupCombined.medEscuta.push(...medEsc);
                groupSpecific.enfComunicacao.push(...enfCom);
                groupCombined.enfComunicacao.push(...enfCom);
                groupSpecific.medComunicacao.push(...medCom);
                groupCombined.medComunicacao.push(...medCom);
                groupSpecific.limpeza.push(...limp2);
                groupCombined.limpeza.push(...limp2);
                groupSpecific.confortoDescanso.push(...confDesc);
                groupCombined.confortoDescanso.push(...confDesc);
                groupSpecific.medComunicacao.push(...medCom);
                groupCombined.medComunicacao.push(...medCom);
                groupSpecific.taxaRecNeg.push(...tRN);
                groupCombined.taxaRecNeg.push(...tRN);
                groupSpecific.taxaRecPos.push(...tRP);
                groupCombined.taxaRecPos.push(...tRP);
            }
        }
    }
    const results = [];
    Object.keys(periodStats).forEach(period => {
        surveyTypes.forEach(type => {
            const stats = periodStats[period][type];
            const totalRec = stats.taxaRecPos.length + stats.taxaRecNeg.length;
            results.push({
                month: `${periodLabels[period]}`,
                source: type,
                enfermagem: round2(average(stats.enfermagem)),
                medico: round2(average(stats.medico)),
                ambiente: round2(average(stats.ambiente)),
                satisfacao: round2(average(stats.satisfacao)),
                recomendacao: round2(average(stats.recomendacao)),
                alta: round2(average(stats.alta)),
                cuidadosPrestados: round2(average(stats.cuidadosPrestados)),
                enfCortesiaRespeito: round2(average(stats.enfCortesiaRespeito)),
                medCortesiaRespeito: round2(average(stats.medCortesiaRespeito)),
                enfEscuta: round2(average(stats.enfEscuta)),
                medEscuta: round2(average(stats.medEscuta)),
                enfComunicacao: round2(average(stats.enfComunicacao)),
                medComunicacao: round2(average(stats.medComunicacao)),
                enfTempo: round2(average(stats.enfTempo)),
                medTempo: round2(average(stats.medTempo)),
                limpeza: round2(average(stats.limpeza)),
                confortoDescanso: round2(average(stats.confortoDescanso)),
                taxaRecPos: totalRec > 0 ? round2(stats.taxaRecPos.length / totalRec) : null,
                taxaRecNeg: totalRec > 0 ? round2(stats.taxaRecNeg.length / totalRec) : null,
            });
        });
    });
    const bundle = generateMeasureReportBundle(results);
    const upserts = await Promise.all(bundle.entry.map((e) => measureReport_1.default.updateOne({ measure: e.resource.measure }, // ou { id: e.resource.id }
    { $set: e.resource }, { upsert: true })));
    console.log(`${upserts.length} MeasureReports atualizados ou inseridos.`);
    return upserts;
}
function generateMeasureReportBundle(results) {
    return {
        resourceType: 'Bundle',
        type: 'collection',
        entry: results.map((row, index) => ({
            fullUrl: `urn:uuid:measure-report-${row.source}-${index + 1}`,
            resource: {
                resourceType: 'MeasureReport',
                id: `measure-report-${row.source}-${index + 1}`,
                status: 'complete',
                type: 'summary',
                date: new Date().toISOString(),
                period: {
                    start: getPeriodStart(row.month),
                    end: new Date().toISOString()
                },
                measure: `Measure/${row.source}-${row.month.replace(/\s+/g, '-').toLowerCase()}`,
                group: [
                    { id: 'enfermagem', code: { text: 'Cuidados de Enfermagem' }, measureScoreQuantity: { value: row.enfermagem } },
                    { id: 'medico', code: { text: 'Cuidados Médicos' }, measureScoreQuantity: { value: row.medico } },
                    { id: 'ambiente', code: { text: 'Ambiente Hospitalar' }, measureScoreQuantity: { value: row.ambiente } },
                    { id: 'satisfacao', code: { text: 'Satisfação Geral' }, measureScoreQuantity: { value: row.satisfacao } },
                    { id: 'recomendacao', code: { text: 'Taxa de Recomendação' }, measureScoreQuantity: { value: row.recomendacao } },
                    { id: 'alta', code: { text: 'Alta' }, measureScoreQuantity: { value: row.alta } },
                    { id: 'cuidadosPrestados', code: { text: 'Cuidados Prestados' }, measureScoreQuantity: { value: row.cuidadosPrestados } },
                    { id: 'enfCortesiaRespeito', code: { text: 'Cortesia e Respeito - Enfermagem' }, measureScoreQuantity: { value: row.enfCortesiaRespeito } },
                    { id: 'medCortesiaRespeito', code: { text: 'Cortesia e Respeito - Médico' }, measureScoreQuantity: { value: row.medCortesiaRespeito } },
                    { id: 'enfEscuta', code: { text: 'Escuta Atenta - Enfermagem' }, measureScoreQuantity: { value: row.enfEscuta } },
                    { id: 'medEscuta', code: { text: 'Escuta Atenta - Médico' }, measureScoreQuantity: { value: row.medEscuta } },
                    { id: 'enfComunicacao', code: { text: 'Clareza na Comunicação - Enfermagem' }, measureScoreQuantity: { value: row.enfComunicacao } },
                    { id: 'medComunicacao', code: { text: 'Clareza na Comunicação - Médico' }, measureScoreQuantity: { value: row.medComunicacao } },
                    { id: 'enfTempo', code: { text: 'Tempo Dedicado - Enfermagem' }, measureScoreQuantity: { value: row.enfTempo } },
                    { id: 'medTempo', code: { text: 'Tempo Dedicado - Médico' }, measureScoreQuantity: { value: row.medTempo } },
                    { id: 'limpeza', code: { text: 'Limpeza e Higiene' }, measureScoreQuantity: { value: row.limpeza } },
                    { id: 'confortoDescanso', code: { text: 'Conforto e Descanso' }, measureScoreQuantity: { value: row.confortoDescanso } },
                    { id: 'taxaRecPos', code: { text: 'Taxa de Recomendação Positiva' }, measureScoreQuantity: { value: row.taxaRecPos } },
                    { id: 'taxaRecNeg', code: { text: 'Taxa de Recomendação Negativa' }, measureScoreQuantity: { value: row.taxaRecNeg } }
                ]
            }
        }))
    };
}
function getPeriodStart(label) {
    const now = new Date();
    const start = new Date(now);
    switch (label) {
        case 'Ultimos 3 Meses':
            start.setMonth(now.getMonth() - 3);
            start.setDate(1);
            break;
        case 'Ultimo Ano':
            start.setFullYear(now.getFullYear() - 1);
            start.setDate(1);
            break;
        default:
            start.setMonth(0);
            start.setDate(1);
    }
    return start.toISOString();
}
