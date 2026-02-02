import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';

@Injectable()
export class TrainingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createTrainingDto: CreateTrainingDto) {
    const training = await this.prisma.training.create({
      data: {
        ...createTrainingDto,
        userId,
      },
    });

    return {
      success: true,
      data: training,
      message: 'Training created successfully',
    };
  }

  async findAll(
    userId: string,
    filters: {
      type?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const trainings = await this.prisma.training.findMany({
      where: {
        userId,
        ...(filters.type && { type: filters.type }),
        ...(filters.startDate &&
          filters.endDate && {
            date: {
              gte: new Date(filters.startDate),
              lte: new Date(filters.endDate),
            },
          }),
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      success: true,
      data: trainings,
    };
  }

  async findOne(id: string, userId: string) {
    const training = await this.prisma.training.findUnique({
      where: { id },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    if (training.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      success: true,
      data: training,
    };
  }

  async update(id: string, userId: string, updateTrainingDto: UpdateTrainingDto) {
    const existingTraining = await this.prisma.training.findUnique({
      where: { id },
    });

    if (!existingTraining) {
      throw new NotFoundException('Training not found');
    }

    if (existingTraining.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const training = await this.prisma.training.update({
      where: { id },
      data: updateTrainingDto,
    });

    return {
      success: true,
      data: training,
      message: 'Training updated successfully',
    };
  }

  async remove(id: string, userId: string) {
    const training = await this.prisma.training.findUnique({
      where: { id },
    });

    if (!training) {
      throw new NotFoundException('Training not found');
    }

    if (training.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.training.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Training deleted successfully',
    };
  }
}
