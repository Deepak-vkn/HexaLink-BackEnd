import mongoose from 'mongoose';
import { CompanyDocument } from '../FrameWork/Databse/companySchema';
import { OtpDocument } from '../FrameWork/Databse/otpSchema';
import { ICompanyRepository } from '../FrameWork/Interface/companyInterface';
import Token, { TokenDocument } from '../FrameWork/Databse/tokenSchema';
import Job,{ JobDocument } from '../FrameWork/Databse/jobSchema';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

export class CompanyUseCase {
  private companyRepo: ICompanyRepository;

  constructor(companyRepo: ICompanyRepository) {
    this.companyRepo = companyRepo;
  }

  async registerCompany(companyData: Partial<CompanyDocument>): Promise<{ success: boolean, message: string, company?: CompanyDocument }> {
    const { email } = companyData;

    if (!email) {
      return { success: false, message: 'Email is required' };
    }

    const existingCompany = await this.companyRepo.findCompanyByEmail(email);
    if (existingCompany?.is_verified) {
      return { success: false, message: 'Company with this email already exists' };
    }

    const company = await this.companyRepo.createCompany(companyData);

    if (company) {
      return { success: true, message: 'Company registered successfully', company };
    } else {
      return { success: false, message: 'Company registration failed' };
    }
  }

  async createOtp(companyId: mongoose.Types.ObjectId): Promise<OtpDocument> {
    const storedOtp = await this.companyRepo.findOtpById(companyId);
    if (storedOtp) {
      await this.companyRepo.deleteOtpById(companyId);
    }
    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    return this.companyRepo.saveOtp(otp, companyId, expiresAt);
  }

  private generateOtp(): number {
    return Math.floor(1000 + Math.random() * 9000);
  }

  async verifyOtp(otp: number, companyId:  mongoose.Types.ObjectId): Promise<{ success: boolean, message: string }> {
    try {
      const storedOtp = await this.companyRepo.findOtpById(companyId);

      if (storedOtp === null) {
        return { success: false, message: 'OTP not found' };
      }

      if (storedOtp === otp) {
        const company = await this.companyRepo.findCompanyById(companyId);

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

  async verifyLogin(email: string, password: string): Promise<{ success: boolean, message: string, company?: CompanyDocument }> {
    try {
      const company = await this.companyRepo.findCompanyByEmail(email);

      if (!company) {
        return { success: false, message: 'Company not found' };
      }

      if (!company.is_verified) {
        const otp = await this.createOtp(company._id as mongoose.Types.ObjectId);
        if (otp) {
            const message=`Your otp for the verifiction is ${otp.otp}`
          await this.sendEmail('deepakvkn1252@gmail.com', message,'OTP Verifictaion');
          return { success: false, message: 'Company not verified. OTP has been sent.', company };
        } else {
          return { success: false, message: 'Failed to generate OTP' };
        }
      }
      if(company.is_block){
        return { success: false, message: 'Acess Denied' };
    }


      if (company.password !== password) {
        return { success: false, message: 'Incorrect password' };
      }

      return { success: true, message: 'Login successful', company };
    } catch (error) {
      console.error('Error verifying login:', error);
      throw new Error('Error verifying login');
    }
  }

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  public async sendEmail(email: string, otp: string,subject: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text: otp,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async getCompany(companyId: mongoose.Types.ObjectId): Promise<CompanyDocument> {
    try {
      const company = await this.companyRepo.getCompanyById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }
      return company;
    } catch (error) {
      console.error('Error fetching company:', error);
      throw new Error('Error fetching company');
    }
  }



  public async generateResetToken(userId: string): Promise<string> {
    const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '1hr' });
    const expireAt = new Date();
  expireAt.setHours(expireAt.getHours() + 1);

    await Token.create({ userId, token: resetToken,expireAt });
    return resetToken;
}

  public async verifyToken(token: string): Promise<{ success: boolean, message?: string, tokenRecord?: any } | null> {
    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;

        const tokenRecord = await Token.findOne({ token });

        if (tokenRecord) {
      
            const currentTime = new Date();
            if (tokenRecord.expireAt < currentTime) {
         
                return { success: false, message: 'Link has expired' };
            }

            return { success: true, tokenRecord };
        } else {
   
            return { success: false, message: 'Invalid or expired token' };
        }
    } catch (error) {
 
        if (error instanceof jwt.TokenExpiredError) {
            return { success: false, message: 'Token has expired' };
        } else {
           
            console.error('Error verifying token:', error);
            return { success: false, message: 'Invalid token' };
        }
    }
}

public async updatePassword(userId: mongoose.Types.ObjectId, newPassword: string): Promise<{ success: boolean, message: string }> {
    try {
        const user = await this.companyRepo.findCompanyById(userId);

        if (user) {
            user.password = newPassword; 
            await user.save();
            return { success: true, message: 'Password updated successfully' };
        } else {
            return { success: false, message: 'User not found' };
        }
    } catch (error) {
        console.error('Error updating password:', error);
        return { success: false, message: 'Error updating password' };
    }
}

public async getUser(userId: mongoose.Types.ObjectId): Promise<CompanyDocument | null> {
    return await this.companyRepo.findCompanyById(userId);
}

public async blockCompany(userId: mongoose.Types.ObjectId):Promise<{ success: boolean, message: string,block?:boolean}>{
       
  const user=await this.companyRepo.findCompanyById(userId)

  if(user){
      if(user.is_block){
          user.is_block=false
          user.save()
          return { success: true, message: 'user blocked successfully',block:false};
      }
      else{
          user.is_block=true
          user.save()
          return { success: true, message: 'user blocked successfully',block:true};
      }
      
  }
  else{
      return { success: false, message: 'failed to  block user ' };
  }
}
public async createJobService(jobData: Partial<JobDocument>): Promise<{ success: boolean; message: string; job?: JobDocument }> {
  
  try {
     
      const createdJob = await this.companyRepo.createJobRepository(jobData);
      
      if (!createdJob) {
          return {
              success: false,
              message: 'Failed to create job',
          };
      }

      return {
          success: true,
          message: 'Job created successfully',
          job: createdJob,
      };
  } catch (error) {
      console.error('Error in createJobService:', error);

     
      return {
          success: false,
          message: 'An error occurred while creating the job',
      };
  }
}

public async fetchJobs(companyId: mongoose.Types.ObjectId, sortBy: string): Promise<{ success: boolean; message: string; jobs: JobDocument[] }> {
  try {
      const jobs = await this.companyRepo.fetchJobsRepository(companyId, sortBy);

      if (jobs && jobs.length > 0) {
          return { success: true, message: 'Jobs fetched successfully', jobs };
      } else {
          return { success: false, message: 'No jobs found', jobs: [] };
      }
  } catch (error) {
      console.error('Error fetching jobs:', error);
      return { success: false, message: 'Error fetching jobs', jobs: [] };
  }
}


public async updateJobService(jobId: string, jobData: Partial<JobDocument>): Promise<{ success: boolean; message: string; job?: JobDocument }> {

  
  try {
    
    const updatedJob = await this.companyRepo.updateJobRepository(jobId, jobData);
    if (!updatedJob) {
      return {
        success: false,
        message: 'Failed to update job',
      };
    }
    return {
      success: true,
      message: 'Job updated successfully',
      job: updatedJob,
    };
  } catch (error) {
    console.error('Error in updateJobService:', error);


    return {
      success: false,
      message: 'An error occurred while updating the job',
    };
  }
}

}

