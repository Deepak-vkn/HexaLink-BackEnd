import { Response } from 'express';
import jwt from 'jsonwebtoken';

interface GenerateTokenParams {
  res: Response;
  userId: string;
  role: string;
}

const generateToken = ({ res, userId, role }: GenerateTokenParams): void => {
  
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    // Generate the token
    const token = jwt.sign({ userId, role }, jwtSecret, {
      expiresIn: '30d',
    });

    res.cookie(role, token, {
      httpOnly: true,
      secure:process.env.NODE_ENV != 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, 

    });

  } catch (error) {

    console.error('Error generating token:', error);
    throw new Error('Could not generate token');
  }
};

export default generateToken;
