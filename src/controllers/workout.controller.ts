import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  userId?: number;
}

// CREATE WORKOUT SESSION
export const createWorkoutSession = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { workoutName, date } = req.body;

    // If a date string (YYYY-MM-DD) is provided, parse it as local midnight UTC
    let createdAt: Date | undefined;
    if (date) {
      const parsed = new Date(`${date}T00:00:00.000Z`);
      if (!isNaN(parsed.getTime())) createdAt = parsed;
    }

    const workout = await prisma.workoutSession.create({
      data: {
        userId: req.userId!,
        workoutName: workoutName || null,
        ...(createdAt ? { createdAt } : {}),
      },
    });

    return res.status(201).json({ success: true, workout });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to create workout session' });
  }
};

// GET ALL USER WORKOUTS
export const getWorkoutSessions = async (req: AuthRequest, res: Response) => {
  try {
    const workouts = await prisma.workoutSession.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, workouts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch workouts' });
  }
};

// GET SINGLE WORKOUT
export const getWorkoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const workoutId = Number(req.params.id);
    const workout = await prisma.workoutSession.findFirst({
      where: { id: workoutId, userId: req.userId },
    });
    if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
    return res.json({ success: true, workout });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch workout' });
  }
};

// GET FULL WORKOUT DETAILS
export const getWorkoutDetails = async (req: AuthRequest, res: Response) => {
  try {
    const workoutId = Number(req.params.id);
    const workout = await prisma.workoutSession.findFirst({
      where: { id: workoutId, userId: req.userId },
      include: {
        exercises: {
          include: {
            sets: { orderBy: { setNumber: 'asc' } },
          },
        },
      },
    });
    if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
    return res.json({ success: true, workout });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch workout details' });
  }
};

// UPDATE WORKOUT
export const updateWorkoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const workoutId = Number(req.params.id);
    const { workoutName } = req.body;
    const workout = await prisma.workoutSession.updateMany({
      where: { id: workoutId, userId: req.userId },
      data: { workoutName },
    });
    return res.json({ success: true, workout });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update workout' });
  }
};

// DELETE WORKOUT
export const deleteWorkoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const workoutId = Number(req.params.id);
    const workout = await prisma.workoutSession.findFirst({
      where: { id: workoutId, userId: req.userId },
    });
    if (!workout) return res.status(404).json({ success: false, message: 'Workout not found' });
    await prisma.workoutSession.delete({ where: { id: workoutId } });
    return res.json({ success: true, message: 'Workout deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete workout' });
  }
};