import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ example: 'Men', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 75.5, required: false })
  @IsOptional()
  weight?: number;

  @ApiProperty({ example: 180, required: false })
  @IsOptional()
  height?: number;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: false, required: false, description: 'Profil visible par tous' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
