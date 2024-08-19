import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { User } from '../../Domain/userType';

export interface UserDocument extends User, Document {}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  number: { type: Number, required: true },
  password: { type: String, required: true },
  joinedAt: { type: Date, required: true, default: Date.now }, 
  is_verified: { type: Boolean, required: true, default: false },
  is_block: { type: Boolean, required: true, default: false },

  // Optional fields with default values
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job', default: [] }], 
  workStatus: { type: String, default: '' }, 
  about: { type: String, default: '' }, 
  role: { type: String, default: '' }, 
  skill: [{ type: String, default: [] }],
  git: { type: String, default: '' },
  education: {
    degree: { type: String, default: '' },
    institution: { type: String, default: '' },
    year: { type: Number },
  },
  status: { type: Boolean, default: false },
  image: { type: String, default: '' },
});

export default mongoose.model<UserDocument>('User', UserSchema);
