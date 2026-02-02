import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createGoalDto: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
      data: {
        ...createGoalDto,
        userId,
        targetDate: createGoalDto.targetDate ? new Date(createGoalDto.targetDate) : null,
      },
    });

    return {
      success: true,
      data: goal,
      message: 'Goal created successfully',
    };
  }

  async findAll(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: goals,
    };
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new ForbiddenException('You can only access your own goals');
    }

    return {
      success: true,
      data: goal,
    };
  }

  async update(id: string, userId: string, updateGoalDto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new ForbiddenException('You can only update your own goals');
    }

    const updatedGoal = await this.prisma.goal.update({
      where: { id },
      data: {
        ...updateGoalDto,
        targetDate: updateGoalDto.targetDate ? new Date(updateGoalDto.targetDate) : undefined,
      },
    });

    return {
      success: true,
      data: updatedGoal,
      message: 'Goal updated successfully',
    };
  }

  async remove(id: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new ForbiddenException('You can only delete your own goals');
    }

    await this.prisma.goal.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Goal deleted successfully',
    };
  }

  async markAsAchieved(id: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new ForbiddenException('You can only update your own goals');
    }

    const updatedGoal = await this.prisma.goal.update({
      where: { id },
      data: {
        achieved: true,
        achievedAt: new Date(),
      },
    });

    return {
      success: true,
      data: updatedGoal,
      message: 'Goal marked as achieved',
    };
  }
}
