-- Migration idempotente : crée l'enum et la table training_presets s'ils n'existent pas.
-- Utile quand la base a été migrée avec une ancienne version de init (sans training_presets).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TrainingDifficulty') THEN
    CREATE TYPE "TrainingDifficulty" AS ENUM ('novice', 'intermediate', 'expert');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "training_presets" (
  "id" TEXT NOT NULL,
  "type" "TrainingType" NOT NULL,
  "difficulty" "TrainingDifficulty" NOT NULL,
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
  CONSTRAINT "training_presets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "training_presets_type_difficulty_key"
  ON "training_presets"("type", "difficulty");

CREATE INDEX IF NOT EXISTS "training_presets_type_difficulty_idx"
  ON "training_presets"("type", "difficulty");
