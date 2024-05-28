import gulp from "gulp";
import plumber from "gulp-plumber";
import fileInclude from "gulp-file-include";
import * as dartSass from "sass";
import gulpSass from "gulp-sass";
import sassGlob from "gulp-sass-glob";
import clean from "gulp-clean";

import LocalServer from "./src/modules/localServer.js";

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
        html: `${ srcPath }**/*.html`,
        styles: `${ srcPath }scss/**/*.scss`,
        js: `${ srcPath }js/**/*.js ${srcPath}modules/**/*.js`,
        img: `${ srcPath }assets/img/**/*.{jpg,png,svg,gif,ico,webp,xml,json,webmanifest}`,
        fonts: `${ srcPath }assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
        data: `${ srcPath }assets/data/**/*.json`,  //is necessary only for watching: data will not be in "dist"
    },
    clean: `./${ distPath }`
};

const sass = gulpSass(dartSass);
const localServer = new LocalServer(pathData.build.html);

function handleHtml() {
    return src(pathData.src.html)
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(dest(pathData.build.html))
}
function handleStyles() {
    return src(pathData.src.styles)
        .pipe(sass({}, () => {}))
        .pipe(dest(pathData.build.styles));
}
function handleImages() {
    return src(pathData.src.img)
        .pipe(dest(pathData.build.img));
}

function watchFiles() {
    gulp.watch(pathData.watch.html, handleHtml);
    gulp.watch(pathData.watch.styles, handleStyles);
    //gulp.watch(pathData.watch.js, handleJs);
    gulp.watch(pathData.watch.img, handleImages);
    //gulp.watch(pathData.watch.fonts, handleFonts);
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

//TODO: to accomplish runBuild
export function runBuild(cb) {
    gulp.series(
        cleanDist,
        gulp.parallel(
            handleHtml,
            handleStyles,
            handleImages,
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

//export const testStream = gulp.series(handleStyles, localServer.stream);
//export const testReload = gulp.series(handleHtml, localServer.reload);

