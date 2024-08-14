
// backend/src/framework/router/userRouter.ts
import express from 'express';
import {registerCompanyController,verifyOtpCompanyController,
    loginCompanyController,resendOtpCompanyController,
    resetPasswordCompanyController,forgetPasswordCompanyController
} from '../../Adapters/companyControll'

const router = express.Router();


router.post('/register-company', registerCompanyController);
router.post('/verifyotp', verifyOtpCompanyController);
router.post('/login', loginCompanyController);
router.post('/resendOtp',resendOtpCompanyController)
router.post('/forgetPassword', forgetPasswordCompanyController);
router.post('/resetPassword', resetPasswordCompanyController);

export default router;
