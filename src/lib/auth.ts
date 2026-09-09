import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { anonymous, magicLink } from "better-auth/plugins";
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
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          from: '"cuGuessr" <noreply@cuguessr.com>',
          to: email,
          subject: "Your temporary cuGuessr sign in link",
          html: `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Sign in to cuGuessr</title>
              </head>
              <body
                style="margin: 0; padding: 56px 24px; background-color: #ffffff; font-family: 'Geist', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0a0a0a; -webkit-font-smoothing: antialiased;"
              >
                <div style="max-width: 380px; margin: 0 auto;">
                  <a
                    href="https://www.cuguessr.com"
                    target="_blank"
                    style="display: inline-flex; text-decoration: none; color: #0a0a0a; font-size: 24px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 40px;"
                  >
                    <span style="color: #e4001a;">cu</span>Guessr
                  </a>
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.5; color: #0a0a0a;">
                    Click below to sign in.
                  </p>
                  <a
                    href="${url}"
                    target="_blank"
                    style="display: block; width: 100%; box-sizing: border-box; background-color: #e4001a; color: #ffffff; font-size: 14px; font-weight: 500; text-align: center; text-decoration: none; height: 44px; line-height: 44px; border-radius: 10px; border: 1px solid transparent; margin-bottom: 28px;"
                  >
                    Sign in
                  </a>
                  <div style="height: 1px; background-color: #e5e5e5; margin-bottom: 20px;"></div>
                  <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #737373;">
                    This link expires in 5 minutes. If you didn't request it, you can ignore this email.
                  </p>
                </div>
              </body>
            </html>
          `,
        });
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
