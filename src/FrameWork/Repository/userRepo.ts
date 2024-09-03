import User, { UserDocument } from '../Databse/userSchema';
import Otp, { OtpDocument } from '../Databse/otpSchema';
import Token, { TokenDocument } from '../Databse/tokenSchema'; // Ensure this import is correct
import { IUserRepository } from '../Interface/userInterface'; // Ensure correct path
import mongoose,{ObjectId } from 'mongoose';
import Post, { PostDocument } from '../Databse/postSchema';
import Job,{ JobDocument } from '../Databse/jobSchema';
import Application,{ ApplicationDocument } from '../Databse/applicationSchema';
import Follow,{ FollowDocument } from '../Databse/followSchema';
import Notification,{NotificationDocument} from '../Databse/notificationSchema';


export class UserRepository implements IUserRepository {
    
    async createUser(userData: Partial<UserDocument>): Promise<UserDocument> {
        const user=await  User.create(userData);

        if(user){
            await Follow.create({ userId: user._id });
        }
        return user
    }

    async findUserByEmail(email: string): Promise<UserDocument | null> {
        return User.findOne({ email }).exec();
    }

    async findUserById(id:  mongoose.Types.ObjectId): Promise<UserDocument | null> {
        try {
            return await User.findById(id).exec();
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw new Error('Error finding user by ID');
        }
    }

    async saveOtp(otp: number, userId:  mongoose.Types.ObjectId, expiresAt: Date): Promise<OtpDocument> {
        const newOtp = new Otp({ otp, userId, expiresAt });
        await newOtp.save();
        return newOtp;
    }

    async findOtpById(userId: mongoose.Types.ObjectId): Promise<OtpDocument | null> {
        try {
            return await Otp.findOne({ userId }).exec();
        } catch (error) {
            console.error('Error finding OTP:', error);
            throw new Error('Error finding OTP');
        }
    }

    async deleteOtpById(userId:  mongoose.Types.ObjectId): Promise<void> {
        await Otp.deleteOne({ userId }).exec();
    }

    async getUserById(userId: mongoose.Types.ObjectId): Promise<UserDocument | null> {
        return User.findById(userId).exec();
    }

    async getTokenById(userId:  mongoose.Types.ObjectId): Promise<TokenDocument | null> {
        try {
            return await Token.findOne({ userId }).exec();
        } catch (error) {
            console.error('Error fetching token by userId:', error);
            return null;
        }
    }

    async createPostRepo(image: string, caption: string, userId: mongoose.Types.ObjectId): Promise<PostDocument| null> {
        try {
           
            const post = new Post({ image, caption, userId });
            const savedPost = await post.save();
            return savedPost;
        } catch (error) {
            console.error('Error creating post:', error);
            return null;
        }
    }

    async getUserPosts(userId: mongoose.Types.ObjectId): Promise<PostDocument[] | null> {
        try {
            return await Post.find({ userId }).exec();
        } catch (error) {
            console.error('Error fetching token by userId:', error);
            return null;
        }
    }
    async fetchJobsRepository(): Promise<JobDocument[] | null> {
     
        const currentDate = new Date();
    
        return Job.find({ expires: { $gte: currentDate } }) 
                  .sort({ posted: -1 }) 
                  .exec();
    }
    
    public async createApplication(applicationData: { 
        userId: string; 
        jobId: string; 
        name: string; 
        email: string; 
        experience: string; 
        resume: Buffer; 
    }): Promise<{ 
        success: boolean; 
        message: string; 
    }> {
        try {
            
            const newApplication = new Application({
                userId: applicationData.userId,
                jobId: applicationData.jobId,
                name: applicationData.name,
                email: applicationData.email,
                experience: applicationData.experience,
                resume: applicationData.resume
            });

            const application = await newApplication.save();
    
            if (application) {
         
                const updatedUser = await User.findByIdAndUpdate(
                    applicationData.userId,
                    { $addToSet: { jobs: applicationData.jobId } }, 
                    { new: true } 
                )
 
                if (updatedUser) {
                    return {
                        success: true,
                        message: 'Application saved successfully',
      
                    };
                } else {
                    return {
                        success: false,
                        message: 'User update failed'
                    };
                }
            } else {
                return {
                    success: false,
                    message: 'Failed to apply for job'
                };
            }
        } catch (error) {
            console.error('Error saving application:', error);
    
            return {
                success: false,
                message: 'Failed to save application'
            };
        }
    }

