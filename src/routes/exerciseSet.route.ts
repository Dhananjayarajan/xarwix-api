import express from 'express';

import {
  saveWorkout,
  getWorkoutLogs,
  updateExerciseSet,
  deleteExerciseSet,
} from '../controllers/exerciseSet.controller';

import { authMiddleware }
from '../middlewares/auth.middleware';

const router =
  express.Router();

router.post(
  '/',
  authMiddleware,
  saveWorkout
);

router.get(
  '/',
  authMiddleware,
  getWorkoutLogs
);

router.put(
  '/set/:id',
  authMiddleware,
  updateExerciseSet
);

router.delete(
  '/set/:id',
  authMiddleware,
  deleteExerciseSet
);

export default router;