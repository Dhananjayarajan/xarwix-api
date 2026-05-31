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
    console.time('saveWorkout');

    const {
      exerciseName,
      muscleGroup,
      date,
      sets,
      equipment
    } = req.body;

    let createdAt: Date | undefined;

    if (date) {
      const parsed = new Date(
        `${date}T00:00:00.000Z`
      );

      if (!isNaN(parsed.getTime())) {
        createdAt = parsed;
      }
    }

    console.time('db-create');

    const workout =
await prisma.workoutSession.create({
  data: {
    userId: req.userId!,
    workoutName:
      exerciseName,

    ...(createdAt && {
      createdAt,
    }),

    exercises: {
      create: {
        userId:
          req.userId!,
        muscleGroup,
        exerciseName,
equipment: equipment ?? 'BARBELL', 
        sets: {
          create: sets,
        },
      },
    },
  },
});

return res.status(201).json({
  success: true,
});

    console.timeEnd(
      'db-create'
    );

    console.timeEnd(
      'saveWorkout'
    );

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


export const getWorkoutLogs = async (req: AuthRequest, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(String(req.query.page  ?? 1)));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? 10))));
    const skip  = (page - 1) * limit;

    const [workouts, total] = await Promise.all([
      prisma.workoutSession.findMany({
        where:   { userId: req.userId },
        include: {
          exercises: {
            include: { sets: { orderBy: { setNumber: 'asc' } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.workoutSession.count({ where: { userId: req.userId } }),
    ]);

    return res.json({
      success: true,
      workouts,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch workouts' });
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

  // EDIT EXERCISE (name, muscleGroup, equipment)
export const updateExercise = async (req: AuthRequest, res: Response) => {
  try {
    const exerciseId = Number(req.params.id);
    const { exerciseName, muscleGroup, equipment } = req.body;

    const exercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: { exerciseName, muscleGroup, equipment },
    });

    return res.json({ success: true, exercise });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update exercise' });
  }
};

// ADD SETS TO EXISTING EXERCISE
export const addSetsToExercise = async (req: AuthRequest, res: Response) => {
  try {
    const exerciseId = Number(req.params.id);
    const { sets } = req.body; // [{ setNumber, weight, reps, difficulty }]

    await prisma.exerciseSet.createMany({
      data: sets.map((s: any) => ({ ...s, exerciseId })),
    });

    return res.status(201).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add sets' });
  }
};