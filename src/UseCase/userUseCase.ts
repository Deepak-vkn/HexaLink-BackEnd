// backend/src/usecase/userUseCase.ts
import { createUser, findUserByEmail,saveOtp,findOtpById,deleteOtpById ,getUserById } from '../FrameWork/Repository/\/userRepo';
import User,{ UserDocument } from '../FrameWork/Databse/userSchema';
import Otp, { OtpDocument } from '../FrameWork/Databse/otpSchema';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';





export async function registerUser(userData: Partial<UserDocument>): Promise<{ success: boolean, message: string, user?: UserDocument }> {
    const { email } = userData;

   
    if (!email) {
        return { success: false, message: 'Email is required' };
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
       console.log(existingUser&&existingUser.is_verified)
               
            return { success: false, message: 'User with this email already exists ' };
        
    }


    const user = await createUser(userData)

    if (user) {
        return { success: true, message: 'User registered successfully', user };
    } else {
        return { success: false, message: 'User registration failed' };
    }
}



export async function createOtp(userId: mongoose.Schema.Types.ObjectId): Promise<OtpDocument> {

   const storedOtp = await findOtpById(userId)
   if(storedOtp){
    await deleteOtpById(userId);
   }
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 
    return saveOtp(otp, userId, expiresAt)
}


function generateOtp(): number {
    return Math.floor(1000 + Math.random() * 9000);
}



export async function verifyotp(otp: number, userId: mongoose.Schema.Types.ObjectId): Promise<{ success: boolean, message: string }> {
    try {
       
        const storedOtp = await findOtpById(userId);
        
        if (storedOtp === null) {
            return { success: false, message: 'OTP not found' };
        }

    
        if (storedOtp === otp) {
 
            const user = await User.findById(userId);

            if (user) {
                user.is_verified = true; 
                await user.save();
                return { success: true, message: 'OTP verified successfully' };
            } else {
                console.log('reched sdhgasgdhgashg')
                return { success: false, message: 'User not found' };
            }
        } else {
            return { success: false, message: 'Invalid OTP' };
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new Error('Error verifying OTP');
    }
}


export async function verifylogin(email: string, password: string): Promise<{ success: boolean; message: string,user?:UserDocument }> {
    try {
        // Find the user by email
        const user = await findUserByEmail(email);
        
        if (!user) {
            
            // No user found with the given email
            return { success: false, message: 'User not found' };
        }

        if (!user.is_verified) {
            
            const otp = await createOtp(user._id as mongoose.Schema.Types.ObjectId);
            if (otp) {
                 sendEmail(user.email, otp.otp);
                return { success: false, message: 'User not verified. OTP has been sent.',user:user};
            } else {
                return { success: false, message: 'Failed to generate OTP' };
            }
        }
        if (user.password !== password) {
            return { success: false, message: 'Incorrect password' };
        }

        
        return { success: true, message: 'Login successful' };
    } catch (error) {
        console.error('Error verifying login:', error);
        throw new Error('Error verifying login');
    }
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send email
export const sendEmail = async (email: string, otp: number): Promise<boolean> => {
    try {
        console.log('process.env:',  process.env.EMAIL_USER, process.env.EMAIL_PASS)
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'deepakvkn1252@gmail.com',
            subject: 'OTP for verification',

            
            text: `Your OTP is ${otp}`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};


export const getUser = async (userId: mongoose.Schema.Types.ObjectId): Promise<UserDocument> => {
    try {
        const user = await getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Error fetching user');
    }
};