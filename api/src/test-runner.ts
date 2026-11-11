import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...process.env, DATABASE_URL: "file:./test.db" };
const prismaCli = resolve(apiRoot, "../node_modules/prisma/build/index.js");

execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], {
  cwd: apiRoot,
  env,
  stdio: "inherit",
});
execFileSync(process.execPath, ["--import", "tsx", "--test", "src/app.test.ts"], {
  cwd: apiRoot,
  env,
  stdio: "inherit",
});
