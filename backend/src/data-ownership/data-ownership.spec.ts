import { NotFoundException } from "@nestjs/common";
import assert from "node:assert/strict";
import test from "node:test";

import { FoodsService } from "../foods/foods.service";
import { MealLogsService } from "../meal-logs/meal-logs.service";
import { PrismaService } from "../prisma/prisma.service";
import { RecipesService } from "../recipes/recipes.service";
import { SymptomLogsService } from "../symptom-logs/symptom-logs.service";
import { TreatmentLogsService } from "../treatments/treatment-logs.service";
import { TreatmentsService } from "../treatments/treatments.service";

const userId = "user-a";
const timestamp = "2026-06-26T10:00:00.000Z";

function asRecord(value: unknown): Record<string, unknown> {
  assert.equal(typeof value, "object");
  assert.notEqual(value, null);

  return value as Record<string, unknown>;
}

function whereFrom(args: unknown): Record<string, unknown> {
  return asRecord(asRecord(args).where);
}

function createMealLogRecord() {
  const date = new Date(timestamp);

  return {
    consumedAt: date,
    createdAt: date,
    description: "Meal",
    foods: [],
    id: "meal-log-id",
    notes: null,
    recipe: null,
    recipeId: null,
    updatedAt: date,
  };
}

test("foods are scoped to the authenticated user", async () => {
  const findFirstArgs: unknown[] = [];
  let deleteCalls = 0;
  let findManyArgs: unknown;
  let updateCalls = 0;
  const prisma = {
    food: {
      delete: async () => {
        deleteCalls += 1;
      },
      findFirst: async (args: unknown) => {
        findFirstArgs.push(args);

        return null;
      },
      findMany: async (args: unknown) => {
        findManyArgs = args;

        return [];
      },
      update: async () => {
        updateCalls += 1;
      },
    },
  };
  const service = new FoodsService(prisma as unknown as PrismaService);

  await service.findAll(userId);
  await assert.rejects(
    () => service.findOne("foreign-food-id", userId),
    NotFoundException,
  );
  await assert.rejects(
    () => service.update("foreign-food-id", { name: "Rice" }, userId),
    NotFoundException,
  );
  await assert.rejects(
    () => service.remove("foreign-food-id", userId),
    NotFoundException,
  );

  assert.equal(whereFrom(findManyArgs).userId, userId);
  assert.equal(
    findFirstArgs.every((args) => whereFrom(args).userId === userId),
    true,
  );
  assert.equal(updateCalls, 0);
  assert.equal(deleteCalls, 0);
});

test("recipes are scoped to the authenticated user", async () => {
  const findFirstArgs: unknown[] = [];
  let deleteCalls = 0;
  let findManyArgs: unknown;
  let updateCalls = 0;
  const prisma = {
    recipe: {
      delete: async () => {
        deleteCalls += 1;
      },
      findFirst: async (args: unknown) => {
        findFirstArgs.push(args);

        return null;
      },
      findMany: async (args: unknown) => {
        findManyArgs = args;

        return [];
      },
      update: async () => {
        updateCalls += 1;
      },
    },
  };
  const service = new RecipesService(prisma as unknown as PrismaService);

  await service.findAll(userId);
  await assert.rejects(
    () => service.findOne("foreign-recipe-id", userId),
    NotFoundException,
  );
  await assert.rejects(
    () => service.update("foreign-recipe-id", { name: "Soup" }, userId),
    NotFoundException,
  );
  await assert.rejects(
    () => service.remove("foreign-recipe-id", userId),
    NotFoundException,
  );

  assert.equal(whereFrom(findManyArgs).userId, userId);
  assert.equal(
    findFirstArgs.every((args) => whereFrom(args).userId === userId),
    true,
  );
  assert.equal(updateCalls, 0);
  assert.equal(deleteCalls, 0);
});

test("treatments are scoped to the authenticated user", async () => {
  const findFirstArgs: unknown[] = [];
  let deleteCalls = 0;
  let findManyArgs: unknown;
  let updateCalls = 0;
  const prisma = {
    treatment: {
      delete: async () => {
        deleteCalls += 1;
      },
      findFirst: async (args: unknown) => {
        findFirstArgs.push(args);

        return null;
      },
      findMany: async (args: unknown) => {
        findManyArgs = args;

        return [];
      },
      update: async () => {
        updateCalls += 1;
      },
    },
  };
  const service = new TreatmentsService(prisma as unknown as PrismaService);

  await service.findAll(userId);
  await assert.rejects(
    () => service.findOne("foreign-treatment-id", userId),
    NotFoundException,
  );
  await assert.rejects(
    () => service.update("foreign-treatment-id", { name: "Protocol" }, userId),
    NotFoundException,
  );
  await assert.rejects(
    () => service.remove("foreign-treatment-id", userId),
    NotFoundException,
  );

  assert.equal(whereFrom(findManyArgs).userId, userId);
  assert.equal(
    findFirstArgs.every((args) => whereFrom(args).userId === userId),
    true,
  );
  assert.equal(updateCalls, 0);
  assert.equal(deleteCalls, 0);
});

