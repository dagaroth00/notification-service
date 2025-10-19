import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Users
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      phone: '1234567890',
      name: 'User One',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      phone: '0987654321',
      name: 'User Two',
    },
  });

  // 2. Create Notification Templates
  const template1 = await prisma.notificationTemplate.create({
    data: {
      name: 'WelcomeTemplate',
      title: 'Welcome!',
      body: 'Thanks for joining us.',
      channel: 'email',
      metadata: {
        templateVersion: '1.0',
        sender: 'Admin',
      },
    },
  });

  const template2 = await prisma.notificationTemplate.create({
    data: {
      name: 'ReminderTemplate',
      title: 'Reminder',
      body: 'Don\'t forget your appointment.',
      channel: 'sms',
    },
  });

  // 3. Create Notifications
  const notification1 = await prisma.notifications.create({
    data: {
      userId: user1.id,
      templateId: template1.id,
      title: 'Welcome!',
      body: 'Thanks for joining us.',
      channel: 'email',
      status: 'sent',
      priority: 'high',
      sentAt: new Date(),
    },
  });

  const notification2 = await prisma.notifications.create({
    data: {
      userId: user2.id,
      templateId: template2.id,
      title: 'Reminder!',
      body: 'Don\'t forget your appointment.',
      channel: 'sms',
      status: 'pending',
    },
  });

  // 4. Create User Preferences
  await prisma.userPreference.createMany({
    data: [
      {
        userId: user1.id,
        channel: 'email',
        enabled: true,
      },
      {
        userId: user1.id,
        channel: 'sms',
        enabled: false,
      },
      {
        userId: user2.id,
        channel: 'sms',
        enabled: true,
      },
    ],
  });

  // 5. Create Device Tokens
  await prisma.deviceToken.createMany({
    data: [
      {
        userId: user1.id,
        token: 'device-token-user1-ios',
        platform: 'iOS',
      },
      {
        userId: user2.id,
        token: 'device-token-user2-android',
        platform: 'Android',
      },
    ],
  });

  // 6. Create Event Logs
  await prisma.eventLog.createMany({
    data: [
      {
        notificationId: notification1.id,
        eventType: 'DELIVERED',
        message: 'Notification delivered via email',
      },
      {
        notificationId: notification2.id,
        eventType: 'QUEUED',
        message: 'Notification queued for sending via SMS',
      },
    ],
  });

  // 7. Create Channel Configs
  await prisma.channelConfig.createMany({
    data: [
      {
        channel: 'email',
        config: {
          smtpServer: 'smtp.example.com',
          port: 587,
        },
      },
      {
        channel: 'sms',
        config: {
          provider: 'Twilio',
          apiKey: 'abc123',
        },
      },
    ],
  });

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
