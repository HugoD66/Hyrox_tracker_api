-- AlterTable
ALTER TABLE "course_times" ADD COLUMN     "place" INTEGER;

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "bestRunLap" INTEGER,
ADD COLUMN     "roxzoneTime" INTEGER,
ADD COLUMN     "runTotal" INTEGER;
