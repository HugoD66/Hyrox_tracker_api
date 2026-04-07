import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('follows')
@Controller('follows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':id')
  @ApiOperation({ summary: 'Follow a user' })
  follow(@CurrentUser() user: { userId: string }, @Param('id') targetId: string) {
    return this.followsService.follow(user.userId, targetId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Unfollow a user' })
  unfollow(@CurrentUser() user: { userId: string }, @Param('id') targetId: string) {
    return this.followsService.unfollow(user.userId, targetId);
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Get follow status with a user' })
  getStatus(@CurrentUser() user: { userId: string }, @Param('id') targetId: string) {
    return this.followsService.getStatus(user.userId, targetId);
  }

  @Get('me/followers')
  @ApiOperation({ summary: 'Get my followers' })
  getFollowers(@CurrentUser() user: { userId: string }) {
    return this.followsService.getFollowers(user.userId);
  }

  @Get('me/following')
  @ApiOperation({ summary: 'Get users I follow' })
  getFollowing(@CurrentUser() user: { userId: string }) {
    return this.followsService.getFollowing(user.userId);
  }

  @Get('me/mutual')
  @ApiOperation({ summary: 'Get mutual follows (can message)' })
  getMutual(@CurrentUser() user: { userId: string }) {
    return this.followsService.getMutualFollows(user.userId);
  }

  @Get('me/recent-followers')
  @ApiOperation({ summary: 'Get followers from the last 24h' })
  getRecentFollowers(@CurrentUser() user: { userId: string }) {
    return this.followsService.getRecentFollowers(user.userId);
  }
}
