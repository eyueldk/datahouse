import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { Sidebar } from "../components/sidebar";
import { Toaster } from "../components/ui/sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    links: [{ rel: "stylesheet", href: appCss }],
  }),
});

function RootComponent() {
  return (
    <RootDocument>
      <div className="dark flex min-h-screen w-full bg-muted/20 font-sans antialiased wrap-anywhere">
        <Sidebar />
        <div className="flex flex-col sm:pl-64 w-full">
          <main className="flex-1 items-start p-4 sm:px-8 sm:py-6 w-full max-w-7xl mx-auto">
            <Outlet />
          </main>
        </div>
        <Toaster position="top-center" richColors closeButton />
      </div>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackRouterDevtools position="bottom-right" />
        <Scripts />
      </body>
    </html>
  );
}
