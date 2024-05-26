import gulp from "gulp";
import fileInclude from "gulp-file-include";
import * as sassAux from "sass";
import gulpSass from "gulp-sass";
import sassGlob from "gulp-sass-glob";
import sync from "browser-sync";


const browserSync = sync.create();
const sass = gulpSass(sassAux);

const { src, dest } = gulp;

const srcPath = "src/";
const distPath = "dist/"

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
        js: `${ srcPath }js/**/*.js`,
        img: `${ srcPath }assets/img/**/*.{jpg,png,svg,gif,ico,webp,xml,json,webmanifest}`,
        fonts: `${ srcPath }assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
        data: `${ srcPath }assets/data/**/*.json`,  //is necessary only for watching: data will not be in "dist"
    },
    clean: `./${ distPath }`
};


