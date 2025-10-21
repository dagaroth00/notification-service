import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding initial data...");

  // Create base templates
  await prisma.notificationTemplate.createMany({
    data: [
      {
        name: "welcome",
        title: "Welcome, {{username}}!",
        body: "Hi {{username}}, we're glad to have you on board 🎉",
        channel: "email",
      },
      {
        name: "new_message",
        title: "You have a new message",
        body: "Hey {{username}}, you’ve received a new message from {{sender}}.",
        channel: "in_app",
      },
      {
        name: "password_reset",
        title: "Password Reset Request",
        body: "Hi {{username}}, click here to reset your password: {{link}}",
        channel: "email",
      },
    ],
    skipDuplicates: true,
  });

  // Create default channel configs
  await prisma.channelConfig.createMany({
    data: [
      {
        channel: "email",
        config: {
          provider: "aws_ses",
          region: "us-east-1",
          fromEmail: "no-reply@yourapp.com",
        },
      },
      {
        channel: "push",
        config: {
          provider: "firebase",
          apiKey: "YOUR_FCM_KEY",
        },
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
