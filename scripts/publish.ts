const packages = [
  "packages/cli",
  "packages/client",
  "packages/core",
  "packages/server",
  "packages/studio",
  "packages/datahouse",
];

const dryRun = process.argv.includes("--dry-run");

for (const path of packages) {
  const args = ["publish", ...(dryRun ? ["--dry-run"] : [])];
  console.log(`> bun ${args.join(" ")}`);
  const proc = Bun.spawn(["bun", ...args], {
    cwd: path,
    stdout: "inherit",
    stderr: "inherit",
  });
  await proc.exited;
  if (proc.exitCode !== 0) {
    console.error(`Failed to publish ${path}`);
    process.exit(1);
  }
}

console.log("Done!");
