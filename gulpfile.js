import gulp from "gulp";
import BrowserSync from "./modules/BrowserSync.js";

import * as dev from "./gulp/dev.js";
//import * as build from "./gulp/build.js";
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

export function runPipesDev(cb) {
    series(
        distClean,
        dev.handleHtml, //handling html beforehand for purgeCss in handleSass
        parallel(
            dev.handleStyles,
            //dev.handleJs,
            dev.handleImages,
            dev.handleFonts,
            dev.handleData
        ),
    )(cb);
}

export function runDev(cb) {
    series(
        runPipesDev,
        browserSync.reload,
        watchSrc
    )(cb);
}
