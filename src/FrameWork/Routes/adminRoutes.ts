import express from 'express';
import { loginAdminControll,fetchUserAdminControll,fetchCompanyAdminControll } from '../../Adapters/adminControll'
import protectAdmin from '../utilits/jwtVerifyAdmin';
const router = express.Router();


router.post('/',loginAdminControll)
router.get('/fetchusers',protectAdmin,fetchUserAdminControll)
router.get('/fetchcompany',protectAdmin,fetchCompanyAdminControll)

export default router;
