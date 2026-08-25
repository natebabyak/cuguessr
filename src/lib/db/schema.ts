import { defineRelations, sql } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/db/auth-schema";

export const submissionStatus = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);

export const game = pgTable("game", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 })
    .unique()
    .default(sql`to_char(current_date, 'YYYY-MM-DD')`),
});

export const photo = pgTable("photo", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  objectKey: text("object_key").unique(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  status: submissionStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const report = pgTable("report", {
  id: serial("id").primaryKey(),
  photoId: integer("photo_id")
    .notNull()
    .references(() => photo.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id),
  description: text("description").notNull(),
  status: submissionStatus("status").notNull().default("pending"),
});

export const round = pgTable("round", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id")
    .notNull()
    .references(() => game.id, { onDelete: "cascade" }),
  photoId: integer("photo_id")
    .notNull()
    .references(() => photo.id, { onDelete: "cascade" }),
});

export const score = pgTable(
  "score",
  {
    id: serial("id").primaryKey(),
    roundId: integer("round_id")
      .notNull()
      .references(() => round.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    distance: doublePrecision("distance").notNull(),
    points: integer("points").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique().on(t.roundId, t.userId)],
);

export const relations = defineRelations(
  { game, photo, report, round, score, user },
  (r) => ({
    game: {
      rounds: r.many.round(),
    },
    photo: {
      reports: r.many.report(),
      rounds: r.many.round(),
      submittedBy: r.one.user({
        from: r.photo.userId,
        to: r.user.id,
      }),
    },
    report: {
      photo: r.one.photo({
        from: r.report.photoId,
        to: r.photo.id,
      }),
      submittedBy: r.one.user({
        from: r.report.userId,
        to: r.user.id,
      }),
    },
    round: {
      game: r.one.game({
        from: r.round.gameId,
        to: r.game.id,
      }),
      photo: r.one.photo({
        from: r.round.photoId,
        to: r.photo.id,
      }),
      scores: r.many.score(),
    },
    score: {
      round: r.one.round({
        from: r.score.roundId,
        to: r.round.id,
      }),
      submittedBy: r.one.user({
        from: r.score.userId,
        to: r.user.id,
      }),
    },
    user: {
      photos: r.many.photo(),
      reports: r.many.report(),
      scores: r.many.score(),
    },
  }),
);