test("meal logs cannot link foods or recipes from another user", async () => {
  let createCalls = 0;
  let foodFindManyArgs: unknown;
  let recipeFindFirstArgs: unknown;
  const prisma = {
    food: {
      findMany: async (args: unknown) => {
        foodFindManyArgs = args;

        return [];
      },
    },
    mealLog: {
      create: async () => {
        createCalls += 1;
      },
    },
    recipe: {
      findFirst: async (args: unknown) => {
        recipeFindFirstArgs = args;

        return null;
      },
    },
  };
  const service = new MealLogsService(prisma as unknown as PrismaService);

  await assert.rejects(
    () =>
      service.create(
        {
          consumedAt: timestamp,
          description: "Meal with foreign recipe",
          recipeId: "foreign-recipe-id",
        },
        userId,
      ),
    NotFoundException,
  );
  await assert.rejects(
    () =>
      service.create(
        {
          consumedAt: timestamp,
          description: "Meal with foreign food",
          foodIds: ["foreign-food-id"],
        },
        userId,
      ),
    NotFoundException,
  );

  assert.equal(whereFrom(recipeFindFirstArgs).userId, userId);
  assert.equal(whereFrom(foodFindManyArgs).userId, userId);
  assert.equal(createCalls, 0);
});

test("meal log updates cannot switch to a foreign recipe", async () => {
  let recipeFindFirstArgs: unknown;
  let transactionCalls = 0;
  const prisma = {
    $transaction: async () => {
      transactionCalls += 1;
    },
    mealLog: {
      findFirst: async () => createMealLogRecord(),
    },
    recipe: {
      findFirst: async (args: unknown) => {
        recipeFindFirstArgs = args;

        return null;
      },
    },
  };
  const service = new MealLogsService(prisma as unknown as PrismaService);

  await assert.rejects(
    () =>
      service.update(
        "meal-log-id",
        {
          recipeId: "foreign-recipe-id",
        },
        userId,
      ),
    NotFoundException,
  );

  assert.equal(whereFrom(recipeFindFirstArgs).userId, userId);
  assert.equal(transactionCalls, 0);
});

test("symptom logs cannot link meal logs from another user", async () => {
  let createCalls = 0;
  let mealLogFindFirstArgs: unknown;
  const prisma = {
    mealLog: {
      findFirst: async (args: unknown) => {
        mealLogFindFirstArgs = args;

        return null;
      },
    },
    symptomLog: {
      create: async () => {
        createCalls += 1;
      },
    },
  };
  const service = new SymptomLogsService(prisma as unknown as PrismaService);

  await assert.rejects(
    () =>
      service.create(
        {
          bloating: 1,
          energy: 5,
          gas: 1,
          loggedAt: timestamp,
          mealLogId: "foreign-meal-log-id",
          pain: 1,
          sleep: 5,
          transit: 2,
        },
        userId,
      ),
    NotFoundException,
  );

  assert.equal(whereFrom(mealLogFindFirstArgs).userId, userId);
  assert.equal(createCalls, 0);
});

test("treatment logs cannot link records from another user", async () => {
  let createCalls = 0;
  let mealLogFindFirstArgs: unknown;
  let mealLogExists = false;
  let symptomLogFindFirstArgs: unknown;
  let treatmentFindFirstArgs: unknown;
  let treatmentExists = false;
  const prisma = {
    mealLog: {
      findFirst: async (args: unknown) => {
        mealLogFindFirstArgs = args;

        return mealLogExists ? { id: "meal-log-id" } : null;
      },
    },
    symptomLog: {
      findFirst: async (args: unknown) => {
        symptomLogFindFirstArgs = args;

        return null;
      },
    },
    treatment: {
      findFirst: async (args: unknown) => {
        treatmentFindFirstArgs = args;

        return treatmentExists ? { id: "treatment-id" } : null;
      },
    },
    treatmentLog: {
      create: async () => {
        createCalls += 1;
      },
    },
  };
  const service = new TreatmentLogsService(prisma as unknown as PrismaService);

  await assert.rejects(
    () =>
      service.create(
        {
          takenAt: timestamp,
          treatmentId: "foreign-treatment-id",
        },
        userId,
      ),
    NotFoundException,
  );
  assert.equal(whereFrom(treatmentFindFirstArgs).userId, userId);

  treatmentExists = true;
  await assert.rejects(
    () =>
      service.create(
        {
          relatedMealLogId: "foreign-meal-log-id",
          takenAt: timestamp,
          treatmentId: "treatment-id",
        },
        userId,
      ),
    NotFoundException,
  );
  assert.equal(whereFrom(mealLogFindFirstArgs).userId, userId);

  mealLogExists = true;
  await assert.rejects(
    () =>
      service.create(
        {
          relatedSymptomLogId: "foreign-symptom-log-id",
          takenAt: timestamp,
          treatmentId: "treatment-id",
        },
        userId,
      ),
    NotFoundException,
  );
  assert.equal(whereFrom(symptomLogFindFirstArgs).userId, userId);
  assert.equal(createCalls, 0);
});
