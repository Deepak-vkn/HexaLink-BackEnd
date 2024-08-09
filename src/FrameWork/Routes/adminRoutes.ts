import express from 'express';
import { loginAdminControll } from '../../Adapters/adminControll'

const router = express.Router();


router.post('/',loginAdminControll)


export default router;