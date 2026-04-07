import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
