-- CreateTable
CREATE TABLE "users" (
                         "id" TEXT NOT NULL,
                         "email" TEXT NOT NULL,
                         "password" TEXT NOT NULL,
                         "firstName" TEXT NOT NULL,
                         "lastName" TEXT NOT NULL,
                         "category" TEXT,
                         "weight" DOUBLE PRECISION,
                         "height" DOUBLE PRECISION,
                         "avatar" TEXT,
                         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         "updatedAt" TIMESTAMP(3) NOT NULL,

                         CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
                           "id" TEXT NOT NULL,
                           "userId" TEXT NOT NULL,
                           "name" TEXT NOT NULL,
                           "city" TEXT NOT NULL,
                           "date" TIMESTAMP(3) NOT NULL,
                           "category" TEXT NOT NULL,
                           "totalTime" INTEGER NOT NULL,
                           "roxzoneTime" INTEGER,
                           "runTotal" INTEGER,
                           "bestRunLap" INTEGER,
                           "notes" TEXT,
                           "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           "updatedAt" TIMESTAMP(3) NOT NULL,

                           CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_times" (
                                "id" TEXT NOT NULL,
                                "courseId" TEXT NOT NULL,
                                "segment" TEXT NOT NULL,
                                "timeSeconds" INTEGER NOT NULL,
                                "place" INTEGER,

                                CONSTRAINT "course_times_pkey" PRIMARY KEY ("id")
);

-- Enums (PostgreSQL) - declare once
CREATE TYPE "TrainingType" AS ENUM (
  'Run',
  'Bike',
  'Swim',
  'Strength',
  'Row',
  'Hike'
);

CREATE TYPE "TrainingFormat" AS ENUM (
  'straight_sets',
  'for_time',
  'amrap',
  'emom',
  'intervals'
);

-- CreateTable
CREATE TABLE "trainings" (
                             "id" TEXT NOT NULL,
                             "userId" TEXT NOT NULL,

                             "type" "TrainingType" NOT NULL,
                             "date" TIMESTAMP(3) NOT NULL,

                             "exerciseName" TEXT,

                             "format" "TrainingFormat",
                             "rounds" INTEGER,

                             "sets" INTEGER,
                             "reps" INTEGER,
                             "weightKg" DOUBLE PRECISION,

                             "durationSeconds" INTEGER,
                             "distanceMeters" INTEGER,

                             "restSeconds" INTEGER,

                             "comment" TEXT,

                             "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             "updatedAt" TIMESTAMP(3) NOT NULL,

                             CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
                         "id" TEXT NOT NULL,
                         "userId" TEXT NOT NULL,
                         "title" TEXT NOT NULL,
                         "targetTime" INTEGER,
                         "targetDate" TIMESTAMP(3),
                         "achieved" BOOLEAN NOT NULL DEFAULT false,
                         "achievedAt" TIMESTAMP(3),
                         "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         "updatedAt" TIMESTAMP(3) NOT NULL,

                         CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
                                 "id" TEXT NOT NULL,
                                 "userId" TEXT NOT NULL,
                                 "theme" TEXT NOT NULL DEFAULT 'light',
                                 "notifications" BOOLEAN NOT NULL DEFAULT true,
                                 "language" TEXT NOT NULL DEFAULT 'fr',
                                 "updatedAt" TIMESTAMP(3) NOT NULL,

                                 CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "courses_userId_idx" ON "courses"("userId");
CREATE INDEX "courses_date_idx" ON "courses"("date");

-- CreateIndex
CREATE INDEX "course_times_courseId_idx" ON "course_times"("courseId");
CREATE UNIQUE INDEX "course_times_courseId_segment_key" ON "course_times"("courseId", "segment");

-- CreateIndex
CREATE INDEX "trainings_userId_date_idx" ON "trainings"("userId", "date");

-- CreateIndex
CREATE INDEX "goals_userId_idx" ON "goals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- AddForeignKey
ALTER TABLE "courses"
    ADD CONSTRAINT "courses_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_times"
    ADD CONSTRAINT "course_times_courseId_fkey"
        FOREIGN KEY ("courseId") REFERENCES "courses"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trainings"
    ADD CONSTRAINT "trainings_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals"
    ADD CONSTRAINT "goals_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings"
    ADD CONSTRAINT "user_settings_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
