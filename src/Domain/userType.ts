import { Document, ObjectId } from 'mongoose';

export interface User  {
 
  name: string; 
  email: string;
  number: number; 
  password: string; 
  joinedAt: Date; 
  is_verified: boolean;
  is_block: boolean;

  // Optional fields
  jobs?: ObjectId[];
  workStatus?: string; 
  about?: string; 
  role?: string; 
  skill?: string[]; 
  git?: string; 
  education?: { 
    degree?: string;
    institution?: string;
    year?: number;
  };
  status?: boolean; 
  image?: string; 
}
