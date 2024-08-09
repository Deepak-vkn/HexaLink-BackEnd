// backend/src/framework/database/adminSchema.ts
import mongoose, { Schema, Document } from 'mongoose';
import { Admin } from '../../Domain/adminType';


export interface AdminDocument extends Admin, Document {}

const AdminSchema: Schema = new Schema({
    name: { type: String, required: true, default: 'Admin' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

export default mongoose.model<AdminDocument>('Admin', AdminSchema);
