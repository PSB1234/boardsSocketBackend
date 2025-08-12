// esbuild.config.js
import { build } from "esbuild";
import path from "path";

const projectRoot = path.resolve(process.cwd());

build({
  entryPoints: ["src/index.ts"], // your main entry file
  bundle: true,
  platform: "node",
  target: "node18", // match your Node.js version
  format: "esm", // because you're using NodeNext
  outdir: "dist",
  sourcemap: true,
  alias: {
    "@": path.join(projectRoot, "src"),
  },
  external: [
    // Make Node.js built-ins external
    "http",
    "https",
    "fs",
    "path",
    "crypto",
    "events",
    "util",
    "stream",
    "url",
    "buffer",
    "querystring",
    "net",
    "tls",
    "zlib",
    "os",
    "dotenv",
    "fs",
    // Make socket.io external to avoid bundling issues
    "socket.io",
    "express",
    "redis",
  ],
}).catch(() => process.exit(1));
