import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TrainingsService } from './trainings.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingDto } from './dto/update-training.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { TrainingType } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@ApiTags('trainings')
@Controller('trainings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingsController {
  private readonly baseUrl: string = 'https://equipements.sports.gouv.fr/api/explore/v2.1';
  private readonly datasetId: string = 'data-es';

  public constructor(
    private readonly trainingsService: TrainingsService,
    private readonly httpService: HttpService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new training' })
  @ApiResponse({ status: 201, description: 'Training created successfully' })
  async create(
    @Body() createTrainingDto: CreateTrainingDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.trainingsService.create(user.userId, createTrainingDto);
  }


  @Get('training-around')
  @ApiOperation({ summary: 'Get training places (Data ES) filtered by department and/or city' })
  @ApiQuery({ name: 'department', required: false, type: String, example: '66' })
  @ApiQuery({ name: 'city', required: false, type: String, example: 'Perpignan' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Training places found' })
  public async find(
    @Query('department') department?: string,
    @Query('city') city?: string,
    @Query('limit') limit?: string,
  ): Promise<unknown>
  {
    const whereParts: string[] = [];

    if (department)
    {
      whereParts.push(`dep_code="${department}"`);
    }

    if (city)
    {
      // Attention: champ "new_name" dans les données Data ES
      whereParts.push(`new_name="${city}"`);
    }

    const whereClause: string | undefined = whereParts.length > 0 ? whereParts.join(' AND ') : undefined;

    const params: Record<string, string> =
      {
        limit: String(Number(limit ?? 20)),
        select: [
          'equip_nom',
          'equip_type_name',
          'inst_nom',
          'inst_adresse',
          'inst_cp',
          'new_name',
          'dep_code',
          'dep_nom',
          'reg_nom',
          'equip_coordonnees',
        ].join(','),
      };

    if (whereClause)
    {
      params.where = whereClause;
    }

    const url: string = `${this.baseUrl}/catalog/datasets/${this.datasetId}/records`;

    const response: AxiosResponse<Record<string, unknown>> = await firstValueFrom(
      this.httpService.get<Record<string, unknown>>(url, { params }),
    );

    return response.data;
  }

  @Get()
  @ApiOperation({ summary: 'Get all trainings for current user' })
  @ApiQuery({ name: 'type', required: false, enum: TrainingType })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Trainings retrieved successfully' })
  async findAll(
    @CurrentUser() user: { userId: string },
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  )
  {
    return this.trainingsService.findAll(user.userId, {
      type: type ? (type as TrainingType) : undefined,
      startDate,
      endDate,
    });
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
