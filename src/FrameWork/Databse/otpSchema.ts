import mongoose, { Schema, Document } from 'mongoose';

import { Otp } from '../../Domain/otpType';


export interface OtpDocument extends Otp, Document {}

const OtpSchema: Schema = new Schema({
    otp: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 },
    expiresAt: { type: Date, required: true }
});

export default mongoose.model<OtpDocument>('Otp', OtpSchema);
