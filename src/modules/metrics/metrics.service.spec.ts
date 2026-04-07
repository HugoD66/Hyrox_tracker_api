import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '@/prisma/prisma.service';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;
  let prisma: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    prisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
    service.onModuleInit();
  });

  it('should expose application, database and HTTP metrics', async () => {
    service.recordHttpRequest('GET', '/api/health/liveness', 200, 0.01);

    const metrics = await service.getMetrics();

    expect(metrics).toContain('hyrox_backend_info');
    expect(metrics).toContain('hyrox_database_up');
    expect(metrics).toContain('http_requests_total');
    expect(metrics).toContain('route="/api/health/liveness"');
  });

  it('should mark the database metric down when the check fails', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('database down'));

    const metrics = await service.getMetrics();

    expect(metrics).toMatch(/hyrox_database_up\{[^}]*\} 0/);
  });
});
