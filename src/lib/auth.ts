import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins/anonymous";
import { emailOTP } from "better-auth/plugins/email-otp";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import * as authSchema from "#/db/auth-schema";
import { db } from "#/db/index";
import * as schema from "#/db/schema";
import { linkAnonymousAccount } from "#/lib/account-linking.server";
import { sendEmail } from "#/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema, ...authSchema },
  }),

  emailAndPassword: {
    enabled: true,
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
        await linkAnonymousAccount(anonymousUser.user.id, newUser.user.id);
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
