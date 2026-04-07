import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CsvParserService } from '@/modules/courses/csv-parser.service';
import * as Sentry from '@sentry/nestjs';

jest.mock('@sentry/nestjs', () => ({
  captureException: jest.fn(),
  withScope: jest.fn((callback: (scope: { setTag: jest.Mock; setExtra: jest.Mock }) => void) => {
    callback({ setTag: jest.fn(), setExtra: jest.fn() });
  }),
}));

describe('CoursesService', () => {
  let service: CoursesService;

  const mockPrismaService = {
    course: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        CsvParserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------
  // CREATE
  // ---------------------
  describe('create', () => {
    it('should create a course', async () => {
      const userId = 'user-id';
      const createCourseDto: CreateCourseDto = {
        name: 'Hyrox Paris',
        city: 'Paris',
        date: '2024-03-15',
        category: 'Men',
        totalTime: 5400,
        times: [{ segment: 'run1', timeSeconds: 240 }],
      };
      mockPrismaService.course.findFirst.mockResolvedValue(null);

      const mockCourse = {
        id: 'course-id',
        userId,
        ...createCourseDto,
        times: createCourseDto.times.map((t) => ({ id: 'time-id', courseId: 'course-id', ...t })),
      };

      mockPrismaService.course.create.mockResolvedValue(mockCourse);

      const result = await service.create(userId, createCourseDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
      expect(mockPrismaService.course.create).toHaveBeenCalled();
    });

    it('should throw ConflictException and report to Sentry if course with same name already exists', async () => {
      const userId = 'user-id';
      const createCourseDto: CreateCourseDto = {
        name: 'Hyrox Paris',
        city: 'Paris',
        date: '2024-03-15',
        category: 'Men',
        totalTime: 5400,
        times: [],
      };

      mockPrismaService.course.findFirst.mockResolvedValue({
        id: 'existing-id',
        name: 'Hyrox Paris',
      });

      await expect(service.create(userId, createCourseDto)).rejects.toThrow(ConflictException);
      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should throw error if required fields are missing', async () => {
      // 🔹 Test validation DTO
      const userId = 'user-id';
      const createCourseDto = {
        city: 'Paris',
      } as CreateCourseDto;

      await expect(service.create(userId, createCourseDto)).rejects.toThrow();
    });
  });

  // ---------------------
  // FIND ONE
  // ---------------------
  describe('findOne', () => {
    it('should return a course', async () => {
      const courseId = 'course-id';
      const userId = 'user-id';
      const mockCourse = {
        id: courseId,
        userId,
        name: 'Hyrox Paris',
        times: [],
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);

      const result = await service.findOne(courseId, userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);
      await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockCourse = {
        id: 'course-id',
        userId: 'other-user-id',
        name: 'Hyrox Paris',
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      await expect(service.findOne('course-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });
  });

  // ---------------------
  // REMOVE
  // ---------------------
  describe('remove', () => {
    it('should delete a course', async () => {
      const courseId = 'course-id';
      const userId = 'user-id';
      const mockCourse = {
        id: courseId,
        userId,
        name: 'Hyrox Paris',
      };

      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      mockPrismaService.course.delete.mockResolvedValue(mockCourse);

      const result = await service.remove(courseId, userId);

      expect(result.success).toBe(true);
      expect(mockPrismaService.course.delete).toHaveBeenCalledWith({ where: { id: courseId } });
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrismaService.course.findUnique.mockResolvedValue(null);
      await expect(service.remove('invalid-id', 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockCourse = {
        id: 'course-id',
        userId: 'other-user-id',
        name: 'Hyrox Paris',
      };
      mockPrismaService.course.findUnique.mockResolvedValue(mockCourse);
      await expect(service.remove('course-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });
  });

  // ---------------------
  // ADDITIONAL EDGE CASES
  // ---------------------
  describe('edge cases', () => {
    it('should handle empty times array on create', async () => {
      const userId = 'user-id';
      const createCourseDto: CreateCourseDto = {
        name: 'Hyrox Lyon',
        city: 'Lyon',
        date: '2024-05-01',
        category: 'Women',
        totalTime: 3600,
        times: [],
      };
      mockPrismaService.course.findFirst.mockResolvedValue(null);

      const mockCourse = { id: 'course-id', userId, ...createCourseDto, times: [] };
      mockPrismaService.course.create.mockResolvedValue(mockCourse);

      const result = await service.create(userId, createCourseDto);

      expect(result.data.times).toHaveLength(0);
    });

    it('should throw NotFoundException when removing already deleted course', async () => {
      // 🔹 simule la suppression d’un course déjà supprimé
      mockPrismaService.course.findUnique.mockResolvedValue(null);
      await expect(service.remove('deleted-id', 'user-id')).rejects.toThrow(NotFoundException);
    });
  });
});
