"use strict";

import path from "path";

/**
 * As all *.js files are treated as ES modules (package.json contains "type": "module"),
 * we get the Node current working directory with process.cwd...
 * Finally, we use path.resolve to construct the absolute path of the src and dist directories
 * relative to the current working directory process.cwd.
 * @type {string}
 */
//
const curWD = process.cwd();
import * as nodePath from "path";
const rootFolder = nodePath.basename(nodePath.resolve());

const srcPath = path.resolve(curWD, "src");
const distPath = path.resolve(curWD, "dist");
export const pathData = {
    rootFolder,
    srcPath,
    distPath,
    ftp: "",
    src: {
        html: `${ srcPath }/*.html`,
        stylesNested: `${ srcPath }/scss/**/*.scss`,
        styles: `${ srcPath }/scss/*.scss`,   //root *.scss, connected to html (for build tasks)
        js: `${ srcPath }/js/*.js`,
        img: `${ srcPath }/assets/img/**/*.{jpg,jpeg,png,svg,gif,webp,avif}`,
        fonts: `${ srcPath }/assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
        data: `${ srcPath }/assets/data/**/*.{json, pdf, xml}`,
        zipDist: `${ distPath }/**/*.*`
    },
    build: {
        html: distPath,
        styles: `${ distPath }/css`,
        js: `${ distPath }/js`,
        img: `${ distPath }/assets/img`,
        fonts: `${ distPath }/assets/fonts`,
        data: `${ distPath }/assets/data`,
        zipDist: distPath
    },
    watch: {
        htmlNested: [
            `${ srcPath }/*.html`,
            `${ srcPath }/html/**/*.html`,
        ],
        stylesNested: `${ srcPath }/scss/**/*.scss`,
        jsNested: [
            `${ srcPath }/js/**/*.js`,
            `${ srcPath }/modules/**/*.js`,
        ],
        img: `${ srcPath }/assets/img/**/*.{jpg,jpeg,png,svg,gif,webp,avif}`,
        fonts: `${ srcPath }/assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
        data: `${ srcPath }/assets/data/**/*.{json, pdf, xml}`,
    },
    clean: distPath,
}
export const entries = {
    js: {
        index: `${ pathData.srcPath }/js/index.js`,
        about: `${ pathData.srcPath }/js/about.js`,
    },
    html: {
        index: `${ pathData.srcPath }/js/index.html`,
        about: `${ pathData.srcPath }/js/about.html`,
    }
}