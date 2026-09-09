import { drizzle } from "drizzle-orm/neon-http";
import { authRelations } from "./db/auth-schema";
import { relations } from "./db/schema";

export const db = drizzle(process.env.DATABASE_URL as string, {
  relations: { ...relations, ...authRelations },
});
