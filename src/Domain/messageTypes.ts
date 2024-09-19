import mongoose, { Document, ObjectId } from 'mongoose';

// TypeScript Interface
export interface Message  {
  conversationId: ObjectId;
  receiveTime: Date ; 
  sendTo: ObjectId ;  
  content: string;   
  sendBy: ObjectId ; 
  sendTime: Date ;    
  status: 'sent' | 'delivered' | 'read'; 
}
