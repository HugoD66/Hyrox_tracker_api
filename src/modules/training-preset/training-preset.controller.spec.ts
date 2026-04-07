import { Test, TestingModule } from '@nestjs/testing';
import { TrainingPresetController } from './training-preset.controller';
import { TrainingPresetService } from './training-preset.service';

describe('TrainingPresetController', () => {
  let controller: TrainingPresetController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingPresetController],
      providers: [
        {
          provide: TrainingPresetService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TrainingPresetController>(TrainingPresetController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
