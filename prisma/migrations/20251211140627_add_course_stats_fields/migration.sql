-- AlterTable
ALTER TABLE "course_times" ADD COLUMN IF NOT EXISTS "place" INTEGER;

-- AlterTable
ALTER TABLE "courses"
    ADD COLUMN IF NOT EXISTS "bestRunLap" INTEGER,
    ADD COLUMN IF NOT EXISTS "roxzoneTime" INTEGER,
    ADD COLUMN IF NOT EXISTS "runTotal" INTEGER;
