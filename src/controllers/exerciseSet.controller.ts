import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  userId?: number;
}

// CREATE SET
export const createExerciseSet =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const {
        exerciseId,
        setNumber,
        weight,
        reps,
        difficulty,
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

      const set =
        await prisma.exerciseSet.create(
          {
            data: {
              exerciseId,
              setNumber,
              weight,
              reps,
              difficulty,
            },
          }
        );

      return res.status(201).json({
        success: true,
        set,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          'Failed to create set',
      });
    }
  };

// UPDATE SET
export const updateExerciseSet =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const setId = Number(
        req.params.id
      );

      const {
        weight,
        reps,
        difficulty,
      } = req.body;

      const set =
        await prisma.exerciseSet.update({
          where: {
            id: setId,
          },
          data: {
            weight,
            reps,
            difficulty,
          },
        });

      return res.json({
        success: true,
        set,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to update set',
      });
    }
  };

// DELETE SET
export const deleteExerciseSet =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const setId = Number(
        req.params.id
      );

      await prisma.exerciseSet.delete({
        where: {
          id: setId,
        },
      });

      return res.json({
        success: true,
        message:
          'Set deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to delete set',
      });
    }
  };