import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TrainingPresetService } from './training-preset.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { TrainingDifficulty, TrainingType } from '@prisma/client';

@ApiTags('training-presets')
@Controller('training-presets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingPresetController
{
  constructor(private readonly trainingPresetService: TrainingPresetService)
  {
  }

  @Get()
  @ApiOperation({ summary: 'Get a training preset by type and difficulty' })
  @ApiQuery({ name: 'type', required: true, enum: TrainingType })
  @ApiQuery({ name: 'difficulty', required: true, enum: TrainingDifficulty })
  @ApiResponse({ status: 200, description: 'Training preset retrieved successfully' })
  async findOne(
    @Query('type') type: string,
    @Query('difficulty') difficulty: string,
  )
  {
    return this.trainingPresetService.findOne({
      type: type as TrainingType,
      difficulty: difficulty as TrainingDifficulty,
    });
  }
}
