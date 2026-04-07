import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    course: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPublicProfileWithStats', () => {
    it('should throw NotFoundException when user is not public or does not exist', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.getPublicProfileWithStats('user-1')).rejects.toThrow(NotFoundException);
    });

    it('should return public user profile with computed stats', async () => {
      const userId = 'user-1';
      const publicUser = {
        id: userId,
        firstName: 'Hugo',
        lastName: 'Martin',
        avatar: null,
        category: 'Men',
      };
      const recentCourses = [
        {
          id: 'course-1',
          name: 'Hyrox Paris',
          city: 'Paris',
          date: new Date('2026-01-01T00:00:00.000Z'),
          totalTime: 5000,
          category: 'Men',
        },
      ];

      mockPrismaService.user.findFirst.mockResolvedValue(publicUser);
      mockPrismaService.course.count.mockResolvedValue(3);
      mockPrismaService.course.aggregate
        .mockResolvedValueOnce({ _sum: { totalTime: 15000 } })
        .mockResolvedValueOnce({ _min: { totalTime: 4600 } });
      mockPrismaService.course.findMany.mockResolvedValue(recentCourses);

      const result = await service.getPublicProfileWithStats(userId);

      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(publicUser);
      expect(result.data.stats).toEqual({
        totalCourses: 3,
        totalDistanceKm: 24,
        totalTimeSeconds: 15000,
        personalBestSeconds: 4600,
      });
      expect(result.data.recentCourses).toEqual(recentCourses);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: userId, isPublic: true } }),
      );
    });
  });

  describe('searchPublicUsers', () => {
    it('should search by query and exclude current user', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      await service.searchPublicUsers('  hu  ', 'current-user');

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isPublic: true,
            NOT: { id: 'current-user' },
            OR: [
              { firstName: { contains: 'hu', mode: 'insensitive' } },
              { lastName: { contains: 'hu', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should return all public users when query is empty', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      await service.searchPublicUsers('   ');

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isPublic: true,
          },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    });

    it('should return the user when found', async () => {
      const user = {
        id: 'user-1',
        email: 'hugo@test.com',
        firstName: 'Hugo',
        lastName: 'Martin',
        category: 'Men',
        weight: 75,
        height: 180,
        avatar: null,
        isPublic: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findById('user-1');

      expect(result).toEqual(user);
    });
  });

  describe('mutations', () => {
    it('should create a user', async () => {
      const payload = {
        email: 'new@test.com',
        password: 'secret',
        firstName: 'New',
        lastName: 'User',
      };
      mockPrismaService.user.create.mockResolvedValue({ id: 'u1', ...payload });

      await service.create(payload);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({ data: payload });
    });

    it('should find by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'u1', email: 'new@test.com' });

      await service.findByEmail('new@test.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'new@test.com' },
      });
    });

    it('should update a user and return success payload', async () => {
      const updatedUser = { id: 'u1', firstName: 'Updated' };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('u1', { firstName: 'Updated' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(result.message).toBe('User updated successfully');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: { firstName: 'Updated' } }),
      );
    });

    it('should remove a user and return success payload', async () => {
      mockPrismaService.user.delete.mockResolvedValue({ id: 'u1' });

      const result = await service.remove('u1');

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
      expect(result).toEqual({ success: true, message: 'User deleted successfully' });
    });
  });
});

