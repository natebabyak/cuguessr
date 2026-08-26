import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { anonymous, magicLink } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
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
    anonymous(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          from: "noreply@cuguessr.com",
          to: email,
          subject: "Sign in link for cuGuessr",
          html: `
            <div>
              <h1>Your sign in link for cuGuessr</h1>
              <a href="${url}">Sign in to cuGuessr</a>
            </div>
          `,
        });
      },
    }),
  ],
  advanced: {
    database: {
      joins: true,
    },
  },
});
