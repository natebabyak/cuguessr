import "../styles.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "photoswipe/style.css";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "#/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <Outlet />
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
