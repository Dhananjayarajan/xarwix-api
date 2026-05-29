import express from 'express';
import {
  currentUser,
  login,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router =
  express.Router();

router.post(
  '/register',
  register
);

router.post(
  '/login',
  login
);

router.get(
  '/me',
  authMiddleware,
  currentUser
);

router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;