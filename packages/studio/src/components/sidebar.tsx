import { Link } from "@tanstack/react-router";
import { Database, Play, FileJson, HardDrive } from "lucide-react";
import { buttonVariants } from "#/components/ui/button";
import { cn } from "#/lib/utils";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
      <div className="flex h-14 items-center border-b px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="h-4 w-4 rounded-full bg-primary" />
          <span>Datahouse Studio</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          <Link
            to="/sources"
            className={cn(
              buttonVariants({
                variant: "ghost",
                className:
                  "w-full justify-start gap-3 text-muted-foreground [&.active]:bg-muted [&.active]:text-foreground",
              }),
            )}
            activeProps={{ className: "active" }}
          >
            <Database className="h-4 w-4" />
            Sources
          </Link>
          <Link
            to="/extractors"
            className={cn(
              buttonVariants({
                variant: "ghost",
                className:
                  "w-full justify-start gap-3 text-muted-foreground [&.active]:bg-muted [&.active]:text-foreground",
              }),
            )}
            activeProps={{ className: "active" }}
          >
            <HardDrive className="h-4 w-4" />
            Extractors
          </Link>
          <Link
            to="/runs"
            className={cn(
              buttonVariants({
                variant: "ghost",
                className:
                  "w-full justify-start gap-3 text-muted-foreground [&.active]:bg-muted [&.active]:text-foreground",
              }),
            )}
            activeProps={{ className: "active" }}
          >
            <Play className="h-4 w-4" />
            Runs
          </Link>
          <Link
            to="/records"
            className={cn(
              buttonVariants({
                variant: "ghost",
                className:
                  "w-full justify-start gap-3 text-muted-foreground [&.active]:bg-muted [&.active]:text-foreground",
              }),
            )}
            activeProps={{ className: "active" }}
          >
            <FileJson className="h-4 w-4" />
            Records
          </Link>
        </nav>
      </div>
    </aside>
  );
}
