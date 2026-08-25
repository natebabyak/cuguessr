import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { authRelations } from "@/lib/db/auth-schema";
import { relations } from "@/lib/db/schema";

export const db = drizzle(process.env.DATABASE_URL as string, {
  relations: { ...relations, ...authRelations },
});
