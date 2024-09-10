
// backend/src/framework/router/userRouter.ts
import express from 'express';
import protectCompany from '../utilits/jwtVerifycCompany';
import {registerCompanyController,verifyOtpCompanyController,
    loginCompanyController,resendOtpCompanyController,
    resetPasswordCompanyController,forgetPasswordCompanyController,blockUserCompanyController,createJobController,fetchJobsController
    ,updateJobController,fetchCompanyApplicationsUseCase,updateApplicationStatusUserControll
} from '../../Adapters/companyControll'

const router = express.Router();

router.post('/register-company', registerCompanyController);
router.post('/verifyotp', verifyOtpCompanyController);
router.post('/login', loginCompanyController);
router.post('/resendOtp',resendOtpCompanyController)
router.post('/forgetPassword', forgetPasswordCompanyController);
router.post('/resetPassword', resetPasswordCompanyController);
router.post('/block',blockUserCompanyController)
router.post('/createJob',protectCompany,createJobController)
router.post('/fetchJobs',protectCompany,fetchJobsController)
router.post('/updateJob/:jobId',protectCompany,updateJobController)
router.get('/fetchApplications',protectCompany,fetchCompanyApplicationsUseCase)
router.get('/updateApplicationStatus',protectCompany,updateApplicationStatusUserControll)
router.get('/verify-token',protectCompany)

export default router;
