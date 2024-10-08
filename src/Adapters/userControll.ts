import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserUseCase } from '../UseCase/userUseCase';
import { IUserRepository } from '../FrameWork/Interface/userInterface';
import { UserRepository } from '../FrameWork/Repository/userRepo';
import generateToken  from '../FrameWork/utilits/userJwt';
import uploadCloudinary from '../FrameWork/utilits/cloudinaray';
import {  updateMessageNotificationCount} from '../FrameWork/socket/socket'

import fs from 'fs';

const userRepository: IUserRepository = new UserRepository();
const userUseCase = new UserUseCase(userRepository);

export async function registerUserController(req: Request, res: Response): Promise<void> {
    try {
        const { name, number, email, password } = req.body;

        const result = await userUseCase.registerUser({ name, number, email, password });

        if (result.success) {
            const otp = await userUseCase.createOtp(result.user!._id as mongoose.Types.ObjectId);

            if (otp) {
                const message=`Your Otp for the account verification is ${otp.otp}`
                await userUseCase.sendEmail('deepakvkn1252@gmail.com', message,'Otp Verifictaion');
                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    data: result.user
                });
            } else {
                res.json({
                    success: false,
                    message: 'Failed to generate OTP'
                });
            }
        } else {
            res.json(result);
        }
    } catch (error) {
        console.error('Error in registerUserController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function verifyOtpUserController(req: Request, res: Response): Promise<void> {
    const { otp, userId } = req.body;

    try {
        // Convert userId to ObjectId
        const userIdObjectId = new mongoose.Types.ObjectId(userId);
        const result = await userUseCase.verifyOtp(otp, userIdObjectId);
        res.json(result);
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'Server error occurred while verifying OTP' });
    }
}

