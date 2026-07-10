import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __luthsPlaygroundPostgresqlPool?: Pool;
};

export const hasDatabase = Boolean(databaseUrl);

export const pool = databaseUrl
  ? globalForDb.__luthsPlaygroundPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    })
  : undefined;

if (process.env.NODE_ENV !== "production" && pool) {
  globalForDb.__luthsPlaygroundPostgresqlPool = pool;
}

export const db = pool ? drizzle(pool) : undefined;
