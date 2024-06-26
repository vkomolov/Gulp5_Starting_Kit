import gulp from "gulp";

//error handling plugins
import plumber from "gulp-plumber";

//html plugins
import typograf from "gulp-typograf";
import htmlclean from "gulp-htmlclean";

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
import prettier from "@bdchauvette/gulp-prettier";

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
import BrowserSync from "./src/modules/BrowserSync.js";
import CustomRenameFile from "./src/modules/CustomRenameFile.js";
import CustomPurgeCss from "./src/modules/CustomPurgeCss.js";
import CustomIf from "./src/modules/CustomIf.js";
import CustomNewer from "./src/modules/CustomNewer.js";
import { combinePaths, cleanDist } from "./src/modules/utilFuncs.js";


/////////////// END OF IMPORTS /////////////////////////

const { src, dest } = gulp;
const srcPath = "./src/";
const distPath = "./dist/";
const fileIncludeSettings = {
    prefix: "@@",
    basepath: "@file"
};
const pathData = {
    build: {
        html: distPath,
        //htmlAux: `${ distPath }*.html`, //redundant?
        styles: `${ distPath }css/`,
        //stylesAux: `${ distPath }css/*.css`,
        js: `${ distPath }js/`,
        //jsAux: `${ distPath }js/*.js`,
        img: `${ distPath }assets/img/`,
        fonts: `${ distPath }assets/fonts/`,
        data: `${ distPath }assets/data/`,
    },
    src: {
        html: `${ srcPath }*.html`,
        styles: `${ srcPath }scss/**/*.scss`,   //only changed files will be processed
        js: `${ srcPath }js/**/*.js`,
        img: `${ srcPath }assets/img/**/*.{jpg,png,svg,gif,ico,webp,xml,json,webmanifest}`,
        fonts: `${ srcPath }assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
        data: `${ srcPath }assets/data/**/*.{json, pdf, xml}`,
    },
    watch: {
        html: [`${ srcPath }*.html`, `${ srcPath }html/**/*.html`],
        styles: `${ srcPath }scss/**/*.scss`,
        js: [`${ srcPath }js/**/*.js`, `${ srcPath }modules/**/*.js`],
        img: `${ srcPath }assets/img/**/*.{jpg,png,svg,gif,ico,webp,xml,json,webmanifest}`,
        fonts: `${ srcPath }assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
        data: `${ srcPath }assets/data/**/*.{json, pdf, xml}`,
    },
    clean: `./${ distPath }`
};

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
const browserSync = new BrowserSync({
    baseDir: distPath,
    index: "main.html",
    open: true,
    notify: true,
    noCacheHeaders: true
});

function handleError(taskTypeError) {
    return (err) => {
        console.error(taskTypeError, err.message);
        //console.error(err);
        //this.emit('end'); // halt the pipe
    }
}

/**
 *
 * @returns {*}
 */
function handleHtml() {
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
function handleStyles() {
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

function handleImages() {
    return src(pathData.src.img, { encoding: false })
        .pipe(plumber({
            errorHandler: handleError("Error at handleImages...")
        }))
        .pipe(new CustomNewer())
        .pipe(dest(pathData.build.img));
}

function handleFonts() {
    return src(pathData.src.fonts, { encoding: false }) //not convert data to text encoding
        .pipe(plumber({
            errorHandler: handleError("Error at handleFonts...")
        }))
        .pipe(new CustomNewer())
        .pipe(dest(pathData.build.fonts));
}

function handleData() {
    return src(pathData.src.data, { encoding: false })
        .pipe(plumber({
            errorHandler: handleError("Error at handleData...")
        }))
        .pipe(new CustomNewer())
        .pipe(dest(pathData.build.data));
}

export function watchFiles() {
    //gulp.watch(pathData.watch.html, gulp.series(handleHtml));
    gulp.watch(pathData.watch.html, gulp.series(handleHtml, browserSync.reload));

    //optional: browserSync.stream()
    //gulp.watch(pathData.watch.styles, gulp.series(handleStyles, browserSync.stream));
    //gulp.watch(pathData.watch.styles, gulp.series(handleStyles));
    gulp.watch(pathData.watch.styles, gulp.series(handleStyles, browserSync.reload));

    //gulp.watch(pathData.watch.js, handleJs);

    //gulp.watch(pathData.watch.img, gulp.series(handleImages));
    gulp.watch(pathData.watch.img, gulp.series(handleImages, browserSync.reload));

    //gulp.watch(pathData.watch.fonts, gulp.series(handleFonts));
    gulp.watch(pathData.watch.fonts, gulp.series(handleFonts, browserSync.reload));

    //gulp.watch(pathData.watch.data, gulp.series(handleData));
    gulp.watch(pathData.watch.data, gulp.series(handleData, browserSync.reload));
}

async function cleanBuild() {
    await cleanDist(pathData.clean);
}

export function runBuild(cb) {
    gulp.series(
        cleanBuild,
        handleHtml, //handling html beforehand for purgeCss in handleSass
        gulp.parallel(
            handleStyles,
            handleImages,
            handleFonts,
            handleData
        ),
    )(cb);
}

export function runDev(cb) {
    gulp.series(
        runBuild,
        browserSync.reload,
        watchFiles
    )(cb);
}

