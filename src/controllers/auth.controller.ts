import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/prisma';
import {
  comparePassword,
  hashPassword,
} from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerificationToken,
      },
    });

    // Send verification email (non-blocking — don't fail registration if email fails)
    sendVerificationEmail(user.email, emailVerificationToken).catch(console.error);

    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerificationToken: null },
    });

    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to avoid email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetExpiry: expiry },
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const user =
      await prisma.user.findUnique({
        where: { email },
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid credentials',
      });
    }

    const isPasswordValid =
      await comparePassword(
        password,
        user.password
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid credentials',
      });
    }

    const token = generateToken(
      user.id
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username : user.username,
        email: user.email,
        isEmailVerified:
          user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Internal server error',
    });
  }
};

export const currentUser =
  async (
    req: Request & {
      userId?: number;
    },
    res: Response
  ) => {
    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id: req.userId,
          },
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            'User not found',
        });
      }

      return res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          isEmailVerified:
            user.isEmailVerified,
          createdAt:
            user.createdAt,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Internal server error',
      });
    }
  };