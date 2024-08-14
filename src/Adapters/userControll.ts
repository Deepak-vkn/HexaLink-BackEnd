import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserUseCase } from '../UseCase/userUseCase';
import { IUserRepository } from '../FrameWork/Interface/userInterface';
import { UserRepository } from '../FrameWork/Repository/userRepo';
import generateToken  from '../FrameWork/utilits/userJwt';

// Initialize UserRepository and UserUseCase
const userRepository: IUserRepository = new UserRepository();
const userUseCase = new UserUseCase(userRepository);

// Controller functions

export async function registerUserController(req: Request, res: Response): Promise<void> {
    try {
        const { name, number, email, password } = req.body;

        const result = await userUseCase.registerUser({ name, number, email, password });

        if (result.success) {
            const otp = await userUseCase.createOtp(result.user!._id as mongoose.Types.ObjectId);

            if (otp) {
                const message=`Your Otp for the account verification is ${otp.otp}`
                await userUseCase.sendEmail('deepakvkn1252@gmail.com', message,'Otp Verifictaion');
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: result.user
                });
            } else {
                res.json({
                    success: false,
                    message: 'Failed to generate OTP'
                });
            }
        } else {
            res.json(result);
        }
    } catch (error) {
        console.error('Error in registerUserController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function verifyOtpUserController(req: Request, res: Response): Promise<void> {
    const { otp, userId } = req.body;

    try {
        // Convert userId to ObjectId
        const userIdObjectId = new mongoose.Types.ObjectId(userId);
        const result = await userUseCase.verifyOtp(otp, userIdObjectId);
        res.json(result);
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'Server error occurred while verifying OTP' });
    }
}

export async function loginUserController(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    
    try {
        const result = await userUseCase.verifyLogin(email, password);
        if (result.success) {
            const role: string = 'user';
            generateToken({ res, userId: result.user?._id as string, role });
            res.json(result);
        } else {
            res.json(result);
        }
    } catch (error) {
        console.error('Error in loginUserController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function resendOtpUserController(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;
   
    try {
        const newOtp = await userUseCase.createOtp(userId);

        if (newOtp) {
            const user = await userUseCase.getUser(userId);
            
            if (user && user.email) {
                const message=`Your otp for the verifitction is ${newOtp.otp} `
                await userUseCase.sendEmail('deepakvkn1252@gmail.com',message,'OTP verification' );
                res.json({ success: true, message: 'OTP resent successfully' });
            } else {
                res.status(404).json({ success: false, message: 'User not found' });
            }
        } else {
            res.status(500).json({ success: false, message: 'Failed to generate OTP' });
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function logout(req: Request, res: Response): Promise<void> {
    try {
        const { role } = req.body;

        res.clearCookie(role, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


export async function forgetPasswordUserController(req: Request, res: Response): Promise<void> {
    try {
        console.log('reched here')
        const { email } = req.body;

        const user = await userRepository.findUserByEmail(email);
      
        if (user) {
            const resetToken = await userUseCase.generateResetToken(user._id as string);
            const resetLink = `${process.env.FRONTEND_URL}resetpassword?token=${resetToken}`;

            const message = `You requested a password reset. Please use the following link to reset your password: ${resetLink}`;

            await userUseCase.sendEmail('deepakvkn1252@gmail.com', message,'Password reset');

            res.json({ success: true, message: 'Password reset link sent successfully' });
        } else {
            res.json({ success: false, message: 'User does not exist' });
        }
    } catch (error) {
        console.error('Error in forgetPasswordUserController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function resetPasswordUserController(req: Request, res: Response): Promise<void> {
    const { password, token } = req.body;

    try {
        const verificationResult = await userUseCase.verifyToken(token);

        if (verificationResult === null || !verificationResult.success) {
            res.json({ success: false, message: verificationResult?.message || 'Invalid token' });
            return;
        }

        const userId = verificationResult.tokenRecord?.userId;
        if (!userId) {
            res.json({ success: false, message: 'Invalid token payload' });
            return;
        }
        const objectId = new mongoose.Types.ObjectId(userId);

        const updatedUser = await userUseCase.updatePassword(objectId, password);

        if (updatedUser.success) {
            res.json({ success: true, message: 'Password reset successfully' });
        } else {
            res.json({ success: false, message: updatedUser.message });
        }
    } catch (error) {
        console.error('Failed to reset password:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
}

export async function fetchtimerUserController(req: Request, res: Response): Promise<void> {
    const { userid } = req.body;

    try {
        const result = await userUseCase.getOtpTimeLeft(userid);

        if (result.success) {
            res.json({ success: true, timeLeft: result.timeLeft });
        } else {
            res.status(404).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error in fetchtimerUserController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}