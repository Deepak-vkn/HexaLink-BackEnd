import express from 'express';
import multer from 'multer';
import jwtVerifyUser from '../utilits/jwtVerifyUser'
import { 
    registerUserController,
    verifyOtpUserController,  
    loginUserController,     
    resendOtpUserController, 
    logout,
    forgetPasswordUserController,
    resetPasswordUserController,
    fetchtimerUserController,
    blockUserUserController,
    updateUserController,
    userPostControll,
    getUserPostsControll,
    fetchJobsController,
    applyJobController,
    updateEducationController,
    searchUsersControll,
    fetchFllowControll,followUserControll,fetchNotificationControll,fetchUserControll,unFollowUserControll,likeUserControll

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
router.post('/fetchtimer',fetchtimerUserController)
router.post('/block',blockUserUserController)
router.post('/update',upload.single('file'),updateUserController)
router.post('/userpost',upload.single('file'),userPostControll)
router.get('/userposts/:userId', getUserPostsControll);
router.get('/fetchJobs',fetchJobsController)
router.post('/applyJob',upload.single('file'),applyJobController)
router.post('/updateEducation',updateEducationController)
router.post('/search',searchUsersControll)
router.get('/fetchFollow', fetchFllowControll);
router.post('/followUser', followUserControll);
router.get('/fetchNotification',fetchNotificationControll)
router.get('/fetchUser', fetchUserControll);
router.post('/unFollowUser', unFollowUserControll);
router.get('/likepost', likeUserControll);



export default router;