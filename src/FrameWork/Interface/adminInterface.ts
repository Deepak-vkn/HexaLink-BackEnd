// backend/src/usecase/IAdminRepository.ts

import { AdminDocument } from '../Databse/adminSchema';
import { UserDocument } from '../Databse/userSchema';
import { CompanyDocument } from '../Databse/companySchema';
export interface IAdminRepository {
    findAdminByEmail(email: string): Promise<AdminDocument | null>;
    fetchUsers():Promise<UserDocument[]>;
    fetchCompany():Promise<CompanyDocument[]>;
    
}
