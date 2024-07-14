import gulp from "gulp";
import BrowserSync from "./modules/BrowserSync.js";

import { distPath, pathData, modes } from "./gulp/vars.js";
import { cleanDist } from "./gulp/utilFuncs.js";
import tasks from "./gulp/tasks.js";

/////////////// END OF IMPORTS /////////////////////////
const { series, parallel, watch } = gulp;
const browserSync = new BrowserSync({
    baseDir: distPath,
    index: "index.html",
    open: true,
    notify: true,
    noCacheHeaders: true
});

function watchFiles() {
    const pipesDev = tasks[modes.dev];
    watch(pathData.watch.htmlNested, series(pipesDev.pipeHtml, browserSync.reload));
    watch(pathData.watch.stylesNested, series(pipesDev.pipeStylesChanged, browserSync.reload));
    watch(pathData.watch.jsNested, series(pipesDev.pipeJs, browserSync.reload));
    watch(pathData.watch.img, series(pipesDev.pipeImages, browserSync.reload));
    watch(pathData.watch.fonts, series(pipesDev.pipeFonts, browserSync.reload));
    watch(pathData.watch.data, series(pipesDev.pipeData, browserSync.reload));
}

/**
 * It initiates tasks with account to the mode of tasks to run
 * @param { string } mode - "dev" or "build"
 * @param { function } cb - callback
 */
function runPipes(mode, cb) {
    if (mode in modes) {
        const task = tasks[mode];
        series(
            distClean,
            task.pipeHtml,
            parallel(
                task.pipeStyles,
                task.pipeJs,
                task.pipeImages,
                task.pipeFonts,
                task.pipeData
            ),
        )(cb);
    }
    else {
        console.error(`the mode ${ mode } is not correct. Please use "dev" or "build" instead...`);
    }
}

export async function distClean() {
    await cleanDist(pathData.clean);
}

export function pipesDev(cb) {
    runPipes(modes.dev, cb);
}

export function pipesBuild(cb) {
    runPipes(modes.build, cb);
}

export function runDev(cb) {
    series(
        pipesDev,
        browserSync.reload,
        watchFiles
    )(cb);
}

export function runBuild(cb) {
    series(
        pipesBuild,
        browserSync.reload,
    )(cb);
}