import mongoose from 'mongoose';
import { CompanyDocument } from '../Databse/companySchema';
import { OtpDocument } from '../Databse/otpSchema';

export interface ICompanyRepository {
    createCompany(companyData: Partial<CompanyDocument>): Promise<CompanyDocument>;
    findCompanyByEmail(email: string): Promise<CompanyDocument | null>;
    findCompanyById(id: mongoose.Types.ObjectId): Promise<CompanyDocument | null>;
    saveOtp(otp: number, userId:  mongoose.Types.ObjectId, expiresAt: Date): Promise<OtpDocument>;
    findOtpById(companyId:  mongoose.Types.ObjectId): Promise<number | null>;
    deleteOtpById(userId:  mongoose.Types.ObjectId): Promise<void>;
    getCompanyById(userId:  mongoose.Types.ObjectId): Promise<CompanyDocument | null>;
}
