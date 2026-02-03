import { Module } from '@nestjs/common';
import { TrainingsController } from './trainings.controller';
import { TrainingsService } from './trainings.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [TrainingsController],
  providers: [TrainingsService],
  exports: [TrainingsService],
})
export class TrainingsModule {}
