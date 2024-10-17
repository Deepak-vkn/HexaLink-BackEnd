
import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { Save } from '../../Domain/saveTypes'; 

export interface SaveDocument extends Save, Document {}

const SaveSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },   
  targetId: { type: Schema.Types.ObjectId, refPath: 'type', required: true }, 
  type: { type: String, enum: ['Posts', 'Jobs'], required: true },         
  savedDate: { type: Date, default: Date.now },                         
});

export default mongoose.model<SaveDocument>('Save', SaveSchema);
