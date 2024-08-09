import mongoose, { Schema, Document, ObjectId } from 'mongoose';

import { Message } from '../../Domain/messageTypes';


export interface MessageDocument extends Message, Document {}

// Mongoose Schema
const MessageSchema: Schema = new Schema({
  receiveTime: { type: Date, default: Date.now }, 
  sendTo: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  content: { type: String, required: true }, 
  sendBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }, 
  sendTime: { type: Date, default: Date.now }, 
});


const Message = mongoose.model<MessageDocument>('Message', MessageSchema);

export default Message;
