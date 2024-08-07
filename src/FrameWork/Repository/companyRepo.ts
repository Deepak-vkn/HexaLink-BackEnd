// backend/src/framework/repository/companyRepository.ts
import Company, { CompanyDocument } from '../Databse/companySchema'
import Otp, { OtpDocument } from '../Databse/otpSchema'
import mongoose from 'mongoose';

export async function createCompany(companyData: Partial<CompanyDocument>): Promise<CompanyDocument> {
    return Company.create(companyData);
}

export async function findCompanyByEmail(email: string): Promise<CompanyDocument | null> {
    return Company.findOne({ email }).exec();
}

export async function findCompanyById(id: string): Promise<CompanyDocument | null> {
    try {
        return await Company.findById(id).exec(); // Use findById to find by company ID
    } catch (error) {
        console.error('Error finding company by ID:', error);
        throw new Error('Error finding company by ID');
    }
}

export async function saveOtp(otp: number, userId: mongoose.Schema.Types.ObjectId, expiresAt: Date): Promise<OtpDocument> {
    console.log('Reached save otp') 
    const newOtp = new Otp({
        otp,
        userId,
        expiresAt
    });
    await newOtp.save();
    return newOtp;
}

export async function findOtpById(companyId: mongoose.Schema.Types.ObjectId): Promise<number | null> {
    try {
        console.log('reched find by id  otp')
       
        const otpRecord = await Otp.findOne({ userId: companyId }).exec();
        if (otpRecord) {
            return otpRecord.otp;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error finding OTP:', error);
        throw new Error('Error finding OTP');
    }
}

export async function deleteOtpById(userId: mongoose.Schema.Types.ObjectId): Promise<void> {
    await Otp.deleteOne({ userId }).exec();
}

export async function getCompanyById(userId: mongoose.Schema.Types.ObjectId): Promise<CompanyDocument | null> {
    return Company.findById(userId).exec();
}
