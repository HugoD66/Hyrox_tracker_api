import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  async create(@Body() createGoalDto: CreateGoalDto, @CurrentUser() user: { userId: string }) {
    return this.goalsService.create(user.userId, createGoalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all goals for current user' })
  @ApiResponse({ status: 200, description: 'Goals retrieved successfully' })
  async findAll(@CurrentUser() user: { userId: string }) {
    return this.goalsService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get goal by ID' })
  @ApiResponse({ status: 200, description: 'Goal retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.goalsService.findOne(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update goal' })
  @ApiResponse({ status: 200, description: 'Goal updated successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.goalsService.update(id, user.userId, updateGoalDto);
  }

  @Patch(':id/achieve')
  @ApiOperation({ summary: 'Mark goal as achieved' })
  @ApiResponse({ status: 200, description: 'Goal marked as achieved' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async markAsAchieved(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.goalsService.markAsAchieved(id, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete goal' })
  @ApiResponse({ status: 200, description: 'Goal deleted successfully' })
  @ApiResponse({ status: 404, description: 'Goal not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.goalsService.remove(id, user.userId);
  }
}
