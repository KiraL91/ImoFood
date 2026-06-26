import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `scrypt:${salt}:${hash}`;
}

const users = [
  {
    username: "owner",
    password: "owner",
    role: "owner",
    displayName: "Owner",
    email: "owner@imo-meals.local",
  },
  {
    username: "member",
    password: "member",
    role: "member",
    displayName: "Member",
    email: "member@imo-meals.local",
  },
  {
    username: "readonly",
    password: "readonly",
    role: "readonly",
    displayName: "Readonly",
    email: "readonly@imo-meals.local",
  },
];

try {
  for (const user of users) {
    await prisma.appUser.upsert({
      where: {
        username: user.username,
      },
      update: {
        active: true,
        displayName: user.displayName,
        email: user.email,
        passwordHash: hashPassword(user.password),
        role: user.role,
      },
      create: {
        active: true,
        displayName: user.displayName,
        email: user.email,
        passwordHash: hashPassword(user.password),
        role: user.role,
        username: user.username,
      },
    });
  }

  const seededUsersCount = await prisma.appUser.count({
    where: {
      username: {
        in: users.map((user) => user.username),
      },
    },
  });

  console.log(
    `User seed completed. Seed users ${seededUsersCount}/${users.length}. No domain demo data is seeded.`,
  );
} finally {
  await prisma.$disconnect();
}
