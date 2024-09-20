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
import Conversation,{ ConversationDocument } from '../Databse/conversationSchema';
import  Message,{ MessageDocument } from '../Databse/messageSchema';
import { emitNotification } from '../../FrameWork/socket/socket'
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

    async createPostRepo(images: string[], caption: string, userId: mongoose.Types.ObjectId): Promise<PostDocument| null> {
        try {
           
            const post = new Post({ images, caption, userId });
            const savedPost = await post.save();
            return savedPost;
        } catch (error) {
            console.error('Error creating post:', error);
            return null;
        }
    }
    async getUserPosts(userId: mongoose.Types.ObjectId): Promise<PostDocument[] | null> {
        try {
            return await Post.find({ userId })
                .populate({
                    path: 'userId', 
                    select: 'name image', 
                })
                .populate({
                    path: 'comments.userId', 
                    select: 'name image', 
                })
                .populate({
                    path: 'likes.userId', 
                    select: 'name image', 
                })
                .exec();
        } catch (error) {
            console.error('Error fetching posts by userId:', error);
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
      async searchUsers(query?:string): Promise<UserDocument[]> {
        let filter: any = { is_block: false }; 
        if (query) {
            filter.name = { $regex: `^${query}`, $options: 'i' }; 
        }

       const user= await  User.find(filter).exec()
 
         return user
    }
    async  fetchFollow(userId: mongoose.Types.ObjectId): Promise<any | null> {
        return Follow.findOne({ userId: userId })
          .populate({
            path: 'following.id', // Populating the `id` field in `following`
            select: 'name image', // Selecting only `name` and `image` fields from the User model
          })
          .populate({
            path: 'followers.id', // Populating the `id` field in `followers`
            select: 'name image', // Selecting only `name` and `image` fields from the User model
          })
          .exec();
      }
      async followUser(
        userId: mongoose.Types.ObjectId, 
        followId: mongoose.Types.ObjectId
      ): Promise<{ success: boolean; message: string; followDoc?: FollowDocument }> {
        try {
          const userDoc = await Follow.findOne({ userId });
          const followDoc = await Follow.findOne({ userId: followId });
      
          if (!userDoc || !followDoc) {
            return { success: false, message: 'User not found' };
          }
      
          const existingFollow = userDoc.following.find(follow => follow.id.toString() === followId.toString());
          const existingFollower = followDoc.followers.find(follow => follow.id.toString() === userId.toString());
      
          if (existingFollow && existingFollower) {
            
            existingFollow.status = 'approved';
            existingFollower.status = 'approved';

            // Save changes before sending notifications
            await userDoc.save();
            await followDoc.save();
            // Create notification after follow is approved
            await this.createNotification(userId, followId, 'follow', ` accepted your follow request.`);
            console.log('rerched acept request')
            emitNotification(String(userId) , String(followId)); 
            return { success: true, message: 'Follow request accepted', followDoc };
          } else {
           
            // If not already following, add the new followId with status 'requested'
            userDoc.following.push({
              id: followId as mongoose.Types.ObjectId,
              followTime: new Date(),
              status: 'requested'
            } as any);
            followDoc.followers.push({
              id: userId as mongoose.Types.ObjectId,
              followTime: new Date(),
              status: 'requested'
            } as any);
            // Save changes before sending notifications
            await userDoc.save();
            await followDoc.save();
      
            // Create notification for sent follow request
            await this.createNotification(followId, userId, 'follow', ` sent you a follow request.`);
              emitNotification(String(followId) , String(userId)); 
            return { success: true, message: 'Follow request sent successfully', followDoc };
          }
        } catch (error) {
          console.error('Error in followUser function:', error);
          return { success: false, message: 'An error occurred while following the user' };
        }
      }
      
     async  createNotification(userId: mongoose.Types.ObjectId, sourceId: mongoose.Types.ObjectId, type: string, message: string): Promise<void> {
      try {
          await Notification.create({
              userId,
              type,
              message,
              sourceId,
              isRead: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              redirectUrl: `/profile/${sourceId}`, // Adjust as needed
              status: 'sent',
          });
      } catch (error) {
          console.error('Error in createNotification function:', error);
          throw new Error('Failed to create notification');
      }
  }


    async fetchNotifications(userId: mongoose.Types.ObjectId): Promise<NotificationDocument[]> {
    return Notification.find({ userId: userId }).populate({
        path: 'sourceId',
        select: 'name image', 
      }).exec(); 
    }

    async unfollowUser(userId: mongoose.Types.ObjectId, followId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string; followDoc?: FollowDocument; }> {
    try {
       
        const userDoc = await Follow.findOne({ userId });
        const followDoc = await Follow.findOne({ userId: followId });

        if (!userDoc || !followDoc) {
            return { success: false, message: 'User not found' };
        }

        const followingIndex = userDoc.following.findIndex(follow => follow.id.toString() === followId.toString());
        const followerIndex = followDoc.followers.findIndex(follow => follow.id.toString() === userId.toString());

        if (followingIndex > -1 && followerIndex > -1) {
            userDoc.following.splice(followingIndex, 1);
            followDoc.followers.splice(followerIndex, 1);

            await userDoc.save();
            await followDoc.save();

            // await Notification.create({
            //     userId: followId,
            //     type: 'unfollow',
            //     message: `${userId} has unfollowed you.`,
            //     sourceId: userId, 
            //     isRead: false,
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            //     redirectUrl: `/profile/${userId}`,
            //     status: 'sent',
            // });
            
            return { success: true, message: 'Successfully unfollowed the user', followDoc };
        } else {
            return { success: false, message: 'You are not following this user' };
        }
    } catch (error) {
        console.error('Error in unfollowUser function:', error);
        return { success: false, message: 'An error occurred while unfollowing the user' };
    }
    }

    async   likepost(postId: mongoose.Types.ObjectId, userId: string): Promise<{ success: boolean; message: string; postDoc?: any }> {
    try {
      
        const post = await Post.findById(postId)
        const userObjectId = new mongoose.Types.ObjectId(userId);
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

            const populatedPost = await Post.findById(postId )
            .populate({
                path: 'userId', 
                select: 'name image', 
            })
            .populate({
                path: 'comments.userId', 
                select: 'name image', 
            })
            .populate({
                path: 'likes.userId',
                select: 'name image', 
            })
            .exec();
            return { success: true, message: 'Like removed successfully', postDoc: populatedPost };
        } else {
            // If the user hasn't liked the post yet, add the user's ID and the current timestamp to the likes array
            post.likes.push({ userId:userObjectId, time: new Date() });
            await post.save();
            const populatedPost = await Post.findById(postId )
            .populate({
                path: 'userId', 
                select: 'name image', 
            })
            .populate({
                path: 'comments.userId', 
                select: 'name image', 
            })
            .populate({
                path: 'likes.userId', 
                select: 'name image', 
            })
            .exec();
            return { success: true, message: 'Post liked successfully', postDoc: populatedPost };
        }
    } catch (error) {
        console.error('Error in likepost function:', error);
        return { success: false, message: 'An error occurred while processing the like' };
    }
    }
     
    async  updatePost(postId: mongoose.Types.ObjectId, caption: string): Promise<{ success: boolean; message: string; postDoc?: any }> {
    try {

      const updatedPost = await Post.findByIdAndUpdate(
        postId, 
        { caption: caption },  
        { new: true, runValidators: true } 
      ).exec();
  
 
      if (!updatedPost) {
        return {
          success: false,
          message: 'Post not found',
        };
      }

      const populatedPost = await Post.findById(postId )
      .populate({
          path: 'userId', 
          select: 'name image', 
      })
      .populate({
          path: 'comments.userId', 
          select: 'name image', 
      })
      .populate({
          path: 'likes.userId', 
          select: 'name image',
      })
      .exec();
  
      return {
        success: true,
        message: 'Post updated successfully',
        postDoc: populatedPost,
      };
    } catch (error) {
      console.error('Error updating post:', error);
      return {
        success: false,
        message: 'Error updating post',
      };
    }
     }

  async  deletePost(postId: mongoose.Types.ObjectId): Promise<{ success: boolean; message: string;  }> {
    try {
     
      const deletedPost = await Post.findByIdAndDelete(postId).exec();
  
      if (!deletedPost) {
        return {
          success: false,
          message: 'Post not found',
        };
      }
  
      return {
        success: true,
        message: 'Post deleted successfully',
       
      };
    } catch (error) {
      console.error('Error deleting post:', error);
      return {
        success: false,
        message: 'Error deleting post',
      };
    }
    }
  async  addComment(postId: mongoose.Types.ObjectId, userId: string, message: string): Promise<{ success: boolean; message: string; postDoc?: any }> {
    try {
   
        const post = await Post.findById(postId);
        const userObjectId = new mongoose.Types.ObjectId(userId);
        if (!post) {
            return { success: false, message: 'Post not found' };
        }
        // Add the new comment to the comments array
        post.comments.push({ userId: userObjectId, message, time: new Date() });
    
        await post.save();

        const populatedPost = await Post.findById(postId )
      .populate({
          path: 'userId', 
          select: 'name image', 
      })
      .populate({
          path: 'comments.userId',
          select: 'name image', 
      })
      .populate({
          path: 'likes.userId', 
          select: 'name image', 
      })
      .exec();
  
        return { success: true, message: 'Comment added successfully', postDoc: populatedPost };
    } catch (error) {
        console.error('Error in addComment function:', error);
        return { success: false, message: 'An error occurred while adding the comment' };
    }
    }
  async fetchPostsByUserIds(userIds: mongoose.Types.ObjectId[]): Promise<PostDocument[]> {
    try {
        return await Post.find({ userId: { $in: userIds } })
        .sort({ postAt: -1 })
            .populate({
                path: 'userId',
                select: 'name image',
            })
            .populate({
                path: 'comments.userId',
                select: 'name image',
            })
            .populate({
                path: 'likes.userId',
                select: 'name image',
            })
            .exec();
    } catch (error) {
        console.error('Error in fetching posts by user IDs:', error);
        return [];
    }
    }
  async  fetchSuggestions(userId: mongoose.Types.ObjectId): Promise<UserDocument[]> {
        try {
    
          const followDoc = await Follow.findOne({ userId });
      
          if (!followDoc) {
            throw new Error('User not found');
          }

          const followedUserIds = followDoc.following.map(follow => follow.id);
      
          const suggestions = await User.find({
            _id: {
              $nin: followedUserIds,  
              $ne: userId          
            }
          });
      
          return suggestions;
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          throw error;
        }
      }
  async deleteComment(
        postId: mongoose.Types.ObjectId,
        commentIndex: number,
      ): Promise<{ success: boolean; message: string; populatedPost?:any}> {
        try {
        
          const post = await Post.findById(postId);
      
          if (!post) {
            return { success: false, message: 'Post not found' };
          }
          if (commentIndex < 0 || commentIndex >= post.comments.length) {
            return { success: false, message: 'Invalid comment index' };
          }
          post.comments.splice(commentIndex, 1);

          await post.save();
          const populatedPost = await Post.findById(postId)
      .populate({
        path: 'userId',
        select: 'name image',
      })
      .populate({
        path: 'comments.userId',
        select: 'name image',
      })
      .populate({
        path: 'likes.userId',
        select: 'name image',
      });
          return { success: true, message: 'Comment deleted successfully', populatedPost };
        } catch (error) {
          console.error('Error deleting comment:', error);
          return { success: false, message: 'Failed to delete comment' };
        }
      }

      async findOrCreateConversation(user1Id: mongoose.Types.ObjectId, user2Id: mongoose.Types.ObjectId): Promise<ConversationDocument> {
        // Try to find an existing conversation
        let conversation = await Conversation.findOne({
            $or: [
                { user1: user1Id, user2: user2Id },
                { user1: user2Id, user2: user1Id }
            ]
        })
        .populate('user1', 'name image') // Populate user1 with name and image
        .populate('user2', 'name image') // Populate user2 with name and image
        .exec();
    
        // If no conversation is found, create a new one
        if (!conversation) {
            conversation = await Conversation.create({ user1: user1Id, user2: user2Id });
    
            // Populate newly created conversation
            conversation = await Conversation.findById(conversation._id)
                .populate('user1', 'name image')
                .populate('user2', 'name image')
                .exec();
        }
    
        return conversation as ConversationDocument;
    }
    
      async  saveMessage(
        conversationId: mongoose.Types.ObjectId,
        sendTo: mongoose.Types.ObjectId,
        sendBy: mongoose.Types.ObjectId,
        content: string
      ): Promise<{ success: boolean; message: string; data: MessageDocument }> {
        const newMessage = await Message.create({
          conversationId,
          sendTo,
          sendBy,
          content,
          sendTime: new Date(), 
          status: 'sent', 
        });
      
        return {
          success: true,
          message: 'Message sent successfully',
          data: newMessage,
        };
      }


      async  getUsersInConversationWith(currentUserId: string): Promise<mongoose.Types.ObjectId[]> {
        try {
            const userObjectId = new mongoose.Types.ObjectId(currentUserId);
    
            // Fetch all conversations where the current user is either user1 or user2
            const conversations = await Conversation.find({
                $or: [
                    { user1: userObjectId },
                    { user2: userObjectId }
                ]
            });
    
            // Extract the user IDs that the current user has conversations with
            const userIds = conversations.map(conversation => {
                // Convert user1 and user2 to string and compare with userObjectId
                const user1Id = new mongoose.Types.ObjectId(conversation.user1.toString());
                const user2Id = new mongoose.Types.ObjectId(conversation.user2.toString());
    
       
                if (user1Id.equals(userObjectId)) {
                    return user2Id;
                } else {
                    return user1Id;
                }
            });
    
            return userIds;
        } catch (error) {
            console.error('Error fetching users in conversation with:', error);
            throw error;
        }
    }

    async getConversationsForUser(currentUserId: string): Promise<ConversationDocument[]> {
      const userObjectId = new mongoose.Types.ObjectId(currentUserId);
    
      const conversations = await Conversation.find({
          $or: [
              { user1: userObjectId },
              { user2: userObjectId }
          ]
      })
      .populate('user1', 'name image') 
      .populate('user2', 'name image') 
      .exec();
    
      return conversations;
  }
  
  
  async  getMessagesForConversation(conversationId: mongoose.Types.ObjectId): Promise<MessageDocument[]> {
    const messages = await Message.find({ conversationId }).populate('sendBy', 'name image').populate('sendTo', 'name image');
    return messages;
}
  async  getConversationById(convId: mongoose.Types.ObjectId): Promise<ConversationDocument | null> {
    const conversation = await Conversation.findById(convId)
    .populate('user1', 'name image') 
    .populate('user2', 'name image') 
    .exec();
  return conversation;
}
  async getMessages(conversationId: mongoose.Types.ObjectId): Promise<MessageDocument[]>  {
  try {
    const messages = await Message.find({ conversationId })
      .sort({ sendTime: 1 })
      .populate({
        path: 'conversationId',
        populate: [
          { path: 'user1', select: 'name image' },
          { path: 'user2', select: 'name image' }
        ]
      }); 
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};
async resetNotification(userId: mongoose.Types.ObjectId): Promise<void> {
  await Notification.updateMany(
      { userId, isRead: false }, 
      { $set: { isRead: true } }
  );
}

}
