import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const prisma = new PrismaClient();

const seedTimestamp = new Date("2026-06-10T00:00:00.000Z");

const foods = [
  {
    id: "food-001",
    name: "Arroz blanco",
    category: "Cereal",
    status: "allowed",
    tolerance: 5,
    notes: "Base neutra para comidas simples.",
    tags: ["bajo residuo", "sin gluten", "base"],
  },
  {
    id: "food-002",
    name: "Pechuga de pollo",
    category: "Proteina",
    status: "allowed",
    tolerance: 5,
    notes: "Mejor a la plancha, horno o cocida con poca grasa.",
    tags: ["proteina", "rapido", "salado"],
  },
  {
    id: "food-003",
    name: "Calabacin",
    category: "Verdura",
    status: "testing",
    tolerance: 3,
    notes: "Probar sin piel y en racion pequena.",
    tags: ["verdura", "fase prueba"],
  },
  {
    id: "food-004",
    name: "Huevo",
    category: "Proteina",
    status: "allowed",
    tolerance: 4,
    notes: "Util para desayunos y cenas rapidas.",
    tags: ["proteina", "desayuno"],
  },
  {
    id: "food-005",
    name: "Aguacate",
    category: "Grasa",
    status: "caution",
    tolerance: 2,
    notes: "Puede ser pesado; revisar cantidad y momento del dia.",
    tags: ["grasa", "porcion controlada"],
  },
  {
    id: "food-006",
    name: "Cebolla",
    category: "Verdura",
    status: "avoid",
    tolerance: 1,
    notes: "Alta probabilidad de sintomas en fases restrictivas.",
    tags: ["fodmap", "evitar"],
  },
  {
    id: "food-007",
    name: "Yogur sin lactosa",
    category: "Lacteo",
    status: "testing",
    tolerance: 3,
    notes: "Introducir solo si hay buena tolerancia a lacteos.",
    tags: ["lacteo", "probio"],
  },
  {
    id: "food-008",
    name: "Platano verde",
    category: "Fruta",
    status: "caution",
    tolerance: 2,
    notes: "Mejor en pequena cantidad y no demasiado maduro.",
    tags: ["fruta", "porcion"],
  },
];

for (const food of foods) {
  await prisma.food.upsert({
    where: { id: food.id },
    update: food,
    create: {
      ...food,
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
    },
  });
}

await prisma.$disconnect();
