import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@think5.app";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Demo user already exists:", email);
    return;
  }
  await prisma.user.create({
    data: {
      email,
      name: "デモユーザー",
      passwordHash: await bcrypt.hash("demo1234", 10),
      profile: { create: {} },
    },
  });
  console.log("Created demo user:");
  console.log("  email:    demo@think5.app");
  console.log("  password: demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
