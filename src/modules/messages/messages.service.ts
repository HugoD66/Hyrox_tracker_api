import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertMutualFollow(userAId: string, userBId: string) {
    const [ab, ba] = await Promise.all([
      this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: userAId, followingId: userBId } },
      }),
      this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: userBId, followingId: userAId } },
      }),
    ]);
    if (!ab || !ba) {
      throw new ForbiddenException('You can only message mutual follows');
    }
  }

  async sendMessage(senderId: string, receiverId: string, content: string) {
    await this.assertMutualFollow(senderId, receiverId);
    return this.prisma.message.create({
      data: { senderId, receiverId, content },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  async getConversation(userId: string, otherUserId: string, take = 50, skip = 0) {
    await this.assertMutualFollow(userId, otherUserId);

    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take,
      skip,
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    // Mark received messages as read
    await this.prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: userId, read: false },
      data: { read: true },
    });

    return { success: true, data: messages };
  }

  async getConversations(userId: string) {
    // Get latest message per conversation partner
    const sent = await this.prisma.message.findMany({
      where: { senderId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        receiver: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    const received = await this.prisma.message.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    });

    // Merge and deduplicate by conversation partner
    const convMap = new Map<string, {
      partner: { id: string; firstName: string; lastName: string; avatar: string | null };
      lastMessage: { content: string; createdAt: Date; senderId: string };
      unreadCount: number;
    }>();

    for (const msg of sent) {
      const partner = msg.receiver;
      const existing = convMap.get(partner.id);
      if (!existing || msg.createdAt > existing.lastMessage.createdAt) {
        convMap.set(partner.id, {
          partner,
          lastMessage: { content: msg.content, createdAt: msg.createdAt, senderId: msg.senderId },
          unreadCount: existing?.unreadCount ?? 0,
        });
      }
    }

    for (const msg of received) {
      const partner = msg.sender;
      const existing = convMap.get(partner.id);
      const unread = !msg.read ? 1 : 0;
      if (!existing || msg.createdAt > existing.lastMessage.createdAt) {
        convMap.set(partner.id, {
          partner,
          lastMessage: { content: msg.content, createdAt: msg.createdAt, senderId: msg.senderId },
          unreadCount: (existing?.unreadCount ?? 0) + unread,
        });
      } else if (existing) {
        existing.unreadCount += unread;
      }
    }

    const conversations = Array.from(convMap.values()).sort(
      (a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime(),
    );

    return { success: true, data: conversations };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: { receiverId: userId, read: false },
    });
    return { success: true, data: { count } };
  }
}
