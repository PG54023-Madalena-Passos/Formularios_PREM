"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const measureReport_1 = __importDefault(require("../models/measureReport"));
const router = express_1.default.Router();
// GET /api/measurereports - Retorna todos os measure reports para a dashboard
router.get('/', async (req, res) => {
    try {
        // Buscar os measure reports mais recentes
        const measureReports = await measureReport_1.default.find()
            .sort({ date: -1 });
        res.json(measureReports);
    }
    catch (error) {
        console.error('Erro ao buscar measure reports:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Não foi possível carregar os dados da dashboard'
        });
    }
});
exports.default = router;
