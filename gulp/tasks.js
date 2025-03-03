"use strict";

import gulp from "gulp";
import beautify from "gulp-beautify";

//fonts plugins
//control plugins
import changed, { compareContents } from "gulp-changed";
import debug from "gulp-debug";

//other plugins
import fileInclude from "gulp-file-include";
import filter from "gulp-filter";

//html plugins
import htmlClean from "gulp-htmlclean";

//error handling plugins
import plumber from "gulp-plumber";

//postcss environment
import postcss from "gulp-postcss";
import replace from "gulp-replace";
import gulpSass from "gulp-sass";
import size from "gulp-size";
import path from "path";

//styles plugins
import * as dartSass from "sass";
import webpack from "webpack";

//js plugins
import webpackStream from "webpack-stream";
import CustomGulpSVGSprite from "../modules/CustomGulpSVGSprite.js";
import CustomGulpWebpHtml from "../modules/CustomGulpWebpHtml.js";
import CustomImgConverter from "../modules/CustomImgConverter.js";
import CustomImgOptimizer from "../modules/CustomImgOptimizer.js";

//custom modules
import CustomRenameFile from "../modules/CustomRenameFile.js";
import { pathData } from "./paths.js";

import {
  beautifySettings,
  languages,
  minifyCss,
  modes,
  optimizeCss,
  setFileIncludeSettings,
  useGulpSizeConfig,
  webpackConfigJs
} from "./settings.js";
import { handleError } from "./utilFuncs.js";

/////////////// END OF IMPORTS /////////////////////////

const { src, dest } = gulp;
const sass = gulpSass(dartSass);
const filterFiles = filter(file => !file.isDirectory());

const imgRegex = /<img(?:.|\n|\r)*?>/g;

/**
 * TASKS:
 *
 * ///// pipeHtml: /////
 * It takes all *.html from .src/html including in nested folders except .src/html/templates/*.html.
 * Then it includes partial files from .src/html/templates/*.html.
 * Then it checks whether the ${baseName}.html is changed compared to the previously included ${baseName}.html in
 * the created .src/temp/html folder.
 * If it is changed, then it is piped to .src/temp/html folder with the new version of the file.
 * Then it removes extra spaces and line breaks inside a tag <img>.
 * Then it is piped to new CustomGulpWebpHtml() to alter the <img> tags with the alternative <picture> webp format.
 * Then it is beautified and written to .dist/
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
      return Promise.all(languages.map(lang => {
        const tempHtmlPath = path.join(pathData.tempPath, lang);

        return src(pathData.src.html)
          .pipe(plumber({
            errorHandler: handleError("Error at pipeHtml...")
          }))
          .pipe(fileInclude(setFileIncludeSettings(lang)))
          .pipe(changed(tempHtmlPath, { hasChanged: compareContents }))
          .pipe(debug({ title: "*.html has been changed or new:" }))
          .pipe(dest(tempHtmlPath))
          .pipe(
            //removes extra spaces and line breaks inside a tag <img>
            replace(imgRegex, function (match) {
              return match.replace(/\r?\n|\r/g, "").replace(/\s{2,}/g, " ");
            })
          )
          .pipe(new CustomGulpWebpHtml(pathData.distPath, "2x"))
          .pipe(beautify.html(beautifySettings.html))
          .pipe(dest(path.join(pathData.build.html, lang)));
      }));
    },
    pipeStyles() {
      return src(pathData.src.styles, { sourcemaps: true })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeStyles...")
        }))
        .pipe(sass.sync({}, () => {}).on('error', sass.logError))
        .pipe(changed(`${pathData.tempPath}/css/`, { hasChanged: compareContents }))
        .pipe(debug({ title: "*.scss is piped:" }))
        .pipe(dest(`${pathData.tempPath}/css/`))
        .pipe(postcss(optimizeCss)) //to optimize *.css
        .pipe(size(useGulpSizeConfig({
          title: "After optimizeCss: "
        })))
        .pipe(dest(pathData.build.styles))  //to paste not compressed *.css to dist/
        .pipe(new CustomRenameFile(null, "min"))    //to rename to *.min.css
        .pipe(dest(pathData.build.styles, { sourcemaps: "." })); //to paste compressed *.css to dist/
    },
    pipeJs() {
      return src(pathData.src.js)
        .pipe(plumber({
          errorHandler: handleError("Error at pipeJs...")
        }))
        .pipe(debug({ title: "*.js is piped..." }))
        //.pipe(webpackStream(webpackConfigJs.dev)) //if no need in webpack version control...
        .pipe(webpackStream(webpackConfigJs.dev, webpack))
        .pipe(dest(pathData.build.js));
    },
    pipeImages() {
      return src(pathData.src.img, { encoding: false })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeImages...")
        }))
        .pipe(changed(pathData.build.img))
        .pipe(debug({ title: "image is piped:" }))
        .pipe(dest(pathData.build.img)) //storing initial images before conversion
        .pipe(new CustomImgConverter(["jpg", "jpeg", "png"], "webp", {
          toOptimize: false,   //by default: false
          toSkipOthers: false, //streaming other formats without touch; by default: false
        }))
        .pipe(dest(pathData.build.img));
    },
    pipeSvgSpriteMono() {
      return src(pathData.src.svgIconsMono, { encoding: false })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeSvgSprite...")
        }))
        .pipe(new CustomGulpSVGSprite("mono", "sprite.mono.svg"))
        .pipe(dest(pathData.build.svgIcons));
    },
    pipeSvgSpriteMulti() {
      return src(pathData.src.svgIconsMulti, { encoding: false })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeSvgSprite...")
        }))
        .pipe(new CustomGulpSVGSprite("multi", "sprite.multi.svg"))
        .pipe(dest(pathData.build.svgIcons));
    },
    pipeFonts() {
      return src(pathData.src.fonts, { encoding: false }) //not convert pagesVersions to text encoding
        .pipe(plumber({
          errorHandler: handleError("Error at pipeFonts...")
        }))
        .pipe(changed(pathData.build.fonts))
        .pipe(debug({ title: "font is piped:" }))
        .pipe(dest(pathData.build.fonts));
    },
    pipeData() {
      return src(pathData.src.data, { encoding: false })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeData...")
        }))
        .pipe(changed(pathData.build.data))
        .pipe(debug({ title: "file is piped:" }))
        .pipe(dest(pathData.build.data));
    },
    pipeUtils() {
      return src(pathData.src.utils, { encoding: false, dot: true })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeUtils...")
        }))
        .pipe(filterFiles)
        .pipe(changed(pathData.build.utils))
        .pipe(debug({ title: "utils file is piped:" }))
        .pipe(dest(pathData.build.utils));
    }
  },
  [modes.build]: {
    pipeHtml() {
      return Promise.all(languages.map(lang => {
        return src(pathData.src.html)
          .pipe(plumber({
            errorHandler: handleError("Error at pipeHtml...")
          }))
          .pipe(fileInclude(setFileIncludeSettings(lang)))
          .pipe(
            //removes extra spaces and line breaks inside a tag <img>
            replace(imgRegex, function (match) {
              return match.replace(/\r?\n|\r/g, "").replace(/\s{2,}/g, " ");
            })
          )
          .pipe(new CustomGulpWebpHtml(pathData.distPath, "2x"))
          .pipe(htmlClean())
          .pipe(dest(path.join(pathData.build.html, lang)));
      }));
    },
    pipeStyles() {
      return src(pathData.src.styles)
        .pipe(plumber({
          errorHandler: handleError("Error at pipeStyles...")
        }))
        /*.pipe(size(useGulpSizeConfig({
          title: "Before sass: "
        })))*/
        .pipe(sass.sync({}, () => {}).on('error', sass.logError))

        //! CustomPurgeCss could be used in mono language version of the project with the one language version of the page...
        //! scss file must have the same name as the corresponding HTML file!!!
        //.pipe(new CustomPurgeCss(pathData.build.html))  //to filter ${basename}.css selectors not used in ${basename}.html
