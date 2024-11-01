// backend/src/usecase/AdminUseCase.ts
import { IAdminRepository } from '../FrameWork/Interface/adminInterface'; 
import { AdminDocument } from '../FrameWork/Databse/adminSchema'; 
import { UserDocument } from '../FrameWork/Databse/userSchema';
import { CompanyDocument } from '../FrameWork/Databse/companySchema';
import { JobDocument } from '../FrameWork/Databse/jobSchema';
import mongoose, { Types } from 'mongoose';
class AdminUseCase {
    private adminRepository: IAdminRepository;

    constructor(adminRepository: IAdminRepository) {
        this.adminRepository = adminRepository;
    }

     async verifyLogin(email: string, password: string): Promise<{ success: boolean, message: string, admin?: AdminDocument }> {
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

     async fetchUsersAdminCase(): Promise<UserDocument[]> {
        const users = await this.adminRepository.fetchUsers(); 
        return users; 
    }
     async fetchCompanyAdminCase(): Promise<CompanyDocument[]> {
        const users = await this.adminRepository.fetchCompany(); 
        return users; 
    }

    async adminDashBoard(): Promise<{ 
        userCount: number, 
        companyCount: number, 
        activeJobCount: number, 
        recentUsers: UserDocument[], 
        recentCompanies: CompanyDocument[], 
        monthlyStats: { month: string, userCount: number, companyCount: number, jobCount: number }[],
        companiesByJobCount: { company: CompanyDocument, jobCount: number }[]
    }> {
        try {
           
            const users: UserDocument[] = await this.adminRepository.fetchUsers();
            const companies: CompanyDocument[] = await this.adminRepository.fetchCompany();
            const jobs: JobDocument[] = await this.adminRepository.fetchJobs();
    
            //  users, companies, and active jobs
            const userCount = users.length;
            const companyCount = companies.length;
            const activeJobCount = jobs.filter(job => job.status=='active').length;
    
            // Sort and get recent companies and users
            const recentUsers = users.slice(-5); 
            const recentCompanies = companies.slice(-5); 
            const monthlyStats: { month: string, userCount: number, companyCount: number, jobCount: number }[] = Array.from({ length: 12 }, (_, i) => ({
                month: new Date(0, i).toLocaleString('default', { month: 'long' }),
                userCount: 0,
                companyCount: 0,
                jobCount: 0
            }));
    
            // Fill in monthly statistics
            users.forEach(user => {
                const monthIndex = new Date(user.joinedAt).getMonth(); 
                monthlyStats[monthIndex].userCount += 1;
            });
    
            companies.forEach(company => {
                const monthIndex = new Date(company.joinedAt).getMonth(); 
                monthlyStats[monthIndex].companyCount += 1;
            });
    
            jobs.forEach(job => {
                const monthIndex = new Date(job.posted).getMonth(); 
                monthlyStats[monthIndex].jobCount += 1;
            });
    
            const companiesByJobCount = companies.map(company => {
                // Count jobs created by this company
                const jobCount = jobs.filter(job => job.companyId.toString() === (company._id as Object).toString()).length;
    
                return { company, jobCount };
            });
    
            // Sort companies by job count in descending order
            companiesByJobCount.sort((a, b) => b.jobCount - a.jobCount);
    
            return { 
                userCount, 
                companyCount, 
                activeJobCount, 
                recentUsers, 
                recentCompanies, 
                monthlyStats,
                companiesByJobCount 
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    }
    
    
    
    
}

export default AdminUseCase;
