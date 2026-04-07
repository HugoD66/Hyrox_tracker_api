import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

type TimeoutGuard = {
  promise: Promise<never>;
  clear: () => void;
};

@Injectable()
export class MetricsService implements OnModuleInit {
  #registry: Registry;
  #httpRequestsTotal: Counter<string>;
  #httpRequestDurationSeconds: Histogram<string>;
  #httpRequestsInFlight: Gauge<string>;
  #databaseUp: Gauge<string>;
  #databaseCheckDurationSeconds: Gauge<string>;

  constructor(private readonly prisma: PrismaService) {
    this.#registry = new Registry();
    this.#registry.setDefaultLabels({
      app: 'hyrox-tracker-api',
      environment: process.env.NODE_ENV || 'development',
    });

    new Gauge({
      name: 'hyrox_backend_info',
      help: 'Static backend application information.',
      labelNames: ['service', 'node_env'],
      registers: [this.#registry],
    }).set(
      {
        service: 'hyrox-tracker-api',
        node_env: process.env.NODE_ENV || 'development',
      },
      1,
    );

    this.#httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests processed by the API.',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.#registry],
    });

    this.#httpRequestDurationSeconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds.',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.#registry],
    });

    this.#httpRequestsInFlight = new Gauge({
      name: 'http_requests_in_flight',
      help: 'Current number of HTTP requests in flight.',
      labelNames: ['method'],
      registers: [this.#registry],
    });

    this.#databaseUp = new Gauge({
      name: 'hyrox_database_up',
      help: 'Database health status from the latest metrics scrape. 1 means up, 0 means down.',
      registers: [this.#registry],
    });

    this.#databaseCheckDurationSeconds = new Gauge({
      name: 'hyrox_database_check_duration_seconds',
      help: 'Duration of the latest database health check executed during a metrics scrape.',
      registers: [this.#registry],
    });
  }

  onModuleInit(): void {
    collectDefaultMetrics({ register: this.#registry });
  }

  get contentType(): string {
    return this.#registry.contentType;
  }

  incrementHttpRequestsInFlight(method: string): void {
    this.#httpRequestsInFlight.inc({ method });
  }

  decrementHttpRequestsInFlight(method: string): void {
    this.#httpRequestsInFlight.dec({ method });
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    durationSeconds: number,
  ): void {
    const labels = {
      method,
      route,
      status_code: String(statusCode),
    };

    this.#httpRequestsTotal.inc(labels);
    this.#httpRequestDurationSeconds.observe(labels, durationSeconds);
  }

  async getMetrics(): Promise<string> {
    await this.collectDatabaseMetrics();

    return this.#registry.metrics();
  }

  private async collectDatabaseMetrics(): Promise<void> {
    const startedAt = process.hrtime.bigint();
    const timeout = this.createTimeoutGuard(2_000);

    try {
      await Promise.race([this.prisma.$queryRaw`SELECT 1`, timeout.promise]);
      this.#databaseUp.set(1);
    } catch {
      this.#databaseUp.set(0);
    } finally {
      timeout.clear();

      const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1_000_000_000;
      this.#databaseCheckDurationSeconds.set(durationSeconds);
    }
  }

  private createTimeoutGuard(timeoutMs: number): TimeoutGuard {
    let timeout: NodeJS.Timeout | undefined;

    const promise = new Promise<never>((_, reject) => {
      timeout = setTimeout(
        () => reject(new Error(`Database metrics check timeout after ${timeoutMs}ms`)),
        timeoutMs,
      );

      timeout.unref();
    });

    return {
      promise,
      clear: () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      },
    };
  }
}
