// backend/src/FrameWork/Repository/adminRepo.ts
import Admin, { AdminDocument } from '../Databse/adminSchema';
import { IAdminRepository } from '../Interface/adminInterface';

export class AdminRepository implements IAdminRepository {
    async findAdminByEmail(email: string): Promise<AdminDocument | null> {
        return Admin.findOne({ email }).exec();
    }
}
