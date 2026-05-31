import express from 'express';

import {
  saveWorkout,
  getWorkoutLogs,
  updateExerciseSet,
  deleteExerciseSet,
  updateExercise, addSetsToExercise
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

router.put('/exercise/:id', authMiddleware, updateExercise);
router.post('/exercise/:id/sets', authMiddleware, addSetsToExercise);

export default router;