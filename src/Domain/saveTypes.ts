import { Document, ObjectId } from 'mongoose';

export interface Save extends Document {
  userId: ObjectId;       
  targetId: ObjectId;       
  type: 'Post' | 'Job';     
  savedDate: Date;         
}
