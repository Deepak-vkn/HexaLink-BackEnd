import { Document, ObjectId } from 'mongoose';

export interface Application {
  jobId: ObjectId;        
  name: string;           
  email: string;         
  resume: Buffer;         
  appliedDate: Date;       
  experience: string;      
  status: 'Pending' | 'Reviewed' | 'Rejected' | 'Shortlisted';    
  }