import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { userId },
      include: { times: true },
      orderBy: { date: 'desc' },
    });

    const trainings = await this.prisma.training.findMany({
      where: { userId },
    });

    // Calculate statistics
    const bestTime = courses.length > 0 ? Math.min(...courses.map((c) => c.totalTime)) : null;
    const latestTime = courses.length > 0 ? courses[0].totalTime : null;
    const averageTime =
      courses.length > 0
        ? Math.round(courses.reduce((acc, c) => acc + c.totalTime, 0) / courses.length)
        : null;

    // Next Hyrox (upcoming courses)
    const upcomingCourses = await this.prisma.course.findMany({
      where: {
        userId,
        date: {
          gte: new Date(),
        },
      },
      orderBy: { date: 'asc' },
      take: 1,
    });

    return {
      success: true,
      data: {
        totalCourses: courses.length,
        totalTrainings: trainings.length,
        bestTime,
        latestTime,
        averageTime,
        nextHyrox: upcomingCourses[0] || null,
        improvement: bestTime && latestTime ? ((latestTime - bestTime) / bestTime) * 100 : null,
      },
    };
  }

  async getProgression(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        name: true,
        date: true,
        totalTime: true,
        category: true,
      },
    });

    return {
      success: true,
      data: courses,
    };
  }

  async getStationStats(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { userId },
      include: {
        times: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group times by segment
    const stationStats: Record<
      string,
      {
        best: number;
        average: number;
        latest: number;
        bestPlace: number | null;
        averagePlace: number | null;
      }
    > = {};

    courses.forEach((course) => {
      course.times.forEach((time) => {
        if (!stationStats[time.segment]) {
          stationStats[time.segment] = {
            best: time.timeSeconds,
            average: time.timeSeconds,
            latest: time.timeSeconds,
            bestPlace: time.place,
            averagePlace: time.place,
          };
        } else {
          stationStats[time.segment].best = Math.min(
            stationStats[time.segment].best,
            time.timeSeconds,
          );
          // Meilleure place (plus petit nombre = meilleur)
          if (time.place !== null) {
            const currentBestPlace = stationStats[time.segment].bestPlace;
            if (currentBestPlace === null || time.place < currentBestPlace) {
              stationStats[time.segment].bestPlace = time.place;
            }
          }
        }
      });
    });

    // Calculate averages
    Object.keys(stationStats).forEach((segment) => {
      const times = courses.flatMap((course) =>
        course.times.filter((t) => t.segment === segment).map((t) => t.timeSeconds),
      );

      const places = courses.flatMap((course) =>
        course.times.filter((t) => t.segment === segment && t.place !== null).map((t) => t.place!),
      );

      stationStats[segment].average =
        times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

      stationStats[segment].averagePlace =
        places.length > 0 ? Math.round(places.reduce((a, b) => a + b, 0) / places.length) : null;

      // Latest time
      const latestCourse = courses[courses.length - 1];
      const latestTime = latestCourse?.times.find((t) => t.segment === segment);
      stationStats[segment].latest = latestTime?.timeSeconds || 0;
    });

    return {
      success: true,
      data: stationStats,
    };
  }

  async getRoxzoneStats(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: {
        userId,
        OR: [
          { roxzoneTime: { not: null } },
          { runTotal: { not: null } },
          { bestRunLap: { not: null } },
        ],
      },
      select: {
        id: true,
        name: true,
        date: true,
        roxzoneTime: true,
        runTotal: true,
        bestRunLap: true,
      },
      orderBy: { date: 'asc' },
    });

    const roxzoneTimes = courses.map((c) => c.roxzoneTime).filter((t): t is number => t !== null);
    const runTotals = courses.map((c) => c.runTotal).filter((t): t is number => t !== null);
    const bestRunLaps = courses.map((c) => c.bestRunLap).filter((t): t is number => t !== null);

    return {
      success: true,
      data: {
        roxzoneTime: {
          best: roxzoneTimes.length > 0 ? Math.min(...roxzoneTimes) : null,
          average:
            roxzoneTimes.length > 0
              ? Math.round(roxzoneTimes.reduce((a, b) => a + b, 0) / roxzoneTimes.length)
              : null,
          latest: roxzoneTimes.length > 0 ? roxzoneTimes[roxzoneTimes.length - 1] : null,
          progression: courses
            .filter((c) => c.roxzoneTime !== null)
            .map((c) => ({ date: c.date.toISOString(), value: c.roxzoneTime as number })),
        },
        runTotal: {
          best: runTotals.length > 0 ? Math.min(...runTotals) : null,
          average:
            runTotals.length > 0
              ? Math.round(runTotals.reduce((a, b) => a + b, 0) / runTotals.length)
              : null,
          latest: runTotals.length > 0 ? runTotals[runTotals.length - 1] : null,
          progression: courses
            .filter((c) => c.runTotal !== null)
            .map((c) => ({ date: c.date.toISOString(), value: c.runTotal as number })),
        },
        bestRunLap: {
          best: bestRunLaps.length > 0 ? Math.min(...bestRunLaps) : null,
          average:
            bestRunLaps.length > 0
              ? Math.round(bestRunLaps.reduce((a, b) => a + b, 0) / bestRunLaps.length)
              : null,
          latest: bestRunLaps.length > 0 ? bestRunLaps[bestRunLaps.length - 1] : null,
          progression: courses
            .filter((c) => c.bestRunLap !== null)
            .map((c) => ({ date: c.date.toISOString(), value: c.bestRunLap as number })),
        },
      },
    };
  }
}
