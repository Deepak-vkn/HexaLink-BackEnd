import mongoose, { Schema, Document, ObjectId } from 'mongoose';
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
// Updated Likes Schema with userId and time
const LikeSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    time: { type: Date, default: Date.now },
}, { _id: false });

const PostsSchema: Schema = new Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    comments: [CommentSchema], // Comments array with userId, message, and time
    likes: [LikeSchema], // Likes array with userId and time
    image: { type: String, default: null },
    caption: { type: String, default: null },
    postAt: { type: Date, default: Date.now },
});

const Posts = mongoose.model<PostDocument>('Posts', PostsSchema);

export default Posts;
