import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TrainingsService } from './trainings.service';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';

describe('TrainingsService', () => {
  let service: TrainingsService;

  const mockPrismaService = {
    training: {
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
        TrainingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TrainingsService>(TrainingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a training', async () => {
      const userId = 'user-id';
      const createTrainingDto: CreateTrainingDto = {
        type: 'Run',
        date: '2024-01-10',
        duration: 45,
        distance: 8,
        rpe: 7,
      };

      const mockTraining = {
        id: 'training-id',
        userId,
        ...createTrainingDto,
      };

      mockPrismaService.training.create.mockResolvedValue(mockTraining);

      const result = await service.create(userId, createTrainingDto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTraining);
      expect(mockPrismaService.training.create).toHaveBeenCalledWith({
        data: {
          ...createTrainingDto,
          userId,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a training', async () => {
      const trainingId = 'training-id';
      const userId = 'user-id';
      const mockTraining = {
        id: trainingId,
        userId,
        type: 'Run',
      };

      mockPrismaService.training.findUnique.mockResolvedValue(mockTraining);

      const result = await service.findOne(trainingId, userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTraining);
    });

    it('should throw NotFoundException if training not found', async () => {
      mockPrismaService.training.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id', 'user-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const mockTraining = {
        id: 'training-id',
        userId: 'other-user-id',
        type: 'Run',
      };

      mockPrismaService.training.findUnique.mockResolvedValue(mockTraining);

      await expect(service.findOne('training-id', 'user-id')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a training', async () => {
      const trainingId = 'training-id';
      const userId = 'user-id';
      const mockTraining = {
        id: trainingId,
        userId,
        type: 'Run',
      };

      mockPrismaService.training.findUnique.mockResolvedValue(mockTraining);
      mockPrismaService.training.delete.mockResolvedValue(mockTraining);

      const result = await service.remove(trainingId, userId);

      expect(result.success).toBe(true);
      expect(mockPrismaService.training.delete).toHaveBeenCalledWith({ where: { id: trainingId } });
    });
  });
});
