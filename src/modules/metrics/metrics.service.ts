import { Injectable, OnModuleInit } from '@nestjs/common';
import { Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  #registry: Registry;

  constructor() {
    this.#registry = new Registry();
  }

  onModuleInit(): void {
    collectDefaultMetrics({ register: this.#registry });
  }

  async getMetrics(): Promise<string> {
    return this.#registry.metrics();
  }
}
