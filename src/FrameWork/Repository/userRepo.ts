// backend/src/framework/repository/userRepository.ts
import User, { UserDocument } from '../Databse/userSchema';
import Otp, { OtpDocument } from '../Databse/otpSchema';


import mongoose from 'mongoose';



export async function createUser(userData: Partial<UserDocument>): Promise<UserDocument> {
    return User.create(userData);
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
    return User.findOne({ email }).exec();
}

export async function findUserById(id: string): Promise<UserDocument | null> {
    try {
        return await User.findById(id).exec(); // Use findById to find by user ID
    } catch (error) {
        console.error('Error finding user by ID:', error);
        throw new Error('Error finding user by ID');
    }
}

export async function saveOtp(otp: number,  userId: mongoose.Schema.Types.ObjectId, expiresAt: Date): Promise<OtpDocument> {
    console.log('raecehed save otp') 
    const newOtp = new Otp({
        otp,
        userId,
        expiresAt
    });
    await newOtp.save();
    return newOtp;
}


export async function findOtpById(userId: mongoose.Schema.Types.ObjectId): Promise<Number | null> {
    try {
        // Find OTP by user ID
        const otpRecord = await Otp.findOne({ userId: userId }).exec();
        if (otpRecord) {
            return otpRecord.otp; // Assuming the OTP is stored in a field named 'otp'
        } else {
            return null; // No OTP found for this user ID
        }
    } catch (error) {
        console.error('Error finding OTP:', error);
        throw new Error('Error finding OTP');
    }
}

export async function deleteOtpById(userId: mongoose.Schema.Types.ObjectId):Promise<void>{
    await Otp.deleteOne({userId}).exec()
}




    
export async function getUserById(userId: mongoose.Schema.Types.ObjectId):Promise<UserDocument|null> {
    
    return User.findById(userId).exec()
}