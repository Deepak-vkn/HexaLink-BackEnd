

// backend/src/usecase/AdminUseCase.ts
import { findAdminByEmail } from '../FrameWork/Repository/adminRepo';
import Admin, { AdminDocument } from '../FrameWork/Databse/adminSchema';


import mongoose from 'mongoose';
import nodemailer from 'nodemailer';


export async function verifyLogin(email: string, password: string): Promise<{ success: boolean, message: string,admin?: AdminDocument }> {
    try {
        const admin = await findAdminByEmail(email);

        if (!admin) {
            return { success: false, message: 'Admin not found' };
        }

        
        if (admin.password !== password) {
            return { success: false, message: 'Incorrect password' };
        }

        return { success: true, message: 'Login successful',admin };
    } catch (error) {
        console.error('Error verifying login:', error);
        throw new Error('Error verifying login');
    }
}
