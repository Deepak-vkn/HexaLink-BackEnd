import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { Posts } from '../../Domain/postTypes';
import { User } from '../../Domain/userType';
export interface PostDocument extends Posts, Document {}


const CommentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true }
}, { _id: false }); 


const PostsSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [CommentSchema], 
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }], 
    image: { type: String, default: null },
    caption: { type: String, default: null },
    postAt: { type: Date, default: Date.now },
});

const Posts = mongoose.model<PostDocument>('Posts', PostsSchema);

export default Posts;
