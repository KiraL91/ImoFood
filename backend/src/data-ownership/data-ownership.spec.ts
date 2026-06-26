import { NotFoundException } from "@nestjs/common";
import { FoodStatus as PrismaFoodStatus } from "@prisma/client";
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

function createFoodRecord(overrides: Record<string, unknown> = {}) {
  const date = new Date(timestamp);

  return {
    category: "Cereal",
    createdAt: date,
    id: "food-id",
    name: "Rice",
    notes: null,
    preferences: [],
    status: PrismaFoodStatus.allowed,
    suggestedServing: null,
    tags: [],
    tolerance: 5,
    updatedAt: date,
    ...overrides,
  };
}

test("foods are shared and merged with authenticated user preferences", async () => {
  let deleteManyArgs: unknown;
  let findManyArgs: unknown;
  const findUniqueArgs: unknown[] = [];
  let findUniqueOrThrowArgs: unknown;
  let upsertArgs: unknown;
  const prisma = {
    food: {
      findMany: async (args: unknown) => {
        findManyArgs = args;

        return [
          createFoodRecord({
            preferences: [
              {
                notes: "No me sienta bien",
                status: PrismaFoodStatus.avoid,
                tolerance: 1,
              },
            ],
          }),
        ];
      },
      findUnique: async (args: unknown) => {
        findUniqueArgs.push(args);

        return createFoodRecord();
      },
      findUniqueOrThrow: async (args: unknown) => {
        findUniqueOrThrowArgs = args;

        return createFoodRecord({
          preferences: [
            {
              notes: "Probando",
              status: PrismaFoodStatus.testing,
              tolerance: 3,
            },
          ],
        });
      },
    },
    foodPreference: {
      deleteMany: async (args: unknown) => {
        deleteManyArgs = args;
      },
      upsert: async (args: unknown) => {
        upsertArgs = args;
      },
    },
  };
  const service = new FoodsService(prisma as unknown as PrismaService);

  const foods = await service.findAll(userId);
  const updatedFood = await service.updatePreference(
    "food-id",
    {
      notes: "Probando",
      status: "testing",
      tolerance: 3,
    },
    userId,
  );
  const resetFood = await service.resetPreference("food-id", userId);
  const findManyInclude = asRecord(asRecord(findManyArgs).include);
  const findManyPreferences = asRecord(findManyInclude.preferences);
  const findManyPreferenceWhere = asRecord(findManyPreferences.where);
  const preferenceWhere = asRecord(asRecord(upsertArgs).where);
  const preferenceId = asRecord(preferenceWhere.userId_foodId);
  const deleteManyWhere = whereFrom(deleteManyArgs);
  const findUniqueOrThrowInclude = asRecord(
    asRecord(findUniqueOrThrowArgs).include,
  );
  const findUniqueOrThrowPreferences = asRecord(
    findUniqueOrThrowInclude.preferences,
  );
  const findUniqueOrThrowPreferenceWhere = asRecord(
    findUniqueOrThrowPreferences.where,
  );

  assert.equal(foods[0]?.status, "avoid");
  assert.equal(foods[0]?.tolerance, 1);
  assert.equal(foods[0]?.notes, "No me sienta bien");
  assert.equal(Object.hasOwn(whereFrom(findManyArgs), "userId"), false);
  assert.equal(findManyPreferenceWhere.userId, userId);
  assert.equal(whereFrom(findUniqueArgs[0]).id, "food-id");
  assert.equal(preferenceId.foodId, "food-id");
  assert.equal(preferenceId.userId, userId);
  assert.equal(findUniqueOrThrowPreferenceWhere.userId, userId);
  assert.equal(updatedFood.status, "testing");
  assert.equal(updatedFood.tolerance, 3);
  assert.equal(updatedFood.notes, "Probando");
  assert.equal(deleteManyWhere.foodId, "food-id");
  assert.equal(deleteManyWhere.userId, userId);
  assert.equal(resetFood.status, "allowed");
  assert.equal(resetFood.tolerance, 5);
  assert.equal(resetFood.notes, undefined);
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

test("meal logs cannot link recipes from another user but can link shared foods", async () => {
  let createCalls = 0;
  let foodFindManyArgs: unknown;
  let recipeFindFirstArgs: unknown;
  const prisma = {
    food: {
      findMany: async (args: unknown) => {
        foodFindManyArgs = args;

        return [{ id: "shared-food-id" }];
      },
    },
    mealLog: {
      create: async () => {
        createCalls += 1;

        return createMealLogRecord();
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
  await service.create(
    {
      consumedAt: timestamp,
      description: "Meal with shared food",
      foodIds: ["shared-food-id"],
    },
    userId,
  );

  assert.equal(whereFrom(recipeFindFirstArgs).userId, userId);
  assert.equal(Object.hasOwn(whereFrom(foodFindManyArgs), "userId"), false);
  assert.equal(createCalls, 1);
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
