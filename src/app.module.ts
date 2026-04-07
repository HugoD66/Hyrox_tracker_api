import { DebugModule } from '@/modules/debug/debug.module';
import { MetricsModule } from '@/modules/metrics/metrics.module';
import { TrainingPresetModule } from '@/modules/training-preset/training-preset.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SentryModule } from '@sentry/nestjs/setup';
import { AuthModule } from './modules/auth/auth.module';
import { CoursesModule } from './modules/courses/courses.module';
import { FollowsModule } from './modules/follows/follows.module';
import { GoalsModule } from './modules/goals/goals.module';
import { HealthModule } from './modules/health/health.module';
import { MessagesModule } from './modules/messages/messages.module';
import { StatsModule } from './modules/stats/stats.module';
import { TrainingsModule } from './modules/trainings/trainings.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

const isDevelopment = process.env.NODE_ENV === 'development';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL || '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
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
    FollowsModule,
    MessagesModule,
    MetricsModule,
    ...(isDevelopment ? [DebugModule] : []),
  ],
})
export class AppModule {}
