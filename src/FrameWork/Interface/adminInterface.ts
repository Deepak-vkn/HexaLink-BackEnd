// backend/src/usecase/IAdminRepository.ts

import { AdminDocument } from '../Databse/adminSchema';

export interface IAdminRepository {
    findAdminByEmail(email: string): Promise<AdminDocument | null>;
}
