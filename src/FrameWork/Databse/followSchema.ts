import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { Follow } from '../../Domain/followTypes';


export interface FollowDocument extends Follow, Document {}


const FollowSchema: Schema = new Schema({
  following: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Follow = mongoose.model<FollowDocument>('Follow', FollowSchema);

export default Follow;
