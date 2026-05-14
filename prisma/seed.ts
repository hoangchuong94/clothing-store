import { UserRole } from '../src/generated/prisma/client';
import prisma from '../src/lib/server/prisma/prisma';

async function main() {
  const roles = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.STAFF,
    UserRole.SELLER,
    UserRole.CUSTOMER,
  ];

  await Promise.all(
    roles.map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  console.log(`Seeded roles: ${roles.join(', ')}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
