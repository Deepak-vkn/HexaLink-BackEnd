// backend/src/framework/database/userSchema.ts
import mongoose, { Schema, Document } from 'mongoose';
import { Company } from '../../Domain/companyType';


export interface CompanyDocument extends Company, Document {}

const CompanySchema: Schema = new Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    joinedAt: { type: Date, required: true, default: Date.now }, 
    address: { type: String, required: true },
    is_verified: { type: Boolean, default: false },
    is_block: { type: Boolean, required: true, default: false }
   
});

export default mongoose.model<CompanyDocument>('Company', CompanySchema);
