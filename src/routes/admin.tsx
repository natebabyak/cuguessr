import { createFileRoute, Link, redirect, useRouter } from "@tanstack/react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import { Header } from "#/components/header";
import { Button, buttonVariants } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";
import { adminQueueSchema, type AdminQueue, respondToReportSchema } from "#/lib/admin-schema";
import {
  getAdminQueueFn,
  moderatePhotoFn,
  requireAdminFn,
  respondToReportFn,
  rotatePhotoFn,
} from "#/lib/admin.functions";
import { getSession } from "#/lib/auth.functions";
import { photoDimensions, photoUrl } from "#/lib/photo-url";

export const Route = createFileRoute("/admin")({
  validateSearch: adminQueueSchema,
  beforeLoad: async () => {
    const session = await getSession();
    if (!session?.user.isAdmin || session.user.isAnonymous) throw redirect({ to: "/" });
    await requireAdminFn();
  },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getAdminQueueFn({ data: deps }),
  head: () => ({ meta: [{ title: "Admin · cuGuessr" }] }),
  pendingComponent: () => (
    <p className="p-8" role="status">
      Loading moderation queue…
    </p>
  ),
  errorComponent: ({ reset }) => (
    <main className="mx-auto grid max-w-lg gap-4 p-8">
      <h1 className="text-2xl font-semibold">Couldn’t load admin</h1>
      <p>Check your connection and admin access, then try again.</p>
      <Button onClick={reset}>Try again</Button>
      <Link to="/">Back to cuGuessr</Link>
    </main>
  ),
  component: AdminPage,
});

type Queue = Awaited<ReturnType<typeof getAdminQueueFn>>;
type AdminPhoto = NonNullable<Queue["reports"][number]["photo"]>;
type RunAction = (action: () => Promise<unknown>, message: string) => Promise<void>;
const statusLabels = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
const reportLabels = { pending: "Pending", approved: "Upheld", rejected: "Dismissed" };

