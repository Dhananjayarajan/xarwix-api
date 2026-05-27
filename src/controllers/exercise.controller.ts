import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  userId?: number;
}

// CREATE EXERCISE
export const createExercise = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      workoutSessionId,
      muscleGroup,
      exerciseName,
    } = req.body;

    const workout =
      await prisma.workoutSession.findFirst(
        {
          where: {
            id: workoutSessionId,
            userId: req.userId,
          },
        }
      );

    if (!workout) {
      return res.status(404).json({
        success: false,
        message:
          'Workout session not found',
      });
    }

    const exercise =
      await prisma.exercise.create({
        data: {
          userId: req.userId!,
          workoutSessionId,
          muscleGroup,
          exerciseName,
        },
      });

    return res.status(201).json({
      success: true,
      exercise,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Failed to create exercise',
    });
  }
};

// UPDATE EXERCISE
export const updateExercise =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const exerciseId = Number(
        req.params.id
      );

      const {
        muscleGroup,
        exerciseName,
      } = req.body;

      const exercise =
        await prisma.exercise.findFirst(
          {
            where: {
              id: exerciseId,
              userId:
                req.userId,
            },
          }
        );

      if (!exercise) {
        return res.status(404).json({
          success: false,
          message:
            'Exercise not found',
        });
      }

      const updatedExercise =
        await prisma.exercise.update(
          {
            where: {
              id: exerciseId,
            },
            data: {
              muscleGroup,
              exerciseName,
            },
          }
        );

      return res.json({
        success: true,
        exercise:
          updatedExercise,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to update exercise',
      });
    }
  };

// DELETE EXERCISE
export const deleteExercise =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const exerciseId = Number(
        req.params.id
      );

      const exercise =
        await prisma.exercise.findFirst(
          {
            where: {
              id: exerciseId,
              userId:
                req.userId,
            },
          }
        );

      if (!exercise) {
        return res.status(404).json({
          success: false,
          message:
            'Exercise not found',
        });
      }

      await prisma.exercise.delete({
        where: {
          id: exerciseId,
        },
      });

      return res.json({
        success: true,
        message:
          'Exercise deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to delete exercise',
      });
    }
  };