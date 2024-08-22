import express from 'express';
import multer from 'multer';
import { 
    registerUserController,
    verifyOtpUserController,  // Corrected spelling
    loginUserController,      // Corrected spelling
    resendOtpUserController,  // Corrected spelling
    logout,
    forgetPasswordUserController,
    resetPasswordUserController,
    fetchtimerUserController,
    blockUserUserController,
    updateUserController,
    userPostControll,
    getUserPostsControll
     // Corrected spelling
} from '../../Adapters/userControll';  // Ensure the path and filename are correct

const upload = multer({ storage: multer.memoryStorage() });
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
router.post('/update',updateUserController)
router.post('/userpost',upload.single('file'),userPostControll)
router.get('/userposts/:userId', getUserPostsControll);
export default router;