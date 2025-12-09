import jwt from 'jsonwebtoken';
import { IUserDocument } from '../models/User';

export const generateToken = (user: IUserDocument): string => {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
  };

  const options = {
    expiresIn: process.env.JWT_EXPIRE as string || '7d'
  } as jwt.SignOptions; 

  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    options
  );
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};