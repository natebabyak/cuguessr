import { afterAll, beforeAll, beforeEach, describe, expect, mock, test } from "bun:test";
import { execFileSync } from "node:child_process";

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
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
  let submitReport;
  let onLinkAccount;

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
    const migration = await pushSchema({ ...schema, ...authSchema }, db);
    await migration.apply();

    mock.module("../src/db/index", () => ({ db }));
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    process.env.BETTER_AUTH_SECRET = "isolated-test-secret-with-at-least-thirty-two-characters";
    ({ auth } = await import("../src/lib/auth"));
    onLinkAccount = auth.options.plugins.find((plugin) => plugin.id === "anonymous").options
      .onLinkAccount;
    ({ submitGuess, getRoundResults } = await import("../src/lib/round-results.server"));
    ({ submitReport } = await import("../src/lib/reports.server"));
  }, 30000);

  afterAll(async () => {
    mock.restore();
    await pool?.end();
    if (containerId) execFileSync("docker", ["rm", "--force", containerId], { stdio: "ignore" });
  });

  beforeEach(async () => {
    await pool.query(
      'TRUNCATE "user", game, photo, report, round, round_result RESTART IDENTITY CASCADE',
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
          objectKey: `photo-${index}`,
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

  const credentials = {
    name: "Player",
    email: "player@example.com",
    password: "test-password-12345",
  };

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
    const { game, rounds, photos } = await seedGame(guest.user.id);
    await submitGuess(
      { roundId: rounds[0].id, latitude: photos[0].latitude, longitude: photos[0].longitude },
      guest.user.id,
    );
    const account = await authenticate("sign-up/email", credentials, guest.cookie);
    expect(await getRoundResults(game.id, account.user.id)).toHaveLength(1);
    expect(await getRoundResults(game.id, guest.user.id)).toHaveLength(0);
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
    }
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