/*        .pipe(size(useGulpSizeConfig({
          title: "After PurgeCss: "
        })))*/

        .pipe(postcss(optimizeCss)) //to optimize *.css
        .pipe(size(useGulpSizeConfig({
          title: "After optimizeCss: "
        })))
        .pipe(dest(pathData.build.styles))  //to paste not compressed *.css to dist/
        .pipe(postcss(minifyCss))   //to compress *.css
        .pipe(size(useGulpSizeConfig({
          title: "After minifyCss: "
        })))
        .pipe(new CustomRenameFile(null, "min"))    //to rename to *.min.css
        .pipe(dest(pathData.build.styles)); //to paste compressed *.css to dist/
    },
    pipeJs() {
      return src(pathData.src.js)
        .pipe(plumber({
          errorHandler: handleError("Error at pipeJs...")
        }))
        .pipe(webpackStream(webpackConfigJs.build, webpack))
        .pipe(dest(pathData.build.js));
    },
    pipeImages() {
      return src(pathData.src.img, { encoding: false })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeImages...")
        }))
        .pipe(dest(pathData.build.img)) //storing initial images
        .pipe(new CustomImgConverter(["jpg", "jpeg", "png"], "webp", {
          //resize: { width: 400 },
          /*                    params: {
                                  quality: 100,
                              },*/
          toOptimize: false,   //by default: false
          toSkipOthers: false,    //streaming other formats without touch; by default: false
        })) //conversion and optimization
        .pipe(size(useGulpSizeConfig({
          title: "Image before optimization: "
        })))
        .pipe(new CustomImgOptimizer({
          //resize: { width: 400 },
          jpeg: { quality: 75 },
          png: { quality: 80 },
          webp: { quality: 75 },
          avif: { quality: 60 },
          svg: {
            js2svg: { indent: 2, pretty: true },
            plugins: [
              {
                name: "preset-default",
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
        .pipe(dest(pathData.build.img));
    },
    pipeSvgSpriteMono() {
      return src(pathData.src.svgIconsMono, { encoding: false })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeSvgSprite...")
        }))
        .pipe(new CustomGulpSVGSprite("mono", "sprite.mono.svg"))
        .pipe(dest(pathData.build.svgIcons));
    },
    pipeSvgSpriteMulti() {
      return src(pathData.src.svgIconsMulti, { encoding: false })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeSvgSprite...")
        }))
        .pipe(new CustomGulpSVGSprite("multi", "sprite.multi.svg"))
        .pipe(dest(pathData.build.svgIcons));
    },
    pipeFonts() {
      return src(pathData.src.fonts, { encoding: false }) //not convert pagesVersions to text encoding
        .pipe(plumber({
          errorHandler: handleError("Error at pipeFonts...")
        }))
        .pipe(dest(pathData.build.fonts));
    },
    pipeData() {
      return src(pathData.src.data, { encoding: false })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeData...")
        }))
        .pipe(dest(pathData.build.data));
    },
    pipeUtils() {
      return src(pathData.src.utils, { encoding: false, dot: true })
        .pipe(plumber({
          errorHandler: handleError("Error at pipeUtils...")
        }))
        .pipe(filterFiles)
        .pipe(debug({ title: "utils file is piped:" }))
        .pipe(dest(pathData.build.utils));
    },
  }
};
export default tasks;