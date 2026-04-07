import { ApiProperty } from '@nestjs/swagger';
import { TrainingFormat, TrainingType } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min, IsNumber } from 'class-validator';

export class CreateTrainingDto {
  @ApiProperty({ example: TrainingType.Run, enum: TrainingType })
  @IsEnum(TrainingType)
  type: TrainingType;

  @ApiProperty({ example: '2024-03-15T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Back Squat', required: false })
  @IsOptional()
  @IsString()
  exerciseName?: string;

  @ApiProperty({ example: TrainingFormat.straight_sets, enum: TrainingFormat, required: false })
  @IsOptional()
  @IsEnum(TrainingFormat)
  format?: TrainingFormat;

  @ApiProperty({ example: 5, required: false, description: 'Number of rounds / blocks' })
  @IsOptional()
  @IsInt()
  @Min(0)
  rounds?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sets?: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  reps?: number;

  @ApiProperty({ example: 80, required: false, description: 'Weight in kilograms' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @ApiProperty({ example: 3600, required: false, description: 'Duration in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @ApiProperty({ example: 10500, required: false, description: 'Distance in meters' })
  @IsOptional()
  @IsInt()
  @Min(0)
  distanceMeters?: number;

  @ApiProperty({ example: 90, required: false, description: 'Rest in seconds' })
  @IsOptional()
  @IsInt()
  @Min(0)
  restSeconds?: number;

  @ApiProperty({ example: 'Felt strong today', required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}
