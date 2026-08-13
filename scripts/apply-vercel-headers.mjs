import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputConfigPath = resolve(".vercel/output/config.json");

const headers = {
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; connect-src 'self' https://*.supabase.co; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; frame-src https://www.youtube.com https://www.youtube-nocookie.com; img-src 'self' data: blob:; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const config = JSON.parse(await readFile(outputConfigPath, "utf8"));
config.routes = [{ src: "/(.*)", headers, continue: true }, ...(config.routes ?? [])];

await writeFile(outputConfigPath, `${JSON.stringify(config, null, 2)}\n`);
