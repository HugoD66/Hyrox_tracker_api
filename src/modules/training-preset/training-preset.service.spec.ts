import { Test, TestingModule } from '@nestjs/testing';
import { TrainingPresetService } from './training-preset.service';

describe('TrainingPresetService', () => {
  let service: TrainingPresetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrainingPresetService],
    }).compile();

    service = module.get<TrainingPresetService>(TrainingPresetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
