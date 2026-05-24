import express from 'express';
import {
  currentUser,
  login,
  register,
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

export default router;