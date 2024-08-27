import { Document, ObjectId } from 'mongoose';



export interface Education {
  degree?: string;
  institution?: string;
  year?: number;
}

export interface User  {
 
  name: string; 
  email: string;
  number: number; 
  password: string; 
  joinedAt: Date; 
  is_verified: boolean;
  is_block: boolean;

  jobs?: ObjectId[];
  workStatus?: string; 
  about?: string; 
  role?: string; 
  skill?: string[]; 
  git?: string; 
  education?:Education[];
  status?: boolean; 
  image?: string; 
}
