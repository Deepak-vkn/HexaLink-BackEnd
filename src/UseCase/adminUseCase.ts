// backend/src/usecase/AdminUseCase.ts
import { IAdminRepository } from '../FrameWork/Interface/adminInterface'; // Import the interface
import { AdminDocument } from '../FrameWork/Databse/adminSchema'; // Corrected path to 'Databse'
import { UserDocument } from '../FrameWork/Databse/userSchema';
import { CompanyDocument } from '../FrameWork/Databse/companySchema';
class AdminUseCase {
    private adminRepository: IAdminRepository;

    constructor(adminRepository: IAdminRepository) {
        this.adminRepository = adminRepository;
    }

    public async verifyLogin(email: string, password: string): Promise<{ success: boolean, message: string, admin?: AdminDocument }> {
        try {
            const admin = await this.adminRepository.findAdminByEmail(email);

            if (!admin) {
                return { success: false, message: 'Admin not found' };
            }

            if (admin.password !== password) {
                return { success: false, message: 'Incorrect password' };
            }

            return { success: true, message: 'Login successful', admin };
        } catch (error) {
            console.error('Error verifying login:', error);
            throw new Error('Error verifying login');
        }
    }

    public async fetchUsersAdminCase(): Promise<UserDocument[]> {
        const users = await this.adminRepository.fetchUsers(); 
        return users; 
    }
    public async fetchCompanyAdminCase(): Promise<CompanyDocument[]> {
        const users = await this.adminRepository.fetchCompany(); 
        return users; 
    }
    
    
}

export default AdminUseCase;
