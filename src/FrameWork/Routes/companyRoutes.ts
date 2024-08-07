
// backend/src/framework/router/userRouter.ts
import express from 'express';
import {registerCompanyController,verifyotpCompanyControll,loginCompanyControll,resendOtpCompanycontroll} from '../../Adapters/companyControll'

const router = express.Router();


router.post('/register-company', registerCompanyController);
router.post('/verifyotp', verifyotpCompanyControll);
router.post('/login', loginCompanyControll);
router.post('/resendOtp',resendOtpCompanycontroll)
export default router;
