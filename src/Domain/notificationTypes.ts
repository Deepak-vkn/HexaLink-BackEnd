import { Document, Schema, Types } from 'mongoose';

export interface Notification extends Document {
  userId: Types.ObjectId;
  type: string;
  message: string;
  sourceId: Types.ObjectId;
  postId:  Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  redirectUrl?: string;
  status: 'pending' | 'sent' | 'failed';
}
