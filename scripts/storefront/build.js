const esbuild = require("esbuild");
const path = require("path");

esbuild
  .build({
    entryPoints: [path.join(__dirname, "sticky-bar.js")],
    bundle: true,
    minify: true,
    outfile: path.join(__dirname, "../../public/sticky-bar.min.js"),
    target: ["es2018"],
    format: "iife",
  })
  .then(() => {
    console.log("✓ Built public/sticky-bar.min.js");
  })
  .catch((err) => {
    console.error("Build failed:", err);
    process.exit(1);
  });
