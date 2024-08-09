// backend/src/adapters/userController.ts
import { Request, Response } from 'express';
import { registerUser,createOtp,verifyotp,verifylogin,sendEmail,getUser} from '../UseCase/userUseCase'
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import userJWT from '../FrameWork/utilits/userJwt'
export async function registerUserController(req: Request, res: Response): Promise<void> {
    try {
     
        const { name, number, email, password } = req.body;
        console.log(name, number, email, password)

        const result = await registerUser({ name, number, email, password });

        if (result.success) {
            const otp = await createOtp(result.user!._id as mongoose.Schema.Types.ObjectId);

            if (otp) {
                 sendEmail(email, otp.otp);
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: result.user
                });
            }
             else {
                res.json({
                    success: false,
                    message: 'Failed to generate OTP'
                });
            }
        }
         else {
            console.log('user alraedy existt')
            res.json(result);
        }
    } catch (error) {
        console.error('Error in registerUserController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}





export async function verifyotpUserControll(req: Request, res: Response): Promise<void> {
    const { otp, userId } = req.body;

    try {
   
        const result = await verifyotp(otp, userId);
        console.log(result);

  
        res.json(result);
    } catch (error) {
        console.error('Error verifying OTP:', error);

        res.status(500).json({ success: false, message: 'Server error occurred while verifying OTP' });
    }
}



export async function loginUserControll(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    
    try {
        const result = await verifylogin(email, password);
        if(result.success){
            const role:string =  'user';
           
            userJWT({res,userId: result.user?._id as string,role});
            res.json(result);
        }
        else{
            res.json(result)
        }
    
    } catch (error) {
        console.error('Error in loginUserControll:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function resendOtpUsercontroll(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;
   
    try {
        
        const newOtp = await createOtp(userId);
        console.log(newOtp)

        if (newOtp) {
            // Retrieve the user's details
            const user = await getUser(userId);
            
            if (user && user.email) {
                // Send the new OTP via email
                await sendEmail(user.email, newOtp.otp);
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
      console.log('Logged out successfully')
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Error logging out:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

