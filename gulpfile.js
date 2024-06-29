import gulp from "gulp";
import BrowserSync from "./modules/BrowserSync.js";

import * as dev from "./gulp/dev.js";
import * as build from "./gulp/build.js";
import { distPath, pathData } from "./gulp/vars.js";
import { cleanDist } from "./gulp/utilFuncs.js";


/////////////// END OF IMPORTS /////////////////////////
const { series, parallel } = gulp;
const browserSync = new BrowserSync({
    baseDir: distPath,
    index: "index.html",
    open: true,
    notify: true,
    noCacheHeaders: true
});

function watchSrc() {
    dev.watchFiles(browserSync);
}

export async function distClean() {
    await cleanDist(pathData.clean);
}

/**
 * It initiates tasks with account to the mode of tasks to run
 * @param { string } mode - "dev" or "build"
 * @param { function } cb - callback
 */
function runPipes(mode, cb) {
    const tasks = mode === "dev" ? dev : build;
    series(
        distClean,
        tasks.handleHtml, //handling html beforehand for purgeCss in handleSass
        parallel(
            tasks.handleStyles,
            tasks.handleJs,
            tasks.handleImages,
            tasks.handleFonts,
            tasks.handleData
        ),
    )(cb);
}

export function runPipesDev(cb) {
    runPipes("dev", cb);
}

export function runPipesBuild(cb) {
    runPipes("build", cb);
}

export function runDev(cb) {
    series(
        runPipesDev,
        browserSync.reload,
        watchSrc
    )(cb);
}

export function runBuild(cb) {
    series(
        runPipesBuild,
        browserSync.reload,
    )(cb);
}