import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class SegmentTimeDto {
  @ApiProperty({ example: 'run1', description: 'Nom du segment' })
  @IsString()
  segment: string;

  @ApiProperty({ example: 240, description: 'Temps en secondes' })
  @IsInt()
  timeSeconds: number;

  @ApiProperty({ example: 182, description: 'Position dans ce segment', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  place?: number;
}

export class ImportCourseDto {
  @ApiProperty({ example: 'Hyrox Paris 2024', description: 'Nom de la course' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Paris', description: 'Ville de la course' })
  @IsString()
  city: string;

  @ApiProperty({ example: '2024-03-15', description: 'Date de la course' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 'Men', description: 'Catégorie' })
  @IsString()
  category: string;

  @ApiProperty({ example: 5400, description: 'Temps total en secondes' })
  @IsInt()
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

  @ApiProperty({
    example: [
      { segment: 'run1', timeSeconds: 240 },
      { segment: 'sledPush', timeSeconds: 180 },
    ],
    description: 'Temps par segment',
    type: [SegmentTimeDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SegmentTimeDto)
  times?: SegmentTimeDto[];

  @ApiProperty({
    example: 'https://results.hyrox.com/race/123',
    description: 'Lien vers le résultat (results.hyrox.com ou hyresult.com)',
    required: false,
  })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiProperty({
    example: 'results.hyrox.com',
    description: "Source de l'import (results.hyrox.com, hyresult.com, manual)",
    required: false,
    default: 'manual',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiProperty({
    example: 'Position: 45/200',
    description: 'Notes additionnelles',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
