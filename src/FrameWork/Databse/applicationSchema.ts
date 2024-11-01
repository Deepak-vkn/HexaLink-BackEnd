// backend/src/framework/database/userSchema.ts
import mongoose, { Schema, Document } from 'mongoose';
import { Application } from '../../Domain/applicationType';


export interface ApplicationDocument extends Application, Document {}

const ApplicationSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    jobId: { type: Schema.Types.ObjectId, ref: 'Jobs', required: true }, 
    name: { type: String, required: true }, 
    email: { type: String, required: true }, 
    resume: { type: Buffer, required: true }, 
    appliedDate: { type: Date, default: Date.now, required: true }, 
    experience: { type: String, required: true }, 
    status: { 
        type: String, 
        required: true, 
        enum: ['Pending', 'Reviewed', 'Rejected', 'Shortlisted'],
        default: 'Pending'
      }
   
});

export default mongoose.model<ApplicationDocument>('Application', ApplicationSchema);
