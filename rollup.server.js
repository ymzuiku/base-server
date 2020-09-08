#!/usr/bin/env node

/* eslint-disable no-console */

// yarn add esbuild rollup rollup-plugin-esbuild rollup-plugin-node-resolve rollup-plugin-uglify typescript -D

const rollup = require("rollup");
const { resolve } = require("path");
const pwd = (...args) => resolve(process.cwd(), ...args);
const pkg = require("./package.json");
const fs = require("fs-extra");
const esbuild = require("rollup-plugin-esbuild");
const argv = process.argv.splice(2);
const cluster = require("cluster");

let env = "dev";
let isWatch = false;
argv.forEach((item) => {
  if (item === "-w") {
    isWatch = true;
  } else if (/=/.test(item)) {
    const [k, v] = item.split("=");
    if (k === "env") {
      env = v;
    }
  }
});

function clearDir(dir) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      fs.remove("${dir}/${file}");
    });
  } else {
    fs.mkdirSync("dist");
  }
}
function haveArgv(...args) {
  let isHave = false;
  args.forEach((str) => {
    argv.forEach((v) => {
      if (v === str) {
        isHave = true;
      }
    });
  });

  return isHave;
}

clearDir(pwd("dist"));
function copyEnv() {
  // 拷贝环境变量
  let envFile = `env/env.${env}.js`;
  if (!fs.existsSync(envFile)) {
    envFile = "env/env.test.js";
  }
  fs.copyFileSync(envFile, "dist/env.js");
}

copyEnv();

// yarn ser 自动重启处理
if (isWatch && cluster.isMaster) {
  cluster.fork();
  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
}
if (cluster.isWorker) {
  console.log(`Worker ${process.pid} started`);
  require("./dist/index.js");
  return;
}

const watchOptions = {
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    "crypto",
    "cluster",
    "path",
    "fs",
    "ws",
    "http",
    "url",
  ],
  input: "./server/app.ts",
  output: {
    file: "./dist/index.js",
    format: "cjs",
    name: "fast",
    sourcemap: true,
    globals: {
      react: "React",
    },
  },
  plugins: [
    esbuild({
      // All options are optional
      include: /\.(ts|tsx|js|jsx)?$/, // default, inferred from `loaders` option
      exclude: /node_modules/, // default
      sourceMap: false, // default
      target: "es2017", // default, or 'es20XX', 'esnext'
      // watch: process.argv.includes("--watch"),
      // minify: process.env.NODE_ENV === "production",
    }),
  ],
};
const watcher = rollup.watch(watchOptions);

const copyList = ["yarn.lock"];
const copyDirList = ["static"];

// event.code can be one of:
//   START        — the watcher is (re)starting
//   BUNDLE_START — building an individual bundle
//   BUNDLE_END   — finished building a bundle
//   END          — finished building all bundles
//   ERROR        — encountered an error while bundling
//   FATAL        — encountered an unrecoverable error
watcher.on("event", (event) => {
  if (event.code === "ERROR") {
    console.log("ERROR", event);
  } else if (event.code === "BUNDLE_END") {
    for (const id in cluster.workers) {
      cluster.workers[id].process.kill();
    }
    // if (!isWatch && cluster.isMaster) {
    //   console.log("BUNDLE_END");
    // }
  } else if (event.code === "END") {
    Object.keys(pkg.devDependencies).forEach((k) => {
      if (
        /(@type|eslint|vite|cypress|rollup|prettier|husky|lint-staged|typescript|nodemon)/.test(
          k
        )
      ) {
        delete pkg.devDependencies[k];
      }
    });
    fs.writeJSONSync("./dist/package.json", pkg, { spaces: 2 });
    copyList.forEach((f) => {
      if (fs.existsSync(f)) {
        fs.copyFileSync(f, "./dist/" + f);
      }
    });
    copyEnv();
    copyDirList.forEach((dir) => {
      fs.readdirSync(dir).forEach((f) => {
        fs.copySync(dir + "/" + f, "./dist/" + f);
      });
    });
    if (!haveArgv("--watch", "-w")) {
      watcher.close();
    }
  }
});
