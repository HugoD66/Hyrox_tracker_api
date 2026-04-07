import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('GoalsService', () => {
  let service: GoalsService;

  const mockPrismaService = {
    goal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a goal and convert targetDate to Date', async () => {
      const dto = { title: 'Sub 1h20', targetTime: 4800, targetDate: '2026-12-31' };
      mockPrismaService.goal.create.mockResolvedValue({ id: 'g1', userId: 'u1', ...dto });

      const result = await service.create('u1', dto);

      expect(result.success).toBe(true);
      expect(mockPrismaService.goal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'u1',
            targetDate: new Date('2026-12-31'),
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return user goals ordered by createdAt desc', async () => {
      mockPrismaService.goal.findMany.mockResolvedValue([]);

      const result = await service.findAll('u1');

      expect(result).toEqual({ success: true, data: [] });
      expect(mockPrismaService.goal.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when goal is missing', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue(null);

      await expect(service.findOne('g1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when goal does not belong to user', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'other-user' });

      await expect(service.findOne('g1', 'u1')).rejects.toThrow(ForbiddenException);
    });

    it('should return goal when found and owned by user', async () => {
      const goal = { id: 'g1', userId: 'u1', title: 'Goal' };
      mockPrismaService.goal.findUnique.mockResolvedValue(goal);

      const result = await service.findOne('g1', 'u1');

      expect(result).toEqual({ success: true, data: goal });
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when goal is missing', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue(null);

      await expect(service.update('g1', 'u1', { title: 'Updated' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when goal does not belong to user', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'other-user' });

      await expect(service.update('g1', 'u1', { title: 'Updated' })).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should update goal and convert targetDate to Date when provided', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'u1' });
      const updatedGoal = { id: 'g1', userId: 'u1', title: 'Updated' };
      mockPrismaService.goal.update.mockResolvedValue(updatedGoal);

      const result = await service.update('g1', 'u1', {
        title: 'Updated',
        targetDate: '2026-10-10',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedGoal);
      expect(mockPrismaService.goal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'g1' },
          data: expect.objectContaining({ targetDate: new Date('2026-10-10') }),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException when goal is missing', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue(null);

      await expect(service.remove('g1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when goal does not belong to user', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'other-user' });

      await expect(service.remove('g1', 'u1')).rejects.toThrow(ForbiddenException);
    });

    it('should delete goal when owned by user', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'u1' });
      mockPrismaService.goal.delete.mockResolvedValue({ id: 'g1' });

      const result = await service.remove('g1', 'u1');

      expect(mockPrismaService.goal.delete).toHaveBeenCalledWith({ where: { id: 'g1' } });
      expect(result).toEqual({ success: true, message: 'Goal deleted successfully' });
    });
  });

  describe('markAsAchieved', () => {
    it('should throw NotFoundException when goal is missing', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue(null);

      await expect(service.markAsAchieved('g1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when goal does not belong to user', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'other-user' });

      await expect(service.markAsAchieved('g1', 'u1')).rejects.toThrow(ForbiddenException);
    });

    it('should mark goal as achieved for owner', async () => {
      mockPrismaService.goal.findUnique.mockResolvedValue({ id: 'g1', userId: 'u1' });
      const updatedGoal = { id: 'g1', userId: 'u1', achieved: true };
      mockPrismaService.goal.update.mockResolvedValue(updatedGoal);

      const result = await service.markAsAchieved('g1', 'u1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedGoal);
      expect(mockPrismaService.goal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'g1' },
          data: expect.objectContaining({ achieved: true, achievedAt: expect.any(Date) }),
        }),
      );
    });
  });
});