   public  async  updateApplicationCount(jobId: string): Promise<void> {
        try {
        
            await Job.findByIdAndUpdate(
                jobId,
                { $inc: { applications: 1 } },
                { new: true, useFindAndModify: false } 
            ).exec();
         
        } catch (error) {
            console.error('Error updating application count:', error);
        }
    }
    public  async searchUsers(query?:string): Promise<UserDocument[]> {
        let filter: any = { is_block: false }; 
        if (query) {
            filter.name = { $regex: `^${query}`, $options: 'i' }; 
        }

       const user= await  User.find(filter).exec()
 
         return user
    }
    public async fetchFollow(userId: mongoose.Types.ObjectId): Promise<FollowDocument | null> {
        return Follow.findOne({ userId: userId }).exec(); 
      }
    public async  followUser(userId:  mongoose.Types.ObjectId, followId:  mongoose.Types.ObjectId): Promise<{ success: boolean; message: string,followDoc?:FollowDocument }> {
        try {
          // Find the Follow document for the user
          const userDoc = await Follow.findOne({ userId });
          const followDoc = await Follow.findOne({ userId:followId });
          console.log('user is ',userDoc)
          console.log('follower is ',followDoc)
      
          if (!userDoc||!followDoc) {
            return { success: false, message: 'User not found' };
          }
      
          // Check if the followId is already in the following array
          const existingFollow = userDoc.following.find(follow => follow.id.toString() === followId.toString());
          const existingFollower = followDoc.followers.find(follow => follow.id.toString() === userId.toString());
     
          if (existingFollow&& existingFollower) {
            console.log('eneyred existing follow')
            // If already following, update the status to 'approved'
            existingFollow.status = 'approved';
            existingFollower.status = 'approved';
            await userDoc.save();
            await followDoc.save();
            await Notification.create({
                userId: followId, // The user who receives the notification
                type: 'follow',
                message: `${userId} accepted your follow request.`,
                sourceId: userId, // The user who triggered the notification
              
                isRead: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                redirectUrl: `/profile/${userId}`,
                status: 'sent',
              });

            return { success: true, message: 'Follow  resquest accepted ',followDoc };
          } else {
            // If not already following, add the new followId with status 'requested'
            userDoc.following.push({
              id: followId as mongoose.Types.ObjectId ,
              followTime: new Date(), // Set the follow time to the current date and time
              status: 'requested'
            } as any);
            followDoc.followers.push({
                id: userId as mongoose.Types.ObjectId ,
                followTime: new Date(), // Set the follow time to the current date and time
                status: 'requested'
              } as any);
          }

          await Notification.create({
            userId: followId, // The user who receives the notification
            type: 'follow',
            message: `${userId} sent you a follow request.`,
            sourceId: userId, // The user who triggered the notification
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            redirectUrl: `/profile/${userId}`,
            status: 'sent',
          });

          await userDoc.save();
          await followDoc.save();
          return { success: true, message: 'Follow request send successfully' ,followDoc};

        } catch (error) {
          console.error('Error in followUser function:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
}


public async fetchNotifications(userId: mongoose.Types.ObjectId): Promise<NotificationDocument[]> {
    return Notification.find({ userId: userId }).exec(); 
}

public async unfollowUser(userId: mongoose.Types.ObjectId, followId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string; followDoc?: FollowDocument; }> {
    try {
        // Find the Follow document for both users
        const userDoc = await Follow.findOne({ userId });
        const followDoc = await Follow.findOne({ userId: followId });

        if (!userDoc || !followDoc) {
            return { success: false, message: 'User not found' };
        }

        // Remove the followId from the user's following array
        const followingIndex = userDoc.following.findIndex(follow => follow.id.toString() === followId.toString());
        const followerIndex = followDoc.followers.findIndex(follow => follow.id.toString() === userId.toString());

        if (followingIndex > -1 && followerIndex > -1) {
            userDoc.following.splice(followingIndex, 1);
            followDoc.followers.splice(followerIndex, 1);

            await userDoc.save();
            await followDoc.save();

            await Notification.create({
                userId: followId,
                type: 'unfollow',
                message: `${userId} has unfollowed you.`,
                sourceId: userId, 
                isRead: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                redirectUrl: `/profile/${userId}`,
                status: 'sent',
            });

            return { success: true, message: 'Successfully unfollowed the user', followDoc };
        } else {
            return { success: false, message: 'You are not following this user' };
        }
    } catch (error) {
        console.error('Error in unfollowUser function:', error);
        return { success: false, message: 'An error occurred while unfollowing the user' };
    }
}
    
    async   likepost(postId: mongoose.Types.ObjectId, userId: string): Promise<{ success: boolean; message: string; postDoc?: PostDocument }> {
    try {
        // Find the post by ID
        const post = await Post.findById(postId);
        const userObjectId = new mongoose.Schema.Types.ObjectId(userId);
        if (!post) {
            return { success: false, message: 'Post not found' };
        }

        // Check if the user has already liked the post
        const existingLikeIndex = post.likes.findIndex(like => 
            like.userId.toString() === userObjectId.toString()  
          );

        if (existingLikeIndex !== -1) {
            // If the user has already liked the post, remove the like
            post.likes.splice(existingLikeIndex, 1);
            await post.save();
            return { success: true, message: 'Like removed successfully', postDoc: post };
        } else {
            // If the user hasn't liked the post yet, add the user's ID and the current timestamp to the likes array
            post.likes.push({ userId:userObjectId, time: new Date() });
            await post.save();
            return { success: true, message: 'Post liked successfully', postDoc: post };
        }
    } catch (error) {
        console.error('Error in likepost function:', error);
        return { success: false, message: 'An error occurred while processing the like' };
    }
}
}
