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
import { FollowDocument } from '../FrameWork/Databse/followSchema';
import { NotificationDocument } from '../FrameWork/Databse/notificationSchema';
import { ConversationDocument } from '../FrameWork/Databse/conversationSchema';
import { MessageDocument } from '../FrameWork/Databse/messageSchema';
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

     async registerUser(userData: Partial<UserDocument>): Promise<{ success: boolean, message: string, user?: UserDocument }> {
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

     async createOtp(userId: mongoose.Types.ObjectId): Promise<OtpDocument> {
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


     async verifyOtp(otp: number, userId: mongoose.Types.ObjectId): Promise<{ success: boolean, message: string }> {
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

     async sendEmail(to: string,content: string ,subject:string='No subject'): Promise<void> {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text: content,
        };

        await this.transporter.sendMail(mailOptions);
    }


    async verifyLogin(email: string, password: string): Promise<{ success: boolean, message: string, user?: UserDocument }> {
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

     async generateResetToken(userId: string): Promise<string> {
        const resetToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: '30s' });
        const expireAt = new Date();
      expireAt.setHours(expireAt.getHours() + 30);

        await Token.create({ userId, token: resetToken,expireAt });
        return resetToken;
    }

     async verifyToken(token: string): Promise<{ success: boolean, message?: string, tokenRecord?: any } | null> {
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

     async updatePassword(userId: mongoose.Types.ObjectId, newPassword: string): Promise<{ success: boolean, message: string }> {
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

     async getUser(userId: mongoose.Types.ObjectId): Promise<UserDocument | null> {

        return await this.userRepository.findUserById(userId);
    }
     async getOtpTimeLeft(userId: mongoose.Types.ObjectId): Promise<{ success: boolean, timeLeft?: number, message?: string }> {
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
     async blockUser(userId: mongoose.Types.ObjectId):Promise<{ success: boolean, message: string,block?:boolean}>{
       
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
     async updateUser(updateData: any): Promise<{ success: boolean, message: string, user?: UserDocument }> {

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
    


     async createPost(imageUrls: string[], caption: string, userId: mongoose.Types.ObjectId):Promise<{ success: boolean, message: string,block?:boolean}> {
        try {
            const user = await this.userRepository.findUserById(userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }
        
    
            const result = await this.userRepository.createPostRepo(imageUrls, caption, userId);
            if (!result) {
                return { success: false, message: 'Failed to post' };
            }

            return { success: true, message: 'Post created successfully' };
        } catch (error) {
            console.error('Error creating post:', error);
            throw new Error('Failed to create post');
        }
    }
     async getPosts(userId: mongoose.Types.ObjectId): Promise<{ success: boolean, message: string, posts?: PostDocument[] }> {
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
     async fetchJobs(): Promise<{ success: boolean; message: string; jobs: JobDocument[] }> {
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



  async applyForJob(applicationData: { 
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


   async updateUserField(
    userId: string,
    index: number,
    field: 'education' | 'skill'
  ): Promise<{ success: boolean; message: string; user?: UserDocument }> {
    
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
  public async searchUsersUseCase(query:string): Promise<UserDocument[]> {
    const users = await this.userRepository.searchUsers(query); 
    return users
    }

     async fetchFllowUsecase(userId: mongoose.Types.ObjectId): Promise<{ success: boolean; follow: FollowDocument | null }> {
        try {
          const follow = await this.userRepository.fetchFollow(userId);
          if (follow) {
   
            return { success: true, follow };
          }

          return { success: false, follow: null };
        } catch (error) {
          console.error('Error fetching follow document:', error);
      
    
          return { success: false, follow: null };
        }
      }
       async followUser(userId: mongoose.Types.ObjectId, followId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string,followDoc?:FollowDocument }> {
        try {
    
          const response = await this.userRepository.followUser(userId, followId);
      
        
          return response;
      
        } catch (error) {
          console.error('Error in followUser service method:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }

       async fetchNotification(userId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string; data?: NotificationDocument[] }> {
        try {

            

            const notifications = await this.userRepository.fetchNotifications(userId);
    
            if (notifications.length > 0) {
     
                return {
                    success: true,
                    message: 'Notifications retrieved successfully',
                    data: notifications
                };
            } else {
       
                return {
                    success: true,
                    message: 'No notifications found',
                    data: []
                };
            }
        } catch (error) {
            console.error('Error in fetchNotification service method:', error);
            return { 
                success: false, 
                message: 'An error occurred while fetching notifications' 
            };
        }
    }
    async resetNotificationCountUseCase(userId: mongoose.Types.ObjectId): Promise<void> {
        try {
            const notifications = await this.userRepository.fetchNotifications(userId);
    
            if (notifications.length > 0) {
              
             await this.userRepository.resetNotification(userId)
            }
        } catch (error) {
            console.error('Error in fetchNotification service method:', error);
        }
    }
     async unFollowUser(userId: mongoose.Types.ObjectId, unfollowId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string,followDoc?:FollowDocument }> {
        try {

          const response = await this.userRepository.unfollowUser(userId, unfollowId);
          return response;
      
        } catch (error) {
          console.error('Error in followUser service method:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }

      async removeFollower(userId: mongoose.Types.ObjectId, unfollowId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string,followDoc?:FollowDocument }> {
        try {

          const response = await this.userRepository.removeFollower(userId, unfollowId);
          return response;
      
        } catch (error) {
          console.error('Error in followUser service method:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }


       async likepost(postId: mongoose.Types.ObjectId,userId:string): Promise<{ success: boolean; message: string, postDoc?: PostDocument }> {
        try {
        
          const response = await this.userRepository.likepost(postId,userId);
        
      

          return response;
      
        } catch (error) {
          console.error('Error in followUser service method:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }
       async updatePost(postId: mongoose.Types.ObjectId,caption:string): Promise<{ success: boolean; message: string, postDoc?: PostDocument }> {
        try {
      
          const response = await this.userRepository.updatePost(postId,caption);
    

          return response;
      
        } catch (error) {
          console.error('Error in followUser service method:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }

      public async deletePost(postId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string }> {
        try {
          
          const response = await this.userRepository.deletePost(postId);
    
          return response;
      
        } catch (error) {
          console.error('Error in followUser service method:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }
       async addComment(postId: mongoose.Types.ObjectId,userId:string,comment:string): Promise<{ success: boolean; message: string, postDoc?: PostDocument }> {
        try {
          
          const response = await this.userRepository.addComment(postId,userId,comment);
   

          return response;
      
        } catch (error) {
          console.error('Error in followUser service method:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }

       async fetchFollowingPosts(userId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string; postDoc?: PostDocument[] }> {
        try {
            const followDoc = await this.userRepository.fetchFollow(userId);
            if (!followDoc) {
                throw new Error('No follow document found for the user.');
            }
    
       
            const approvedFollowingUserIds = followDoc.following
            .filter((followStatus: any) => followStatus.status === 'approved')
            .map((followStatus: any) => new mongoose.Types.ObjectId(followStatus.id._id.toString()));
          
            if (approvedFollowingUserIds.length > 0) {
                const posts = await this.userRepository.fetchPostsByUserIds(approvedFollowingUserIds);
                return { success: true, message: 'Posts fetched successfully', postDoc: posts };
            } else {
                return { success: true, message: 'No posts available for the approved following users' };
            }
        } catch (error) {
            console.error('Error in fetching following posts service method:', error);
            return { success: false, message: 'An error occurred while fetching the following posts' };
        }
    }
    
    async fetchSuggestions(userId: mongoose.Types.ObjectId): Promise<any> {
        try {
        
          const response = await this.userRepository.fetchSuggestions(userId);
        
          return response;
      
        } catch (error) {
          console.error('Error in followUser service method:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }

  
      async deleteCommentUseCase(postId: mongoose.Types.ObjectId,commentIndex:number): Promise<any> {
        try {
    
          const response = await this.userRepository.deleteComment(postId,commentIndex);
    
          return response;
      
        } catch (error) {
          console.error('Error in followUser service method:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }
      async findOrCreateConversationUseCase(user1Id: mongoose.Types.ObjectId, user2Id: mongoose.Types.ObjectId): Promise<ConversationDocument>{
        const result=await this.userRepository.findOrCreateConversation(user1Id,user2Id)
        return result
      }


      async  saveMessageUseCase(
        conversationId: mongoose.Types.ObjectId,
        sendTo: mongoose.Types.ObjectId,
        sendBy: mongoose.Types.ObjectId,
        content?: string,
        file?:string

      ): Promise<{ success: boolean; message: string; data?: MessageDocument }>{
        
        const result=await this.userRepository.saveMessage(conversationId,sendTo,sendBy,content,file)
        if(result.success){
            const conversation=await this.userRepository.getConversationById(conversationId)
            if(conversation){
                conversation.lastMessage = content ? content : (file ? file: 'No content');  
                conversation.updatedAt =new Date()
               await conversation.save()
            }
        }
        return result
      }
      async getConversationd(currentUserId: string) {
        try {
          
            const conversations = await this.userRepository.getConversationsForUser(currentUserId);
    
           
            const conversationDetailsWithSentCount = await Promise.all(conversations.map(async (conversation: any) => {
                const conversationId = conversation._id;
    
             
                const messages = await this.userRepository.getMessages(conversationId);
    
                const unreadCount = messages.filter((message: any) => message.status === 'sent'&& message.sendTo.toString() === currentUserId).length;
    
                return {
                    ...conversation.toObject(),  
                    unreadCount
                };
            }));
    
            
            return conversationDetailsWithSentCount;
        } catch (error) {
            console.error('Error fetching conversations and messages:', error);
            throw error;
        }
    }
    
    
    async getMessage(conversationId: mongoose.Types.ObjectId): Promise<MessageDocument[]> {
        try {

            const messages = await this.userRepository.getMessages(conversationId);
            return messages;
        } catch (error) {
            console.error('Error fetching conversations and messages:', error);
            throw error;
        }
    }

    async removeAllNotificationsUseCase(userId: mongoose.Types.ObjectId,type:string): Promise<{ success: boolean; message: string }> {
        try {
            const messages = await this.userRepository.removeAllNotifications(userId,type);
            return messages;
        } catch (error) {
            console.error('Error fetching conversations and messages:', error);
            throw error;
        }
    }

    async deleteMessageUseCase(messageId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string }> {
        try {
    
          const response = await this.userRepository.deleteMessage(messageId);
    
          return response;
      
        } catch (error) {
          console.error('Error in followUser service method:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }

      async getUnreadMessageCountUseCase(userId: string): Promise<any> {
        try {
            const conversations = await this.userRepository.getConversationsForUser(userId);
    
            let unreadCount = 0;
    
          
            for (const conversation of conversations) {
                const conversationId = conversation._id as mongoose.Types.ObjectId
               
               
                const messages = await this.userRepository.getMessages(conversationId);
    
          
                const unreadMessages = messages.filter((message: any) => 
                    message.status === 'sent' && message.sendTo.toString() === userId
                );
    
                unreadCount += unreadMessages.length;
            }
            return { success: true, count: unreadCount };
    
        } catch (error) {
            console.error('Error fetching conversations and messages:', error);
            throw error;
        }
    }

    async makeMessageReadUseCase(conversationId: mongoose.Types.ObjectId, userId: mongoose.Types.ObjectId): Promise<any> {
        try {

            const messages = await this.userRepository.getMessages(conversationId);
    
    
            const unreadMessages = messages.filter((message: any) => 
                message.status === 'sent' && message.sendBy.toString() === userId.toString()
            );
    

            const updatedMessages = unreadMessages.map(async (message: any) => {
                message.status = 'read';
                await message.save();
                return message;
            });

            await Promise.all(updatedMessages);

            return {
                success: true,
                message: 'All unread messages sent by other users marked as read.',
            };
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }

    
    }
    

  

    