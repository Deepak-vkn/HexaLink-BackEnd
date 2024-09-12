// backend/src/domain/interfaces/userRepository.ts
import { UserDocument } from '../Databse/userSchema';
import { OtpDocument } from '../Databse/otpSchema';
import { TokenDocument } from '../Databse/tokenSchema';
import { PostDocument } from '../Databse/postSchema';
import Job,{ JobDocument } from '../Databse/jobSchema';
import Follow,{FollowDocument} from '../Databse/followSchema';
import mongoose from 'mongoose';
import Notification,{NotificationDocument} from '../Databse/notificationSchema';


export interface IUserRepository {
    createUser(userData: Partial<UserDocument>): Promise<UserDocument>;
    findUserByEmail(email: string): Promise<UserDocument | null>;
    findUserById(id:  mongoose.Types.ObjectId): Promise<UserDocument | null>;
    saveOtp(otp: number, userId:  mongoose.Types.ObjectId, expiresAt: Date): Promise<OtpDocument>;
    findOtpById(userId: mongoose.Types.ObjectId): Promise<OtpDocument | null>;
    deleteOtpById(userId:  mongoose.Types.ObjectId): Promise<void>;
    getUserById(userId: mongoose.Types.ObjectId): Promise<UserDocument | null>;
    getTokenById(userId:  mongoose.Types.ObjectId): Promise<TokenDocument | null>;
    createPostRepo(images:string[],caption:string,userId:mongoose.Types.ObjectId):Promise<PostDocument|null>
    getUserPosts(userId:mongoose.Types.ObjectId):Promise<PostDocument[]|null>
    fetchJobsRepository():Promise<JobDocument[]|null>
    createApplication(applicationData: {
        userId: string; 
        jobId: string; 
        name: string; 
        email: string; 
        experience: string; 
        resume: Buffer; 
    }): Promise<{ success: boolean, message: string }> 
    updateApplicationCount(jobId: string): Promise<void>
    searchUsers(query?:string):Promise<UserDocument[]>;
    fetchFollow(userId: mongoose.Types.ObjectId):Promise<any| null>;
    followUser(userId:mongoose.Types.ObjectId,followId:mongoose.Types.ObjectId): Promise<{ success: boolean, message: string,followDoc?:FollowDocument }> 
    fetchNotifications(userId: mongoose.Types.ObjectId): Promise<NotificationDocument[]>
    unfollowUser(userId:mongoose.Types.ObjectId,followId:mongoose.Types.ObjectId): Promise<{ success: boolean, message: string,followDoc?:FollowDocument }> 
    likepost(postId: mongoose.Types.ObjectId,userId:string): Promise<{ success: boolean; message: string ,postDoc?: PostDocument }> 
    updatePost(postId: mongoose.Types.ObjectId,caption:string): Promise<{ success: boolean; message: string, postDoc?: PostDocument }>
    deletePost(postId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string }>
    addComment(postId: mongoose.Types.ObjectId,userId:string,comment:string): Promise<{ success: boolean; message: string, postDoc?: PostDocument }>
    fetchPostsByUserIds(userIds: mongoose.Types.ObjectId[]): Promise<PostDocument[]>
    fetchSuggestions(userIds: mongoose.Types.ObjectId):Promise<UserDocument[]>;
    deleteComment(postId: mongoose.Types.ObjectId,commentIndex:number): Promise<{success: boolean; message: string; populatedPost?:any}>
}
