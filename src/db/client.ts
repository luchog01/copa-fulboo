import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Neon URLs require SSL; local Postgres does not
const needsSsl = connectionString.includes(".neon.tech");

// In production (serverless), keep max connections low to avoid exhausting the pool
const isProd = process.env.NODE_ENV === "production";

const globalForDb = globalThis as unknown as { pgClient: ReturnType<typeof postgres> };

function makeClient() {
  return postgres(connectionString, {
    ssl: needsSsl ? "require" : undefined,
    max: isProd ? 1 : 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const client = isProd ? makeClient() : (globalForDb.pgClient ?? makeClient());
if (!isProd) globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
