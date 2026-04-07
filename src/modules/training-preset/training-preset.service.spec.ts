import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TrainingDifficulty, TrainingType } from '@prisma/client';
import { TrainingPresetService } from './training-preset.service';
import { PrismaService } from '@/prisma/prisma.service';

describe('TrainingPresetService', () => {
  let service: TrainingPresetService;

  const prismaServiceMock = {
    trainingPreset: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingPresetService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    service = module.get<TrainingPresetService>(TrainingPresetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a preset when found', async () => {
      const preset = {
        id: 'preset-1',
        type: TrainingType.Run,
        difficulty: TrainingDifficulty.novice,
      };
      prismaServiceMock.trainingPreset.findUnique.mockResolvedValue(preset);

      const result = await service.findOne({
        type: TrainingType.Run,
        difficulty: TrainingDifficulty.novice,
      });

      expect(result).toEqual(preset);
      expect(prismaServiceMock.trainingPreset.findUnique).toHaveBeenCalledWith({
        where: {
          type_difficulty: {
            type: TrainingType.Run,
            difficulty: TrainingDifficulty.novice,
          },
        },
      });
    });

    it('should throw NotFoundException when preset does not exist', async () => {
      prismaServiceMock.trainingPreset.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne({
          type: TrainingType.Row,
          difficulty: TrainingDifficulty.expert,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
