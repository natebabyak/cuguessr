import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { anonymous, emailOTP } from "better-auth/plugins";
import { and, eq, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { photo, report, roundResult } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import * as authSchema from "./db/auth-schema";
import * as schema from "./db/schema";
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
          .select({ roundId: roundResult.roundId })
          .from(roundResult)
          .where(eq(roundResult.userId, newUserId));

        const existingRoundIds = existingResults.map(
          (result) => result.roundId,
        );

        await db
          .update(roundResult)
          .set({ userId: newUserId })
          .where(
            existingRoundIds.length > 0
              ? and(
                  eq(roundResult.userId, anonymousUserId),
                  notInArray(roundResult.roundId, existingRoundIds),
                )
              : eq(roundResult.userId, anonymousUserId),
          );

        await db
          .update(report)
          .set({ userId: newUserId })
          .where(eq(report.userId, anonymousUserId));

        await db
          .update(photo)
          .set({ userId: newUserId })
          .where(eq(photo.userId, anonymousUserId));
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          await sendEmail({
            from: '"cuGuessr Auth" <noreply@cuguessr.com>',
            to: email,
            subject: "Sign in OTP for cuGuessr",
            text: `Your one-time password is: ${otp}.`,
          });
        } else if (type === "email-verification") {
          await sendEmail({
            from: '"cuGuessr Auth" <noreply@cuguessr.com>',
            to: email,
            subject: "Email verification OTP for cuGuessr",
            text: `Your one-time password is: ${otp}.`,
          });
        } else {
          await sendEmail({
            from: '"cuGuessr Auth" <noreply@cuguessr.com>',
            to: email,
            subject: "Password reset OTP for cuGuessr",
            text: `Your one-time password is: ${otp}.`,
          });
        }
      },
    }),
    nextCookies(),
  ],
  advanced: {
    database: {
      joins: true,
    },
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
