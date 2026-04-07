import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { TrainingDifficulty, TrainingType } from '@prisma/client';

@Injectable()
export class TrainingPresetService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(params: { type: TrainingType; difficulty: TrainingDifficulty }) {
    const preset = await this.prismaService.trainingPreset.findUnique({
      where: {
        type_difficulty: {
          type: params.type,
          difficulty: params.difficulty,
        },
      },
    });

    if (!preset) {
      throw new NotFoundException('Training preset not found.');
    }

    return preset;
  }
}
