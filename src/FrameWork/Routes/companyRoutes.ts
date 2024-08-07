
// backend/src/framework/router/userRouter.ts
import express from 'express';


const router = express.Router();


router.post('/register-company', registerCompanyController);

export default router;
