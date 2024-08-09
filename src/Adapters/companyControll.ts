// backend/src/adapters/companyController.ts
import { Request, Response } from 'express';
import { registerCompany, createOtp, sendEmail,verifyOtp,verifyLogin,getCompany } from '../UseCase/companyUseCase' // Adjust the import paths based on your project structure
import mongoose from 'mongoose';
import userJWT from '../FrameWork/utilits/userJwt'

export async function registerCompanyController(req: Request, res: Response): Promise<void> {
    try {
        console.log('reached comapny back end')  
        const { name, number, email, password, address } = req.body;

        const result = await registerCompany({ name, number, email, password, address });

        if (result.success) {
          
            const otp = await createOtp(result.company!._id as mongoose.Schema.Types.ObjectId);

            if (otp) {
                sendEmail(email, otp.otp);
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


export async function verifyotpCompanyControll(req: Request, res: Response): Promise<void> {
  
    const { otp, userId } = req.body;
    

    try {
   
        const result = await verifyOtp(otp, userId);
        console.log(result);
  
        res.json(result);
    } catch (error) {
        console.error('Error verifying OTP:', error);

        res.status(500).json({ success: false, message: 'Server error occurred while verifying OTP' });
    }
}




export async function loginCompanyControll(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
 
    try {
        const result = await verifyLogin(email, password);
        if(result.success){
            const role:string='company'
            userJWT({res,userId: result.company?._id as string,role});
            res.json(result);
        }
    } catch (error) {
        console.error('Error in loginUserControll:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


export async function resendOtpCompanycontroll(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;
   
    try {
        
        const newOtp = await createOtp(userId);
        console.log(newOtp)

        if (newOtp) {
            // Retrieve the user's details
            const user = await getCompany(userId);
            
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