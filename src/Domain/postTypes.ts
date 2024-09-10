import mongoose, { ObjectId } from 'mongoose';

// Updated Comment interface to include `message` and `time`
export interface Comment {
    userId: mongoose.Types.ObjectId;
    message: string;  // Updated field from `comment` to `message`
    time: Date;
}

export interface Like {
    userId: mongoose.Types.ObjectId;
    time: Date;
}

// Updated Posts interface
export interface Posts {
    userId: ObjectId;
    comments: Comment[];  // Updated Comment structure
    likes: Like[];        // Updated Likes structure
    images: string[];     // Changed from `image` (string | null) to `images` array
    caption: string | null;
    postAt: Date | null;
}
