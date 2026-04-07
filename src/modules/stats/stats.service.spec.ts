import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('StatsService', () => {
  let service: StatsService;

  const mockPrismaService = {
    course: {
      findMany: jest.fn(),
    },
    training: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOverview', () => {
    it('should return overview statistics with computed improvement and nextHyrox', async () => {
      const userId = 'u1';
      const latestCourseDate = new Date('2026-01-20T00:00:00.000Z');
      const olderCourseDate = new Date('2025-11-20T00:00:00.000Z');
      const nextCourseDate = new Date('2026-05-20T00:00:00.000Z');

      mockPrismaService.course.findMany
        .mockResolvedValueOnce([
          { id: 'c2', totalTime: 5600, date: latestCourseDate, times: [] },
          { id: 'c1', totalTime: 5400, date: olderCourseDate, times: [] },
        ])
        .mockResolvedValueOnce([{ id: 'c3', date: nextCourseDate }]);
      mockPrismaService.training.findMany.mockResolvedValue([{ id: 't1' }, { id: 't2' }]);

      const result = await service.getOverview(userId);

      expect(result.success).toBe(true);
      expect(result.data.totalCourses).toBe(2);
      expect(result.data.totalTrainings).toBe(2);
      expect(result.data.bestTime).toBe(5400);
      expect(result.data.latestTime).toBe(5600);
      expect(result.data.averageTime).toBe(5500);
      expect(result.data.nextHyrox).toEqual({ id: 'c3', date: nextCourseDate });
      expect(result.data.improvement).toBeCloseTo(((5600 - 5400) / 5400) * 100, 6);
      expect(mockPrismaService.course.findMany).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.training.findMany).toHaveBeenCalledWith({ where: { userId } });
    });

    it('should return null metrics when user has no courses', async () => {
      mockPrismaService.course.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
      mockPrismaService.training.findMany.mockResolvedValue([]);

      const result = await service.getOverview('u1');

      expect(result.data.totalCourses).toBe(0);
      expect(result.data.bestTime).toBeNull();
      expect(result.data.latestTime).toBeNull();
      expect(result.data.averageTime).toBeNull();
      expect(result.data.nextHyrox).toBeNull();
      expect(result.data.improvement).toBeNull();
    });
  });

  describe('getProgression', () => {
    it('should return progression ordered by date asc', async () => {
      const courses = [
        { id: 'c1', name: 'Race 1', date: new Date('2025-01-01T00:00:00.000Z'), totalTime: 5600, category: 'Men' },
      ];
      mockPrismaService.course.findMany.mockResolvedValue(courses);

      const result = await service.getProgression('u1');

      expect(result).toEqual({ success: true, data: courses });
      expect(mockPrismaService.course.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { date: 'asc' },
        select: {
          id: true,
          name: true,
          date: true,
          totalTime: true,
          category: true,
        },
      });
    });
  });

  describe('getStationStats', () => {
    it('should compute best, average, latest and place stats by segment', async () => {
      mockPrismaService.course.findMany.mockResolvedValue([
        {
          id: 'c1',
          date: new Date('2025-01-01T00:00:00.000Z'),
          times: [
            { segment: 'run1', timeSeconds: 120, place: 5 },
            { segment: 'sled', timeSeconds: 180, place: null },
          ],
        },
        {
          id: 'c2',
          date: new Date('2025-02-01T00:00:00.000Z'),
          times: [
            { segment: 'run1', timeSeconds: 110, place: 3 },
            { segment: 'sled', timeSeconds: 200, place: 6 },
          ],
        },
      ]);

      const result = await service.getStationStats('u1');

      expect(result.success).toBe(true);
      expect(result.data.run1).toEqual({
        best: 110,
        average: 115,
        latest: 110,
        bestPlace: 3,
        averagePlace: 4,
      });
      expect(result.data.sled).toEqual({
        best: 180,
        average: 190,
        latest: 200,
        bestPlace: 6,
        averagePlace: 6,
      });
    });

    it('should return an empty object when no course exists', async () => {
      mockPrismaService.course.findMany.mockResolvedValue([]);

      const result = await service.getStationStats('u1');

      expect(result).toEqual({ success: true, data: {} });
    });
  });

  describe('getRoxzoneStats', () => {
    it('should compute roxzone metrics and progression while filtering null values', async () => {
      const d1 = new Date('2025-01-01T00:00:00.000Z');
      const d2 = new Date('2025-02-01T00:00:00.000Z');
      const d3 = new Date('2025-03-01T00:00:00.000Z');

      mockPrismaService.course.findMany.mockResolvedValue([
        { id: 'c1', name: 'Race 1', date: d1, roxzoneTime: 600, runTotal: 2200, bestRunLap: 260 },
        { id: 'c2', name: 'Race 2', date: d2, roxzoneTime: null, runTotal: 2100, bestRunLap: 250 },
        { id: 'c3', name: 'Race 3', date: d3, roxzoneTime: 550, runTotal: null, bestRunLap: null },
      ]);

      const result = await service.getRoxzoneStats('u1');

      expect(result.success).toBe(true);
      expect(result.data.roxzoneTime).toEqual({
        best: 550,
        average: 575,
        latest: 550,
        progression: [
          { date: d1.toISOString(), value: 600 },
          { date: d3.toISOString(), value: 550 },
        ],
      });
      expect(result.data.runTotal).toEqual({
        best: 2100,
        average: 2150,
        latest: 2100,
        progression: [
          { date: d1.toISOString(), value: 2200 },
          { date: d2.toISOString(), value: 2100 },
        ],
      });
      expect(result.data.bestRunLap).toEqual({
        best: 250,
        average: 255,
        latest: 250,
        progression: [
          { date: d1.toISOString(), value: 260 },
          { date: d2.toISOString(), value: 250 },
        ],
      });
    });

    it('should return null metrics and empty progression when no values are present', async () => {
      mockPrismaService.course.findMany.mockResolvedValue([]);

      const result = await service.getRoxzoneStats('u1');

      expect(result.data.roxzoneTime).toEqual({
        best: null,
        average: null,
        latest: null,
        progression: [],
      });
      expect(result.data.runTotal).toEqual({
        best: null,
        average: null,
        latest: null,
        progression: [],
      });
      expect(result.data.bestRunLap).toEqual({
        best: null,
        average: null,
        latest: null,
        progression: [],
      });
    });
  });
});

