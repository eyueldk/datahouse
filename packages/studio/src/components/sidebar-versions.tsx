import { useEffect, useState } from "react";
import studioPackage from "../../package.json" with { type: "json" };
import { getApiVersion } from "#/lib/server-functions";

export function SidebarVersions() {
  const [serverVersion, setServerVersion] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getApiVersion()
      .then((res) => {
        if (!cancelled) setServerVersion(res.version);
      })
      .catch(() => {
        if (!cancelled) setServerVersion("—");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const apiMono = (
    <span className="font-mono text-foreground/90 tabular-nums">
      {serverVersion === null ? (
        <>
          v
          <span
            className="inline-block h-2 w-7 translate-y-px rounded-sm bg-muted-foreground/25 animate-pulse align-middle"
            aria-busy
            aria-label="Loading API version"
          />
        </>
      ) : serverVersion === "—" ? (
        <span className="text-muted-foreground/90">v—</span>
      ) : (
        <>v{serverVersion}</>
      )}
    </span>
  );

  return (
    <div className="border-t border-border/60 bg-muted/20 px-4 py-2">
      <p className="truncate text-left text-[11px] leading-tight text-muted-foreground">
        Studio{" "}
        <span className="font-mono text-foreground/90 tabular-nums">
          v{studioPackage.version}
        </span>
        <span className="mx-1 select-none text-muted-foreground/35" aria-hidden>
          |
        </span>
        API {apiMono}
      </p>
    </div>
  );
}
