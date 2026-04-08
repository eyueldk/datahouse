import { run, subcommands } from "cmd-ts";
import * as commands from "./commands";
import packageJson from "../package.json";


const cli = subcommands({
  name: "datahouse",
  version: packageJson.version,
  cmds: commands,
});

run(cli, process.argv.slice(2));
