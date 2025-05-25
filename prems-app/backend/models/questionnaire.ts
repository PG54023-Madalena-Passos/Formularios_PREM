import mongoose, { Document, Schema } from 'mongoose';

// Interface TypeScript representando o Questionário
export interface IQuestionnaire extends Document {
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
const QuestionnaireSchema = new Schema<IQuestionnaire>({
  id: { type: String, required: true },
  code: { type: String, required: true },
  profissionais: { type: [String], required: true },
  DataEvento: { type: Date, required: true },
  pacienteEmail: { type: String },
  enviado: { type: Boolean, default: false  },
  reforco: { type: Boolean, default: false  },
  respondido: { type: Boolean, default: false  },
});


// Criar o modelo ou usa o já existente Questionnaire
const QuestionnaireModel = mongoose.model<IQuestionnaire>('Questionnaire', QuestionnaireSchema,'Questionnaire');

export default QuestionnaireModel;
