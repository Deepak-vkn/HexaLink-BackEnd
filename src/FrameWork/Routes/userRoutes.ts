// backend/src/framework/router/userRouter.ts
import express from 'express';
import { registerUserController,verifyotpUserControll,loginUserControll ,resendOtpUsercontroll} from '../../Adapters/userControll';

const router = express.Router();


router.post('/register', registerUserController);
router.post('/verifyotp',verifyotpUserControll)
router.post('/login',loginUserControll)
router.post('/resendOtp',resendOtpUsercontroll)
export default router;
