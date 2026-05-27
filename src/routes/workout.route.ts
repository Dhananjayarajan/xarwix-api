import express from 'express';
import {
  createWorkoutSession,
  deleteWorkoutSession,
  getWorkoutDetails,
  getWorkoutSession,
  getWorkoutSessions,
  updateWorkoutSession,
} from '../controllers/workout.controller';

import { authMiddleware }
from '../middlewares/auth.middleware';

const router =
  express.Router();

router.post(
  '/',
  authMiddleware,
  createWorkoutSession
);

router.get(
  '/',
  authMiddleware,
  getWorkoutSessions
);

router.get(
  '/:id',
  authMiddleware,
  getWorkoutSession
);

router.get(
  '/:id/details',
  authMiddleware,
  getWorkoutDetails
);

router.put(
  '/:id',
  authMiddleware,
  updateWorkoutSession
);

router.delete(
  '/:id',
  authMiddleware,
  deleteWorkoutSession
);

export default router;