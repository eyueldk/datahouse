import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { Sidebar } from "../components/sidebar";
import { Toaster } from "../components/ui/sonner";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  head: () => ({
    links: [{ rel: "stylesheet", href: appCss }],
  }),
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <div className="dark flex min-h-screen w-full min-w-0 bg-muted/20 font-sans antialiased wrap-anywhere">
          <Sidebar />
          <div className="flex w-full min-w-0 flex-1 flex-col sm:pl-64">
            <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 items-start p-4 sm:px-8 sm:py-6">
              <Outlet />
            </main>
          </div>
          <Toaster position="top-center" richColors closeButton />
        </div>
      </RootDocument>
    </QueryClientProvider>
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

function NotFoundComponent() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you requested does not exist.
      </p>
    </div>
  );
}
