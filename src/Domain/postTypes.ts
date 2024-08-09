import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface Posts  {
  userId: ObjectId ;
  comment: string | null;
  likes: number | null;
  image: string | null;
  caption: string | null;
  postAt: Date | null;
}
