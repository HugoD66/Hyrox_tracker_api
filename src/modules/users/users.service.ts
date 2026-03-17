import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicProfileWithStats(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isPublic: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        category: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [count, totalTimeAgg, bestTimeAgg, recent] = await Promise.all([
      this.prisma.course.count({ where: { userId } }),
      this.prisma.course.aggregate({ where: { userId }, _sum: { totalTime: true } }),
      this.prisma.course.aggregate({ where: { userId }, _min: { totalTime: true } }),
      this.prisma.course.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          city: true,
          date: true,
          totalTime: true,
          category: true,
        },
      }),
    ]);

    const totalTimeSeconds = totalTimeAgg._sum.totalTime ?? 0;
    const bestTimeSeconds = bestTimeAgg._min.totalTime ?? null;
    // Hyrox standard: 8 km (estimation car la distance n'est pas stockée en base)
    const totalDistanceKm = count * 8;

    return {
      success: true,
      data: {
        user,
        stats: {
          totalCourses: count,
          totalDistanceKm,
          totalTimeSeconds,
          personalBestSeconds: bestTimeSeconds,
        },
        recentCourses: recent,
      },
    };
  }

  async searchPublicUsers(q?: string, excludeUserId?: string) {
    const trimmed = q?.trim();
    const where: any = {
      isPublic: true,
      ...(excludeUserId && { NOT: { id: excludeUserId } }),
    };

    if (trimmed && trimmed.length > 0) {
      where.OR = [
        { firstName: { contains: trimmed, mode: 'insensitive' } },
        { lastName: { contains: trimmed, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      take: 50,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        category: true,
      },
    });

    return {
      success: true,
      data: users,
    };
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    category?: string;
    weight?: number;
    height?: number;
  }) {
    return this.prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        category: true,
        weight: true,
        height: true,
        avatar: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        category: true,
        weight: true,
        height: true,
        avatar: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
  }

  async remove(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
