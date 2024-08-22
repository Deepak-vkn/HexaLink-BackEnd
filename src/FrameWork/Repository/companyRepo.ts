import mongoose from 'mongoose';
import Company, { CompanyDocument } from '../Databse/companySchema';
import Otp, { OtpDocument } from '../Databse/otpSchema';
import { ICompanyRepository } from '../Interface/companyInterface'; // Assuming you have this interface in the same directory
import Job,{ JobDocument } from '../Databse/jobSchema';

export class CompanyRepository implements ICompanyRepository {
    
    async createCompany(companyData: Partial<CompanyDocument>): Promise<CompanyDocument> {
        return Company.create(companyData);
    }

    async findCompanyByEmail(email: string): Promise<CompanyDocument | null> {
        return Company.findOne({ email }).exec();
    }

    async findCompanyById(id:  mongoose.Types.ObjectId): Promise<CompanyDocument | null> {
        try {
            return await Company.findById(id).exec();
        } catch (error) {
            console.error('Error finding company by ID:', error);
            throw new Error('Error finding company by ID');
        }
    }

    async saveOtp(otp: number, userId:  mongoose.Types.ObjectId, expiresAt: Date): Promise<OtpDocument> {
        console.log('Reached save otp');
        const newOtp = new Otp({
            otp,
            userId,
            expiresAt,
        });
        await newOtp.save();
        return newOtp;
    }

    async findOtpById(companyId:  mongoose.Types.ObjectId): Promise<number | null> {
        try {
            console.log('Reached find by id otp');
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

    async deleteOtpById(userId:  mongoose.Types.ObjectId): Promise<void> {
        await Otp.deleteOne({ userId }).exec();
    }

    async getCompanyById(userId:  mongoose.Types.ObjectId): Promise<CompanyDocument | null> {
        return Company.findById(userId).exec();
    }
    async  createJobRepository(jobData: Partial<JobDocument>): Promise<JobDocument | null> {
        try {

            const newJob = new Job(jobData);

            const savedJob = await newJob.save();
            return savedJob;
        } catch (error) {
            console.error('Error in createJobRepository:', error);
            return null;
        }
    }
    fetchJobsRepository(companyId: mongoose.Types.ObjectId): Promise<JobDocument[] | null> {
        return Job.find({ companyId }).exec(); 
    }
    
}