function AdminPage() {
  const queue = Route.useLoaderData();
  const search = Route.useSearch();
  const router = useRouter();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const run: RunAction = async (action, message) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setNotice(null);
    try {
      await action();
      setNotice({ error: false, text: message });
      await router.invalidate();
    } catch (error) {
      setNotice({
        error: true,
        text: error instanceof Error ? error.message : "Couldn’t save. Please try again.",
      });
      // Refresh stale revisions as well as successful actions.
      await router.invalidate();
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const labels = search.tab === "photos" ? statusLabels : reportLabels;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-muted-foreground mb-2 flex items-center gap-2 text-sm">
              <ShieldCheck className="size-4" />
              Moderation
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
            <p className="text-muted-foreground mt-2">
              Review campus photos and follow up on reports.
            </p>
          </div>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => run(async () => {}, "Queue refreshed.")}
          >
            Refresh queue
          </Button>
        </div>

        <nav aria-label="Moderation queues" className="flex flex-wrap gap-2">
          {(["photos", "reports"] as const).map((tab) => (
            <Link
              key={tab}
              to="/admin"
              search={{ tab, status: "pending", page: 1 }}
              aria-current={search.tab === tab ? "page" : undefined}
              className={buttonVariants({
                variant: search.tab === tab ? "default" : "outline",
                size: "lg",
              })}
            >
              {tab === "photos" ? "Photos" : "Reports"}
              <span className="bg-background/20 rounded-full px-2 text-xs tabular-nums">
                {queue.counts[tab].find((item) => item.status === "pending")?.count ?? 0} pending
              </span>
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <nav aria-label={`${search.tab} status`} className="flex flex-wrap gap-2">
            {(["pending", "approved", "rejected"] as const).map((status) => (
              <Link
                key={status}
                to="/admin"
                search={{ ...search, status, page: 1 }}
                aria-current={search.status === status ? "page" : undefined}
                className={buttonVariants({
                  variant: search.status === status ? "secondary" : "ghost",
                  size: "sm",
                })}
              >
                {labels[status]} (
                {queue.counts[search.tab].find((item) => item.status === status)?.count ?? 0})
              </Link>
            ))}
          </nav>
          <span className="text-muted-foreground text-sm" role="status">
            {busy ? "Saving…" : `${queue.total} ${search.tab} · oldest first`}
          </span>
        </div>
        {notice && (
          <p
            role={notice.error ? "alert" : "status"}
            className={`rounded-xl border p-4 text-sm ${notice.error ? "text-destructive" : "text-foreground"}`}
          >
            {notice.text}
          </p>
        )}
        {queue.total === 0 && (
          <div className="rounded-2xl border border-dashed px-6 py-16 text-center">
            <h2 className="text-lg font-medium">
              No {labels[search.status].toLowerCase()} {search.tab}
            </h2>
            <p className="text-muted-foreground mt-2">
              Items will appear here when there’s something to review.
            </p>
          </div>
        )}
        {search.tab === "photos" ? (
          <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
            {queue.photos.map((photo) => (
              <article key={photo.id} className="bg-card overflow-hidden rounded-2xl border">
                <PhotoPreview photo={photo} />
                <div className="grid gap-3 p-4">
                  <div>
                    <h2 className="font-medium">Photo #{photo.id}</h2>
                    <p className="text-muted-foreground text-sm">
                      {photo.submittedBy?.name ?? "Deleted account"} · {formatDate(photo.createdAt)}
                    </p>
                  </div>
                  <PhotoControls photo={photo} busy={busy} run={run} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid gap-5">
            {queue.reports.map((report) => (
              <ReportCard
                key={`${report.id}:${report.revision}`}
                report={report}
                busy={busy}
                run={run}
              />
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <PageLink search={search} page={queue.page - 1} disabled={queue.page <= 1}>
            <ChevronLeft />
            Previous
          </PageLink>
          <span className="text-muted-foreground text-sm">
            Page {queue.page} of {queue.pages}
          </span>
          <PageLink search={search} page={queue.page + 1} disabled={queue.page >= queue.pages}>
            Next
            <ChevronRight />
          </PageLink>
        </div>
      </main>
    </div>
  );
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function PageLink({
  search,
  page,
  disabled,
  children,
}: {
  search: AdminQueue;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return disabled ? (
    <Button variant="outline" disabled>
      {children}
    </Button>
  ) : (
    <Link
      to="/admin"
      search={{ ...search, page }}
      className={buttonVariants({ variant: "outline" })}
    >
      {children}
    </Link>
  );
}

function PhotoPreview({ photo }: { photo: AdminPhoto }) {
  const dimensions = photoDimensions(photo.width, photo.height, photo.rotation);
  return (
    <div className="grid gap-2">
      <a
        href={photoUrl(photo.objectKey, 2560, photo.rotation)}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open full photo #${photo.id}`}
        className="bg-muted flex aspect-[4/3] items-center justify-center overflow-hidden"
      >
        <img
          src={photoUrl(photo.objectKey, 800, photo.rotation)}
          {...dimensions}
          alt={`Campus photo #${photo.id}`}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </a>
      <a
        href={`https://www.openstreetmap.org/?mlat=${photo.latitude}&mlon=${photo.longitude}#map=18/${photo.latitude}/${photo.longitude}`}
        target="_blank"
        rel="noreferrer"
        className="text-muted-foreground px-4 text-xs underline underline-offset-4"
      >
        Location: {photo.latitude.toFixed(5)}, {photo.longitude.toFixed(5)}
      </a>
    </div>
  );
}

function PhotoControls({ photo, busy, run }: { photo: AdminPhoto; busy: boolean; run: RunAction }) {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground mr-auto text-xs">
          {statusLabels[photo.status]} · {photo.rotation}°
        </span>
        <Button
          size="icon-sm"
          variant="outline"
          disabled={busy}
          aria-label={`Rotate photo #${photo.id} left`}
          onClick={() =>
            run(
              () =>
                rotatePhotoFn({
                  data: { photoId: photo.id, revision: photo.revision, direction: "left" },
                }),
              "Photo rotated left.",
            )
          }
        >
          <RotateCcw />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          disabled={busy}
          aria-label={`Rotate photo #${photo.id} right`}
          onClick={() =>
            run(
              () =>
                rotatePhotoFn({
                  data: { photoId: photo.id, revision: photo.revision, direction: "right" },
                }),
              "Photo rotated right.",
            )
          }
        >
          <RotateCw />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {photo.status !== "approved" && (
          <Button
            disabled={busy}
            onClick={() =>
              run(
                () =>
                  moderatePhotoFn({
                    data: { photoId: photo.id, revision: photo.revision, status: "approved" },
                  }),
                "Photo approved.",
              )
            }
          >
            <Check />
            Approve
          </Button>
        )}
        {photo.status !== "rejected" && (
          <Button
            variant="destructive"
            disabled={busy}
            onClick={() =>
              run(
                () =>
                  moderatePhotoFn({
                    data: { photoId: photo.id, revision: photo.revision, status: "rejected" },
                  }),
                "Photo rejected. It will not be selected for new games.",
              )
            }
          >
            <X />
            Reject
          </Button>
        )}
        {photo.status !== "pending" && (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() =>
              run(
                () =>
                  moderatePhotoFn({
                    data: { photoId: photo.id, revision: photo.revision, status: "pending" },
                  }),
                "Photo returned to pending review.",
              )
            }
          >
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}

function ReportCard({
  report,
  busy,
  run,
}: {
  report: Queue["reports"][number];
  busy: boolean;
  run: RunAction;
}) {
  const [response, setResponse] = useState(report.response ?? "");
  const [status, setStatus] = useState(report.status);
  const parsed = respondToReportSchema.safeParse({
    reportId: report.id,
    revision: report.revision,
    response,
    status,
  });
  return (
    <article className="bg-card grid overflow-hidden rounded-2xl border md:grid-cols-[minmax(0,20rem)_1fr]">
      {report.photo && (
        <div className="border-b md:border-r md:border-b-0">
          <PhotoPreview photo={report.photo} />
          <div className="grid gap-3 p-4">
            <h3 className="font-medium">Photo #{report.photo.id}</h3>
            <PhotoControls photo={report.photo} busy={busy} run={run} />
            <p className="text-muted-foreground text-xs">
              Photo decisions affect future selection. Existing game rounds are preserved.
            </p>
          </div>
        </div>
      )}
      <div className="grid content-start gap-4 p-5">
        <div>
          <h2 className="text-lg font-semibold">
            Report #{report.id}{" "}
            <span className="text-muted-foreground text-sm font-normal">
              · {reportLabels[report.status]}
            </span>
          </h2>
          <p className="text-muted-foreground text-sm">
            {report.submittedBy?.name ?? "Deleted account"} · {formatDate(report.createdAt)}
          </p>
        </div>
        <p className="bg-muted rounded-xl p-4 break-words whitespace-pre-wrap">
          {report.description}
        </p>
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (parsed.success)
              void run(() => respondToReportFn({ data: parsed.data }), "Internal response saved.");
          }}
        >
          <label htmlFor={`response-${report.id}`} className="text-sm font-medium">
            Internal response
          </label>
          <Textarea
            id={`response-${report.id}`}
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            required
            maxLength={2000}
            disabled={busy}
            className="min-h-28"
            aria-describedby={`response-help-${report.id}`}
            placeholder="Record what you checked and how this was handled…"
          />
          <p id={`response-help-${report.id}`} className="text-muted-foreground text-xs">
            Visible to admins only. No message is sent to the reporter. {response.length}/2000
          </p>
          <label htmlFor={`resolution-${report.id}`} className="text-sm font-medium">
            Resolution
          </label>
          <select
            id={`resolution-${report.id}`}
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            disabled={busy}
            className="bg-background h-10 rounded-lg border px-3 text-sm"
          >
            <option value="pending">Pending — needs follow-up</option>
            <option value="approved">Upheld — report accepted</option>
            <option value="rejected">Dismissed — no action needed</option>
          </select>
          <p className="text-muted-foreground text-xs">
            Resolving a report does not change its photo’s approval. Use the photo controls
            separately.
          </p>
          {report.resolvedAt && (
            <p className="text-muted-foreground text-xs">
              Last resolved {formatDate(report.resolvedAt)}
            </p>
          )}
          <Button type="submit" disabled={busy || !parsed.success} className="w-fit">
            {busy ? <LoaderCircle className="animate-spin" /> : <Check />}Save response & resolution
          </Button>
        </form>
      </div>
    </article>
  );
}
