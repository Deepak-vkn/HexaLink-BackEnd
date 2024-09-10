import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { Follow } from '../../Domain/followTypes';


export interface FollowStatus {
  id: mongoose.Types.ObjectId; 
  followTime: Date;
  status: 'requested' | 'approved';
}
export interface FollowDocument extends Follow, Document {}

const FollowStatusSchema: Schema = new Schema({
  id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  followTime: { type: Date, default: Date.now },
  status: { type: String, enum: ['requested', 'approved'], default: 'requested' },
});

const FollowSchema: Schema = new Schema({
  following: { type: [FollowStatusSchema], default: [] },
  followers: { type: [FollowStatusSchema], default: [] },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

const Follow = mongoose.model<FollowDocument>('Follow', FollowSchema);

export default Follow;
