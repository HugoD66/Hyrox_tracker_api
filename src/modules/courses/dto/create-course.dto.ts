import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsDateString,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class CourseTimeDto {
  @ApiProperty({ example: 'run1' })
  @IsString()
  segment: string;

  @ApiProperty({ example: 240 })
  @IsInt()
  @Min(0)
  timeSeconds: number;

  @ApiProperty({ example: 182, description: 'Position dans ce segment', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  place?: number;
}

export class CreateCourseDto {
  @ApiProperty({ example: 'Hyrox Paris 2024' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  city: string;

  @ApiProperty({ example: '2024-03-15T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Men' })
  @IsString()
  category: string;

  @ApiProperty({ example: 5400 })
  @IsInt()
  @Min(0)
  totalTime: number;

  @ApiProperty({
    example: 347,
    description: 'Temps total des stations (Roxzone Time) en secondes',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  roxzoneTime?: number;

  @ApiProperty({
    example: 2647,
    description: 'Temps total des runs (Run Total) en secondes',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  runTotal?: number;

  @ApiProperty({
    example: 328,
    description: 'Meilleur temps de run (Best Run Lap) en secondes',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  bestRunLap?: number;

  @ApiProperty({ example: 'Great performance!', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [CourseTimeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseTimeDto)
  times: CourseTimeDto[];
}
