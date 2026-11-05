import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

// Pool único por processo. A URL vem de DATABASE_URL (.env.local em dev).
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL não definida. Veja .env.example.");
}

const globalForDb = globalThis as unknown as { pool?: pg.Pool };

const pool =
  globalForDb.pool ??
  new pg.Pool({
    connectionString,
    // Supabase exige SSL. rejectUnauthorized: false é aceito aqui por ora; revisar antes do deploy.
    ssl: { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
