import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { verifyLogin } from '../UseCase/adminUseCase'
import userJWT from '../FrameWork/utilits/userJwt'


export async function loginAdminControll(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    console.log('raeched company login backend')
    try {
        const result = await verifyLogin(email, password);
        if(result.success){
            const role:string='admin'
            userJWT({res,userId: result.admin?._id as string,role});
        }
        res.json(result);
    } catch (error) {
        console.error('Error in loginUserControll:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}