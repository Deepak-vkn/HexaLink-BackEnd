// backend/src/framework/database/userSchema.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
    name: string;
    number: number;
    email: string;
    password: string;
    is_verified: boolean;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    number: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    is_verified: { type: Boolean, default: false }
   
});

export default mongoose.model<UserDocument>('User', UserSchema);
