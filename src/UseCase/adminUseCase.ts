// backend/src/usecase/AdminUseCase.ts
import { IAdminRepository } from '../FrameWork/Interface/adminInterface'; // Import the interface
import { AdminDocument } from '../FrameWork/Databse/adminSchema'; // Corrected path to 'Databse'

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
}

export default AdminUseCase;
