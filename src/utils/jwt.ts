import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export const generateToken = (payload: {username:string,userId:bigint},expiresIn:string): string => {
  return jwt.sign(payload, config.jwt_secret, { expiresIn });
};

export const verifyToken = (token: string): object | string => {
  return jwt.verify(token, config.jwt_secret);
};
