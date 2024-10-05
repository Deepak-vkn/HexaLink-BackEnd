import mongoose, { Document, ObjectId } from 'mongoose';


export interface Message  {
  conversationId: ObjectId;
  receiveTime: Date ; 
  sendTo: ObjectId ;  
  content: string;   
  file: string;  
  sendBy: ObjectId ; 
  sendTime: Date ;    
  status: 'sent' | 'delivered' | 'read'; 
}
