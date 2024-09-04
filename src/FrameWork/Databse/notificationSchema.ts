import mongoose, { Document, Schema } from 'mongoose';
import { Notification } from '../../Domain/notificationTypes';

// Define the NotificationDocument interface extending Mongoose's Document and your custom Notification type
export interface NotificationDocument extends Notification, Document {}

// Define the schema for the Notification model
const NotificationSchema = new Schema<NotificationDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  sourceId: { type: Schema.Types.ObjectId, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  redirectUrl: { type: String },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' }
});
const Notification = mongoose.model<NotificationDocument>('Notification', NotificationSchema);

export default Notification;

