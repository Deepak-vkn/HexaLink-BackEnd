import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Admin from '../../FrameWork/Databse/adminSchema'; // Import Admin Schema

interface DecodedToken extends JwtPayload {
    userId: string;
}

const protectAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Admin Token Validation Middleware');

    // Access the token from the cookies
    let token: string | undefined = req.cookies?.admin;

    if (token) {
        try {
            // Decode the token using the secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

            // Find the admin by the decoded userId
            const admin = await Admin.findById(decoded.userId);

            if (admin) {
                console.log("Valid admin token found in middleware");

                // If the route is `/verify-token`, return the response
                if (req.path === '/verify-token') {
                    res.status(200).json({ token: true, message: "Token is valid" });
                    return;
                }
                next(); // Proceed to the next middleware if token is valid
            } else {
                console.log('Admin not found, invalid token');
                res.json({ token: false, message: "Admin not found", role: 'admin' });
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            res.json({ token: false, message: "Unauthorized", role: 'admin' });
        }
    } else {
        console.log("Token not found in middleware");
        res.json({ token: false, message: "Unauthorized", role: 'admin' });
    }
}

export default protectAdmin;
