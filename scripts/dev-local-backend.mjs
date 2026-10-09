import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
nextEnv.loadEnvConfig(root, true);

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const backend = new URL(
  process.env.WQH_LOCAL_API_URL || "http://127.0.0.1:10000/",
);
if (
  !["http:", "https:"].includes(backend.protocol) ||
  !["localhost", "127.0.0.1", "[::1]"].includes(backend.hostname) ||
  backend.username || backend.password || backend.search || backend.hash
) {
  throw new Error("WQH_LOCAL_API_URL must be a loopback HTTP URL without credentials, a query, or a fragment");
}
backend.pathname = `${backend.pathname.replace(/\/+$/, "")}/`;
const apiUrl = backend.toString();
const uiUrl = `http://localhost:${port}`;

console.log(`Local backend: ${apiUrl}`);
console.log(`UI: ${uiUrl}/smart-match`);
console.log("Clerk and Supabase use the credentials in this worktree's environment files.");

const child = spawn(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "dev", "--hostname", "localhost", "--port", String(port)],
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      APP_ENV: "dev",
      WQH_LOCAL_BACKEND_TESTING: "true",
      WQH_DEV_API_URL: apiUrl,
      WQH_PROD_API_URL: apiUrl,
      WQH_TRAITS_API_URL: apiUrl,
      NEXT_PUBLIC_APP_URL: uiUrl,
      NEXT_PUBLIC_SITE_URL: uiUrl,
    },
  },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => child.kill(signal));
}
child.once("error", (error) => {
  console.error(`Could not start Next.js: ${error.message}`);
  process.exitCode = 1;
});
child.once("exit", (code, signal) => {
  process.exitCode = code ?? (["SIGINT", "SIGTERM"].includes(signal) ? 0 : 1);
});
