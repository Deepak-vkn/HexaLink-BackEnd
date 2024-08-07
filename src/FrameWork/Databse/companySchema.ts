// backend/src/framework/database/userSchema.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface CompanyDocument extends Document {
    name: string;
    number: number;
    email: string;
    password: string;
    address:string;
    is_verified: boolean;
}

const CompanySchema: Schema = new Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    is_verified: { type: Boolean, default: false }
   
});

export default mongoose.model<CompanyDocument>('Company', CompanySchema);
