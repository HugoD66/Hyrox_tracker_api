import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get overview statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getOverview(@CurrentUser() user: { userId: string }) {
    return this.statsService.getOverview(user.userId);
  }

  @Get('progression')
  @ApiOperation({ summary: 'Get progression over time' })
  @ApiResponse({ status: 200, description: 'Progression data retrieved successfully' })
  async getProgression(@CurrentUser() user: { userId: string }) {
    return this.statsService.getProgression(user.userId);
  }

  @Get('stations')
  @ApiOperation({ summary: 'Get statistics by station' })
  @ApiResponse({ status: 200, description: 'Station statistics retrieved successfully' })
  async getStationStats(@CurrentUser() user: { userId: string }) {
    return this.statsService.getStationStats(user.userId);
  }

  @Get('roxzone')
  @ApiOperation({ summary: 'Get Roxzone, Run Total and Best Run Lap statistics' })
  @ApiResponse({ status: 200, description: 'Roxzone statistics retrieved successfully' })
  async getRoxzoneStats(@CurrentUser() user: { userId: string }) {
    return this.statsService.getRoxzoneStats(user.userId);
  }
}
