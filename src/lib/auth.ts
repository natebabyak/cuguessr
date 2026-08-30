import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { anonymous, magicLink } from "better-auth/plugins";
import { sendEmail } from "@/lib/email";
import { db } from "../../old/src/lib/db";
import * as authSchema from "./db/auth-schema";
import * as schema from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { ...schema, ...authSchema },
  }),
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
    anonymous(),
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        await sendEmail({
          from: "noreply@cuguessr.com",
          to: email,
          subject: "Sign in link for cuGuessr",
          html: `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Sign in to cuGuessr</title>
              </head>
              <body style="margin: 0; padding: 40px 20px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; -webkit-font-smoothing: antialiased;">
                <div style="max-width: 400px; margin: 0 auto;">
                  <a href="https://cuguessr.com" target="_blank" style="display: inline-block; text-decoration: none; color: #000000; font-size: 18px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 32px;">
                    cuGuessr
                  </a>
                  <h1 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 600; color: #0f172a; letter-spacing: -0.01em;">
                    Sign in to your account
                  </h1>
                  <a href="${url}" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #5e6ad2; color: #ffffff; font-size: 14px; font-weight: 500; text-align: center; text-decoration: none; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
                    Sign in to cuGuessr &rarr;
                  </a>
                  <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.5; color: #64748b;">
                    This link will expire in 5 minutes. If the button above does not work, you can paste the link directly into your browser or enter the code below. If you didn't request this, you can safely ignore this email.
                  </p>
                  <div style="display: inline-block; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 16px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 18px; font-weight: 600; color: #0f172a; letter-spacing: 0.2em;">
                    ${token}
                  </div>
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
