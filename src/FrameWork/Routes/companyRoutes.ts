
// backend/src/framework/router/userRouter.ts
import express from 'express';
import {registerCompanyController,verifyOtpCompanyController,
    loginCompanyController,resendOtpCompanyController,
    resetPasswordCompanyController,forgetPasswordCompanyController,blockUserCompanyController,createJobController,fetchJobsController,updateJobController
} from '../../Adapters/companyControll'

const router = express.Router();


router.post('/register-company', registerCompanyController);
router.post('/verifyotp', verifyOtpCompanyController);
router.post('/login', loginCompanyController);
router.post('/resendOtp',resendOtpCompanyController)
router.post('/forgetPassword', forgetPasswordCompanyController);
router.post('/resetPassword', resetPasswordCompanyController);
router.post('/block',blockUserCompanyController)
router.post('/createJob',createJobController)
router.post('/fetchJobs',fetchJobsController)
router.post('/updateJob/:jobId',updateJobController)

export default router;
