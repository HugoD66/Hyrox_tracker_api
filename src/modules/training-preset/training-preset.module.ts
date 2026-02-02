import { Module } from '@nestjs/common';
import { TrainingPresetService } from './training-preset.service';
import { TrainingPresetController } from './training-preset.controller';

@Module({
  controllers: [TrainingPresetController],
  providers: [TrainingPresetService],
})
export class TrainingPresetModule {}
