import { createAuthClient } from "better-auth/client";
import { anonymousClient, magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [anonymousClient(), magicLinkClient()],
});
