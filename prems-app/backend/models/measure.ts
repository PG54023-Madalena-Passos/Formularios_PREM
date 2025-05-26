import mongoose, { Document, Schema } from 'mongoose';

export interface IMeasure extends Document {
  resourceType: 'Measure';
  id: string;
  status: string;
  name: string;
  title: string;
  date: string;
  description?: string;
  scoring: {
    coding: {
      system: string;
      code: string;
      display: string;
    }[];
  };
  subjectCodeableConcept?: {
    text: string;
  };
}

const MeasureSchema = new Schema<IMeasure>(
  {
    resourceType: { type: String, default: 'Measure' },
    id: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    name: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String },
    scoring: {
      coding: [
        {
          system: { type: String },
          code: { type: String },
          display: { type: String }
        }
      ]
    },
    subjectCodeableConcept: {
      text: { type: String }
    }
  },
  { timestamps: true }
);

export default mongoose.model<IMeasure>('Measure', MeasureSchema);
