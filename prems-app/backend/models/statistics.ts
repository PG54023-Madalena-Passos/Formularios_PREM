import mongoose, { Document, Schema } from 'mongoose';

export interface IMonthlyStats extends Document {
  mes: number; 
  ano: number;
  mediaEnf: number;
  mediaMed: number;
  medAmb: number;
  medAlt: number;
  taxRec: number;
  enfCortResp: number;
  enfEsc: number;
  enfExp: number;
  ambLimp: number;
  ambDesc: number;
  ambSil: number;
  classPos: number;
  classNeg: number;
}

const MonthlyStatsSchema = new Schema<IMonthlyStats>({
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


const MonthlyStatsModel = mongoose.model<IMonthlyStats>('MonthlyStats', MonthlyStatsSchema, 'MonthlyStats');

export default MonthlyStatsModel;
