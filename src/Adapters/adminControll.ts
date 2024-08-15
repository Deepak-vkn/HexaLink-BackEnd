import { Request, Response } from 'express';
import { AdminRepository } from '../FrameWork/Repository/adminRepo'; // Correct import
import AdminUseCase from '../UseCase/adminUseCase';
import userJWT from '../FrameWork/utilits/userJwt';
// Instantiate the repository and use case
const adminRepo = new AdminRepository();
const adminUseCase = new AdminUseCase(adminRepo);

// Example function where you need to use findAdminByEmail
export async function loginAdminControll(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    console.log('Reached admin login backend');
    try {
        // Use the method from the adminRepo instance
        const result = await adminUseCase.verifyLogin(email, password);
        if (result.success) {
            const role: string = 'admin';
            userJWT({ res, userId: result.admin?._id as string, role });
        }
        res.json(result);
    } catch (error) {
        console.error('Error in loginAdminControll:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function fetchUserAdminControll(req:Request,res:Response):Promise<void>{
    console.log('raeched backend')
    try {
        const users=await adminUseCase.fetchUsersAdminCase()
        res.status(200).json({
            success: true,
            data: users,
        });
        
    } catch (error) {
        console.error('Error fetching users',error)
        res.status(500).json({success:false,message:'Failed to load users'})
    }
}

export async function fetchCompanyAdminControll(req:Request,res:Response):Promise<void>{
    console.log('raeched backend')
    try {
        const users=await adminUseCase.fetchCompanyAdminCase()
        res.status(200).json({
            success: true,
            data: users,
        });
        
    } catch (error) {
        console.error('Error fetching company',error)
        res.status(500).json({success:false,message:'Failed to load users'})
    }
}

