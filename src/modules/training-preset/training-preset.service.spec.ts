import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { TrainingPresetService } from './training-preset.service';

describe('TrainingPresetService', () => {
  let service: TrainingPresetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingPresetService,
        {
          provide: PrismaService,
          useValue: {
            trainingPreset: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TrainingPresetService>(TrainingPresetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
