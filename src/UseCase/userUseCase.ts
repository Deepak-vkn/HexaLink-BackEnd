import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../FrameWork/Interface/userInterface';
import User, { UserDocument } from '../FrameWork/Databse/userSchema';
import Otp, { OtpDocument } from '../FrameWork/Databse/otpSchema';
import Token, { TokenDocument } from '../FrameWork/Databse/tokenSchema';
import { forgetPasswordCompanyController } from '../Adapters/companyControll';
import { UserRepository } from '../FrameWork/Repository/userRepo';
import uploadCloudinary from '../FrameWork/utilits/cloudinaray';
import { PostDocument } from '../FrameWork/Databse/postSchema';
import Job,{ JobDocument } from '../FrameWork/Databse/jobSchema';
export class UserUseCase {
    private userRepository: IUserRepository;
    private transporter: nodemailer.Transporter;

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository;

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    public async registerUser(userData: Partial<UserDocument>): Promise<{ success: boolean, message: string, user?: UserDocument }> {
        const { email } = userData;

        if (!email) {
            return { success: false, message: 'Email is required' };
        }

        const existingUser = await this.userRepository.findUserByEmail(email);
        if (existingUser?.is_verified) {
            return { success: false, message: 'User with this email already exists' };
        }

        const user = await this.userRepository.createUser(userData);

        if (user) {
            return { success: true, message: 'User registered successfully', user };
        } else {
            return { success: false, message: 'User registration failed' };
        }
    }

    public async createOtp(userId: mongoose.Types.ObjectId): Promise<OtpDocument> {
        const storedOtp = await this.userRepository.findOtpById(userId);
        if (storedOtp) {
            await this.userRepository.deleteOtpById(userId);
        }

        const otp = this.generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
        return this.userRepository.saveOtp(otp, userId, expiresAt);
    }

    private generateOtp(): number {
        return Math.floor(1000 + Math.random() * 9000);
    }


    public async verifyOtp(otp: number, userId: mongoose.Types.ObjectId): Promise<{ success: boolean, message: string }> {
        try {
            const otpRecord = await this.userRepository.findOtpById(userId);
    
            if (!otpRecord) {
                return { success: false, message: 'OTP not found' };
            }
    
            if (otpRecord.otp === otp) {
                const user = await this.userRepository.findUserById(userId);
    
                if (user) {
                    user.is_verified = true;
                    await user.save();
                    return { success: true, message: 'OTP verified successfully' };
                } else {
                    return { success: false, message: 'User not found' };
                }
            } else {
                return { success: false, message: 'Invalid OTP' };
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return { success: false, message: 'Error verifying OTP' };
        }
    }

    public async sendEmail(to: string,content: string ,subject:string='No subject'): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text: content,
        };

