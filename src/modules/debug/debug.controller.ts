import { Controller, Get } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

@Controller('debug')
export class DebugController
{
  @Get('sentry')
  public async testSentry(): Promise<{ ok: true; eventId: string | null }>
  {
    const error = new Error('Test Sentry from NestJS');
    const eventId = Sentry.captureException(error);

    // Force l'envoi immédiat en environnement de test local.
    await Sentry.flush(2000);

    return {
      ok: true,
      eventId: eventId || null,
    };
  }

  @Get('sentry/throw')
  public testSentryThrow(): string
  {
    throw new Error('Test Sentry from NestJS (throw route)');
  }
}