import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  userId?: number;
}

export const saveWorkout = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      exerciseName,
      muscleGroup,
      date,
      sets,
    } = req.body;

    if (!exerciseName || !sets?.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data',
      });
    }

    let createdAt: Date | undefined;

    if (date) {
      const parsed = new Date(
        `${date}T00:00:00.000Z`
      );

      if (!isNaN(parsed.getTime())) {
        createdAt = parsed;
      }
    }

    const workout =
      await prisma.workoutSession.create({
        data: {
          userId: req.userId!,
          workoutName: exerciseName,
          ...(createdAt && {
            createdAt,
          }),

          exercises: {
            create: {
              userId: req.userId!,
              muscleGroup,
              exerciseName,

              sets: {
                create: sets.map(
                  (
                    set: {
                      setNumber: number;
                      weight: number;
                      reps: number;
                      difficulty: string;
                    }
                  ) => ({
                    setNumber:
                      set.setNumber,
                    weight:
                      set.weight,
                    reps: set.reps,
                    difficulty:
                      set.difficulty,
                  })
                ),
              },
            },
          },
        },

        include: {
          exercises: {
            include: {
              sets: true,
            },
          },
        },
      });

    return res.status(201).json({
      success: true,
      workout,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        'Failed to save workout',
    });
  }
};


export const getWorkoutLogs =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const workouts =
        await prisma.workoutSession.findMany({
          where: {
            userId: req.userId,
          },

          include: {
            exercises: {
              include: {
                sets: {
                  orderBy: {
                    setNumber:
                      'asc',
                  },
                },
              },
            },
          },

          orderBy: {
            createdAt:
              'desc',
          },
        });

      return res.json({
        success: true,
        workouts,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          'Failed to fetch workouts',
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