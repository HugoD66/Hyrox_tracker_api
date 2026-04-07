import { PrismaClient, TrainingType, TrainingFormat } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void>
{
  console.log('🌱 Starting seed...');

  const existingUser = await prisma.user.findUnique({ where: { email: 'demo@hyrox.com' } });
  if (existingUser) {
    console.log('✅ Demo data already exists, skipping seed.');
    return;
  }

  const password = await bcrypt.hash('Demo1234', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@hyrox.com',
      password,
      firstName: 'Demo',
      lastName: 'User',
      category: 'Men',
      weight: 75,
      height: 180,
    },
  });

  await prisma.userSettings.create({
    data: {
      userId: user.id,
      theme: 'light',
      notifications: true,
      language: 'fr',
    },
  });

  const createdCourses = await Promise.all([
    prisma.course.create({
      data: {
        userId: user.id,
        name: 'Hyrox Paris 2024',
        city: 'Paris',
        date: new Date('2024-03-15T00:00:00.000Z'),
        category: 'Men',
        totalTime: 5400,
        roxzoneTime: 1500,
        runTotal: 1985,
        bestRunLap: 240,
        notes: 'Premier Hyrox, bonne performance !',
        times: {
          create: [
            { segment: 'run1', timeSeconds: 240 },
            { segment: 'sledPush', timeSeconds: 180 },
            { segment: 'run2', timeSeconds: 250 },
            { segment: 'sledPull', timeSeconds: 200 },
            { segment: 'run3', timeSeconds: 245 },
            { segment: 'burpeeBroadJump', timeSeconds: 320 },
            { segment: 'run4', timeSeconds: 255 },
            { segment: 'row', timeSeconds: 280 },
            { segment: 'run5', timeSeconds: 260 },
            { segment: 'farmerCarry', timeSeconds: 190 },
            { segment: 'run6', timeSeconds: 250 },
            { segment: 'sandbagLunges', timeSeconds: 300 },
            { segment: 'run7', timeSeconds: 245 },
            { segment: 'wallBalls', timeSeconds: 310 },
            { segment: 'run8', timeSeconds: 240 },
          ],
        },
      },
    }),
    prisma.course.create({
      data: {
        userId: user.id,
        name: 'Hyrox Bruxelles 2024',
        city: 'Bruxelles',
        date: new Date('2024-06-02T00:00:00.000Z'),
        category: 'Men',
        totalTime: 5280,
        roxzoneTime: 1450,
        runTotal: 1940,
        bestRunLap: 236,
        notes: 'Course mieux gérée sur le pacing.',
        times: {
          create: [
            { segment: 'run1', timeSeconds: 236 },
            { segment: 'sledPush', timeSeconds: 175 },
            { segment: 'run2', timeSeconds: 242 },
            { segment: 'sledPull', timeSeconds: 195 },
            { segment: 'run3', timeSeconds: 240 },
            { segment: 'burpeeBroadJump', timeSeconds: 305 },
            { segment: 'run4', timeSeconds: 245 },
            { segment: 'row', timeSeconds: 270 },
            { segment: 'run5', timeSeconds: 248 },
            { segment: 'farmerCarry', timeSeconds: 185 },
            { segment: 'run6', timeSeconds: 245 },
            { segment: 'sandbagLunges', timeSeconds: 292 },
            { segment: 'run7', timeSeconds: 244 },
            { segment: 'wallBalls', timeSeconds: 298 },
            { segment: 'run8', timeSeconds: 240 },
          ],
        },
      },
    }),
    prisma.course.create({
      data: {
        userId: user.id,
        name: 'Hyrox Madrid 2024',
        city: 'Madrid',
        date: new Date('2024-10-12T00:00:00.000Z'),
        category: 'Men',
        totalTime: 5205,
        roxzoneTime: 1415,
        runTotal: 1908,
        bestRunLap: 232,
        notes: 'Bonne progression globale, transitions plus rapides.',
        times: {
          create: [
            { segment: 'run1', timeSeconds: 232 },
            { segment: 'sledPush', timeSeconds: 170 },
            { segment: 'run2', timeSeconds: 238 },
            { segment: 'sledPull', timeSeconds: 188 },
            { segment: 'run3', timeSeconds: 236 },
            { segment: 'burpeeBroadJump', timeSeconds: 298 },
            { segment: 'run4', timeSeconds: 240 },
            { segment: 'row', timeSeconds: 265 },
            { segment: 'run5', timeSeconds: 244 },
            { segment: 'farmerCarry', timeSeconds: 180 },
            { segment: 'run6', timeSeconds: 240 },
            { segment: 'sandbagLunges', timeSeconds: 286 },
            { segment: 'run7', timeSeconds: 242 },
            { segment: 'wallBalls', timeSeconds: 290 },
            { segment: 'run8', timeSeconds: 236 },
          ],
        },
      },
    }),
    prisma.course.create({
      data: {
        userId: user.id,
        name: 'Hyrox Turin 2025',
        city: 'Turin',
        date: new Date('2025-03-08T00:00:00.000Z'),
        category: 'Men',
        totalTime: 5140,
        roxzoneTime: 1390,
        runTotal: 1884,
        bestRunLap: 229,
        notes: 'Nouveau PR sur plusieurs segments.',
        times: {
          create: [
            { segment: 'run1', timeSeconds: 229 },
            { segment: 'sledPush', timeSeconds: 168 },
            { segment: 'run2', timeSeconds: 235 },
            { segment: 'sledPull', timeSeconds: 185 },
            { segment: 'run3', timeSeconds: 233 },
            { segment: 'burpeeBroadJump', timeSeconds: 292 },
            { segment: 'run4', timeSeconds: 238 },
            { segment: 'row', timeSeconds: 260 },
            { segment: 'run5', timeSeconds: 241 },
            { segment: 'farmerCarry', timeSeconds: 178 },
            { segment: 'run6', timeSeconds: 238 },
            { segment: 'sandbagLunges', timeSeconds: 280 },
            { segment: 'run7', timeSeconds: 240 },
            { segment: 'wallBalls', timeSeconds: 285 },
            { segment: 'run8', timeSeconds: 230 },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Created sample courses:', createdCourses.map((c) => c.name).join(', '));

  const trainings = await prisma.training.createMany({
    data: [
      {
        userId: user.id,
        type: TrainingType.Run,
        date: new Date('2024-01-10T00:00:00.000Z'),
        durationSeconds: 45 * 60,
        distanceMeters: 8_000,
        comment: 'Bon rythme, 5:37/km',
        exerciseName: 'Run easy',
      },
      {
        userId: user.id,
        type: TrainingType.Strength,
        date: new Date('2024-01-12T00:00:00.000Z'),
        durationSeconds: 60 * 60,
        weightKg: 80,
        comment: 'Focus sled push et pull',
        exerciseName: 'Sled push & pull',
        format: TrainingFormat.straight_sets,
      },
      {
        userId: user.id,
        type: TrainingType.Strength,
        date: new Date('2024-01-15T00:00:00.000Z'),
        durationSeconds: 90 * 60,
        comment: 'Simulation complète Hyrox',
        exerciseName: 'Hyrox simulation',
        format: TrainingFormat.for_time,
      },
      {
        userId: user.id,
        type: TrainingType.Run,
        date: new Date('2024-01-19T00:00:00.000Z'),
        durationSeconds: 50 * 60,
        distanceMeters: 9_000,
        rounds: 6,
        restSeconds: 90,
        comment: '6x1km allure soutenue, récup 90s',
        exerciseName: 'Run intervals',
        format: TrainingFormat.intervals,
      },
      {
        userId: user.id,
        type: TrainingType.Row,
        date: new Date('2024-01-24T00:00:00.000Z'),
        durationSeconds: 35 * 60,
        distanceMeters: 7_000,
        rounds: 8,
        restSeconds: 60,
        comment: 'Bloc de 8x500m au rameur',
        exerciseName: 'Row intervals',
        format: TrainingFormat.intervals,
      },
      {
        userId: user.id,
        type: TrainingType.Bike,
        date: new Date('2024-01-28T00:00:00.000Z'),
        durationSeconds: 45 * 60,
        rounds: 10,
        restSeconds: 60,
        comment: 'Travail cardio en intervalles',
        exerciseName: 'Bike intervals',
        format: TrainingFormat.intervals,
      },
      {
        userId: user.id,
        type: TrainingType.Strength,
        date: new Date('2024-02-01T00:00:00.000Z'),
        durationSeconds: 50 * 60,
        rounds: 12,
        weightKg: 70,
        comment: 'EMOM orienté jambes et grip',
        exerciseName: 'Lower body EMOM',
        format: TrainingFormat.emom,
      },
      {
        userId: user.id,
        type: TrainingType.Hike,
        date: new Date('2024-02-04T00:00:00.000Z'),
        durationSeconds: 100 * 60,
        weightKg: 8,
        comment: 'Sortie active pour récupération + endurance',
        exerciseName: 'Hike ruck',
      },
    ],
  });

  // 🔧 Training presets (catalogue global)
  await prisma.trainingPreset.createMany({
    data: [
      // -----------------------
      // RUN
      // -----------------------
      {
        type: TrainingType.Run,
        difficulty: 'novice',
        exerciseName: 'Run easy',
        durationSeconds: 30 * 60,
        distanceMeters: 5_000,
        comment: 'Endurance facile (RPE 5/10)',
      },
      {
        type: TrainingType.Run,
        difficulty: 'intermediate',
        exerciseName: 'Tempo run',
        durationSeconds: 45 * 60,
        distanceMeters: 8_000,
        comment: 'Soutenu mais contrôlé (RPE 7/10)',
      },
      {
        type: TrainingType.Run,
        difficulty: 'expert',
        exerciseName: 'Intervals',
        rounds: 6,
        restSeconds: 90,
        comment: '6x800m @ allure 10K, récup 90s',
      },

      // -----------------------
      // BIKE
      // -----------------------
      {
        type: TrainingType.Bike,
        difficulty: 'novice',
        exerciseName: 'Bike easy',
        durationSeconds: 35 * 60,
        comment: 'Cadence facile, zone 2',
      },
      {
        type: TrainingType.Bike,
        difficulty: 'intermediate',
        exerciseName: 'Bike tempo',
        durationSeconds: 50 * 60,
        comment: 'Zone 3, cadence régulière',
      },
      {
        type: TrainingType.Bike,
        difficulty: 'expert',
        exerciseName: 'Bike intervals',
        rounds: 8,
        restSeconds: 60,
        comment: '8x2min fort / 1min easy',
      },

      // -----------------------
      // SWIM
      // -----------------------
      {
        type: TrainingType.Swim,
        difficulty: 'novice',
        exerciseName: 'Swim easy',
        durationSeconds: 30 * 60,
        comment: 'Technique + nage continue facile',
      },
      {
        type: TrainingType.Swim,
        difficulty: 'intermediate',
        exerciseName: 'Swim mixed',
        rounds: 10,
        restSeconds: 30,
        comment: '10x100m, récup 30s (allure stable)',
      },
      {
        type: TrainingType.Swim,
        difficulty: 'expert',
        exerciseName: 'Swim intervals',
        rounds: 12,
        restSeconds: 20,
        comment: '12x100m, récup 20s (allure soutenue)',
      },

      // -----------------------
      // STRENGTH
      // -----------------------
      {
        type: TrainingType.Strength,
        difficulty: 'novice',
        exerciseName: 'Full body basics',
        format: TrainingFormat.straight_sets,
        sets: 3,
        reps: 8,
        comment: 'Mouvements de base, focus technique',
      },
      {
        type: TrainingType.Strength,
        difficulty: 'intermediate',
        exerciseName: 'Strength hypertrophy',
        format: TrainingFormat.straight_sets,
        sets: 4,
        reps: 10,
        comment: 'Charge modérée, tempo contrôlé',
      },
      {
        type: TrainingType.Strength,
        difficulty: 'expert',
        exerciseName: 'Strength for time',
        format: TrainingFormat.for_time,
        rounds: 5,
        comment: '5 rounds for time (squat / push / pull)',
      },

      // -----------------------
      // ROW
      // -----------------------
      {
        type: TrainingType.Row,
        difficulty: 'novice',
        exerciseName: 'Row easy',
        durationSeconds: 20 * 60,
        comment: 'Technique + rythme facile',
      },
      {
        type: TrainingType.Row,
        difficulty: 'intermediate',
        exerciseName: 'Row steady',
        durationSeconds: 30 * 60,
        comment: 'Allure stable, respir. contrôlée',
      },
      {
        type: TrainingType.Row,
        difficulty: 'expert',
        exerciseName: 'Row intervals',
        rounds: 10,
        restSeconds: 60,
        comment: '10x500m fort, récup 60s',
      },

      // -----------------------
      // HIKE
      // -----------------------
      {
        type: TrainingType.Hike,
        difficulty: 'novice',
        exerciseName: 'Hike easy',
        durationSeconds: 45 * 60,
        comment: 'Marche active, terrain facile',
      },
      {
        type: TrainingType.Hike,
        difficulty: 'intermediate',
        exerciseName: 'Hike moderate',
        durationSeconds: 75 * 60,
        comment: 'Dénivelé modéré, allure soutenue',
      },
      {
        type: TrainingType.Hike,
        difficulty: 'expert',
        exerciseName: 'Hike ruck',
        durationSeconds: 90 * 60,
        weightKg: 10,
        comment: 'Ruck avec charge (10kg), dénivelé si possible',
      },
    ],
    skipDuplicates: true,
  });


  console.log('✅ Created sample trainings:', trainings.count);

  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        title: 'Passer sous 1h25',
        targetTime: 5100,
        targetDate: new Date('2024-06-01T00:00:00.000Z'),
        achieved: false,
      },
      {
        userId: user.id,
        title: 'Améliorer le sled push',
        targetTime: 150,
        achieved: false,
      },
    ],
  });

  console.log('✅ Created sample goals');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) =>
  {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () =>
  {
    await prisma.$disconnect();
  });
