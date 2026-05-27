import express from 'express';

import {
  createExercise,
  updateExercise,
  deleteExercise,
} from '../controllers/exercise.controller';

import { authMiddleware }
from '../middlewares/auth.middleware';

const router =
  express.Router();

router.post(
  '/',
  authMiddleware,
  createExercise
);

router.put(
  '/:id',
  authMiddleware,
  updateExercise
);

router.delete(
  '/:id',
  authMiddleware,
  deleteExercise
);

export default router;