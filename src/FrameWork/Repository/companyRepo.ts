// backend/src/framework/database/userController.ts
import Company, { CompanyDocument } from '../../FrameWork/Databse/companySchema';
import Otp, { OtpDocument } from '../../FrameWork/Databse/otpSchema';

export async function createCompany(companyData: Partial<CompanyDocument>): Promise<CompanyDocument> {
  return Company.create(companyData);
}


