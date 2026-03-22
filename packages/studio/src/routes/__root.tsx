import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Sidebar } from "../components/sidebar";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex min-h-screen w-full bg-muted/20 font-sans antialiased wrap-anywhere">
      <Sidebar />
      <div className="flex flex-col sm:pl-64 w-full">
        <main className="flex-1 items-start p-4 sm:px-8 sm:py-6 w-full max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
