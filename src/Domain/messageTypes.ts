import mongoose, { Document, ObjectId } from 'mongoose';

// TypeScript Interface
export interface Message  {
  receiveTime: Date ; 
  sendTo: ObjectId ;  
  content: string;   
  sendBy: ObjectId ; 
  sendTime: Date ;    
}
