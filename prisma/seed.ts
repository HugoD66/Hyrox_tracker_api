import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database
  await prisma.courseTime.deleteMany();
  await prisma.course.deleteMany();
  await prisma.training.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
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

  console.log('✅ Created demo user:', user.email);

  // Create user settings
  await prisma.userSettings.create({
    data: {
      userId: user.id,
      theme: 'light',
      notifications: true,
      language: 'fr',
    },
  });

  // Create sample course
  const course = await prisma.course.create({
    data: {
      userId: user.id,
      name: 'Hyrox Paris 2024',
      city: 'Paris',
      date: new Date('2024-03-15'),
      category: 'Men',
      totalTime: 5400, // 1h30
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

  // Create sample trainings
  const trainings = await prisma.training.createMany({
    data: [
      {
        userId: user.id,
        type: 'Run',
        date: new Date('2024-01-10'),
        duration: 45,
        distance: 8,
        rpe: 7,
        notes: 'Bon rythme, 5:37/km',
      },
      {
        userId: user.id,
        type: 'Renfo',
        date: new Date('2024-01-12'),
        duration: 60,
        load: 80,
        rpe: 8,
        notes: 'Focus sled push et pull',
      },
      {
        userId: user.id,
        type: 'MixHyrox',
        date: new Date('2024-01-15'),
        duration: 90,
        rpe: 9,
        notes: 'Simulation complète Hyrox',
      },
    ],
  });

  console.log('✅ Created sample trainings:', trainings.count);

  // Create sample goals
  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        title: 'Passer sous 1h25',
        targetTime: 5100,
        targetDate: new Date('2024-06-01'),
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

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Demo credentials:');
  console.log('   Email: demo@hyrox.com');
  console.log('   Password: Demo1234');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


