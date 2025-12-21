import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@arafims.com";
  // Generate a more secure, random password
  const password = randomUUID().replaceAll("-", "").slice(0, 16);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "admin",
    },
    create: {
      email,
      name: "Admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log(`Admin user created/updated: ${user.email}.`);
  console.log(`IMPORTANT: The password for this user is: ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });