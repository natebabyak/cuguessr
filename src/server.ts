import handler from "@tanstack/react-start/server-entry";
import { createGameServer } from "#/lib/game/server";

export default {
  async fetch(request, _env, _ctx) {
    return handler.fetch(request);
  },
  async scheduled(
    _controller: ScheduledController,
    _env: Env,
    ctx: ExecutionContext,
  ) {
    const today = Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Toronto",
    }).format(new Date());

    ctx.waitUntil(createGameServer(today));
  },
} satisfies ExportedHandler<Env>;
