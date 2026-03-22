#!/usr/bin/env bun
import { run, subcommands } from "cmd-ts";
import { serveCommand } from "./commands/serve.ts";
import { studioCommand } from "./commands/studio.ts";

const cli = subcommands({
  name: "datahouse",
  cmds: { serve: serveCommand, studio: studioCommand },
});

export function runCli(argv: string[] = process.argv.slice(2)): void {
  run(cli, argv);
}

if (import.meta.main) {
  runCli();
}