export async function loginUserController(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;
    
    try {
        const result = await userUseCase.verifyLogin(email, password);
        if (result.success) {
            const role: string = 'user';
            generateToken({ res, userId: result.user?._id as string, role });
            res.json(result);
        } else {
            res.json(result);
        }
    } catch (error) {
        console.error('Error in loginUserController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function resendOtpUserController(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;
   
    try {
        const newOtp = await userUseCase.createOtp(userId);

        if (newOtp) {
            const user = await userUseCase.getUser(userId);
            
            if (user && user.email) {
                const message=`Your otp for the verifitction is ${newOtp.otp} `
                await userUseCase.sendEmail('deepakvkn1252@gmail.com',message,'OTP verification' );
                res.json({ success: true, message: 'OTP resent successfully' });
            } else {
                res.status(404).json({ success: false, message: 'User not found' });
            }
        } else {
            res.status(500).json({ success: false, message: 'Failed to generate OTP' });
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function logout(req: Request, res: Response): Promise<void> {
    try {
        const { role } = req.body;

        res.clearCookie(role, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
        });
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


export async function forgetPasswordUserController(req: Request, res: Response): Promise<void> {
    try {
      
        const { email } = req.body;

        const user = await userRepository.findUserByEmail(email);
      
        if (user) {
            const resetToken = await userUseCase.generateResetToken(user._id as string);
            const resetLink = `${process.env.FRONTEND_URL}resetpassword?token=${resetToken}`;

            const message = `You requested a password reset. Please use the following link to reset your password: ${resetLink}`;

            await userUseCase.sendEmail('deepakvkn1252@gmail.com', message,'Password reset');

            res.json({ success: true, message: 'Password reset link sent successfully' });
        } else {
            res.json({ success: false, message: 'User does not exist' });
        }
    } catch (error) {
        console.error('Error in forgetPasswordUserController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function resetPasswordUserController(req: Request, res: Response): Promise<void> {
    const { password, token } = req.body;

    try {
        const verificationResult = await userUseCase.verifyToken(token);

        if (verificationResult === null || !verificationResult.success) {
            res.json({ success: false, message: verificationResult?.message || 'Invalid token' });
            return;
        }

        const userId = verificationResult.tokenRecord?.userId;
        if (!userId) {
            res.json({ success: false, message: 'Invalid token payload' });
            return;
        }
        const objectId = new mongoose.Types.ObjectId(userId);

        const updatedUser = await userUseCase.updatePassword(objectId, password);

        if (updatedUser.success) {
            res.json({ success: true, message: 'Password reset successfully' });
        } else {
            res.json({ success: false, message: updatedUser.message });
        }
    } catch (error) {
        console.error('Failed to reset password:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
}

export async function fetchtimerUserController(req: Request, res: Response): Promise<void> {
    const { userid } = req.body;

    try {
        const result = await userUseCase.getOtpTimeLeft(userid);

        if (result.success) {
            res.json({ success: true, timeLeft: result.timeLeft });
        } else {
            res.status(404).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Error in fetchtimerUserController:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export async function blockUserUserController(req: Request, res: Response): Promise<void> {
    const{userId}=req.body
 
    try {
       
       
        const result = await userUseCase.blockUser(userId); 
        
        res.status(result.success ? 200 : 400).json(result);
        
    } catch (error) {
        console.error('Error in blocking user:', error);
        res.status(500).json({ success: false, message: 'Error in blocking user' });
    }
}



export async function updateUserController (req:Request,res:Response) :Promise<void>{
console.log('raeched bakend')
    const userUpdates = req.body;
    if (req.file) {
        userUpdates.image = req.file.path; 
    }
    try {
        const result=await userUseCase.updateUser(userUpdates)
        res.json(result);
   
    } catch (error) {
        console.error('Error in updating user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
export async function userPostControll(req: Request, res: Response) {
    try {
        const { caption, userId, images } = req.body;

        if (!caption || !userId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }
        let imageArray: string[] = [];
        if (Array.isArray(images)) {
 
            imageArray = images;
        } else if (typeof images === 'string') {
  
            imageArray = [images];
        } else {
            return res.status(400).json({ success: false, message: 'Invalid images format' });
        }

        const userIdObj = new mongoose.Types.ObjectId(userId);
        const imageUrls: string[] = [];

        for (const base64Image of imageArray) {
            try {
    
                const imageUrl = await uploadCloudinary(base64Image);
               
                imageUrls.push(imageUrl); 
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
     
                return res.status(500).json({ success: false, message: 'Image upload failed' });
            }
        }

        const result = await userUseCase.createPost(imageUrls, caption, userIdObj);
        return res.json(result);
    } catch (error) {
        console.error('Error in userPostControll:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


export async function getUserPostsControll(req:Request,res:Response): Promise<any>{

    try {
        const userId = req.params.userId;
        
        if (!userId) {
            res.status(400).json({ message: 'User ID is required' });
            return;
        }
        const objectId = new mongoose.Types.ObjectId(userId);
        const result=  await userUseCase.getPosts(objectId)
        if (result.success) {
  
            res.json({
                success:true,
                message: result.message,
                posts: result.posts,
            });
        } else {
            res.json({
                success:false,
                message: result.message,
            });
        }
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ message: 'Failed to fetch user posts.' });
    }
    
}


export async function fetchJobsController(req: Request, res: Response): Promise<void> {
   
    try {
        const result = await userUseCase.fetchJobs();
        res.json(result);
    } catch (error) {
        console.error('Error in fetching jobs:', error);
        res.json({ success: false, message: 'Error in fetching jobs', jobs: [] });
    }
}


export async function applyJobController(req: Request, res: Response): Promise<void> {
    try {
   
        const resume = req.file ? req.file.buffer : null; 
   
        const applicationData :any= {
            userId: req.body.userId, 
            jobId: req.body.jobId, 
            name: req.body.name, 
            email: req.body.email, 
            experience: req.body.experience, 
            resume, 
        };
      
   
        const result = await userUseCase.applyForJob(applicationData);

        res.json(result);
    } catch (error) {
        console.error('Error in job application:', error);
        res.json({ success: false, message: 'Error in job application' });
    }
}

export async function updateEducationController(req: Request, res: Response): Promise<void> {
    try {
        const { userId, index,field} = req.body; 
        const result=await userUseCase.updateUserField(userId,index,field)
        res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}

export async function searchUsersControll(req: Request, res: Response): Promise<void> {


    try {
        const { query} = req.body; 

        const result=await userUseCase.searchUsersUseCase(query)
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}


export async function fetchFllowControll(req: Request, res: Response): Promise<void> {
    const { userId } = req.query;

    try {
      if (!userId) {
        res.json({ success: false, message: 'User ID is required' });
        return;
      }
      const userObjectId = new mongoose.Types.ObjectId(userId as string); 
  
      const result = await userUseCase.fetchFllowUsecase(userObjectId);
      if (result) {
  
        res.json(result);
      } else {
        res.json({ success: false, message: 'Follow document not found' });
      }
    } catch (error) {
      console.error('Error fetching follow document:', error);
      res.status(500).json({ success: false, message: 'Error fetching follow document' });
    }
  }
  export async function followUserControll(req: Request, res: Response): Promise<void> {
    try {
        const { userId,followId} = req.body; 
        const result=await userUseCase.followUser(userId,followId)
       
      
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}

export async function fetchNotificationControll(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.query;

        if (typeof userId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid user ID format' });
            return;
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        const result=await userUseCase.fetchNotification(objectId)
  
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}

export async function removeAllNotificationsUserControll(req: Request, res: Response): Promise<void> {
    try {
        const { userId,type } = req.query;
        console.log('reched remove notfictio backend')
        if (typeof userId !== 'string' || typeof type !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid user ID format' });
            return;
        }
        const objectId = new mongoose.Types.ObjectId(userId);
        const result=await userUseCase.removeAllNotificationsUseCase(objectId,type)
    
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}


export async function fetchUserControll(req: Request, res: Response): Promise<void> {
  
    try {
        const { userId } = req.query;

        if (typeof userId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid user ID format' });
            return;
        }
        const objectId = new mongoose.Types.ObjectId(userId)
        const result = await userUseCase.getUser(objectId);
        
        res.json(result);
    } catch (error) {
        console.error('Error in fetching jobs:', error);
        res.json({ success: false, message: 'Error in fetching jobs', jobs: [] });
    }
}


export async function unFollowUserControll(req: Request, res: Response): Promise<void> {
    try {
        const { userId,unfollowId} = req.body; 
        
        const result=await userUseCase.unFollowUser(userId,unfollowId)
       
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}


export async function likeUserControll(req: Request, res: Response): Promise<void> {
    
    try {
        const { postId, userId } = req.query;



        if (typeof postId !== 'string' || typeof userId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid postId or userId format' });
            return;
        }

        const postObjectId = new mongoose.Types.ObjectId(postId);

        const result = await userUseCase.likepost(postObjectId, userId);

            res.json(result)
        
    } catch (error) {
        console.error('Error in likeUserControll:', error);
        res.status(500).json({ success: false, message: 'Error in liking the post' });
    }
}


export async function updatePostUserControll(req: Request, res: Response): Promise<void> {
    try {
        const { caption,postId} = req.body; 
        const postObjectId = new mongoose.Types.ObjectId(postId);

        const result=await userUseCase.updatePost(postObjectId,caption)
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}
export async function deletePostUserControll(req: Request, res: Response): Promise<void> {
    try {
        const { postId} = req.query; 
        
        if (typeof postId !== 'string' ) {
            res.status(400).json({ success: false, message: 'Invalid postId or userId format' });
            return;
        }
        const postObjectId = new mongoose.Types.ObjectId(postId);

        const result=await userUseCase.deletePost(postObjectId)
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}

export async function addCommentUserControll(req: Request, res: Response): Promise<void> {
    try {
        const { postId,userId,comment} = req.body; 
        const postObjectId = new mongoose.Types.ObjectId(postId);

        const result=await userUseCase.addComment(postObjectId,userId,comment)
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}

export async function fetchFollowingPosts(req: Request, res: Response): Promise<void> {
    try {
        const { userId} = req.query; 

        if (typeof userId !== 'string' ) {
            res.status(400).json({ success: false, message: 'Invalid postId or userId format' });
            return;
        }
        const postObjectId = new mongoose.Types.ObjectId(userId);
        
        const result=await userUseCase.fetchFollowingPosts(postObjectId)

         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}

export async function followSuggestionUserControll(req: Request, res: Response): Promise<void> {
    try {
        const { userId} = req.query; 

        if (typeof userId !== 'string' ) {
            res.status(400).json({ success: false, message: 'Invalid postId or userId format' });
            return;
        }
        const postObjectId = new mongoose.Types.ObjectId(userId);
        
        const result=await userUseCase.fetchSuggestions(postObjectId)
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}


export async function deleteCommentUserControll(req: Request, res: Response): Promise<void> {
    try {
        const { postId, commentIndex } = req.body; 
   

        const postObjectId = new mongoose.Types.ObjectId(postId);
        
        const result=await userUseCase.deleteCommentUseCase(postObjectId,commentIndex)

        res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}


export async function sendMessage(conversationId: string | undefined,
     sendTo: string, sendBy: string,content?: string, 
     file?: string ): Promise<void> {
    try {
        let convId: mongoose.Types.ObjectId | undefined;

        if (conversationId) {
     
            convId = new mongoose.Types.ObjectId(conversationId);
        }

        const sendObjectId = new mongoose.Types.ObjectId(sendBy);
        const receiveObjectId = new mongoose.Types.ObjectId(sendTo);

        if (!convId) {
           
            const conversation = await userUseCase.findOrCreateConversationUseCase(sendObjectId, receiveObjectId);
            if (conversation) {
                convId = conversation._id as mongoose.Types.ObjectId;
            } else {
                throw new Error("Failed to create or find a conversation.");
            }
        }

        if (convId) {

            await userUseCase.saveMessageUseCase(convId, receiveObjectId, sendObjectId, content,file);
        } else {
            throw new Error("Conversation ID could not be determined.");
        }
    } catch (error) {
        console.error('Error sending message:', error);
      
    }
  

    
}

export async function  getConversationsAndMessages(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.query; 
        if (typeof userId !== 'string' ) {
            res.status(400).json({ success: false, message: 'Invalid  userId format' });
            return;
        }
        const result=await userUseCase.getConversationd(userId)
        console.log(result)
        res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}

export async function createConversationUseCase(req: Request, res: Response): Promise<void> {

    try {
        const { sendObjectId, receiveObjectId } = req.query; 
        if (typeof sendObjectId !== 'string' || typeof receiveObjectId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid userId format' });
            return;
        }
        const sendId = new mongoose.Types.ObjectId(sendObjectId);
        const receiveId = new mongoose.Types.ObjectId(receiveObjectId);
        const conversation = await userUseCase.findOrCreateConversationUseCase(sendId, receiveId);

        res.json(conversation);
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ success: false, message: 'Error creating conversation' });
    }
}

export async function  getMessage(req: Request, res: Response): Promise<void> {
    try {
        const {conversationId } = req.query; 
        if (typeof conversationId !== 'string' ) {
            res.status(400).json({ success: false, message: 'Invalid userId format' });
            return;
        }
        const convId = new mongoose.Types.ObjectId(conversationId);
        const message = await userUseCase.getMessage(convId );
   
        res.json(message);
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ success: false, message: 'Error creating conversation' });
    }
}
export async function resetNotificationCount(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.query;
        if (typeof userId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid user ID format' });
            return;
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        const result=await userUseCase.resetNotificationCountUseCase(objectId)
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}

export async function fileUpload(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.query;
        if (typeof userId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid user ID format' });
            return;
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        const result=await userUseCase.resetNotificationCountUseCase(objectId)
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}



export async function uploadFileController(req: Request, res: Response) {
    console.log('Reached upload file');
    try {
        if (req.body.image) {

            // // Use req.file.buffer if you're storing files in memory using multer
            const fileBuffer = req.body.image;
            // // Assuming your Cloudinary function can handle a buffer, you can pass it directly
             const fileUrl = await uploadCloudinary(fileBuffer); 

            console.log('File upload URL from Buffer:', fileUrl);

            return res.json({ success: true, message: 'File uploaded successfully', fileUrl });
        } else {
            return res.status(400).json({ success: false, message: 'No file provided' });
        }
    } catch (error) {
        console.error('Error in uploadFileController:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}


export async function deleteMessageUserControll(req: Request, res: Response): Promise<void> {
    try {
    
        const { messageId } = req.query; 
        console.log('message id is ',messageId)
        if (typeof messageId !== 'string' ) {
            res.status(400).json({ success: false, message: 'Invalid  message format' });
            return;
        }

        const messageObjectId = new mongoose.Types.ObjectId(messageId);
        
        const result=await userUseCase.deleteMessageUseCase(messageObjectId)
        console.log(result)
        res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}


export async function getUnreadMessageCountUserControll(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.query; 
        if (typeof userId !== 'string' ) {
            res.status(400).json({ success: false, message: 'Invalid  message format' });
            return;
        }
        
        const result=await userUseCase.getUnreadMessageCountUseCase(userId)
        res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}

export async function makeMessageReadUserController(req: Request, res: Response): Promise<void> {
    try {
        const { conversationId,userId } = req.query; 
        if (typeof userId !== 'string' || typeof conversationId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid  format format' });
            return;
        }
        const conversationObjectId = new mongoose.Types.ObjectId(conversationId);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const result=await userUseCase.makeMessageReadUseCase(conversationObjectId,userObjectId)
     
        res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}


export async function updateMessageCount(userId: string): Promise<{ success: boolean; count: number }> {
    try {
        const result = await userUseCase.getUnreadMessageCountUseCase(userId);
        
        if (result.success) {
            console.log('Retrieved unread message count:', result.count);
            return { success: true, count: result.count }; // Return the result with success and count
        }
    } catch (error) {
        console.error('Error getting message count:', error);
    }
    
    return { success: false, count: 0 }; // Return false if there was an error
}
 

