import { Document, ObjectId } from 'mongoose';

export interface Job  {
  package: number;
  expires: Date ; 
  opening: string; 
  status: string ; 
  applications: number;
  skill: string[] ; 
  experience: string ;
  posted: Date ; 
  description: string ; 
  level: string ; 
  companyId: ObjectId ; 
  title: string ; 
  applicants:ObjectId[]|null;
}
