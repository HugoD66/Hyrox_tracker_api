import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsDateString, MinLength, MaxLength } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({ example: 'Passer sous 1h25', description: "Titre de l'objectif" })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    example: 5100,
    description: 'Temps cible en secondes (ex: 1h25 = 5100s)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  targetTime?: number;

  @ApiProperty({ example: '2024-12-31', description: 'Date cible', required: false })
  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
