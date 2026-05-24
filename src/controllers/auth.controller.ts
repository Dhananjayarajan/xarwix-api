import { Request, Response } from 'express';
import prisma from '../config/prisma';
import {
  comparePassword,
  hashPassword,
} from '../utils/hash';
import { generateToken } from '../utils/jwt';

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } =
      req.body;

    if (
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            'Email and password required',
        });
    }

    const existingUser =
      await prisma.user.findUnique(
        {
          where: {
            email,
          },
        }
      );

    if (
      existingUser
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            'User already exists',
        });
    }

    const hashedPassword =
      await hashPassword(
        password
      );

    const user =
      await prisma.user.create(
        {
          data: {
            email,
            password:
              hashedPassword,
          },
        }
      );

    const token =
      generateToken(
        user.id
      );

    return res
      .status(201)
      .json({
        success: true,
        token,
        user: {
          id: user.id,
          email:
            user.email,
          isEmailVerified:
            user.isEmailVerified,
        },
      });
  } catch (error) {
    console.error(
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          'Internal server error',
      });
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