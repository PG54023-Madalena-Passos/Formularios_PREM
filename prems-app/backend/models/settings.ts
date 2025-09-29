import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  hour: string;
  minutes: string;
  envio: string;
  reforco: string;
  sucesso: string;
}

const SettingsSchema = new Schema<ISettings>({
  hour: String,
  minutes: String,
  envio: String,
  reforco: String,
  sucesso: String,
});

export default mongoose.model<ISettings>("Settings", SettingsSchema);
