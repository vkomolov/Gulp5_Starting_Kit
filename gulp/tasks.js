"use strict";

import gulp from "gulp";
import {
    modes,
    fileIncludeSettings,
    webpackConfigJs,
    useGulpSizeConfig,
    optimizeCss,
    minifyCss,
    beautifySettings
} from "./settings.js";
import { pathData } from "./paths.js";

//error handling plugins
import plumber from "gulp-plumber";

//html plugins
import htmlClean from "gulp-htmlclean";
import beautify from "gulp-beautify";

//styles plugins
import * as dartSass from "sass";
import gulpSass from "gulp-sass";

//postcss environment
import postcss from "gulp-postcss";

//js plugins
import webpackStream from "webpack-stream";
import webpack from "webpack";

//fonts plugins
//import ttf2woff2 from "gulp-ttf2woff2";

//control plugins
import changed, { compareContents } from "gulp-changed"; //TODO can be removed
import debug from "gulp-debug";
import size from "gulp-size";

//other plugins
import fileInclude from "gulp-file-include";
import zip from "gulp-zip";

//custom modules
import CustomRenameFile from "../modules/CustomRenameFile.js";
import CustomPurgeCss from "../modules/CustomPurgeCss.js";
import CustomImgOptimizer from "../modules/CustomImgOptimizer.js";
import CustomImgConverter from "../modules/CustomImgConverter.js";
import CustomGulpWebpHtml from "../modules/CustomGulpWebpHtml.js";
import { combinePaths, handleError } from "./utilFuncs.js";

/////////////// END OF IMPORTS /////////////////////////

const { src, dest } = gulp;
const sass = gulpSass(dartSass);

/**
 * TASKS:
 *
 * ///// pipeHtml: /////
 *
 * ///// pipeStyles: /////
 *  It takes all scss files:
 *  - at the initial cycle with runDev/runBuild it caches all *.scss files, including nested to the folders at .src/scss
 *  - at the following watch cycles it filters only the changed *.scss in all the folders at .src/scss/
 *  Then it filters the root *.scss files, which linked to html and dependant to the changed *.scss, imported to them
 *  Then it pipes the dependant root *.scss to Sass, which compiles them with all imported *.scss, nested in the folders
 *  Then it removes the css selectors from ${baseName}.css, which are not used in the following ${baseName}.html
 *  Then it optimizes the css files with no compression for the following writing to .dist/
 *  Then it compresses the css files and renames them with .min suffix for the following writing to .dist/
 *
 * ///// pipeJs: /////
 *
 * ///// pipeImages: /////
 *
 * ///// pipeFonts: /////
 *
 * ///// pipeData: /////
 *
 * ///// watchFiles: /////
 *
 */
