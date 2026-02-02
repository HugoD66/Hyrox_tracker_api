import { PartialType } from '@nestjs/swagger';
import { CreateTrainingPresetDto } from './create-training-preset.dto';

export class UpdateTrainingPresetDto extends PartialType(CreateTrainingPresetDto) {}
