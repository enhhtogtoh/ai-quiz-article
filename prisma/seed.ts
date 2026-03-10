import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.PRISMA_DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "test@test.com" },
    update: {},
    create: {
      email: "test@test.com",
      name: "Test User",
      clerkId: "user_test123",
    },
  });

  console.log("✅ Test user created:");
  console.log("  id     :", user.id);
  console.log("  clerkId:", user.clerkId);
  console.log("  email  :", user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
