import { defineRelations } from "drizzle-orm";
import {
  date,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "@/lib/db/auth-schema";

export const submissionStatus = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);

export const game = pgTable("game", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
});

export const gameResult = pgTable(
  "game_result",
  {
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    points: integer("points").notNull(),
    durationMs: integer("duration_ms").notNull(),
  },
  (t) => [primaryKey({ columns: [t.gameId, t.userId] })],
);

export const photo = pgTable("photo", {
  id: uuid("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  objectKey: text("object_key").notNull().unique(),
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
  photoId: uuid("photo_id")
    .notNull()
    .references(() => photo.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  status: submissionStatus("status").notNull().default("pending"),
});

export const round = pgTable(
  "round",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id, { onDelete: "cascade" }),
    photoId: uuid("photo_id")
      .notNull()
      .references(() => photo.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
  },
  (t) => [unique().on(t.gameId, t.photoId, t.number)],
);

export const roundResult = pgTable(
  "round_result",
  {
    roundId: integer("round_id")
      .notNull()
      .references(() => round.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    distance: doublePrecision("distance"),
    points: integer("points"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    durationMs: integer("duration_ms"),
  },
  (t) => [primaryKey({ columns: [t.roundId, t.userId] })],
);

export const relations = defineRelations(
  {
    game,
    gameResult,
    photo,
    report,
    round,
    roundResult,
    user,
  },
  (r) => ({
    game: {
      rounds: r.many.round(),
    },
    gameResult: {
      game: r.one.game({
        from: r.gameResult.gameId,
        to: r.game.id,
      }),
      submittedBy: r.one.user({
        from: r.gameResult.userId,
        to: r.user.id,
      }),
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
      results: r.many.roundResult(),
    },
    roundResult: {
      round: r.one.round({
        from: r.roundResult.roundId,
        to: r.round.id,
      }),
      submittedBy: r.one.user({
        from: r.roundResult.userId,
        to: r.user.id,
      }),
    },
    user: {
      gameResults: r.many.gameResult(),
      photos: r.many.photo(),
      reports: r.many.report(),
      roundResults: r.many.roundResult(),
    },
  }),
);
