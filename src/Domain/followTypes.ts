import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface Follow  {
  following: ObjectId[];
  followers: ObjectId[];
  userId: ObjectId | null;
}
