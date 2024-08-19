import { Request, Response } from 'express';
import { CompanyUseCase } from '../UseCase/companyUseCase';
import { CompanyRepository } from '../FrameWork/Repository/companyRepo';
import userJWT from '../FrameWork/utilits/userJwt';
import mongoose from 'mongoose';

const companyRepo = new CompanyRepository();
const companyUseCase = new CompanyUseCase(companyRepo);

export async function registerCompanyController(req: Request, res: Response): Promise<void> {
    try {
        console.log('Reached company backend');  
        const { name, number, email, password, address } = req.body;

        const result = await companyUseCase.registerCompany({ name, number, email, password, address });

        if (result.success) {
            const otp = await companyUseCase.createOtp(result.company!._id as mongoose.Types.ObjectId);
            if (otp) {
                const message=`Your code for the OTP verification is ${otp.otp}`
                await companyUseCase.sendEmail('deepakvkn1252@gmail.com', message,'OTP verification');
                res.status(201).json({
                    success: true,
                    message: 'Company registered successfully',
                    data: result.company
                });
            } else {
                res.json({
                    success: false,
                    message: 'Failed to generate OTP'
                });
            }
        } else {
            console.log('Company already exists');
            res.json(result);
        }
    } catch (error) {
        console.error('Error in registerCompanyController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function verifyOtpCompanyController(req: Request, res: Response): Promise<void> {
    const { otp, userId } = req.body;

    try {
        const result = await companyUseCase.verifyOtp(otp, new mongoose.Types.ObjectId(userId));
        console.log(result);
  
        res.json(result);
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'Server error occurred while verifying OTP' });
    }
}

export async function loginCompanyController(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    try {
        const result = await companyUseCase.verifyLogin(email, password);
        if (result.success) {
            const role: string = 'company';
            userJWT({ res, userId: result.company!._id as string, role });
            res.json(result);
        } else {
            res.json(result);
        }
    } catch (error) {
        console.error('Error in loginCompanyController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function resendOtpCompanyController(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;

    try {
        const newOtp = await companyUseCase.createOtp(new mongoose.Types.ObjectId(userId));

        if (newOtp) {
            const user = await companyUseCase.getCompany(new mongoose.Types.ObjectId(userId));

            if (user && user.email) {
                const message=`Your OTP for the verification is ${newOtp.otp}`
                await companyUseCase.sendEmail('deepakvkn1252@gmail.com', message,'Otp Verifictaion');
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
export async function forgetPasswordCompanyController(req: Request, res: Response): Promise<void> {
    try {
        console.log('reched here')
        const { email } = req.body;

        const user = await companyRepo.findCompanyByEmail(email);
        console.log(user)
        if (user) {
            const resetToken = await companyUseCase.generateResetToken(user._id as string);
            const resetLink = `${process.env.FRONTEND_URL}company-passwordreset?token=${resetToken}`;

            const message = `You requested a password reset. Please use the following link to reset your password: ${resetLink}`;

            await companyUseCase.sendEmail('deepakvkn1252@gmail.com', message,'Password reset');

            res.json({ success: true, message: 'Password reset link sent successfully' });
        } else {
            res.json({ success: false, message: 'User does not exist' });
        }
    } catch (error) {
        console.error('Error in forgetPasswordUserController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function resetPasswordCompanyController(req: Request, res: Response): Promise<void> {
    const { password, token } = req.body;

    try {
        const verificationResult = await companyUseCase.verifyToken(token);

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

        const updatedUser = await companyUseCase.updatePassword(objectId, password);

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

export async function blockUserCompanyController(req: Request, res: Response): Promise<void> {
    const{userId}=req.body
    console.log('user is',userId)
    try {
        console.log('reched bolck user')
       
        const result = await companyUseCase.blockCompany(userId); 
        
        res.status(result.success ? 200 : 400).json(result);
        
    } catch (error) {
        console.error('Error in blocking user:', error);
        res.status(500).json({ success: false, message: 'Error in blocking user' });
    }
}