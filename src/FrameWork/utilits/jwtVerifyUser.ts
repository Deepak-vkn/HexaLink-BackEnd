
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../../FrameWork/Databse/userSchema';

interface DecodedToken extends JwtPayload {
    userId: string;
}

const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
 
  
    let token: string = req.cookies?.user;


    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
            const user = await User.findById(decoded.userId)

            if (user) {
    
                if (req.path === '/verify-token') {
                     res.status(200).json({ token: true, message: "Token is valid" });
                     return
                }
                next();
            } else {
               
                res.json({ token: false, message: "User not found",role:'user' });
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            res.json({ token: false, message: "Unauthorized" });
        }
    } 
    else {
        console.log("Token not found in middleware");
        res.json({ token: false, message: "Unauthorized" });
    }
}

export default protect;
