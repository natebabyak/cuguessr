import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  mock,
  setSystemTime,
  test,
} from "bun:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { betterAuth } from "better-auth";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import * as authSchema from "../src/db/auth-schema";
import * as schema from "../src/db/schema";

// Opt in with `bun run test:integration`. Only a disposable, local database is used.
const integration = process.env.CUGUESSR_TEST_POSTGRES === "1" ? describe : describe.skip;

integration("account linking and daily play in PostgreSQL", () => {
  let containerId;
  let pool;
  let db;
  let auth;
  let submitGuess;
  let getRoundResults;
  let getDailyLeaderboard;
  let getUserStreaks;
  let submitReport;
  let onLinkAccount;
  let admin;
  let getHomePhotos;
  let getGame;

  beforeAll(async () => {
    containerId = execFileSync(
      "docker",
      [
        "run",
        "--rm",
        "--detach",
        "--pull=never",
        "--publish",
        "127.0.0.1::5432",
        "--tmpfs",
        "/var/lib/postgresql",
        "--env",
        "POSTGRES_PASSWORD=cuguessr-test-only",
        "--env",
        "POSTGRES_DB=cuguessr_test",
        "postgres:18-alpine",
      ],
      { encoding: "utf8" },
    ).trim();
    const port = execFileSync("docker", ["port", containerId, "5432/tcp"], { encoding: "utf8" })
      .trim()
      .split(":")
      .at(-1);
    pool = new Pool({
      connectionString: `postgresql://postgres:cuguessr-test-only@127.0.0.1:${port}/cuguessr_test`,
      connectionTimeoutMillis: 1000,
    });
    for (let attempt = 0; ; attempt++) {
      try {
        await pool.query("SELECT 1");
        break;
      } catch (error) {
        if (attempt >= 50) throw error;
        await Bun.sleep(100);
      }
    }
    db = drizzle({ client: pool, relations: { ...schema.relations, ...authSchema.authRelations } });
    const { pushSchema } = await import("drizzle-kit/api-postgres");
    // Better Auth owns its schema; product migrations start at the NAT-326 baseline.
    const authMigration = await pushSchema(authSchema, db);
    await authMigration.apply();
    await migrate(db, { migrationsFolder: "./drizzle" });

    mock.module("../src/db/index", () => ({ db }));
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    process.env.BETTER_AUTH_SECRET = "isolated-test-secret-with-at-least-thirty-two-characters";
    const { auth: appAuth } = await import("../src/lib/auth");
    // Exercise the real linking hook without delivering OTP emails from tests.
    auth = betterAuth({ ...appAuth.options, emailAndPassword: { enabled: true } });
    onLinkAccount = auth.options.plugins.find((plugin) => plugin.id === "anonymous").options
      .onLinkAccount;
    ({ submitGuess, getRoundResults } = await import("../src/lib/round-results.server"));
    ({ getDailyLeaderboard, getUserStreaks } = await import("../src/lib/game-results.server"));
    ({ submitReport } = await import("../src/lib/reports.server"));
    admin = await import("../src/lib/admin.server");
    ({ getHomePhotos } = await import("../src/lib/photos.server"));
    ({ getGame } = await import("../src/lib/game.server"));
  }, 30000);

  afterAll(async () => {
    mock.restore();
    await pool?.end();
    if (containerId) execFileSync("docker", ["rm", "--force", containerId], { stdio: "ignore" });
  });

  afterEach(() => {
    setSystemTime();
  });

  beforeEach(async () => {
    await pool.query(
      'TRUNCATE "user", game, photo, report, round, round_result, game_result RESTART IDENTITY CASCADE',
    );
  });

  async function authenticate(path, body = {}, cookie) {
    const response = await auth.handler(
      new Request(`http://localhost:3000/api/auth/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: JSON.stringify(body),
      }),
    );
    const result = await response.json();
    expect(response.status, JSON.stringify(result)).toBe(200);
    const cookies = response.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    return { user: result.user, cookie: cookies };
  }

  async function seedGame(ownerId, date = "2026-09-09") {
    const [game] = await db.insert(schema.game).values({ date }).returning();
    const photos = await db
      .insert(schema.photo)
      .values(
        Array.from({ length: 5 }, (_, index) => ({
          objectKey: `photo-${game.id}-${index}`,
          userId: ownerId,
          height: 600,
          width: 800,
          latitude: 45.3866786,
          longitude: -75.697256,
          status: "approved",
        })),
      )
      .returning();
    const rounds = await db
      .insert(schema.round)
      .values(photos.map((photo, index) => ({ gameId: game.id, photoId: photo.id, index })))
      .returning();
    return { game, rounds, photos };
  }

  function perfectGuess(round, photo) {
    return { roundId: round.id, latitude: photo.latitude, longitude: photo.longitude };
  }

  async function completeGame(userId, { rounds, photos }) {
    for (const [index, round] of rounds.entries()) {
      await submitGuess(perfectGuess(round, photos[index]), userId);
    }
  }

  async function seedCompletions(userId, dates, onTime = true) {
    const games = await db
      .insert(schema.game)
      .values(dates.map((date) => ({ date })))
      .returning();
    await db.insert(schema.gameResult).values(
      games.map((game) => ({
        gameId: game.id,
        userId,
        points: 0,
        onTime,
        completedAt: new Date(`${game.date}T17:00:00Z`),
      })),
    );
    return games;
  }

  function savedGuess(roundId, userId, points, createdAt) {
    return { roundId, userId, points, createdAt, latitude: 45, longitude: -75, distance: 20 };
  }

  const credentials = {
    name: "Player",
    email: "player@example.com",
    password: "test-password-12345",
  };

  async function seedModerator(id = "moderator", values = {}) {
    const [actor] = await db
      .insert(authSchema.user)
      .values({
        id,
        name: id,
        email: `${id}@example.com`,
        isAdmin: true,
        isAnonymous: false,
        ...values,
      })
      .returning();
    return actor;
  }

  test("admin reads and every mutation reject missing, ordinary, anonymous, and revoked admins", async () => {
    const actor = await seedModerator();
    const fixture = await seedGame(actor.id);
    await submitReport(fixture.photos[0].id, "Photo is sideways", actor.id);
    const [report] = await db.select().from(schema.report);
    await seedModerator("ordinary", { isAdmin: false });
    await seedModerator("anonymous", { isAnonymous: true });
    await seedModerator("revoked");
    await db
      .update(authSchema.user)
      .set({ isAdmin: false })
      .where(eq(authSchema.user.id, "revoked"));
    const photosBefore = await db.select().from(schema.photo);
    const reportsBefore = await db.select().from(schema.report);
    for (const userId of [undefined, "missing", "ordinary", "anonymous", "revoked"]) {
      await expect(
        admin.getAdminQueue(userId, { tab: "photos", status: "pending", page: 1 }),
      ).rejects.toThrow();
      await expect(
        admin.moderatePhoto(userId, {
          photoId: fixture.photos[0].id,
          revision: 0,
          status: "rejected",
        }),
      ).rejects.toThrow();
      await expect(
        admin.rotatePhoto(userId, {
          photoId: fixture.photos[0].id,
          revision: 0,
          direction: "right",
        }),
      ).rejects.toThrow();
      await expect(
        admin.respondToReport(userId, {
          reportId: report.id,
          revision: 0,
          status: "approved",
          response: "Checked.",
        }),
      ).rejects.toThrow();
    }
    expect(await db.select().from(schema.photo)).toEqual(photosBefore);
    expect(await db.select().from(schema.report)).toEqual(reportsBefore);
  });

  test("photo moderation changes selection, preserves rounds, and prevents stale overwrites", async () => {
    const actor = await seedModerator();
    const fixture = await seedGame(actor.id);
    const target = fixture.photos[0];
    await admin.moderatePhoto(actor.id, { photoId: target.id, revision: 0, status: "rejected" });
    expect((await getHomePhotos()).map((photo) => photo.objectKey)).not.toContain(target.objectKey);
    expect((await getGame(fixture.game.date)).rounds.map((round) => round.photo.id)).toContain(
      target.id,
    );
    await expect(
      admin.moderatePhoto(actor.id, { photoId: target.id, revision: 0, status: "approved" }),
    ).rejects.toThrow("changed");
    await admin.moderatePhoto(actor.id, { photoId: target.id, revision: 1, status: "pending" });
    expect((await getHomePhotos()).map((photo) => photo.objectKey)).not.toContain(target.objectKey);
    await admin.moderatePhoto(actor.id, { photoId: target.id, revision: 2, status: "approved" });
    expect((await getHomePhotos()).map((photo) => photo.objectKey)).toContain(target.objectKey);
    await expect(
      admin.moderatePhoto(actor.id, { photoId: 99999, revision: 0, status: "approved" }),
    ).rejects.toThrow("removed");
  });

  test("rotation wraps both directions, reaches public photo reads, and rejects stale edits", async () => {
    const actor = await seedModerator();
    const fixture = await seedGame(actor.id);
    const target = fixture.photos[0];
    for (let revision = 0; revision < 4; revision++) {
      await admin.rotatePhoto(actor.id, { photoId: target.id, revision, direction: "right" });
      const [saved] = await db.select().from(schema.photo).where(eq(schema.photo.id, target.id));
      expect(saved.rotation).toBe(((revision + 1) * 90) % 360);
      expect(saved.width).toBe(target.width);
      expect(saved.height).toBe(target.height);
    }
    await admin.rotatePhoto(actor.id, { photoId: target.id, revision: 4, direction: "left" });
    await expect(
      admin.rotatePhoto(actor.id, { photoId: target.id, revision: 4, direction: "left" }),
    ).rejects.toThrow("changed");
    expect(
      (await getHomePhotos()).find((photo) => photo.objectKey === target.objectKey).rotation,
    ).toBe(270);
    expect((await getGame(fixture.game.date)).rounds[0].photo.rotation).toBe(270);
    await expect(
      db.update(schema.photo).set({ rotation: 45 }).where(eq(schema.photo.id, target.id)).execute(),
    ).rejects.toThrow();
  });

  test("report responses persist privately with a resolver and may be reopened independently of photo status", async () => {
    const actor = await seedModerator();
    const fixture = await seedGame(actor.id);
    await submitReport(fixture.photos[0].id, "Photo is sideways", actor.id);
    const [report] = await db.select().from(schema.report);
    const data = {
      reportId: report.id,
      revision: 0,
      status: "approved",
      response: "Rotated the photo.",
    };
    await admin.respondToReport(actor.id, data);
    const [saved] = await db.select().from(schema.report);
    expect(saved).toMatchObject({
      response: data.response,
      status: "approved",
      resolvedBy: actor.id,
      revision: 1,
    });
    expect(saved.resolvedAt).toBeInstanceOf(Date);
    expect((await db.select().from(schema.photo))[0].status).toBe("approved");
    expect((await getGame(fixture.game.date)).rounds[0].photo).not.toHaveProperty("reports");
    await expect(admin.respondToReport(actor.id, data)).rejects.toThrow("changed");
    await admin.respondToReport(actor.id, {
      ...data,
      revision: 1,
      status: "pending",
      response: "Needs another look.",
    });
    expect((await db.select().from(schema.report))[0]).toMatchObject({
      status: "pending",
      resolvedAt: null,
      resolvedBy: null,
      revision: 2,
    });
    await admin.respondToReport(actor.id, {
      ...data,
      revision: 2,
      status: "rejected",
      response: "No issue found.",
    });
    const queue = await admin.getAdminQueue(actor.id, {
      tab: "reports",
      status: "rejected",
      page: 1,
    });
    expect(queue.reports[0]).toMatchObject({
      id: report.id,
      response: "No issue found.",
      submittedBy: { name: actor.name },
      photo: { id: fixture.photos[0].id },
    });
  });

  test("moderation queues filter statuses, paginate stably, and support deleted submitters", async () => {
    const actor = await seedModerator();
    const fixture = await seedGame(actor.id);
    await db.insert(schema.photo).values(
      Array.from({ length: 14 }, (_, index) => ({
        objectKey: `pending-${index}`,
        width: 800,
        height: 600,
        latitude: 45,
        longitude: -75,
      })),
    );
    const first = await admin.getAdminQueue(actor.id, {
      tab: "photos",
      status: "pending",
      page: 1,
    });
    const last = await admin.getAdminQueue(actor.id, {
      tab: "photos",
      status: "pending",
      page: 999,
    });
    expect(first.total).toBe(14);
    expect(first.photos).toHaveLength(12);
    expect(last.page).toBe(2);
    expect(last.photos).toHaveLength(2);
    expect(new Set([...first.photos, ...last.photos].map((photo) => photo.id)).size).toBe(14);
    expect(first.photos[0].submittedBy).toBeNull();
    expect(first.counts.photos).toContainEqual({ status: "approved", count: 5 });
    expect(first.reports).toEqual([]);
    await submitReport(fixture.photos[0].id, "Check this location", actor.id);
    const reports = await admin.getAdminQueue(actor.id, {
      tab: "reports",
      status: "pending",
      page: 1,
    });
    expect(reports.reports).toHaveLength(1);
    expect(reports.photos).toEqual([]);
    expect(reports.counts.reports).toEqual([{ status: "pending", count: 1 }]);
  });

  test("keeps account scores on overlap and transfers guest scores, photos, and reports through real sign-in", async () => {
    const account = await authenticate("sign-up/email", credentials);
    const guest = await authenticate("sign-in/anonymous");
    const { rounds, photos } = await seedGame(guest.user.id);
    const result = (roundId, userId, points) => ({
      roundId,
      userId,
      latitude: 45,
      longitude: -75,
      distance: 20,
      points,
    });
    await db
      .insert(schema.roundResult)
      .values([
        result(rounds[0].id, account.user.id, 1234),
        result(rounds[0].id, guest.user.id, 4999),
        result(rounds[1].id, guest.user.id, 2222),
      ]);
    await submitReport(photos[0].id, "Photo is unclear", guest.user.id);

    await authenticate(
      "sign-in/email",
      { email: credentials.email, password: credentials.password },
      guest.cookie,
    );

    const results = await db.select().from(schema.roundResult);
    expect(
      results
        .map(({ roundId, userId, points }) => ({ roundId, userId, points }))
        .sort((a, b) => a.roundId - b.roundId),
    ).toEqual([
      { roundId: rounds[0].id, userId: account.user.id, points: 1234 },
      { roundId: rounds[1].id, userId: account.user.id, points: 2222 },
    ]);
    expect(
      (await db.select().from(schema.photo)).every((photo) => photo.userId === account.user.id),
    ).toBe(true);
    expect((await db.select().from(schema.report))[0].userId).toBe(account.user.id);
    expect(
      await db.select().from(authSchema.user).where(eq(authSchema.user.id, guest.user.id)),
    ).toHaveLength(0);
  });

  test("transfers all activity to a newly registered account with no existing scores", async () => {
    const guest = await authenticate("sign-in/anonymous");
    const fixture = await seedGame(guest.user.id);
    const { game } = fixture;
    await completeGame(guest.user.id, fixture);
    const [original] = await db.select().from(schema.gameResult);
    const account = await authenticate("sign-up/email", credentials, guest.cookie);
    expect(await getRoundResults(game.id, account.user.id)).toHaveLength(5);
    expect(await getRoundResults(game.id, guest.user.id)).toHaveLength(0);
    expect(await db.select().from(schema.gameResult)).toEqual([
      { ...original, userId: account.user.id },
    ]);
  });

  test("saves five scored guesses, resumes progress, and preserves the original result on retry", async () => {
    const guest = await authenticate("sign-in/anonymous");
    const { game, rounds, photos } = await seedGame(guest.user.id);
    for (const [index, round] of rounds.entries()) {
      const guess = {
        roundId: round.id,
        latitude: photos[index].latitude,
        longitude: photos[index].longitude,
      };
      const result = await submitGuess(guess, guest.user.id);
      expect(result.points).toBe(5000);
      expect(result.distance).toBe(0);
      expect(result.photo).toEqual({ latitude: guess.latitude, longitude: guess.longitude });
      expect(await getRoundResults(game.id, guest.user.id)).toHaveLength(index + 1);
      expect(await db.select().from(schema.gameResult)).toHaveLength(index === 4 ? 1 : 0);
    }
    const [completed] = await db.select().from(schema.gameResult);
    expect(completed).toMatchObject({
      gameId: game.id,
      userId: guest.user.id,
      points: 25000,
      onTime: false,
    });
    const retry = await submitGuess(
      { roundId: rounds[0].id, latitude: 0, longitude: 0 },
      guest.user.id,
    );
    expect(retry.points).toBe(5000);
    expect(retry.latitude).toBe(photos[0].latitude);
    const saved = await getRoundResults(game.id, guest.user.id);
    expect(saved).toHaveLength(5);
    expect(saved.map((result) => result.roundId)).toEqual(rounds.map((round) => round.id));
    expect(saved[0].photo).toEqual({
      latitude: photos[0].latitude,
      longitude: photos[0].longitude,
    });
    expect(saved.reduce((total, result) => total + result.points, 0)).toBe(25000);
    expect(await getRoundResults(game.id, "another-user")).toHaveLength(0);
    expect(await db.select().from(schema.gameResult)).toEqual([completed]);
    expect(await getDailyLeaderboard(game.id)).toEqual([]);
  });

  test.each([
    ["2026-11-04", "2026-11-05T04:59:59Z", true],
    ["2026-11-04", "2026-11-05T05:00:00Z", false],
    ["2026-09-09", "2026-09-10T03:59:59Z", true],
    ["2026-09-09", "2026-09-10T04:00:00Z", false],
  ])("finishing %s at %s records Toronto onTime=%s", async (date, finish, onTime) => {
    const guest = await authenticate("sign-in/anonymous");
    const fixture = await seedGame(guest.user.id, date);
    setSystemTime(new Date(Date.parse(finish) - 1000));
    for (let index = 0; index < 4; index++) {
      await submitGuess(perfectGuess(fixture.rounds[index], fixture.photos[index]), guest.user.id);
    }
    setSystemTime(new Date(finish));
    await submitGuess(perfectGuess(fixture.rounds[4], fixture.photos[4]), guest.user.id);

    const [completed] = await db.select().from(schema.gameResult);
    expect(completed).toEqual({
      gameId: fixture.game.id,
      userId: guest.user.id,
      points: 25000,
      onTime,
      completedAt: new Date(finish),
    });
    setSystemTime(new Date(Date.parse(finish) + 86400000));
    await submitGuess({ roundId: fixture.rounds[4].id, latitude: 0, longitude: 0 }, guest.user.id);
    expect(await db.select().from(schema.gameResult)).toEqual([completed]);
  });

  test("concurrent final rounds and retries create exactly one completed game", async () => {
    const guest = await authenticate("sign-in/anonymous");
    const fixture = await seedGame(guest.user.id);
    for (let index = 0; index < 3; index++) {
      await submitGuess(perfectGuess(fixture.rounds[index], fixture.photos[index]), guest.user.id);
    }
    await Promise.all([
      submitGuess(perfectGuess(fixture.rounds[3], fixture.photos[3]), guest.user.id),
      submitGuess(perfectGuess(fixture.rounds[4], fixture.photos[4]), guest.user.id),
      submitGuess(perfectGuess(fixture.rounds[4], fixture.photos[4]), guest.user.id),
    ]);
    expect(await getRoundResults(fixture.game.id, guest.user.id)).toHaveLength(5);
    expect(await db.select().from(schema.gameResult)).toMatchObject([
      { gameId: fixture.game.id, userId: guest.user.id, points: 25000 },
    ]);
  });

  test("failure to save game_result rolls back the fifth round_result", async () => {
    const guest = await authenticate("sign-in/anonymous");
    const fixture = await seedGame(guest.user.id);
    for (let index = 0; index < 4; index++) {
      await submitGuess(perfectGuess(fixture.rounds[index], fixture.photos[index]), guest.user.id);
    }
    await pool.query(
      "ALTER TABLE game_result ADD CONSTRAINT test_reject_completion CHECK (points < 25000)",
    );
    try {
      await expect(
        submitGuess(perfectGuess(fixture.rounds[4], fixture.photos[4]), guest.user.id),
      ).rejects.toThrow();
      expect(await getRoundResults(fixture.game.id, guest.user.id)).toHaveLength(4);
      expect(await db.select().from(schema.gameResult)).toHaveLength(0);
    } finally {
      await pool.query("ALTER TABLE game_result DROP CONSTRAINT test_reject_completion");
    }
    await submitGuess(perfectGuess(fixture.rounds[4], fixture.photos[4]), guest.user.id);
    expect(await db.select().from(schema.gameResult)).toHaveLength(1);
  });

  test("merges partial games using retained scores and ignores a discarded late overlap", async () => {
    const account = await authenticate("sign-up/email", credentials);
    const guest = await authenticate("sign-in/anonymous");
    const { game, rounds } = await seedGame(guest.user.id, "2026-11-04");
    const onTime = new Date("2026-11-05T04:59:59Z");
    const late = new Date("2026-11-05T05:00:00Z");
    await db
      .insert(schema.roundResult)
      .values([
        savedGuess(rounds[0].id, account.user.id, 1000, onTime),
        savedGuess(rounds[1].id, account.user.id, 2000, onTime),
        savedGuess(rounds[0].id, guest.user.id, 5000, late),
        ...rounds
          .slice(2)
          .map((round, index) => savedGuess(round.id, guest.user.id, (index + 3) * 1000, onTime)),
      ]);
    expect(await db.select().from(schema.gameResult)).toHaveLength(0);
    const now = new Date("2026-11-05T17:00:00Z");
    expect((await getUserStreaks(account.user.id, now)).currentStreak).toBe(0);
    expect((await getUserStreaks(guest.user.id, now)).currentStreak).toBe(0);
    await authenticate(
      "sign-in/email",
      { email: credentials.email, password: credentials.password },
      guest.cookie,
    );
    expect(await getRoundResults(game.id, account.user.id)).toHaveLength(5);
    expect(await db.select().from(schema.gameResult)).toEqual([
      {
        gameId: game.id,
        userId: account.user.id,
        points: 15000,
        onTime: true,
        completedAt: onTime,
      },
    ]);
    expect(await getUserStreaks(account.user.id, now)).toEqual({
      currentStreak: 1,
      bestStreak: 1,
      lastCompletedDate: "2026-11-04",
    });
    expect((await getUserStreaks(guest.user.id, now)).currentStreak).toBe(0);
  });

  test("recomputes a complete guest game when an account's retained overlap was late", async () => {
    const account = await authenticate("sign-up/email", credentials);
    const guest = await authenticate("sign-in/anonymous");
    const fixture = await seedGame(guest.user.id, "2026-11-04");
    setSystemTime(new Date("2026-11-05T04:59:59Z"));
    await completeGame(guest.user.id, fixture);
    expect((await db.select().from(schema.gameResult))[0].onTime).toBe(true);
    const now = new Date("2026-11-05T17:00:00Z");
    expect((await getUserStreaks(guest.user.id, now)).currentStreak).toBe(1);
    setSystemTime();
    const late = new Date("2026-11-05T05:00:00Z");
    await db
      .insert(schema.roundResult)
      .values(savedGuess(fixture.rounds[0].id, account.user.id, 1000, late));
    await authenticate(
      "sign-in/email",
      { email: credentials.email, password: credentials.password },
      guest.cookie,
    );
    expect(await db.select().from(schema.gameResult)).toEqual([
      {
        gameId: fixture.game.id,
        userId: account.user.id,
        points: 21000,
        onTime: false,
        completedAt: late,
      },
    ]);
    expect(await getDailyLeaderboard(fixture.game.id)).toEqual([]);
    expect(await getUserStreaks(account.user.id, now)).toEqual({
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
    });
    expect((await getUserStreaks(guest.user.id, now)).currentStreak).toBe(0);
  });

  test("derives one streak from linked accounts, counting overlapping dates once", async () => {
    const account = await authenticate("sign-up/email", credentials);
    const guest = await authenticate("sign-in/anonymous");
    const dates = ["2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06"];
    for (const [index, date] of dates.entries()) {
      const fixture = await seedGame(guest.user.id, date);
      setSystemTime(new Date(`${date}T17:00:00Z`));
      if (index <= 2) await completeGame(account.user.id, fixture);
      if (index >= 2) await completeGame(guest.user.id, fixture);
    }
    setSystemTime();
    const now = new Date("2026-11-06T17:00:00Z");
    expect(await getUserStreaks(account.user.id, now)).toEqual({
      currentStreak: 0,
      bestStreak: 3,
      lastCompletedDate: "2026-11-04",
    });
    expect(await getUserStreaks(guest.user.id, now)).toEqual({
      currentStreak: 3,
      bestStreak: 3,
      lastCompletedDate: "2026-11-06",
    });

    await authenticate(
      "sign-in/email",
      { email: credentials.email, password: credentials.password },
      guest.cookie,
    );

    expect(await getUserStreaks(account.user.id, now)).toEqual({
      currentStreak: 5,
      bestStreak: 5,
      lastCompletedDate: "2026-11-06",
    });
    expect(await getUserStreaks(guest.user.id, now)).toEqual({
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
    });
  });

  test("preserves an already completed signed-in game when both accounts finished it", async () => {
    const account = await authenticate("sign-up/email", credentials);
    const guest = await authenticate("sign-in/anonymous");
    const fixture = await seedGame(guest.user.id, "2026-11-04");
    setSystemTime(new Date("2026-11-05T04:59:59Z"));
    await completeGame(account.user.id, fixture);
    const [original] = await db.select().from(schema.gameResult);
    setSystemTime(new Date("2026-11-05T05:00:00Z"));
    for (const round of fixture.rounds) {
      await submitGuess({ roundId: round.id, latitude: 0, longitude: 0 }, guest.user.id);
    }
    expect(await db.select().from(schema.gameResult)).toHaveLength(2);
    setSystemTime();
    await authenticate(
      "sign-in/email",
      { email: credentials.email, password: credentials.password },
      guest.cookie,
    );
    expect(await db.select().from(schema.gameResult)).toEqual([original]);
  });

  test("rolls back account activity transfers if completion recomputation fails", async () => {
    const account = await authenticate("sign-up/email", credentials);
    const guest = await authenticate("sign-in/anonymous");
    const { game, rounds, photos } = await seedGame(guest.user.id);
    await db
      .insert(schema.roundResult)
      .values(
        rounds.map((round, index) =>
          savedGuess(round.id, index < 2 ? account.user.id : guest.user.id, 5000, new Date()),
        ),
      );
    await submitReport(photos[0].id, "Photo is unclear", guest.user.id);
    const original = await db.select().from(schema.roundResult);
    await pool.query(
      "ALTER TABLE game_result ADD CONSTRAINT test_reject_merge CHECK (points < 25000)",
    );
    try {
      await expect(
        onLinkAccount({
          anonymousUser: { user: guest.user },
          newUser: { user: account.user },
        }),
      ).rejects.toThrow();
      expect(await db.select().from(schema.roundResult)).toEqual(original);
      expect(
        (await db.select().from(schema.photo)).every((photo) => photo.userId === guest.user.id),
      ).toBe(true);
      expect((await db.select().from(schema.report))[0].userId).toBe(guest.user.id);
      expect(await getDailyLeaderboard(game.id)).toEqual([]);
    } finally {
      await pool.query("ALTER TABLE game_result DROP CONSTRAINT test_reject_merge");
    }
  });

  test("daily leaderboards read completed on-time game totals in descending order", async () => {
    const players = await Promise.all(
      Array.from({ length: 3 }, () => authenticate("sign-in/anonymous")),
    );
    const { game } = await seedGame(players[0].user.id);
    const { game: otherGame } = await seedGame(players[0].user.id, "2026-09-10");
    await db.insert(schema.gameResult).values([
      { gameId: game.id, userId: players[0].user.id, points: 10000, onTime: true },
      { gameId: game.id, userId: players[1].user.id, points: 20000, onTime: true },
      { gameId: game.id, userId: players[2].user.id, points: 25000, onTime: false },
      { gameId: otherGame.id, userId: players[0].user.id, points: 25000, onTime: true },
    ]);
    // No round_result rows: this query must use the stored totals, not aggregate live guesses.
    expect(await db.select().from(schema.roundResult)).toHaveLength(0);
    expect(
      (await getDailyLeaderboard(game.id)).map(({ userId, points }) => ({ userId, points })),
    ).toEqual([
      { userId: players[1].user.id, points: 20000 },
      { userId: players[0].user.id, points: 10000 },
    ]);
  });

  test("streaks are empty without on-time completions", async () => {
    const guest = await authenticate("sign-in/anonymous");
    const now = new Date("2026-11-16T17:00:00Z");
    const empty = { currentStreak: 0, bestStreak: 0, lastCompletedDate: null };
    expect(await getUserStreaks(guest.user.id, now)).toEqual(empty);
    await seedCompletions(guest.user.id, ["2026-11-15", "2026-11-16"], false);
    expect(await getUserStreaks(guest.user.id, now)).toEqual(empty);
  });

  test("streaks use game-date islands and exclude late, future, and other users' rows", async () => {
    const guest = await authenticate("sign-in/anonymous");
    const other = await authenticate("sign-in/anonymous");
    const now = new Date("2026-11-16T17:00:00Z");
    await seedCompletions(guest.user.id, [
      "2026-11-16",
      "2026-11-04",
      "2026-11-12",
      "2026-11-03",
      "2026-11-15",
      "2026-11-02",
      "2026-11-13",
      "2026-11-05",
    ]);
    const [late] = await seedCompletions(guest.user.id, ["2026-11-14"], false);
    await seedCompletions(guest.user.id, ["2026-11-17", "2026-11-18"]);
    await db.insert(schema.gameResult).values({
      gameId: late.id,
      userId: other.user.id,
      points: 25000,
      onTime: true,
      completedAt: new Date("2026-11-14T17:00:00Z"),
    });
    expect(await db.select().from(schema.roundResult)).toHaveLength(0);
    expect(await getUserStreaks(guest.user.id, now)).toEqual({
      currentStreak: 2,
      bestStreak: 4,
      lastCompletedDate: "2026-11-16",
    });
    expect(await getUserStreaks(other.user.id, now)).toEqual({
      currentStreak: 0,
      bestStreak: 1,
      lastCompletedDate: "2026-11-14",
    });
  });

  test.each([
    [["2026-09-09", "2026-09-10"], "2026-09-12T03:59:59Z", "2026-09-12T04:00:00Z"],
    [["2026-11-03", "2026-11-04"], "2026-11-06T04:59:59Z", "2026-11-06T05:00:00Z"],
    [["2026-10-30", "2026-10-31"], "2026-11-02T04:59:59Z", "2026-11-02T05:00:00Z"],
    [["2027-03-12", "2027-03-13"], "2027-03-15T03:59:59Z", "2027-03-15T04:00:00Z"],
  ])(
    "streak ending on %s expires at Toronto midnight %s / %s without writes",
    async (dates, before, after) => {
      const guest = await authenticate("sign-in/anonymous");
      await seedCompletions(guest.user.id, dates);
      setSystemTime(new Date(before));
      expect(await getUserStreaks(guest.user.id)).toEqual({
        currentStreak: 2,
        bestStreak: 2,
        lastCompletedDate: dates.at(-1),
      });
      setSystemTime(new Date(after));
      expect(await getUserStreaks(guest.user.id)).toEqual({
        currentStreak: 0,
        bestStreak: 2,
        lastCompletedDate: dates.at(-1),
      });
    },
  );

  test.each([
    ["2026-10-31", "2026-11-01", "2026-11-02"],
    ["2027-03-13", "2027-03-14", "2027-03-15"],
    ["2026-12-30", "2026-12-31", "2027-01-01"],
    ["2028-02-28", "2028-02-29", "2028-03-01"],
  ])("counts consecutive calendar dates across %s / %s / %s", async (...dates) => {
    const guest = await authenticate("sign-in/anonymous");
    await seedCompletions(guest.user.id, dates);
    expect(await getUserStreaks(guest.user.id, new Date(`${dates.at(-1)}T17:00:00Z`))).toEqual({
      currentStreak: 3,
      bestStreak: 3,
      lastCompletedDate: dates.at(-1),
    });
  });

  test("migration backfills only complete games with Toronto midnight and DST boundaries", async () => {
    const players = await Promise.all(
      Array.from({ length: 3 }, () => authenticate("sign-in/anonymous")),
    );
    const fixtures = [
      await seedGame(players[0].user.id, "2026-09-09"),
      await seedGame(players[0].user.id, "2026-11-04"),
    ];
    const finishes = [
      ["2026-09-10T03:59:59Z", "2026-09-10T04:00:00Z"],
      ["2026-11-05T04:59:59Z", "2026-11-05T05:00:00Z"],
    ];
    for (const [gameIndex, { rounds }] of fixtures.entries()) {
      for (const [playerIndex, { user }] of players.entries()) {
        const finish = new Date(finishes[gameIndex][Math.min(playerIndex, 1)]);
        await db
          .insert(schema.roundResult)
          .values(
            rounds
              .slice(0, playerIndex === 2 ? 4 : 5)
              .map((round, index) =>
                savedGuess(
                  round.id,
                  user.id,
                  5000,
                  new Date(finish.getTime() - (4 - index) * 1000),
                ),
              ),
          );
      }
    }
    const migrationSql = readFileSync(
      new URL(
        "../drizzle/20261118214240_game_result_admin_moderation/migration.sql",
        import.meta.url,
      ),
      "utf8",
    );
    // Only re-run the game_result DDL + backfill. The squashed file also has
    // admin ALTERs that already applied when migrations ran in beforeAll.
    const gameResultSql = migrationSql.slice(0, migrationSql.indexOf('ALTER TABLE "photo"'));
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DROP TABLE game_result");
      await client.query("SET LOCAL TIME ZONE 'Asia/Tokyo'");
      await client.query(gameResultSql);
      const { rows } = await client.query(
        "SELECT * FROM game_result ORDER BY game_id, on_time DESC",
      );
      expect(rows).toEqual(
        fixtures.flatMap(({ game }, index) => [
          {
            game_id: game.id,
            user_id: players[0].user.id,
            points: 25000,
            on_time: true,
            completed_at: new Date(finishes[index][0]),
          },
          {
            game_id: game.id,
            user_id: players[1].user.id,
            points: 25000,
            on_time: false,
            completed_at: new Date(finishes[index][1]),
          },
        ]),
      );
      // The backfill itself is safe to retry.
      await client.query(gameResultSql.slice(gameResultSql.indexOf('INSERT INTO "game_result"')));
      expect((await client.query("SELECT * FROM game_result")).rows).toHaveLength(4);
      await client.query('DELETE FROM "user" WHERE id = $1', [players[0].user.id]);
      expect((await client.query("SELECT * FROM game_result")).rows).toHaveLength(2);
      await client.query("DELETE FROM game WHERE id = $1", [fixtures[0].game.id]);
      expect((await client.query("SELECT * FROM game_result")).rows).toHaveLength(1);
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  });

  test("concurrent submissions save one result and return the same score", async () => {
    const guest = await authenticate("sign-in/anonymous");
    const { game, rounds, photos } = await seedGame(guest.user.id);
    const guess = {
      roundId: rounds[0].id,
      latitude: photos[0].latitude,
      longitude: photos[0].longitude,
    };
    const [first, second] = await Promise.all([
      submitGuess(guess, guest.user.id),
      submitGuess({ ...guess, latitude: 0, longitude: 0 }, guest.user.id),
    ]);
    expect(first).toEqual(second);
    expect(await getRoundResults(game.id, guest.user.id)).toHaveLength(1);
  });

  test("rejects nonexistent and future rounds without saving guesses", async () => {
    const guest = await authenticate("sign-in/anonymous");
    const { rounds } = await seedGame(guest.user.id, "2099-01-01");
    await expect(
      submitGuess({ roundId: rounds[0].id, latitude: 45, longitude: -75 }, guest.user.id),
    ).rejects.toThrow("Round not found");
    await expect(
      submitGuess({ roundId: 9999, latitude: 45, longitude: -75 }, guest.user.id),
    ).rejects.toThrow("Round not found");
    expect(await db.select().from(schema.roundResult)).toHaveLength(0);
  });

  test("linking an account to itself leaves its scores intact", async () => {
    const guest = await authenticate("sign-in/anonymous");
    const { game, rounds, photos } = await seedGame(guest.user.id);
    await submitGuess(
      { roundId: rounds[0].id, latitude: photos[0].latitude, longitude: photos[0].longitude },
      guest.user.id,
    );
    await onLinkAccount({ anonymousUser: { user: guest.user }, newUser: { user: guest.user } });
    expect(await getRoundResults(game.id, guest.user.id)).toHaveLength(1);
  });
});