        await this.transporter.sendMail(mailOptions);
    }


   public async verifyLogin(email: string, password: string): Promise<{ success: boolean, message: string, user?: UserDocument }> {
    try {
        const user = await this.userRepository.findUserByEmail(email);

        if (!user) {
            return { success: false, message: 'User not found' };
        }
        if(!user.is_verified){
            const otp = await this.createOtp(user._id as mongoose.Types.ObjectId);
            if (otp) {
                const message=`Your otp for the verifiction is ${otp.otp}`
              await this.sendEmail('deepakvkn1252@gmail.com', message,'OTP Verifictaion');
              return { success: false, message: 'User not verified. OTP has been sent.', user };
            } else {
              return { success: false, message: 'Failed to generate OTP' };
            }

        }
        if(user.is_block){
            return { success: false, message: 'Acess Denied' };
        }

    
        const isPasswordValid = user.password === password;

        if (!isPasswordValid) {
            return { success: false, message: 'Invalid password' };
        }

        return { success: true, message: 'Login successful', user };
    } catch (error) {
        console.error('Error in verifyLogin:', error);
        return { success: false, message: 'Internal server error' };
    }
}

    public async generateResetToken(userId: string): Promise<string> {
        const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '30s' });
        const expireAt = new Date();
      expireAt.setHours(expireAt.getHours() + 30);

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
            const user = await this.userRepository.findUserById(userId);

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

    public async getUser(userId: mongoose.Types.ObjectId): Promise<UserDocument | null> {
        return await this.userRepository.findUserById(userId);
    }
    public async getOtpTimeLeft(userId: mongoose.Types.ObjectId): Promise<{ success: boolean, timeLeft?: number, message?: string }> {
        try {
            
            const otp = await Otp.findOne({ userId }).exec();

            if (!otp) {
                return { success: false, message: 'OTP not found' };
            }


            const currentTime = new Date();
            const expiresAt = otp.expiresAt; 
            const timeLeft = Math.max(0, Math.floor((expiresAt.getTime() - currentTime.getTime()) / 1000)); 

            return { success: true, timeLeft };
        } catch (error) {
            console.error('Error fetching OTP:', error);
            return { success: false, message: 'An error occurred while fetching OTP' };
        }
    }
    public async blockUser(userId: mongoose.Types.ObjectId):Promise<{ success: boolean, message: string,block?:boolean}>{
       
        const user=await this.userRepository.getUserById(userId)
    
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
    public async updateUser(updateData: any): Promise<{ success: boolean, message: string, user?: UserDocument }> {
        console.log('Update data is', updateData);
        try {
            const existingUser = await this.userRepository.getUserById(updateData.userId);
    
            if (!existingUser) {
                return { success: false, message: 'User not found' };
            }
    
            if (updateData.user.image) {
                const imageUrl = await uploadCloudinary(updateData.user.image);
                updateData.user.image = imageUrl;
            }
    
            for (const key in updateData.user) {
                if (updateData.user.hasOwnProperty(key)) {
                    if (key === 'education' && updateData.user[key]) {
                        if (Array.isArray(updateData.user[key])) {
                            existingUser.education = [
                                ...(existingUser.education || []),
                                ...updateData.user[key]
                            ];
                        } else {
                            existingUser.education = [
                                ...(existingUser.education || []),
                                updateData.user[key]
                            ];
                        }
                    } else if (key === 'skills' && Array.isArray(updateData.user[key])) {
                        // Merge new skills with existing ones
                        const updatedSkills = new Set([
                            ...(existingUser.skill || []),
                            ...updateData.user[key]
                        ]);
                        existingUser.skill = Array.from(updatedSkills);
                    } else if (key !== 'education' && key !== 'skills') {
                        (existingUser as any)[key] = updateData.user[key];
                    }
                }
            }
    
            await existingUser.save();
            return { success: true, message: 'User updated successfully', user: existingUser };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, message: 'Error updating user' };
        }
    }
    
    
    

    public async createPost(file: string, caption: string, userId: mongoose.Types.ObjectId):Promise<{ success: boolean, message: string,block?:boolean}> {
      console.log('raeched usecse',file)
        try {
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }
            let imageUrl: string  = '';
            if (file) {
                imageUrl = await uploadCloudinary(file);
            }
    
            const result = await this.userRepository.createPostRepo(imageUrl, caption, userId);
            if (!result) {
                return { success: false, message: 'Failed to post' };
            }

            return { success: true, message: 'Post created successfully' };
        } catch (error) {
            console.error('Error creating post:', error);
            throw new Error('Failed to create post');
        }
    }
    public async getPosts(userId: mongoose.Types.ObjectId): Promise<{ success: boolean, message: string, posts?: PostDocument[] }> {
        try {
            
            const posts = await this.userRepository.getUserPosts(userId);
    
            if (posts && posts.length > 0) {

                return {
                    success: true,
                    message: 'Posts retrieved successfully',
                    posts: posts
                };
            } else {
                return {
                    success: false,
                    message: 'No posts found for this user'
                };
            }
        } catch (error) {
            console.error('Error retrieving posts:', error);
            return {
                success: false,
                message: 'Failed to retrieve posts'
            };
        }
    }
    public async fetchJobs(): Promise<{ success: boolean; message: string; jobs: JobDocument[] }> {
        try {
            const jobs = await this.userRepository.fetchJobsRepository();
      
            if (jobs) {
                return { success: true, message: 'Jobs fetched successfully', jobs };
            } else {
                return { success: false, message: 'No jobs found', jobs: [] };
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return { success: false, message: 'Error fetching jobs', jobs: [] };
        }
      }



 public async applyForJob(applicationData: { 
    userId: string; 
    jobId: string; 
    name: string; 
    email: string; 
    experience: string; 
    resume: Buffer; 
}): Promise<{ 
    success: boolean; 
    message: string; 
    user?: UserDocument 
}> {
    try {
        
        const userId = new mongoose.Types.ObjectId(applicationData.userId);
        const jobId = new mongoose.Types.ObjectId(applicationData.jobId);
    
        const user = await this.userRepository.getUserById(userId);

        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        const userJobs = (user.jobs || []).map(job => new mongoose.Types.ObjectId(job.toString()));

        const jobAlreadyApplied = userJobs.some(job => job.equals(jobId));

        if (jobAlreadyApplied) {
            return {
                success: false,
                message: 'Job has already been applied for'
            };
        }

        const result = await this.userRepository.createApplication(applicationData);

        if (result.success) {
            
        const user2 = await this.userRepository.getUserById(userId);
           
            await this.userRepository.updateApplicationCount(applicationData.jobId)
           

            return {
                success: true,
                message: result.message,
                user: user2 || undefined   
            };
        } else {
            return {
                success: false,
                message: result.message
            };
        }
    } catch (error) {
        console.error('Error applying for job:', error);
        return {
            success: false,
            message: 'Error applying for job'
        };
    }
}


public async updateUserField(
    userId: string,
    index: number,
    field: 'education' | 'skill'
  ): Promise<{ success: boolean; message: string; user?: UserDocument }> {
    console.log('feild  is ',field)
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const existingUser = await this.userRepository.getUserById(userObjectId);
  
      if (!existingUser) {
        return { success: false, message: 'User not found' };
      }
  
      if (field === 'education') {
        if (!existingUser.education || index < 0 || index >= existingUser.education.length) {
          return { success: false, message: 'Invalid education index or education array is undefined' };
        }
        existingUser.education.splice(index, 1);
      } else if (field === 'skill') {
        if (!existingUser.skill || index < 0 || index >= existingUser.skill.length) {
          return { success: false, message: 'Invalid skill index or skill array is undefined' };
        }
        existingUser.skill.splice(index, 1);
      }
  
      await existingUser.save();
      return { success: true, message: `${field.charAt(0).toUpperCase() + field.slice(1)} removed successfully`, user: existingUser };
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      return { success: false, message: `Error updating ${field}` };
    }
  }
  
}