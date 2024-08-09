import mongoose, { Schema, Document, ObjectId } from 'mongoose';
import { Posts } from '../../Domain/postTypes';


export interface PostDocument extends Posts, Document {}

const PostsSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  comment: { type: String, default: '' },
  likes: { type: Number, default: 0 },
  image: { type: String, default: '' },
  caption: { type: String, default: '' },
  postAt: { type: Date, default: Date.now },
});

const Posts = mongoose.model<PostDocument>('Posts', PostsSchema);

export default Posts;
