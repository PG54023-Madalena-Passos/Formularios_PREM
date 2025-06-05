import mongoose, { Document, Schema } from 'mongoose';

export interface IMeasureReport extends Document {
  resourceType: 'MeasureReport';
  status: string;
  type: 'summary' | 'individual' | 'subject-list' | 'data-exchange';
  measure: string;
  period: {
    start: string;
    end: string;
  };
  date: string;
  group: {
    id: string;
    measureScoreQuantity: {
      value: number;
    };
  }[];
}

const MeasureReportSchema = new Schema<IMeasureReport>(
  {
    resourceType: { type: String, default: 'MeasureReport' },
    status: { type: String, required: true },
    type: {
      type: String,
      enum: ['summary', 'individual', 'subject-list', 'data-exchange'],
      required: true
    },
    measure: { type: String, required: true },
    period: {
      start: { type: String, required: true },
      end: { type: String, required: true }
    },
    date: { type: String, required: true },
    group: [
      {
        id: { type: String, required: true },
        measureScoreQuantity: {
          value: { type: Number, required: true }
        }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model<IMeasureReport>('MeasureReport', MeasureReportSchema);
