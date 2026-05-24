import jwt from 'jsonwebtoken';

export const generateToken = (
  userId: number
) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    {
      expiresIn:
        (process.env.JWT_EXPIRES_IN ||
          '7d') as jwt.SignOptions['expiresIn'],
    }
  );
};