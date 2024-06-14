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
import purgecss from "@fullhuman/postcss-purgecss"; //TODO: redundant???

//postcss environment
import postcss from "gulp-postcss";
import cssnano from "cssnano";
import normalizeWhitespace from 'postcss-normalize-whitespace';

//js plugins
import babel from "gulp-babel";
import prettier from "@bdchauvette/gulp-prettier";
import uglify from "gulp-uglify";

//control plugins
import newer from "gulp-newer";
import cached from "gulp-cached";   //TODO can be removed in favor to gulp-newer
import changed from "gulp-changed"; //
import debug from "gulp-debug";
import size from 'gulp-size';

//fonts plugins
import ttf2woff2 from "gulp-ttf2woff2";

//other plugins
import fileInclude from "gulp-file-include";
import clean from "gulp-clean";

//custom modules
import LocalServer from "./src/modules/localServer.js";
import CustomRenameFile from "./src/modules/CustomRenameFile.js";
import CustomPurgeCss from "./src/modules/CustomPurgeCss.js";
import { combinePaths } from "./src/modules/utilFuncs.js";  //TODO: redundant???


/////////////// END OF IMPORTS /////////////////////////

const { src, dest } = gulp;
const srcPath = "src/";
const distPath = "dist/";
const fileIncludeSettings = {
    prefix: "@@",
    basepath: "@file"
};
const pathData = {
    build: {
        html: distPath,
        htmlAux: `${ distPath }*.html`, //redundant?
        styles: `${ distPath }css/`,
        stylesAux: `${ distPath }css/*.css`,
        js: `${ distPath }js/`,
        jsAux: `${ distPath }js/*.js`,
        img: `${ distPath }assets/img/`,
        fonts: `${ distPath }assets/fonts/`,
        data: `${ distPath }assets/data/`,
    },
    src: {
        html: `${ srcPath }*.html`,
        styles: `${ srcPath }scss/*.scss`,
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
const localServer = new LocalServer(pathData.build.html);
const optimizeScss = [
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
const optimizeCss = [
    normalizeWhitespace(),
];

function handleError(taskTypeError) {
    return (err) => {
        console.error(taskTypeError, err.message);
        //console.error(err);
        //this.emit('end'); // halt the pipe
    }
}

function handleHtml() {
    return src(pathData.src.html)
        .pipe(plumber({
            errorHandler: handleError("Error at handleHtml...")
        }))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(dest(pathData.build.html));
}

function handleSass() {
    return src(pathData.src.styles, { sourcemaps: true })
        .pipe(debug({title: "Sass run...: "}))
        .pipe(size())
        .pipe(plumber({
            errorHandler: handleError("Error at handleStyles...")
        }))
        .pipe(dependents())
        .pipe(sass({}, () => {}))
        .pipe(debug({title: "Sass optimized...: "}))
        .pipe(size())
        .pipe(postcss(optimizeScss))
        .pipe(dest(pathData.build.styles, { sourcemaps: '.' }));
}

function handleCss() {
    return src(pathData.build.stylesAux)
        .pipe(debug({title: "PurgeCss run... "}))
        .pipe(size())
        .pipe(new CustomPurgeCss(pathData.build.html))
        .pipe(debug({title: "PurgeCss optimized... "}))
        .pipe(size())
        .pipe(debug({title: "compressing css... "}))
        .pipe(postcss(optimizeCss))
        .pipe(debug({title: "css compressed... "}))
        .pipe(size())
        .pipe(new CustomRenameFile(null, 'min'))
        .pipe(dest(pathData.build.styles));
}

function handleImages() {
    return src(pathData.src.img, { encoding: false })
        .pipe(plumber({
            errorHandler: handleError("Error at handleImages...")
        }))
        .pipe(newer(pathData.build.img))
        .pipe(dest(pathData.build.img));
}

function handleFonts() {
    return src(pathData.src.fonts, { encoding: false }) //not convert data to text encoding
        .pipe(plumber({
            errorHandler: handleError("Error at handleFonts...")
        }))
        .pipe(newer(pathData.build.fonts))
        .pipe(dest(pathData.build.fonts));
}

function handleData() {
    return src(pathData.src.data, { encoding: false })
        .pipe(plumber({
            errorHandler: handleError("Error at handleData...")
        }))
        .pipe(newer(pathData.build.data))
        .pipe(dest(pathData.build.data));
}

function watchFiles() {
    gulp.watch(pathData.watch.html, gulp.series(handleHtml, localServer.reload));

    //optional: browserSync.stream()
    //gulp.watch(pathData.watch.styles, gulp.series(handleStyles, localServer.stream)
    gulp.watch(pathData.watch.styles, gulp.series(handleStyles, localServer.reload));

    //gulp.watch(pathData.watch.js, handleJs);

    gulp.watch(pathData.watch.img, gulp.series(handleImages, localServer.reload));

    gulp.watch(pathData.watch.fonts, gulp.series(handleFonts, localServer.reload));
    gulp.watch(pathData.watch.data, gulp.series(handleData, localServer.reload));
}

export function cleanDist() {
    return src(
        pathData.clean,
        {
            allowEmpty: true,
            read: false,
        }
    )
        .pipe(clean({ force: true }));
}

export function runBuild(cb) {
    gulp.series(
        cleanDist,
        gulp.parallel(
            handleHtml,
            handleSass,
            handleImages,
            handleFonts,
            handleData
        ),
        handleCss
    )(cb);
}

export function runDev(cb) {
    gulp.series(
        runBuild,
        localServer.reload,
        watchFiles
    )(cb);
}

