import mongoose, { Schema, Document } from 'mongoose';
import { Tokens } from '../../Domain/tokenType'; // Adjust the path to where your Tokens type is defined

export interface TokenDocument extends Tokens, Document {}

const TokenSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Adjust 'User' to your actual user model name
    token: { type: String, required: true },
    expireAt: { type: Date, required: true },
});
TokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.model<TokenDocument>('Token', TokenSchema);
