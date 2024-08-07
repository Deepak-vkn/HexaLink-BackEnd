// backend/src/adapters/companyController.ts
import { Request, Response } from 'express';
import { registerCompany, createOtp, sendEmail } from '../useCase/companyUseCase'; // Adjust the import paths based on your project structure
import mongoose from 'mongoose';

export async function registerCompanyController(req: Request, res: Response): Promise<void> {
    try {
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
