import express from 'express';
import multer from 'multer';
import jwtVerifyUser from '../utilits/jwtVerifyUser'
import { 
    registerUserController,verifyOtpUserController,  
    loginUserController,resendOtpUserController, 
    logout,forgetPasswordUserController,
    resetPasswordUserController,fetchtimerUserController,
    blockUserUserController,updateUserController,
    userPostControll,getUserPostsControll,
    fetchJobsController,applyJobController,
    updateEducationController,searchUsersControll,
    fetchFllowControll,followUserControll,fetchNotificationControll,
    fetchUserControll,unFollowUserControll,likeUserControll,
    updatePostUserControll,deletePostUserControll,
    addCommentUserControll,fetchFollowingPosts,followSuggestionUserControll,
    deleteCommentUserControll,getConversationsAndMessages,createConversationUseCase,getMessage,resetNotificationCount,
    removeAllNotificationsUserControll

} from '../../Adapters/userControll'; 

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 
    }
});

const router = express.Router();

router.post('/register', registerUserController);
router.post('/verifyotp', verifyOtpUserController);
router.post('/login', loginUserController);
router.post('/resendOtp', resendOtpUserController);
router.post('/logout', logout);
router.post('/forgetPassword', forgetPasswordUserController);
router.post('/resetPassword', resetPasswordUserController);
router.post('/fetchtimer',fetchtimerUserController);
router.post('/block',blockUserUserController);
router.post('/update',jwtVerifyUser,upload.single('file'),updateUserController);
router.post('/userpost',jwtVerifyUser,upload.array('images', 4),userPostControll);
router.get('/userposts/:userId',jwtVerifyUser, getUserPostsControll);
router.get('/fetchJobs',fetchJobsController)
router.post('/applyJob',jwtVerifyUser,upload.single('file'),applyJobController)
router.post('/updateEducation',jwtVerifyUser,updateEducationController)
router.post('/search',jwtVerifyUser,searchUsersControll)
router.get('/fetchFollow',jwtVerifyUser, fetchFllowControll);
router.post('/followUser',jwtVerifyUser, followUserControll);
router.get('/fetchNotification',jwtVerifyUser,fetchNotificationControll)
router.get('/fetchUser',jwtVerifyUser, fetchUserControll);
router.post('/unFollowUser',jwtVerifyUser, unFollowUserControll);
router.get('/likepost',jwtVerifyUser, likeUserControll);
router.post('/updatePost',jwtVerifyUser, updatePostUserControll);
router.get('/deletePost',jwtVerifyUser, deletePostUserControll);
router.post('/postComment',jwtVerifyUser, addCommentUserControll);
router.get('/fetchFollowingPosts',jwtVerifyUser, fetchFollowingPosts)
router.get('/followSuggestion',followSuggestionUserControll)
router.delete('/deleteComment',deleteCommentUserControll)
router.get('/messages',getConversationsAndMessages)
router.get('/createConversation',createConversationUseCase)
router.get('/getMessage',getMessage)
router.get('/resetNotificationCount',resetNotificationCount)
router.get('/removeAllNotifications',removeAllNotificationsUserControll)

router.get('/verify-token',jwtVerifyUser)
export default router;