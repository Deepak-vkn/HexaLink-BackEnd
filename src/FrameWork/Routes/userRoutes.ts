import express from 'express';
import { 
    registerUserController,
    verifyOtpUserController,  // Corrected spelling
    loginUserController,      // Corrected spelling
    resendOtpUserController,  // Corrected spelling
    logout,
    forgetPasswordUserController,
    resetPasswordUserController,
    fetchtimerUserController
     // Corrected spelling
} from '../../Adapters/userControll';  // Ensure the path and filename are correct

const router = express.Router();

router.post('/register', registerUserController);
router.post('/verifyotp', verifyOtpUserController);
router.post('/login', loginUserController);
router.post('/resendOtp', resendOtpUserController);
router.post('/logout', logout);
 router.post('/forgetPassword', forgetPasswordUserController);
 router.post('/resetPassword', resetPasswordUserController);
 router.post('/fetchtimer',fetchtimerUserController)
export default router;