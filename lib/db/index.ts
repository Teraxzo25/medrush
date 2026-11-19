import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & { medrushPool?: Pool };

export const pool = globalForDb.medrushPool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForDb.medrushPool = pool;

export const db = drizzle(pool, { schema });
