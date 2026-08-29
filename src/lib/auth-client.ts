import { createAuthClient } from "better-auth/client";
import {
  anonymousClient,
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins";
import type { auth } from "#/lib/auth";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    anonymousClient(),
    magicLinkClient(),
  ],
});
