import mongoose from 'mongoose';
import { CompanyDocument } from '../Databse/companySchema';
import { OtpDocument } from '../Databse/otpSchema';
import Job,{ JobDocument } from '../Databse/jobSchema';
import Application,{ ApplicationDocument } from '../Databse/applicationSchema';
export interface ICompanyRepository {
    createCompany(companyData: Partial<CompanyDocument>): Promise<CompanyDocument>;
    findCompanyByEmail(email: string): Promise<CompanyDocument | null>;
    findCompanyById(id: mongoose.Types.ObjectId): Promise<CompanyDocument | null>;
    saveOtp(otp: number, userId:  mongoose.Types.ObjectId, expiresAt: Date): Promise<OtpDocument>;
    findOtpById(companyId:  mongoose.Types.ObjectId): Promise<number | null>;
    deleteOtpById(userId:  mongoose.Types.ObjectId): Promise<void>;
    getCompanyById(userId:  mongoose.Types.ObjectId): Promise<CompanyDocument | null>;
    createJobRepository(jobData: Partial<JobDocument>): Promise<JobDocument | null>;
    fetchJobsRepository(companyId:mongoose.Types.ObjectId,sortBy: string):Promise<JobDocument[]|null>
    updateJobRepository(jobId: string, jobData: Partial<JobDocument>): Promise<JobDocument | null>;
    fetchCompanyApplications(companyId: mongoose.Types.ObjectId): Promise<ApplicationDocument[]>;
    updateApplicationStatus(applicationId: mongoose.Types.ObjectId, status:string): Promise<{ success: boolean; message: string;  }>

}
