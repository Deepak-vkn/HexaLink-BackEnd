import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { UserUseCase } from '../UseCase/userUseCase';
import { IUserRepository } from '../FrameWork/Interface/userInterface';
import { UserRepository } from '../FrameWork/Repository/userRepo';
import generateToken  from '../FrameWork/utilits/userJwt';
import uploadCloudinary from '../FrameWork/utilits/cloudinaray';
import fs from 'fs';
// Initialize UserRepository and UserUseCase
const userRepository: IUserRepository = new UserRepository();
const userUseCase = new UserUseCase(userRepository);

// Controller functions

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
        console.log('reched here')
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
    console.log('user is',userId)
    try {
        console.log('reched bolck user')
       
        const result = await userUseCase.blockUser(userId); 
        
        res.status(result.success ? 200 : 400).json(result);
        
    } catch (error) {
        console.error('Error in blocking user:', error);
        res.status(500).json({ success: false, message: 'Error in blocking user' });
    }
}



export async function updateUserController (req:Request,res:Response) :Promise<void>{

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
        console.log('Received images:', images);

        // Check if all required fields are present
        if (!caption || !userId) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        // Normalize images into an array
        let imageArray: string[] = [];
        if (Array.isArray(images)) {
            // If images is already an array, use it directly
            imageArray = images;
        } else if (typeof images === 'string') {
            // If images is a single string, convert it into an array
            imageArray = [images];
        } else {
            return res.status(400).json({ success: false, message: 'Invalid images format' });
        }

        const userIdObj = new mongoose.Types.ObjectId(userId);
        const imageUrls: string[] = [];

        // Process each image (upload base64 to Cloudinary)
        for (const base64Image of imageArray) {
            try {
                // Assuming `uploadCloudinary` function handles base64 uploads
                const imageUrl = await uploadCloudinary(base64Image);
                console.log('Uploaded image URL:', imageUrl);
                imageUrls.push(imageUrl); // Collect all image URLs
            } catch (uploadError) {
                console.error('Error uploading image to Cloudinary:', uploadError);
                // Handle upload errors (e.g., continue or halt based on your needs)
                return res.status(500).json({ success: false, message: 'Image upload failed' });
            }
        }

        // Pass the array of image URLs to the createPost use case
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
        console.log('Reached backend job application');
        console.log('Name:', req.body.name);
        console.log('Email:', req.body.email);

        const resume = req.file ? req.file.buffer : null; 
        if (req.file) {
            console.log('Uploaded File:', req.file);
        } else {
            console.log('No file uploaded');
        }

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
    console.log('User ID:', userId);
    console.log('reachedin backend')
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
        console.log('result  follow is ', result)
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
        console.log('result  follow is ', result)
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}



export async function fetchUserControll(req: Request, res: Response): Promise<void> {
   console.log('raeched abckend for fetch user')
    try {
        const { userId } = req.query;
        console.log('query is ',userId)
        if (typeof userId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid user ID format' });
            return;
        }
        const objectId = new mongoose.Types.ObjectId(userId)
        const result = await userUseCase.getUser(objectId);
        if(result){
            console.log(result)
        }
        res.json(result);
    } catch (error) {
        console.error('Error in fetching jobs:', error);
        res.json({ success: false, message: 'Error in fetching jobs', jobs: [] });
    }
}


export async function unFollowUserControll(req: Request, res: Response): Promise<void> {
    try {
        const { userId,unfollowId} = req.body; 
        console.log('userir and followid is',userId,unfollowId)
        const result=await userUseCase.unFollowUser(userId,unfollowId)
        console.log('result  follow is ', result)
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}


export async function likeUserControll(req: Request, res: Response): Promise<void> {
    console.log('Reached backend for like post');
    try {
        const { postId, userId } = req.query;

        console.log('Query params:', { postId, userId });

        if (typeof postId !== 'string' || typeof userId !== 'string') {
            res.status(400).json({ success: false, message: 'Invalid postId or userId format' });
            return;
        }

        const postObjectId = new mongoose.Types.ObjectId(postId);

        const result = await userUseCase.likepost(postObjectId, userId);

            console.log('Like post result:', result);
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
        console.log('postId and Caption is', caption,postId)
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
        console.log('postId  is', postId)
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
        console.log('postId and Caption is',postId,userId,comment)
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
        console.log(result)
         res.json(result);
    } catch (error) {
        console.error('Error updating education:', error);
        res.status(500).json({ success: false, message: 'Error updating education' });
    }
}