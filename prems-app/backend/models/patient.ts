import mongoose, { Schema, Document, Types, Model } from 'mongoose';

// Interface TypeScript representando o Patient
export interface IPatient extends Document {
  _id: Types.ObjectId;
  resourceType: string;
  id: string;
  text: {
    status: string;
    div: string;
  };
  identifier: Array<{
    use: string;
    type: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
      text: string;
    };
    system: string;
    value: string;
    assigner: {
      display: string;
    };
  }>;
  active: boolean;
  name: Array<{
    use: string;
    family: string;
    given: string[];
  }>;
  gender: string;
  birthDate: string;
  address: Array<{
    use: string;
    line: string[];
    city: string;
    postalCode: string;
    country: string;
  }>;
  telecom: Array<{
    system: string;
    value: string;
    use: string;
  }>;
}

// Definição do Schema
const PatientSchema: Schema<IPatient> = new Schema({
  _id: { type: Schema.Types.ObjectId, required: true },
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

// Criar o modelo
const Patient: Model<IPatient> = mongoose.model<IPatient>('Patient', PatientSchema, 'Patient');

export default Patient;