const tasks = {
    [modes.dev]: {
        pipeHtml() {
            return src(pathData.src.html)
                .pipe(plumber({
                    errorHandler: handleError("Error at handleHtml...")
                }))
                .pipe(fileInclude(fileIncludeSettings))
                .pipe(changed(`${pathData.tempPath}/html/`, { hasChanged: compareContents }))
                .pipe(debug({title: 'file changed:'}))
                .pipe(dest(`${pathData.tempPath}/html/`))
                .pipe(new CustomGulpWebpHtml())
                .pipe(beautify.html(beautifySettings.html))
                .pipe(dest(pathData.build.html));
        },
        pipeStyles() {
            return src(pathData.src.styles, { sourcemaps: true })
                .pipe(plumber({
                    errorHandler: handleError("Error at handleStyles...")
                }))
                .pipe(size(useGulpSizeConfig({
                    title: "Before sass: "
                })))
                .pipe(sass({}, () => {}))
                .pipe(size(useGulpSizeConfig({
                    title: "After sass: "
                })))
                .pipe(postcss(optimizeCss)) //to optimize *.css
                .pipe(size(useGulpSizeConfig({
                    title: "After optimizeCss: "
                })))
                .pipe(dest(pathData.build.styles))  //to paste not compressed *.css to dist/
                .pipe(new CustomRenameFile(null, 'min'))    //to rename to *.min.css
                .pipe(dest(pathData.build.styles, { sourcemaps: "." })); //to paste compressed *.css to dist/
        },
        pipeStylesChanged() {
            return src(pathData.src.styles, { sourcemaps: true })
                .pipe(plumber({
                    errorHandler: handleError("Error at handleStyles...")
                }))
                //.pipe(changed(pathData.build.styles))
                //.pipe(debug({title: 'file:'}))
                .pipe(size(useGulpSizeConfig({
                    title: "Before sass: "
                })))
                .pipe(sass({}, () => {}))
                .pipe(size(useGulpSizeConfig({
                    title: "After sass: "
                })))
                .pipe(postcss(optimizeCss)) //to optimize *.css
                .pipe(size(useGulpSizeConfig({
                    title: "After optimizeCss: "
                })))
                .pipe(dest(pathData.build.styles))  //to paste not compressed *.css to dist/
                .pipe(new CustomRenameFile(null, 'min'))    //to rename to *.min.css
                .pipe(dest(pathData.build.styles, { sourcemaps: "." })); //to paste compressed *.css to dist/
        },
        pipeJs() {
            return src(pathData.src.js)
                .pipe(plumber({
                    errorHandler: handleError("Error at handleJs...")
                }))
                .pipe(webpackStream(webpackConfigJs.dev, webpack))
                .pipe(dest(pathData.build.js))
        },
        pipeImages() {
            return src(pathData.src.img, { encoding: false })
                .pipe(plumber({
                    errorHandler: handleError("Error at handleImages...")
                }))
                .pipe(size(useGulpSizeConfig({
                    title: "image: "
                })))
                .pipe(dest(pathData.build.img))
                .pipe(new CustomImgConverter(["jpg", "jpeg", "png"], "webp", {
                    toSkipOthers: true,
                }))
                .pipe(dest(pathData.build.img));
        },
        pipeImagesChanged() {
            return src(pathData.src.img, { encoding: false })
                .pipe(plumber({
                    errorHandler: handleError("Error at handleImages...")
                }))
                .pipe(changed(pathData.build.img))
                .pipe(size(useGulpSizeConfig({
                    title: "image: "
                })))
                .pipe(dest(pathData.build.img))
                .pipe(new CustomImgConverter(["jpg", "jpeg", "png"], "webp", {
                    toSkipOthers: true,
                }))
                .pipe(dest(pathData.build.img));
        },
        pipeFonts() {
            return src(pathData.src.fonts, { encoding: false }) //not convert data to text encoding
                .pipe(plumber({
                    errorHandler: handleError("Error at handleFonts...")
                }))
                .pipe(dest(pathData.build.fonts));
        },
        pipeFontsChanged() {
            return src(pathData.src.fonts, { encoding: false }) //not convert data to text encoding
                .pipe(plumber({
                    errorHandler: handleError("Error at handleFonts...")
                }))
                .pipe(changed(pathData.build.fonts))
                .pipe(dest(pathData.build.fonts));
        },
        pipeData() {
            return src(pathData.src.data, { encoding: false })
                .pipe(plumber({
                    errorHandler: handleError("Error at handleData...")
                }))
                .pipe(dest(pathData.build.data));
        },
        pipeDataChanged() {
            return src(pathData.src.data, { encoding: false })
                .pipe(plumber({
                    errorHandler: handleError("Error at handleData...")
                }))
                .pipe(changed(pathData.build.data))
                .pipe(dest(pathData.build.data));
        },
    },
    [modes.build]: {
        pipeHtml() {
            return src(pathData.src.html)
                .pipe(plumber({
                    errorHandler: handleError("Error at handleHtml...")
                }))
                .pipe(fileInclude(fileIncludeSettings))
                .pipe(new CustomGulpWebpHtml())
                .pipe(htmlClean())
                .pipe(dest(pathData.build.html));
        },
        pipeStyles() {
            return src(pathData.src.styles)
                .pipe(plumber({
                    errorHandler: handleError("Error at handleStyles...")
                }))
                .pipe(size(useGulpSizeConfig({
                    title: "Before sass: "
                })))
                .pipe(sass({}, () => {}))
                .pipe(size(useGulpSizeConfig({
                    title: "After sass: "
                })))
                .pipe(new CustomPurgeCss(pathData.build.html))  //to filter ${basename}.css selectors not used in ${basename}.html
                .pipe(size(useGulpSizeConfig({
                    title: "After PurgeCss: "
                })))
                .pipe(postcss(optimizeCss)) //to optimize *.css
                .pipe(size(useGulpSizeConfig({
                    title: "After optimizeCss: "
                })))
                .pipe(dest(pathData.build.styles))  //to paste not compressed *.css to dist/
                .pipe(postcss(minifyCss))   //to compress *.css
                .pipe(size(useGulpSizeConfig({
                    title: "After minifyCss: "
                })))
                .pipe(new CustomRenameFile(null, 'min'))    //to rename to *.min.css
                .pipe(dest(pathData.build.styles)); //to paste compressed *.css to dist/
        },
        pipeJs() {
            return src(pathData.src.js)
                .pipe(plumber({
                    errorHandler: handleError("Error at handleJs...")
                }))
                .pipe(webpackStream(webpackConfigJs.build, webpack))
                .pipe(dest(pathData.build.js));
        },
        pipeImages() {
            return src(pathData.src.img, { encoding: false })
                .pipe(plumber({
                    errorHandler: handleError("Error at handleImages...")
                }))
                .pipe(size(useGulpSizeConfig({
                    title: "Image before optimization: "
                })))
                .pipe(new CustomImgOptimizer({
                    //resize: { width: 1000 },
                    jpeg: { quality: 75 },
                    png: { quality: 80 },
                    webp: { quality: 75 },
                    avif: { quality: 60 },
                    svg: {
                        js2svg: { indent: 2, pretty: true },
                        plugins: [
                            {
                                name: 'preset-default',
                                params: {
                                    overrides: {
                                        removeViewBox: false,
                                        cleanupIds: false,
                                        inlineStyles: {
                                            onlyMatchedOnce: false,
                                        },
                                    },
                                },
                            },
                        ],
                    }
                }))
                .pipe(size(useGulpSizeConfig({
                    title: "Image after optimization: "
                })))
                .pipe(dest(pathData.build.img))
                .pipe(new CustomImgConverter(["jpg", "jpeg", "png"], "webp", {
                    toSkipOthers: true,
                }))
                .pipe(dest(pathData.build.img));
        },
        pipeFonts() {
            return src(pathData.src.fonts, { encoding: false }) //not convert data to text encoding
                .pipe(plumber({
                    errorHandler: handleError("Error at handleFonts...")
                }))
                .pipe(dest(pathData.build.fonts));
        },
        pipeData() {
            return src(pathData.src.data, { encoding: false })
                .pipe(plumber({
                    errorHandler: handleError("Error at handleData...")
                }))
                .pipe(dest(pathData.build.data));
        },
        pipeZipProject() {
            return src(pathData.src.zipProject, {})
                .pipe(plumber({
                    errorHandler: handleError("Error at zipProject...")
                }))
                .pipe(zip(`${ pathData.rootFolder }.project.zip`))
                .pipe(dest(pathData.build.zipProject));
        },
        pipeZipDist() {
            return src(pathData.src.zipDist, {})
                .pipe(plumber({
                    errorHandler: handleError("Error at zipDist...")
                }))
                .pipe(zip(`${ pathData.rootFolder }.zip`))
                .pipe(dest(pathData.build.zipDist));
        }
    }
};
export default tasks;