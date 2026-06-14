import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

function getRuntimeDatabaseUrl(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    return undefined;
  }

  try {
    const parsedUrl = new URL(databaseUrl);
    const isSupabaseTransactionPooler =
      parsedUrl.hostname.endsWith(".pooler.supabase.com") &&
      parsedUrl.port === "6543";

    if (!isSupabaseTransactionPooler) {
      return databaseUrl;
    }

    if (!parsedUrl.searchParams.has("pgbouncer")) {
      parsedUrl.searchParams.set("pgbouncer", "true");
    }

    if (!parsedUrl.searchParams.has("connection_limit")) {
      parsedUrl.searchParams.set("connection_limit", "1");
    }

    return parsedUrl.toString();
  } catch {
    return databaseUrl;
  }
}

function getPrismaClientOptions(): Prisma.PrismaClientOptions {
  const runtimeDatabaseUrl = getRuntimeDatabaseUrl();

  if (!runtimeDatabaseUrl) {
    return {};
  }

  return {
    datasources: {
      db: {
        url: runtimeDatabaseUrl,
      },
    },
  };
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super(getPrismaClientOptions());
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
