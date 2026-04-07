import { Test, TestingModule } from '@nestjs/testing';
import { TrainingDifficulty, TrainingType } from '@prisma/client';
import { TrainingPresetController } from './training-preset.controller';
import { TrainingPresetService } from './training-preset.service';

describe('TrainingPresetController', () => {
  let controller: TrainingPresetController;

  const trainingPresetServiceMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingPresetController],
      providers: [
        {
          provide: TrainingPresetService,
          useValue: trainingPresetServiceMock,
        },
      ],
    }).compile();

    controller = module.get<TrainingPresetController>(TrainingPresetController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should delegate to service with mapped params', async () => {
      const preset = { id: 'preset-1' };
      trainingPresetServiceMock.findOne.mockResolvedValue(preset);

      const result = await controller.findOne('Run', 'novice');

      expect(trainingPresetServiceMock.findOne).toHaveBeenCalledWith({
        type: TrainingType.Run,
        difficulty: TrainingDifficulty.novice,
      });
      expect(result).toEqual(preset);
    });
  });
});
