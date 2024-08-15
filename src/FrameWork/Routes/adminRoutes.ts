import express from 'express';
import { loginAdminControll,fetchUserAdminControll,fetchCompanyAdminControll } from '../../Adapters/adminControll'

const router = express.Router();


router.post('/',loginAdminControll)
router.get('/fetchusers',fetchUserAdminControll)
router.get('/fetchcompany',fetchCompanyAdminControll)

export default router;