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


  // Optional fields
  jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }], 
  workStatus: { type: String },
  about: { type: String },
  role: { type: String },
  skill: [{ type: String }],
  git: { type: String },
  education: {
    degree: { type: String },
    institution: { type: String },
    year: { type: Number },
  },
  status: { type: Boolean },
  image: { type: String },
});



export default mongoose.model<UserDocument>('User', UserSchema);
