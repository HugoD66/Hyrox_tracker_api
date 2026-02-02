import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ImportCourseDto } from './dto/import-course.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: { userId: string }) {
    return this.coursesService.create(user.userId, createCourseDto);
  }

  // Routes d'import - IMPORTANT: Les routes plus spécifiques doivent être avant les routes plus générales
  @Post('import/csv')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import courses from CSV file (results.hyrox.com export)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file exported from results.hyrox.com',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Courses imported successfully from CSV' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid CSV file' })
  async importFromCsv(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string } | undefined,
    @CurrentUser() user: { userId: string },
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    if (!file.mimetype.includes('csv') && !file.originalname.endsWith('.csv')) {
      throw new Error('File must be a CSV file');
    }

    return this.coursesService.importFromCsv(user.userId, file.buffer);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import a course from HyResult or external source (manual data)' })
  @ApiResponse({ status: 201, description: 'Course imported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async importFromHyResult(
    @Body() importCourseDto: ImportCourseDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.coursesService.importFromHyResult(user.userId, importCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses for current user' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['date', 'totalTime'] })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async findAll(
    @CurrentUser() user: { userId: string },
    @Query('category') category?: string,
    @Query('sortBy') sortBy: 'date' | 'totalTime' = 'date',
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    return this.coursesService.findAll(user.userId, { category, sortBy, order });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.coursesService.findOne(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.coursesService.update(id, user.userId, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a course' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.coursesService.remove(id, user.userId);
  }
}
