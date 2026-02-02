import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  public async onModuleInit(): Promise<void>
  {
    this.logger.log('🔄 Attempting to connect to database...');

    void this.connectWithRetry();
  }

  public async onModuleDestroy(): Promise<void>
  {
    try
    {
      await this.$disconnect();
      this.logger.log('🔌 Disconnected from database');
    }
    catch (error)
    {
      this.logger.warn(`⚠️ Error while disconnecting Prisma: ${this.formatError(error)}`);
    }
  }

  private async connectWithRetry(): Promise<void>
  {
    const maxAttempts = 10;
    const baseDelayMs = 1_000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++)
    {
      try
      {
        await this.connectWithTimeout(5_000);
        this.logger.log('✅ Successfully connected to database');
        return;
      }
      catch (error)
      {
        const message = this.formatError(error);
        this.logger.error(`❌ Database connection attempt ${attempt}/${maxAttempts} failed: ${message}`);

        // backoff simple (1s, 2s, 3s... max 10s)
        const delayMs = Math.min(baseDelayMs * attempt, 10_000);
        this.logger.warn(`⏳ Retrying in ${Math.round(delayMs / 1000)}s...`);

        await this.sleep(delayMs);
      }
    }

    this.logger.warn('⚠️ All database connection attempts failed. App will continue; Prisma will try again on queries.');
  }

  private async connectWithTimeout(timeoutMs: number): Promise<void>
  {
    const timeoutPromise = new Promise<never>((_, reject) =>
    {
      setTimeout(() => reject(new Error(`Database connection timeout after ${timeoutMs}ms`)), timeoutMs);
    });

    await Promise.race([this.$connect(), timeoutPromise]);
  }

  private sleep(ms: number): Promise<void>
  {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private formatError(error: unknown): string
  {
    if (error instanceof Error)
    {
      return error.message;
    }

    try
    {
      return JSON.stringify(error);
    }
    catch
    {
      return String(error);
    }
  }
}
