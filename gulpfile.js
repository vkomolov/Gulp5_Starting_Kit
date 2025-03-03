import gulp from "gulp";

import { pathData } from "./gulp/paths.js";
import { modes } from "./gulp/settings.js";
import tasks from "./gulp/tasks.js";
import { cleanDist } from "./gulp/utilFuncs.js";
import BrowserSync from "./modules/BrowserSync.js";

/////////////// END OF IMPORTS /////////////////////////
const { series, parallel, watch } = gulp;

const initBs = (lang) => {
	return new BrowserSync({
		//first priority: "dist/html/", then "dist/" for assets/css or assets/img...
		//baseDir: [path.resolve(pathData.distPath, "html"), pathData.distPath],
		baseDir: pathData.distPath,
		startPath: `/${ lang }/index.html`,
		open: true,
		notify: false,
		noCacheHeaders: true,
		injectChanges: true,  // Enabling change injection
		reloadOnRestart: true,  // Reboot on restart
		ui: false,  // Disabling UI
	});
};


function watchFiles(bs) {
	const pipesDev = tasks[modes.dev];
	watch(pathData.watch.htmlNested, series(pipesDev.pipeHtml, bs.reload));
	watch(pathData.watch.stylesNested, series(pipesDev.pipeStyles, bs.reload));
	watch(pathData.watch.jsNested, series(pipesDev.pipeJs, bs.reload));
	watch(pathData.watch.img, series(pipesDev.pipeImages, bs.reload));
	watch(pathData.watch.svgIconsMono, series(pipesDev.pipeSvgSpriteMono, bs.reload));
	watch(pathData.watch.svgIconsMulti, series(pipesDev.pipeSvgSpriteMulti, bs.reload));
	watch(pathData.watch.fonts, series(pipesDev.pipeFonts, bs.reload));
	//watching data, including *.json, and renewing the html files, compiled with gulp-file-include
	watch(pathData.watch.data, series(pipesDev.pipeData, pipesDev.pipeHtml, bs.reload));
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
			task.pipeImages,
			task.pipeHtml,  //it needs images with alternative *.webp for tag <picture>
			parallel(
				task.pipeStyles,
				task.pipeJs,
				task.pipeFonts,
				task.pipeSvgSpriteMono,
				task.pipeSvgSpriteMulti,
				task.pipeData,
				task.pipeUtils,
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
	const bs = initBs("ua");
	series(
		pipesDev,
		bs.start,
		() => watchFiles(bs)
	)(cb);
}

export function runBuild(cb) {
	const bs = initBs("ua");
	series(
		pipesBuild,
		bs.start,
	)(cb);
}