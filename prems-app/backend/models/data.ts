import mongoose, { Document, Schema } from 'mongoose';

// Interface TypeScript representando o Necessary_data
export interface IData extends Document {
  id: string;
  code: string;
  profissionais: string[];
  DataEvento: Date;
  pacienteEmail?: string;
  enviado: Boolean;
  reforco: Boolean;
  respondido: Boolean;
}

// Definição do Schema
const DataSchema = new Schema<IData>({
  id: { type: String, required: true },
  code: { type: String, required: true },
  profissionais: { type: [String], required: true },
  DataEvento: { type: Date, required: true },
  pacienteEmail: { type: String },
  enviado: { type: Boolean, default: false  },
  reforco: { type: Boolean, default: false  },
  respondido: { type: Boolean, default: false  },
});


// Criar o modelo ou usa o já existente Necessary_data
const DataModel = mongoose.model<IData>('Necessary_data', DataSchema,'Necessary_data');

export default DataModel;
