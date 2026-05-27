-- CreateIndex
CREATE INDEX "exercise_sets_exerciseId_idx" ON "exercise_sets"("exerciseId");

-- CreateIndex
CREATE INDEX "exercises_userId_idx" ON "exercises"("userId");

-- CreateIndex
CREATE INDEX "exercises_workoutSessionId_idx" ON "exercises"("workoutSessionId");

-- CreateIndex
CREATE INDEX "workout_sessions_userId_createdAt_idx" ON "workout_sessions"("userId", "createdAt");
