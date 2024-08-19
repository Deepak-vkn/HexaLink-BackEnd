import mongoose, { ObjectId } from 'mongoose';

export interface Comment {
    userId: ObjectId;
    comment: string;
}

export interface Posts {
    userId: ObjectId;
    comments: Comment[];
    likes: string[]; 
    image: string | null;
    caption: string | null;
    postAt: Date | null;
}
