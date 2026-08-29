import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { authRelations } from "#/lib/db/auth-schema";
import { relations } from "#/lib/db/schema";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL as string);

export const db = drizzle({
  client: sql,
  relations: { ...relations, ...authRelations },
});
