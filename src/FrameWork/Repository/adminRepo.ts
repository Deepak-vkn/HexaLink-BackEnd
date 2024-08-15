// backend/src/FrameWork/Repository/adminRepo.ts
import Admin, { AdminDocument } from '../Databse/adminSchema';
import Company,{ CompanyDocument } from '../Databse/companySchema';
import User,{ UserDocument } from '../Databse/userSchema';
import { IAdminRepository } from '../Interface/adminInterface';

export class AdminRepository implements IAdminRepository {
    async findAdminByEmail(email: string): Promise<AdminDocument | null> {
        return Admin.findOne({ email }).exec();
    }

    async fetchUsers(): Promise<UserDocument[]> {
        return User.find()
    }
    async fetchCompany(): Promise<CompanyDocument[]> {
        return Company.find()
    }
}
