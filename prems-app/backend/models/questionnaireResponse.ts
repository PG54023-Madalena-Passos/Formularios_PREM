import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestionnaireResponse extends Document {
  resourceType: string;
  questionnaire: string;
  status: string;
  authored: string;
  extension: any[];
  item: any[];
}

const ExtensionSchema = new Schema(
  {
    url: { type: String, required: true },
    valueReference: {
      reference: { type: String },
      display: { type: String }
    },
    valueDateTime: { type: Schema.Types.Mixed }
  },
  { _id: false }
);

const AnswerSchema = new Schema(
  {
    valueInteger: Number,
    valueString: String
  },
  { _id: false }
);

const ItemSchema = new Schema(
  {
    linkId: { type: String, required: true },
    text: String,
    answer: [AnswerSchema]
  },
  { _id: false }
);

const GroupItemSchema = new Schema(
  {
    linkId: { type: String, required: true },
    item: [ItemSchema]
  },
  { _id: false }
);

const QuestionnaireResponseSchema = new Schema<IQuestionnaireResponse>(
  {
    resourceType: { type: String, required: true },
    questionnaire: { type: String, required: true },
    status: { type: String, required: true },
    authored: { type: String, required: true },
    extension: [ExtensionSchema],
    item: [GroupItemSchema]
  },
  { timestamps: true }
);

export default mongoose.model<IQuestionnaireResponse>('QuestionnaireResponse', QuestionnaireResponseSchema);
