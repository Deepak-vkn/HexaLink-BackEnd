import mongoose, { Document, ObjectId, Schema } from 'mongoose';
import { Conversation } from '../../Domain/conversation'; 


export interface ConversationDocument extends Conversation, Document {}

const ConversationSchema: Schema = new Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', 
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastMessage: {
    type: String, 
    default: '', 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now },
});


export default mongoose.model<ConversationDocument>('Conversation', ConversationSchema);
