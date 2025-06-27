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
// Definição do Schema
const PatientSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    resourceType: { type: String, required: true },
    id: { type: String, required: true },
    text: {
        status: { type: String, required: true },
        div: { type: String, required: true },
    },
    identifier: [
        {
            use: { type: String, required: true },
            type: {
                coding: [
                    {
                        system: { type: String, required: true },
                        code: { type: String, required: true },
                        display: { type: String, required: true },
                    },
                ],
                text: { type: String, required: true },
            },
            system: { type: String, required: true },
            value: { type: String, required: true },
            assigner: {
                display: { type: String, required: true },
            },
        },
    ],
    active: { type: Boolean, required: true },
    name: [
        {
            use: { type: String, required: true },
            family: { type: String, required: true },
            given: [{ type: String, required: true }],
        },
    ],
    gender: { type: String, required: true },
    birthDate: { type: String, required: true },
    address: [
        {
            use: { type: String, required: true },
            line: [{ type: String, required: true }],
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
    ],
    telecom: [
        {
            system: { type: String, required: true },
            value: { type: String, required: true },
            use: { type: String, required: true },
        },
        {
            system: { type: String, required: true },
            value: { type: String, required: true },
            use: { type: String, required: true },
        },
    ],
});
// Criar o modelo ou usa o já existente Patient
const Patient = mongoose_1.default.model('Patient', PatientSchema, 'Patient');
exports.default = Patient;
