"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const MonthlyStatsSchema = new mongoose_1.Schema({
    mes: { type: Number, required: true },
    ano: { type: Number, required: true },
    mediaEnf: { type: Number, required: true },
    mediaMed: { type: Number, required: true },
    medAmb: { type: Number, required: true },
    medAlt: { type: Number, required: true },
    taxRec: { type: Number, required: true },
    enfCortResp: { type: Number, required: true },
    enfEsc: { type: Number, required: true },
    enfExp: { type: Number, required: true },
    ambLimp: { type: Number, required: true },
    ambDesc: { type: Number, required: true },
    ambSil: { type: Number, required: true },
    classPos: { type: Number, required: true },
    classNeg: { type: Number, required: true },
});
const MonthlyStatsModel = mongoose_1.default.model('MonthlyStats', MonthlyStatsSchema, 'MonthlyStats');
exports.default = MonthlyStatsModel;
