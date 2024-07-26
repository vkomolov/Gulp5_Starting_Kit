import gulp from "gulp";
import BrowserSync from "./modules/BrowserSync.js";

import { pathData } from "./gulp/paths.js";
import { modes } from "./gulp/settings.js";
import { cleanDist } from "./gulp/utilFuncs.js";
import tasks from "./gulp/tasks.js";

/////////////// END OF IMPORTS /////////////////////////
const { series, parallel, watch } = gulp;
const initBs = () => {
    return new BrowserSync({
        baseDir: pathData.distPath,
        index: "index.html",
        open: true,
        notify: false,
        noCacheHeaders: true
    });
};

function watchFiles(bs) {
    const pipesDev = tasks[modes.dev];
    watch(pathData.watch.htmlNested, series(pipesDev.pipeHtml, bs.reload));
    watch(pathData.watch.stylesNested, series(pipesDev.pipeStyles, bs.reload));
    watch(pathData.watch.jsNested, series(pipesDev.pipeJs, bs.reload));
    watch(pathData.watch.img, series(pipesDev.pipeImages, bs.reload));
    watch(pathData.watch.fonts, series(pipesDev.pipeFonts, bs.reload));
    watch(pathData.watch.data, series(pipesDev.pipeData, bs.reload));
}

/**
 * It initiates tasks with account to the mode of tasks to run
 * @param { string } mode - "dev" or "build"
 * @param { function } cb - callback
 */
function runPipes(mode, cb) {
    if (mode in modes) {
        const task = tasks[mode];
        const zipDist = () => {
            return task.pipeZipDist ? task.pipeZipDist() : Promise.resolve();
        }
        const zipProject = () => {
            return task.pipeZipProject ? task.pipeZipProject() : Promise.resolve();
        }

        series(
            distClean,
            task.pipeImages,
            task.pipeHtml,  //it needs images with alternative *.webp for tag <picture>
            parallel(
                task.pipeStyles,
                task.pipeJs,
                task.pipeFonts,
                task.pipeData
            ),
            zipProject,
            zipDist,
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
    const bs = initBs();
    series(
        pipesDev,
        bs.start,
        () => watchFiles(bs)
    )(cb);
}

export function runBuild(cb) {
    const bs = initBs();
    series(
        pipesBuild,
        bs.start,
    )(cb);
}