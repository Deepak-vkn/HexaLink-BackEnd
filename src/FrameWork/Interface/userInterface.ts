// backend/src/domain/interfaces/userRepository.ts
import { UserDocument } from '../Databse/userSchema';
import { OtpDocument } from '../Databse/otpSchema';
import { TokenDocument } from '../Databse/tokenSchema';
import { PostDocument } from '../Databse/postSchema';
import Job,{ JobDocument } from '../Databse/jobSchema';
import mongoose from 'mongoose';

export interface IUserRepository {
    createUser(userData: Partial<UserDocument>): Promise<UserDocument>;
    findUserByEmail(email: string): Promise<UserDocument | null>;
    findUserById(id:  mongoose.Types.ObjectId): Promise<UserDocument | null>;
    saveOtp(otp: number, userId:  mongoose.Types.ObjectId, expiresAt: Date): Promise<OtpDocument>;
    findOtpById(userId: mongoose.Types.ObjectId): Promise<OtpDocument | null>;
    deleteOtpById(userId:  mongoose.Types.ObjectId): Promise<void>;
    getUserById(userId: mongoose.Types.ObjectId): Promise<UserDocument | null>;
    getTokenById(userId:  mongoose.Types.ObjectId): Promise<TokenDocument | null>;
    createPostRepo(file:string,caption:string,userId:mongoose.Types.ObjectId):Promise<PostDocument|null>
    getUserPosts(userId:mongoose.Types.ObjectId):Promise<PostDocument[]|null>
    fetchJobsRepository():Promise<JobDocument[]|null>
}
