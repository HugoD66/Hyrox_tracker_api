import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { TrainingsModule } from './modules/trainings/trainings.module';
import { StatsModule } from './modules/stats/stats.module';
import { HealthModule } from './modules/health/health.module';
import { GoalsModule } from './modules/goals/goals.module';
import { TrainingPresetModule } from '@/modules/training-preset/training-preset.module';
import { MetricsModule } from '@/modules/metrics/metrics.module';
import { DebugModule } from '@/modules/debug/debug.module';
import { SentryModule } from '@sentry/nestjs/setup';

const isDevelopment = process.env.NODE_ENV === 'development';

@Module({
  imports: [
    SentryModule.forRoot(),
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '10'),
      },
    ]),
    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    TrainingsModule,
    StatsModule,
    HealthModule,
    GoalsModule,
    TrainingPresetModule,
    MetricsModule,
    ...(isDevelopment ? [DebugModule] : []),
  ],
})
export class AppModule {}
