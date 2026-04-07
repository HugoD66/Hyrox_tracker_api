import { Test, TestingModule } from '@nestjs/testing';
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
