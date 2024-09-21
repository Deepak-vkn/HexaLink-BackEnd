import mongoose, { Schema, Document } from 'mongoose';
import { Posts } from '../../Domain/postTypes';
import { User } from '../../Domain/userType';

export interface PostDocument extends Posts, Document {}

// Updated Comment Schema with message, userId, and time
const CommentSchema = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    time: { type: Date, default: Date.now } // Added time field
}, { _id: false });

// Updated Likes Schema with userId and time
const LikeSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    time: { type: Date, default: Date.now },
}, { _id: false });

const PostsSchema: Schema = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    comments: [CommentSchema],
    likes: [LikeSchema],
    images: { type: [String], default: [] }, 
    caption: { type: String, default: null },
    postAt: { type: Date, default: Date.now },
});

const Posts = mongoose.model<PostDocument>('Posts', PostsSchema);

export default Posts;
