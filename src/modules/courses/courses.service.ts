import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { ImportCourseDto } from './dto/import-course.dto';
import { CsvParserService } from './csv-parser.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly csvParser: CsvParserService,
  ) {}

  async create(userId: string, createCourseDto: CreateCourseDto) {
    const { times, ...courseData } = createCourseDto;
    const existing = await this.prisma.course.findMany({
      where: {
        name: courseData.name,
        date: courseData.date,
        userId,
      },
    });

    if (existing.length > 0) {
      throw new ConflictException('Course already exists for this user on this date');
    }

    const course = await this.prisma.course.create({
      data: {
        ...courseData,
        userId,
        times: {
          create: times.map((time: { segment: string; timeSeconds: number; place?: number }) => ({
            segment: time.segment,
            timeSeconds: time.timeSeconds,
            place: time.place || null,
          })),
        },
      },
      include: {
        times: true,
      },
    });

    return {
      success: true,
      data: course,
      message: 'Course created successfully',
    };
  }

  async findAll(
    userId: string,
    filters: {
      category?: string;
      sortBy?: 'date' | 'totalTime';
      order?: 'asc' | 'desc';
    },
  ) {
    const courses = await this.prisma.course.findMany({
      where: {
        userId,
        ...(filters.category && { category: filters.category }),
      },
      include: {
        times: true,
      },
      orderBy: {
        [filters.sortBy || 'date']: filters.order || 'desc',
      },
    });

    return {
      success: true,
      data: courses,
    };
  }

  async findOne(id: string, userId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        times: {
          orderBy: {
            segment: 'asc',
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      success: true,
      data: course,
    };
  }

  async update(id: string, userId: string, updateCourseDto: UpdateCourseDto) {
    // Check ownership
    const existingCourse = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      throw new NotFoundException('Course not found');
    }

    if (existingCourse.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const { times, ...courseData } = updateCourseDto;

    // Update course and times
    const course = await this.prisma.course.update({
      where: { id },
      data: {
        ...courseData,
        ...(times && {
          times: {
            deleteMany: {},
            create: times.map((time: { segment: string; timeSeconds: number; place?: number }) => ({
              segment: time.segment,
              timeSeconds: time.timeSeconds,
              place: time.place || null,
            })),
          },
        }),
      },
      include: {
        times: true,
      },
    });

    return {
      success: true,
      data: course,
      message: 'Course updated successfully',
    };
  }

  async remove(id: string, userId: string) {
    // Check ownership
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.course.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Course deleted successfully',
    };
  }

  async importFromHyResult(userId: string, importCourseDto: ImportCourseDto) {
    const { times, sourceUrl, notes, ...courseData } = importCourseDto;

    // Construire les notes en incluant la source si disponible
    let courseNotes = notes;
    if (sourceUrl && !notes) {
      courseNotes = `Importé depuis: ${sourceUrl}`;
    } else if (sourceUrl && notes) {
      courseNotes = `${notes} (Source: ${sourceUrl})`;
    }

    const course = await this.prisma.course.create({
      data: {
        ...courseData,
        userId,
        date: new Date(importCourseDto.date),
        notes: courseNotes || null,
        times:
          times && times.length > 0
            ? {
                create: times.map(
                  (time: { segment: string; timeSeconds: number; place?: number }) => ({
                    segment: time.segment,
                    timeSeconds: time.timeSeconds,
                    place: time.place || null,
                  }),
                ),
              }
            : undefined,
      },
      include: {
        times: true,
      },
    });

    return {
      success: true,
      data: course,
      message: 'Course imported successfully',
    };
  }

  async importFromCsv(userId: string, csvBuffer: Buffer) {
    try {
      const parsedCourses = await this.csvParser.parseHyroxCsv(csvBuffer);

      if (parsedCourses.length === 0) {
        throw new BadRequestException('Aucune course valide trouvée dans le fichier CSV');
      }

      const createdCourses = [];

      for (const courseData of parsedCourses) {
        const { times, ...data } = courseData;
        const course = await this.prisma.course.create({
          data: {
            ...data,
            userId,
            date: new Date(data.date),
            times: times
              ? {
                  create: times.map((time) => ({
                    segment: time.segment,
                    timeSeconds: time.timeSeconds,
                  })),
                }
              : undefined,
          },
          include: {
            times: true,
          },
        });
        createdCourses.push(course);
      }

      return {
        success: true,
        data: createdCourses,
        message: `${createdCourses.length} course(s) importée(s) avec succès depuis results.hyrox.com`,
      };
    } catch (error) {
      throw new BadRequestException(`Erreur lors de l'import CSV: ${error.message}`);
    }
  }
}
