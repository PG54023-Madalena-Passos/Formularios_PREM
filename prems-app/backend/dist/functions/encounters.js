"use strict";
// Listar todas as datas de fim dos Encounters
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const db = mongoose_1.default.connection.db;
        const encounterCollection = db.collection('Encounter');
        // Buscamos somente o campo 'period.end'
        const documentos = await encounterCollection
            .find({}, { projection: { 'period.end': 1, _id: 0 } })
            .toArray();
        res.json({ periodEnds: documentos.map(doc => { var _a; return (_a = doc.period) === null || _a === void 0 ? void 0 : _a.end; }) });
    }
    catch (error) {
        console.error('Erro ao listar period.end:', error.message);
        res.status(500).json({ error: 'Erro ao listar period.end' });
    }
});
exports.default = router;
