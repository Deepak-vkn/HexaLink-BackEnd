import mongoose, { ObjectId } from 'mongoose';

// Updated Comment interface to include `message` and `time`
export interface Comment {
    userId: ObjectId;
    message: string;  // Updated field from `comment` to `message`
    time: Date;
}

export interface Like {
    userId: ObjectId;
    time: Date;
}

// Updated Posts interface
export interface Posts {
    userId: ObjectId;
    comments: Comment[];  // Updated Comment structure
    likes: Like[];        // Updated Likes structure
    image: string | null;
    caption: string | null;
    postAt: Date | null;
}
