import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { authRelations } from "#/lib/db/auth-schema.ts";
import { relations } from "#/lib/db/schema.ts";

export const db = drizzle(process.env.DATABASE_URL as string, {
  relations: { ...authRelations, ...relations },
});
