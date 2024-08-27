import mongoose, { Schema, Document } from 'mongoose';
import { Tokens } from '../../Domain/tokenType'; 

export interface TokenDocument extends Tokens, Document {}

const TokenSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
    token: { type: String, required: true },
    expireAt: { type: Date, required: true },
});
TokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model<TokenDocument>('Token', TokenSchema);
