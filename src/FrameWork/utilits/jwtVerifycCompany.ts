import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Company from '../../FrameWork/Databse/companySchema'; // Import Company Schema

interface DecodedToken extends JwtPayload {
    userId: string;
}

const protectCompany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Company Token Validation Middleware');

    // Access the token from the cookies
    let token: string | undefined = req.cookies?.company;

    if (token) {
        try {
            // Decode the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

            // Find the company by the decoded userId
            const company = await Company.findById(decoded.userId);
            if (company) {
                console.log("Valid company token found in middleware");
                // If the route is `/verify-token`, return the response
                if (req.path === '/verify-token') {
                    res.status(200).json({ token: true, message: "Token is valid" });
                    return;
                }
                next(); // Proceed to the next middleware if token is valid
            } 
            else {
                console.log('Company not found, invalid token');
                res.json({ token: false, message: "Company not found", role: 'company' });
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            res.json({ token: false, message: "Unauthorized" ,role: 'company'});
        }
    } else {
        console.log("Token not found in middleware");
        res.json({ token: false, message: "Unauthorized" ,role: 'company'});
    }
}

export default protectCompany;
