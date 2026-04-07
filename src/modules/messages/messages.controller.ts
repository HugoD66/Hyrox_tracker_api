import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  getConversations(@CurrentUser() user: { userId: string }) {
    return this.messagesService.getConversations(user.userId);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread message count' })
  getUnread(@CurrentUser() user: { userId: string }) {
    return this.messagesService.getUnreadCount(user.userId);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get conversation with a user' })
  getConversation(
    @CurrentUser() user: { userId: string },
    @Param('userId') otherUserId: string,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.messagesService.getConversation(
      user.userId,
      otherUserId,
      take ? parseInt(take) : 50,
      skip ? parseInt(skip) : 0,
    );
  }
}
