import { PrismaClient, TrainingType, TrainingFormat } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void>
{
  console.log('🌱 Starting seed...');

  await prisma.courseTime.deleteMany();
  await prisma.course.deleteMany();
  await prisma.training.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();

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

  const course = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Hyrox Paris 2024',
      city: 'Paris',
      date: new Date('2024-03-15T00:00:00.000Z'),
      category: 'Men',
      totalTime: 5400,
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
  });

  console.log('✅ Created sample course:', course.name);

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
    ],
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
