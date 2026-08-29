import { defineRelations } from "drizzle-orm";
import {
  date,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "#/lib/db/auth-schema";

export const submissionStatus = pgEnum("submission_status", [
  "pending",
  "approved",
  "rejected",
]);

export const game = pgTable("game", {
  id: serial("id").primaryKey(),
  date: date("date", { mode: "string" }).notNull().unique(),
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
    points: smallint("points").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.gameId, t.userId] }),
    index("game_result_user_id_idx").on(t.userId),
  ],
);

export const photo = pgTable(
  "photo",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    objectKey: text("object_key").notNull().unique(),
    height: integer("height").notNull(),
    width: integer("width").notNull(),
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
  },
  (t) => [
    index("photo_user_id_idx").on(t.userId),
    index("photo_status_idx").on(t.status),
  ],
);

export const report = pgTable(
  "report",
  {
    id: serial("id").primaryKey(),
    photoId: integer("photo_id")
      .notNull()
      .references(() => photo.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),
    status: submissionStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("report_photo_id_idx").on(t.photoId),
    index("report_user_id_idx").on(t.userId),
    index("report_status_idx").on(t.status),
  ],
);

export const round = pgTable(
  "round",
  {
    id: serial("id").primaryKey(),
    gameId: integer("game_id")
      .notNull()
      .references(() => game.id, { onDelete: "cascade" }),
    photoId: integer("photo_id")
      .notNull()
      .references(() => photo.id, { onDelete: "cascade" }),
    index: smallint("index").notNull(),
  },
  (t) => [
    unique("round_game_id_index_unique").on(t.gameId, t.index),
    unique("round_game_id_photo_id_unique").on(t.gameId, t.photoId),
  ],
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
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    distance: doublePrecision("distance").notNull(),
    points: smallint("points").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.roundId, t.userId] }),
    index("round_result_user_id_idx").on(t.userId),
  ],
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
