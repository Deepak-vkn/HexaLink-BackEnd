import User, { UserDocument } from '../Databse/userSchema';
import Otp, { OtpDocument } from '../Databse/otpSchema';
import Token, { TokenDocument } from '../Databse/tokenSchema'; // Ensure this import is correct
import { IUserRepository } from '../Interface/userInterface'; // Ensure correct path
import mongoose from 'mongoose';
import Post, { PostDocument } from '../Databse/postSchema';
import Job,{ JobDocument } from '../Databse/jobSchema';

export class UserRepository implements IUserRepository {
    async createUser(userData: Partial<UserDocument>): Promise<UserDocument> {
        return User.create(userData);
    }

    async findUserByEmail(email: string): Promise<UserDocument | null> {
        return User.findOne({ email }).exec();
    }

    async findUserById(id:  mongoose.Types.ObjectId): Promise<UserDocument | null> {
        try {
            return await User.findById(id).exec();
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw new Error('Error finding user by ID');
        }
    }

    async saveOtp(otp: number, userId:  mongoose.Types.ObjectId, expiresAt: Date): Promise<OtpDocument> {
        console.log('Reached save otp');
        const newOtp = new Otp({ otp, userId, expiresAt });
        await newOtp.save();
        return newOtp;
    }

    async findOtpById(userId: mongoose.Types.ObjectId): Promise<OtpDocument | null> {
        try {
            return await Otp.findOne({ userId }).exec();
        } catch (error) {
            console.error('Error finding OTP:', error);
            throw new Error('Error finding OTP');
        }
    }

    async deleteOtpById(userId:  mongoose.Types.ObjectId): Promise<void> {
        await Otp.deleteOne({ userId }).exec();
    }

    async getUserById(userId: mongoose.Types.ObjectId): Promise<UserDocument | null> {
 
        return User.findById(userId).exec();
    }

    async getTokenById(userId:  mongoose.Types.ObjectId): Promise<TokenDocument | null> {
        try {
            return await Token.findOne({ userId }).exec();
        } catch (error) {
            console.error('Error fetching token by userId:', error);
            return null;
        }
    }

    async createPostRepo(image: string, caption: string, userId: mongoose.Types.ObjectId): Promise<PostDocument| null> {
        try {
            console.log('are hed repo')
            const post = new Post({ image, caption, userId });
            const savedPost = await post.save();
            return savedPost;
        } catch (error) {
            console.error('Error creating post:', error);
            return null;
        }
    }
    async getUserPosts(userId: mongoose.Types.ObjectId): Promise<PostDocument[] | null> {
        try {
            return await Post.find({ userId }).exec();
        } catch (error) {
            console.error('Error fetching token by userId:', error);
            return null;
        }
    }
    fetchJobsRepository(): Promise<JobDocument[] | null> {
        console.log('reched repo')
            return Job.find().exec(); 
    }
    
}
