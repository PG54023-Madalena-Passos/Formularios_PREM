"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const router = express_1.default.Router();
// Carrega especificamente o arquivo process.env
(0, dotenv_1.config)({ path: (0, path_1.join)(__dirname, '../configs/process.env') });
router.post('/login', (req, res, next) => {
    (async () => {
        const { email, password, remember } = req.body;
        console.log(email + " Pass: " + password);
        const user = await user_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ error: 'Credenciais inválidas' });
            return;
        }
        console.log(user);
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Credenciais inválidas' });
            return;
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_SECRET, {
            expiresIn: remember ? '30d' : '1d'
        });
        res
            .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
        })
            .json({ accessToken });
    })().catch(next);
});
router.post('/refresh', (req, res, next) => {
    (async () => {
        const token = req.cookies.refreshToken;
        if (!token) {
            res.status(401).json({ error: 'Token ausente' });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_SECRET);
            const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id }, process.env.JWT_SECRET, {
                expiresIn: '15m',
            });
            res.json({ accessToken });
        }
        catch (err) {
            res.status(403).json({ error: 'Token inválido' });
        }
    })().catch(next);
});
router.post('/logout', (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
    });
    res.sendStatus(200);
});
exports.default = router;
