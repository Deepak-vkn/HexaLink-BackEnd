// backend/src/usecase/companyUseCase.ts
import { createCompany, findCompanyByEmail, saveOtp, findOtpById, deleteOtpById, getCompanyById } from '../FrameWork/Repository/companyRepo';
import Company, { CompanyDocument } from '../FrameWork/Databse/companySchema';
import Otp, { OtpDocument } from '../FrameWork/Databse/otpSchema';

import mongoose from 'mongoose';
import nodemailer from 'nodemailer';



export async function registerCompany(companyData: Partial<CompanyDocument>): Promise<{ success: boolean, message: string, company?: CompanyDocument }> {
    const { email } = companyData;

    if (!email) {
        return { success: false, message: 'Email is required' };
    }

    const existingCompany = await findCompanyByEmail(email);
    if (existingCompany) {
        console.log(existingCompany && existingCompany.is_verified);
        return { success: false, message: 'Company with this email already exists' };
    }

    const company = await createCompany(companyData);

    if (company) {
        return { success: true, message: 'Company registered successfully', company };
    } else {
        return { success: false, message: 'Company registration failed' };
    }
}


export async function createOtp(companyId: mongoose.Schema.Types.ObjectId): Promise<OtpDocument> {
    console.log('reched craete otp')
    const storedOtp = await findOtpById(companyId);
    if (storedOtp) {
        await deleteOtpById(companyId);
    }
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 
    return saveOtp(otp, companyId, expiresAt);
}

function generateOtp(): number {
    return Math.floor(1000 + Math.random() * 9000);
}

export async function verifyOtp(otp: number, companyId: mongoose.Schema.Types.ObjectId): Promise<{ success: boolean, message: string }> {
    try {
        const storedOtp = await findOtpById(companyId);

        if (storedOtp === null) {
            return { success: false, message: 'OTP not found' };
        }

        if (storedOtp === otp) {
            const company = await Company.findById(companyId);

            if (company) {
                company.is_verified = true;
                await company.save();
                return { success: true, message: 'OTP verified successfully' };
            } else {
                return { success: false, message: 'Company not found' };
            }
        } else {
            return { success: false, message: 'Invalid OTP' };
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw new Error('Error verifying OTP');
    }
}

export async function verifyLogin(email: string, password: string): Promise<{ success: boolean, message: string, company?: CompanyDocument }> {
    try {
        const company = await findCompanyByEmail(email);

        if (!company) {
            return { success: false, message: 'Company not found' };
        }

        if (!company.is_verified) {
            const otp = await createOtp(company._id as mongoose.Schema.Types.ObjectId);
            if (otp) {
                await sendEmail(company.email, otp.otp);
                return { success: false, message: 'Company not verified. OTP has been sent.', company: company };
            } else {
                return { success: false, message: 'Failed to generate OTP' };
            }
        }
        if (company.password !== password) {
            return { success: false, message: 'Incorrect password' };
        }

        return { success: true, message: 'Login successful',company };
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

export const sendEmail = async (email: string, otp: number): Promise<boolean> => {
    try {
        console.log('process.env:', process.env.EMAIL_USER, process.env.EMAIL_PASS);
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

export const getCompany = async (companyId: mongoose.Schema.Types.ObjectId): Promise<CompanyDocument> => {
    try {
        const company = await getCompanyById(companyId);
        if (!company) {
            throw new Error('Company not found');
        }
        return company;
    } catch (error) {
        console.error('Error fetching company:', error);
        throw new Error('Error fetching company');
    }
};
