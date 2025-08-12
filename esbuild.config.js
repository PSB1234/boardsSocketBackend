// esbuild.config.js
import { build } from "esbuild";
import path from "path";

const projectRoot = path.resolve(process.cwd());

build({
  entryPoints: ["src/index.ts"], // your main entry file
  bundle: true,
  platform: "node",
  target: "node22", // match your Node.js version
  format: "esm", // because you're using NodeNext
  outdir: "dist",
  sourcemap: true,
  alias: {
    "@": path.join(projectRoot, "src"),
  },
  external: [], // add external packages here if needed
}).catch(() => process.exit(1));
