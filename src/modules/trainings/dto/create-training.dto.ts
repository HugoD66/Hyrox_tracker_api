import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsDateString, IsOptional, Min, Max } from 'class-validator';

export class CreateTrainingDto {
  @ApiProperty({ example: 'Run' })
  @IsString()
  type: string;

  @ApiProperty({ example: '2024-03-15T10:00:00Z' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: 60, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @ApiProperty({ example: 10.5, required: false })
  @IsOptional()
  distance?: number;

  @ApiProperty({ example: 80, required: false })
  @IsOptional()
  load?: number;

  @ApiProperty({ example: 7, required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  rpe?: number;

  @ApiProperty({ example: 'Felt strong today', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
