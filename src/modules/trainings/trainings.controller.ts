import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('trainings')
@Controller('trainings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingsController {
  constructor(private readonly trainingsService: TrainingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new training' })
  @ApiResponse({ status: 201, description: 'Training created successfully' })
  async create(
    @Body() createTrainingDto: CreateTrainingDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.trainingsService.create(user.userId, createTrainingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainings for current user' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Trainings retrieved successfully' })
  async findAll(
    @CurrentUser() user: { userId: string },
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.trainingsService.findAll(user.userId, { type, startDate, endDate });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get training by ID' })
  @ApiResponse({ status: 200, description: 'Training retrieved successfully' })
  async findOne(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.trainingsService.findOne(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a training' })
  @ApiResponse({ status: 200, description: 'Training updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateTrainingDto: UpdateTrainingDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.trainingsService.update(id, user.userId, updateTrainingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a training' })
  @ApiResponse({ status: 200, description: 'Training deleted successfully' })
  async remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.trainingsService.remove(id, user.userId);
  }
}
