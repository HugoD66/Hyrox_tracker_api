import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter
{
  @SentryExceptionCaptured()
  public override catch(exception: unknown, host: ArgumentsHost): void
  {
    super.catch(exception, host);
  }
}