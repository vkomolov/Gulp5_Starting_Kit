"use strict";

import gulp from "gulp";

//variables and settings
import { fileIncludeSettings, pathData } from "./vars.js";

//error handling plugins
import plumber from "gulp-plumber";

//html plugins
import typograf from "gulp-typograf";
import htmlclean from "gulp-htmlclean";
import prettier from "@bdchauvette/gulp-prettier";

//styles plugins
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import dependents from "gulp-dependents";
import autoprefixer from "autoprefixer";
import sortMediaQueries from "postcss-sort-media-queries";
import discardUnused from "postcss-discard-unused";

//postcss environment
import postcss from "gulp-postcss";
import cssnano from "cssnano";
import normalizeWhitespace from 'postcss-normalize-whitespace';

//js plugins
import babel from "gulp-babel";
import webpack from "webpack-stream";

//control plugins
import cached from "gulp-cached";   //TODO can be removed in favor to gulp-newer
import changed from "gulp-changed"; //TODO can be removed
import debug from "gulp-debug";
import size from 'gulp-size';

//fonts plugins
//import ttf2woff2 from "gulp-ttf2woff2";

//other plugins
import fileInclude from "gulp-file-include";

//custom modules

import CustomRenameFile from "../modules/CustomRenameFile.js";
import CustomPurgeCss from "../modules/CustomPurgeCss.js";
import CustomIf from "../modules/CustomIf.js";
import CustomNewer from "../modules/CustomNewer.js";
import TerserMinifier from "../modules/TerserMinifier.js";
import { combinePaths, handleError } from "./utilFuncs.js";

/////////////// END OF IMPORTS /////////////////////////

const { src, dest, series, parallel, watch } = gulp;

const sass = gulpSass(dartSass);
const optimizeCss = [
    sortMediaQueries({
        sort: "mobile-first"
    }),
    autoprefixer(),
    discardUnused({}),
    cssnano({
        preset: [
            "default",
            {
                normalizeWhitespace: false //avoiding compressing css file
            }
        ]
    })
];
const minifyCss = [
    normalizeWhitespace(),
];

/**
 *
 *
 */
export function handleHtml() {
    return src(pathData.src.html)
        .pipe(plumber({
            errorHandler: handleError("Error at handleHtml...")
        }))
        .pipe(debug({title: "dependants: "}))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(dest(pathData.build.html));
}

/**
 *  It takes all scss files:
 *  - at the initial cycle with runDev/runBuild it caches all *.scss files, including nested to the folders at .src/scss
 *  - at the following watch cycles it filters only the changed *.scss in all the folders at .src/scss/
 *  Then it filters the root *.scss files, which linked to html and dependant to the changed *.scss, imported to them
 *  Then it pipes the dependant root *.scss to Sass, which compiles them with all imported *.scss, nested in the folders
 *  Then it removes the css selectors from ${baseName}.css, which are not used in the following ${baseName}.html
 *  Then it optimizes the css files with no compression for the following writing to .dist/
 *  Then it compresses the css files and renames them with .min suffix for the following writing to .dist/
 * TODO: to the find solution with the correct sourcemaps...
 * TODO: CustomPurgeCss and postCss([normalizeWhitespace()]) break the sourcemap
 * TODO: https://www.npmjs.com/package/gulp-sourcemaps have 3 moderate vulnerabilities and was removed...
 * TODO: src(srcPath, { sourcemaps: true })/gulp.dest(distPath, { sourcemaps: '.' }) are also broken by the upper modules
 */
export function handleStyles() {
    return src(pathData.src.styles)
        .pipe(plumber({
            errorHandler: handleError("Error at handleStyles...")
        }))
        .pipe(new CustomNewer())    //it caches and filters files by the modified time
        .pipe(dependents()) //it collects the files which are dependant to the updated file
        .pipe(debug({title: "dependants: "}))
        .pipe(new CustomIf(/^[^\\]*\.scss$/))   //it filters the dependant root scss files not nested in /**/
        .pipe(sass({}, () => {}))
        .pipe(debug({title: "Sass: "}))
        .pipe(size())
        .pipe(new CustomPurgeCss(pathData.build.html))  //to filter ${basename}.css selectors not used in ${basename}.html
        .pipe(debug({title: "PurgeCss: "}))
        .pipe(size())
        .pipe(postcss(optimizeCss)) //to optimize *.css
        .pipe(debug({title: "css optimized: "}))
        .pipe(size())
        .pipe(dest(pathData.build.styles))  //to paste not compressed *.css to dist/
        .pipe(postcss(minifyCss))   //to compress *.ss
        .pipe(debug({title: "css compressed: "}))
        .pipe(size())
        .pipe(new CustomRenameFile(null, 'min'))    //to rename to *.min.css
        .pipe(dest(pathData.build.styles)); //to paste compressed *.css to dist/
}

/*function handleJs() {
    return src(pathData.src.js, { sourcemaps: true })
        .pipe(babel())
        .pipe(dest(pathData.build.js))
        .pipe(new CustomRenameFile(null, 'min'))    //to rename to *.min.js
        .pipe(new TerserMinifier({
            format: {
                "quote_style": 2
            }
        }))
        .pipe(dest(pathData.build.js, { sourcemaps: "." }));
}*/

/*
export function handleJs() {
    return src(pathData.src.js, { sourcemaps: true })
        .pipe(webpack())
}
*/

export function handleImages() {
    return src(pathData.src.img, { encoding: false })
        .pipe(plumber({
            errorHandler: handleError("Error at handleImages...")
        }))
        .pipe(new CustomNewer())
        .pipe(dest(pathData.build.img));
}

export function handleFonts() {
    return src(pathData.src.fonts, { encoding: false }) //not convert data to text encoding
        .pipe(plumber({
            errorHandler: handleError("Error at handleFonts...")
        }))
        .pipe(new CustomNewer())
        .pipe(dest(pathData.build.fonts));
}

export function handleData() {
    return src(pathData.src.data, { encoding: false })
        .pipe(plumber({
            errorHandler: handleError("Error at handleData...")
        }))
        .pipe(new CustomNewer())
        .pipe(dest(pathData.build.data));
}

export function watchFiles(browserSync) {
    watch(pathData.watch.html, series(handleHtml, browserSync.reload));

    //optional: browserSync.stream()
    //watch(pathData.watch.styles, series(handleStyles, browserSync.stream));
    watch(pathData.watch.styles, series(handleStyles, browserSync.reload));

//    watch(pathData.watch.js, series(handleJs, browserSync.reload));

    watch(pathData.watch.img, series(handleImages, browserSync.reload));

    watch(pathData.watch.fonts, series(handleFonts, browserSync.reload));

    watch(pathData.watch.data, series(handleData, browserSync.reload));
}