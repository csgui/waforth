#!/usr/bin/env node
/* eslint-env node */
/* eslint @typescript-eslint/no-var-requires:0 */

const esbuild = require("esbuild");
const path = require("path");
const { wasmTextPlugin } = require("./scripts/esbuild/wasm-text");
const Mocha = require("mocha");

let watch = false;
for (const arg of process.argv.slice(2)) {
  switch (arg) {
    case "--watch":
      watch = true;
      break;
  }
}

function runTests() {
  const mocha = new Mocha();
  delete require.cache[path.join(__dirname, "build", "tests.js")];
  mocha.addFile("build/tests.js");
  mocha.run((failures) => (process.exitCode = failures ? 1 : 0));
}

let buildConfig = {
  bundle: true,
  logLevel: "warning",
  entryPoints: [path.join(__dirname, "src", "web", "tests", "tests.node")],
  target: "node17",
  outdir: path.join(__dirname, "build"),
  external: ["fs", "stream", "util", "events", "path"],
  minify: false,
  loader: {
    ".wasm": "binary",
    ".f": "text",
    ".fr": "text",
    ".fth": "text",
  },
  sourcemap: true,
  plugins: [wasmTextPlugin({ debug: true })],
  ...(watch
    ? {
        watch: {
          async onRebuild(error) {
            if (error) {
              console.error(error);
            } else {
              runTests();
            }
          },
        },
      }
    : {}),
};

esbuild.build(buildConfig).then(runTests, (e) => {
  console.error(e);
  process.exit(1);
});
