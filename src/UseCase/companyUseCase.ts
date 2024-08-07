// backend/src/framework/database/companyController.ts
import mongoose from 'mongoose';
import Company, { CompanyDocument } from './companySchema';
import Otp, { OtpDocument } from './otpSchema';
import { sendEmail } from '../utils/sendEmail'; // Import your email sending function

export async function registerCompany(companyData: Partial<CompanyDocument>): Promise<{ success: boolean, message: string, company?: CompanyDocument }> {
    const { email } = companyData;

    if (!email) {
        return { success: false, message: 'Email is required' };
    }

    const existingCompany = await findCompanyByEmail(email);
    if (existingCompany) {
        return { success: false, message: 'Company with this email already exists' };
    }

    const company = await createCompany(companyData);

    if (company) {
        return { success: true, message: 'Company registered successfully', company };
    } else {
        return { success: false, message: 'Company registration failed' };
    }
}
