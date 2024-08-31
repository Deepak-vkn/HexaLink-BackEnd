// backend/src/FrameWork/Repository/adminRepo.ts
import Admin, { AdminDocument } from '../Databse/adminSchema';
import Company,{ CompanyDocument } from '../Databse/companySchema';
import User,{ UserDocument } from '../Databse/userSchema';
import { IAdminRepository } from '../Interface/adminInterface';

export class AdminRepository implements IAdminRepository {
    async findAdminByEmail(email: string): Promise<AdminDocument | null> {
        return Admin.findOne({ email }).exec();
    }


    async  fetchUsers(query?: string): Promise<UserDocument[]> {
        let filter: any = { is_block: false }; 
    
        if (query) {
            filter.name = { $regex: `^${query}`, $options: 'i' }; 
        }
        return User.find(filter);
    }
    
    async fetchCompany(): Promise<CompanyDocument[]> {
        return Company.find()
    }
}
