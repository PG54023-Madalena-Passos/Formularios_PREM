"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questionnaireResponse_1 = __importDefault(require("../models/questionnaireResponse"));
const router = (0, express_1.Router)();
const getMonthKey = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};
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
const average = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
router.get('/statistics', async (req, res) => {
    var _a, _b;
    try {
        const responses = await questionnaireResponse_1.default.find();
        const stats = {};
        for (const resItem of responses) {
            const isEuropep = resItem.questionnaire.includes('europep');
            const isHcahps = resItem.questionnaire.includes('hcahps');
            const monthKey = getMonthKey(resItem.authored);
            const practitionerExt = (_a = resItem.extension) === null || _a === void 0 ? void 0 : _a.find((e) => e.url === 'http://hl7.org/fhir/StructureDefinition/practitioner');
            const areaCode = ((_b = practitionerExt === null || practitionerExt === void 0 ? void 0 : practitionerExt.valueReference) === null || _b === void 0 ? void 0 : _b.display) || 'UNK';
            const isMedico = areaCode === 'MD';
            const isEnfermeiro = areaCode === 'RN';
            if (!stats[monthKey]) {
                stats[monthKey] = {
                    europep: { enfermagem: [], medico: [], ambiente: [], satisfacao: [] },
                    hcahps: { enfermagem: [], medico: [], ambiente: [], satisfacao: [] },
                    combined: { enfermagem: [], medico: [], ambiente: [], satisfacao: [] }
                };
            }
            const targetGroups = [];
            if (isEuropep)
                targetGroups.push('europep');
            if (isHcahps)
                targetGroups.push('hcahps');
            targetGroups.push('combined');
            for (const group of targetGroups) {
                const current = stats[monthKey][group];
                if (isEnfermeiro && (isEuropep || isHcahps)) {
                    current.enfermagem.push(...extractAnswers(resItem.item, 'grp1'));
                }
                if (isMedico && isEuropep) {
                    current.medico.push(...extractAnswers(resItem.item, 'grp1'));
                }
                if (isMedico && isHcahps) {
                    current.medico.push(...extractAnswers(resItem.item, 'grp2'));
                }
                if (isEuropep) {
                    current.ambiente.push(...extractAnswersOnly(resItem.item, 'grp3', ['22', '23']));
                    current.satisfacao.push(...extractAnswersOnly(resItem.item, 'grp3', ['24']));
                }
                if (isHcahps) {
                    current.ambiente.push(...extractAnswers(resItem.item, 'grp3'));
                    current.satisfacao.push(...extractAnswersOnly(resItem.item, 'grp6', ['24']));
                }
            }
        }
        const result = Object.entries(stats).flatMap(([month, data]) => [
            {
                month,
                source: 'europep',
                enfermagem: average(data.europep.enfermagem),
                medico: average(data.europep.medico),
                ambiente: average(data.europep.ambiente),
                satisfacao: average(data.europep.satisfacao)
            },
            {
                month,
                source: 'hcahps',
                enfermagem: average(data.hcahps.enfermagem),
                medico: average(data.hcahps.medico),
                ambiente: average(data.hcahps.ambiente),
                satisfacao: average(data.hcahps.satisfacao)
            },
            {
                month,
                source: 'combined',
                enfermagem: average(data.combined.enfermagem),
                medico: average(data.combined.medico),
                ambiente: average(data.combined.ambiente),
                satisfacao: average(data.combined.satisfacao)
            }
        ]);
        res.json(result);
    }
    catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
        res.status(500).json({ error: 'Erro ao calcular estatísticas' });
    }
});
exports.default = router;
