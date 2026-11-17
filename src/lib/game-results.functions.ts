import { createServerFn } from "@tanstack/react-start";

import { getSession } from "./auth.functions";
import { getUserStreaks } from "./game-results.server";

export const getUserStreaksFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session) return null;

  return getUserStreaks(session.user.id);
});
