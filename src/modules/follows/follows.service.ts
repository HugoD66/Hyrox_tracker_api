import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const target = await this.prisma.user.findFirst({
      where: { id: followingId, isPublic: true },
    });
    if (!target) {
      throw new NotFoundException('User not found or profile is private');
    }

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (existing) {
      throw new ConflictException('Already following this user');
    }

    await this.prisma.follow.create({ data: { followerId, followingId } });
    return { success: true, message: 'Now following' };
  }

  async unfollow(followerId: string, followingId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    if (!existing) {
      throw new NotFoundException('Not following this user');
    }

    await this.prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { success: true, message: 'Unfollowed' };
  }

  async getStatus(currentUserId: string, targetUserId: string) {
    const [isFollowing, isFollowedBy] = await Promise.all([
      this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: targetUserId } },
      }),
      this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: targetUserId, followingId: currentUserId } },
      }),
    ]);

    return {
      success: true,
      data: {
        isFollowing: !!isFollowing,
        isFollowedBy: !!isFollowedBy,
        isMutual: !!isFollowing && !!isFollowedBy,
      },
    };
  }

  async getFollowers(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: { id: true, firstName: true, lastName: true, avatar: true, category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: follows.map((f) => ({ ...f.follower, followedAt: f.createdAt })),
    };
  }

  async getFollowing(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: { id: true, firstName: true, lastName: true, avatar: true, category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: follows.map((f) => ({ ...f.following, followedAt: f.createdAt })),
    };
  }

  async getMutualFollows(userId: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    const mutuals = await this.prisma.follow.findMany({
      where: { followerId: { in: followingIds }, followingId: userId },
      include: {
        follower: {
          select: { id: true, firstName: true, lastName: true, avatar: true, category: true },
        },
      },
    });

    return {
      success: true,
      data: mutuals.map((f) => f.follower),
    };
  }
}
