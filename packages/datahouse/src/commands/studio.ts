import { command, number, option } from "cmd-ts";
import { startStudio } from "@datahouse/studio/server";

export const studioCommand = command({
  name: "studio",
  description: "Start the Datahouse studio",
  args: {
    port: option({
      type: number,
      long: "port",
      short: "p",
      defaultValue: () => 2511,
    }),
  },
  handler: async (args) => {
    console.log(`Starting studio on port ${args.port}...`);

    await startStudio(args.port);

    console.log(`Studio available at http://localhost:${args.port}`);
  },
});
