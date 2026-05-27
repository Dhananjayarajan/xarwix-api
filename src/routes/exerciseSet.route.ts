import express from 'express';

import {
  createExerciseSet,
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
  createExerciseSet
);

router.put(
  '/:id',
  authMiddleware,
  updateExerciseSet
);

router.delete(
  '/:id',
  authMiddleware,
  deleteExerciseSet
);

export default router;