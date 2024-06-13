import gulp from "gulp";

//error handling plugins
import plumber from "gulp-plumber";

//html plugins
import typograf from "gulp-typograf";
import webpHtml from "gulp-webp-retina-html";
import htmlclean from "gulp-htmlclean";


//styles plugins
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import dependents from "gulp-dependents";
import autoprefixer from "autoprefixer";
import sortMediaQueries from "postcss-sort-media-queries";
import discardUnused from "postcss-discard-unused";
import webImagesCSS from "gulp-web-images-css";
import purgecss from "@fullhuman/postcss-purgecss";

//postcss environment
import postcss from "gulp-postcss";
import cssnano from "cssnano";
import normalizeWhitespace from 'postcss-normalize-whitespace';

//js plugins
import babel from "gulp-babel";
import prettier from "@bdchauvette/gulp-prettier";
import uglify from "gulp-uglify";

//change control plugins
import newer from "gulp-newer";
import cached from "gulp-cached";
import changed from "gulp-changed";

//fonts plugins
import ttf2woff2 from "gulp-ttf2woff2";

//other plugins
import fileInclude from "gulp-file-include";
import clean from "gulp-clean";

//custom modules
import LocalServer from "./src/modules/localServer.js";
import CustomRenameFile from "./src/modules/CustomRenameFile.js";
import { combinePaths } from "./src/modules/utilFuncs.js";


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
        styles: `${ distPath }css/`,
        stylesAux: [`${ distPath }css/*.css`, `!${ distPath }css/*.min.css`],
        js: `${ distPath }js/`,
        img: `${ distPath }assets/img/`,
        fonts: `${ distPath }assets/fonts/`,
    },
    src: {
        html: `${ srcPath }*.html`,
        styles: `${ srcPath }scss/*.scss`,
        js: `${ srcPath }js/**/*.js`,
        img: `${ srcPath }assets/img/**/*.{jpg,png,svg,gif,ico,webp,xml,json,webmanifest}`,
        fonts: `${ srcPath }assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
    },
    watch: {
        html: [`${ srcPath }*.html`, `${ srcPath }html/**/*.html`],
        styles: `${ srcPath }scss/**/*.scss`,
        js: [`${ srcPath }js/**/*.js`, `${ srcPath }modules/**/*.js`],
        img: `${ srcPath }assets/img/**/*.{jpg,png,svg,gif,ico,webp,xml,json,webmanifest}`,
        fonts: `${ srcPath }assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
        data: `${ srcPath }assets/data/**/*.{json}`,
    },
    clean: `./${ distPath }`
};

const sass = gulpSass(dartSass);
const localServer = new LocalServer(pathData.build.html);
const optimizing = [
    sortMediaQueries({
        sort: "mobile-first"
    }),
    autoprefixer(),
    discardUnused({}),
    purgecss({
        content: combinePaths(pathData.watch.html, pathData.src.js), //it receives a path or|and array of paths
//        safelist: ['safelist-selector'], // classes, which must not be removed...
    }),
    cssnano({
        preset: [
            "default",
            {
                normalizeWhitespace: false //avoiding compressing css file
            }
        ]
    })
];
const compressing = [
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
        .pipe(plumber({
            errorHandler: handleError("Error at handleStyles...")
        }))
        .pipe(dependents())
        .pipe(sass({}, () => {}))
        .pipe(postcss(optimizing))
        .pipe(dest(pathData.build.styles, { sourcemaps: '.' }));
}

function minifyCss() {
    return src(pathData.build.stylesAux)
        .pipe(postcss(compressing))
        .pipe(new CustomRenameFile(null, 'min'))
        .pipe(dest(pathData.build.styles));
}

function handleStyles(cb) {
    gulp.series(
        handleSass,
        minifyCss
    )(cb)
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

function watchFiles() {
    gulp.watch(pathData.watch.html, gulp.series(handleHtml, localServer.reload));

    //optional: browserSync.stream()
    //gulp.watch(pathData.watch.styles, gulp.series(handleStyles, localServer.stream)
    gulp.watch(pathData.watch.styles, gulp.series(handleStyles, localServer.reload));

    //gulp.watch(pathData.watch.js, handleJs);

    gulp.watch(pathData.watch.img, gulp.series(handleImages, localServer.reload));

    gulp.watch(pathData.watch.fonts, gulp.series(handleFonts, localServer.reload));
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
            handleStyles,
            handleImages,
            handleFonts
        )
    )(cb);
}

export function runDev(cb) {
    gulp.series(
        runBuild,
        localServer.reload,
        watchFiles
    )(cb);
}

