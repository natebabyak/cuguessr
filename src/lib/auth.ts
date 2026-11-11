import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins/anonymous";
import { emailOTP } from "better-auth/plugins/email-otp";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { and, eq, notInArray } from "drizzle-orm";

import * as authSchema from "#/db/auth-schema";
import { db } from "#/db/index";
import * as schema from "#/db/schema";
import { sendEmail } from "#/lib/email";

import { generateUsername } from "./generate-username";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema, ...authSchema },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.name) {
            return {
              data: {
                ...user,
                name: generateUsername(),
              },
            };
          }
        },
      },
    },
  },
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        input: false,
      },
    },
  },
  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    reddit: {
      clientId: process.env.REDDIT_CLIENT_ID as string,
      clientSecret: process.env.REDDIT_CLIENT_SECRET as string,
    },
  },
  plugins: [
    anonymous({
      onLinkAccount: async ({ anonymousUser, newUser }) => {
        const anonymousUserId = anonymousUser.user.id;
        const newUserId = newUser.user.id;

        if (anonymousUserId === newUserId) {
          return;
        }

        const existingResults = await db
          .select({ roundId: schema.roundResult.roundId })
          .from(schema.roundResult)
          .where(eq(schema.roundResult.userId, newUserId));

        const existingRoundIds = existingResults.map((result) => result.roundId);

        await db
          .update(schema.roundResult)
          .set({ userId: newUserId })
          .where(
            existingRoundIds.length > 0
              ? and(
                  eq(schema.roundResult.userId, anonymousUserId),
                  notInArray(schema.roundResult.roundId, existingRoundIds),
                )
              : eq(schema.roundResult.userId, anonymousUserId),
          );

        await db
          .update(schema.report)
          .set({ userId: newUserId })
          .where(eq(schema.report.userId, anonymousUserId));

        await db
          .update(schema.photo)
          .set({ userId: newUserId })
          .where(eq(schema.photo.userId, anonymousUserId));
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await sendEmail({
            from: '"cuGuessr Authentication" <noreply@cuguessr.com>',
            to: email,
            subject: "Login code for cuGuessr",
            text: `Your one-time password is: ${otp}.`,
          });
        } else if (type === "email-verification") {
          await sendEmail({
            from: '"cuGuessr Authentication" <noreply@cuguessr.com>',
            to: email,
            subject: "Email verification OTP for cuGuessr",
            text: `Your one-time password is: ${otp}.`,
          });
        } else {
          await sendEmail({
            from: '"cuGuessr Authentication" <noreply@cuguessr.com>',
            to: email,
            subject: "Password reset OTP for cuGuessr",
            text: `Your one-time password is: ${otp}.`,
          });
        }
      },
    }),
    tanstackStartCookies(),
  ],
  advanced: {
    database: {
      joins: true,
    },
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
