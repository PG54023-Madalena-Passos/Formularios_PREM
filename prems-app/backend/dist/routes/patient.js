"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patient_1 = __importDefault(require("../models/patient"));
const router = express_1.default.Router();
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const patient = await patient_1.default.findOne({ id: id });
        // Do something async here, like a DB query
        res.json(patient);
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});
exports.default = router;
