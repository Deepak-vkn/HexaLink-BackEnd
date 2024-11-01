import { Document, ObjectId } from 'mongoose';

export interface Application {
  userId: ObjectId;     
  jobId: ObjectId;        
  name: string;           
  email: string;         
  resume: Buffer;         
  appliedDate: Date;       
  experience: string;      
  status: 'Pending' | 'Reviewed' | 'Rejected' | 'Shortlisted';    
  }