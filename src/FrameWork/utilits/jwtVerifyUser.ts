import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../../FrameWork/Databse/userSchema';

interface DecodedToken extends JwtPayload {
    userId: string;
}

const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined = req.cookies?.user;

    console.log(token);

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

            const user = await User.findById(decoded.userId)

            if (user) {
                console.log("TOKEN FOUND IN MIDDLEWARE");
                next();
            } else {
                res.status(401).json({ token: false, message: "User not found",role:'user' });
            }
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401).json({ token: false, message: "Unauthorized" });
        }
    } else {
        console.log("Token not found in middleware");
        res.status(401).json({ token: false, message: "Unauthorized" });
    }
}

export default protect;
