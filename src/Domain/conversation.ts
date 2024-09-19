import mongoose, { Document, ObjectId } from 'mongoose';

export interface Conversation  {
    user1: ObjectId; 
    user2: ObjectId; 
    createdAt: Date;
    lastMessage?:string;
}
