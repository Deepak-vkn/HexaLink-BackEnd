import Admin, { AdminDocument } from '../Databse/adminSchema';




export async function findAdminByEmail(email: string): Promise<AdminDocument | null> {
    return Admin.findOne({ email }).exec();
}
