import { createServerFn } from "@tanstack/react-start";

import { getSession } from "./auth.functions";
import { reportSchema } from "./report-schema";
import { submitReport } from "./reports.server";

export const submitReportFn = createServerFn({ method: "POST" })
  .validator(reportSchema)
  .handler(async ({ data }) => {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    await submitReport(data.photoId, data.description, session.user.id);
  });
