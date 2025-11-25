import esbuild from "esbuild"
import path from "path"
const root = process.cwd()

try {
  esbuild.buildSync({
    alias: {
      "three/**/*": path.join(root, "/node_modules/three/examples/**/*.js")
      // "./examples/**/*": path.join(root, "/node_modules/three/examples/**/*")
    },
    entryPoints: { index: path.join(root, "/src/index.ts") },
    outdir: path.join(root, "/dist/"),
    bundle: true,
    tsconfig: path.join(root, "/tsconfig.json"),
    target: "esnext",
    platform: "node",
    format: "iife",
    minify: false,
    external: ["proxy-agent"]
  })
} catch (error) {}
