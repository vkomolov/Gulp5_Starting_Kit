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
import uglify from "gulp-uglify";

//control plugins
//import newer from "gulp-newer";
import cached from "gulp-cached";   //TODO can be removed in favor to gulp-newer
import changed from "gulp-changed"; //TODO can be removed
import debug from "gulp-debug";
import size from 'gulp-size';

//fonts plugins
//import ttf2woff2 from "gulp-ttf2woff2";

//other plugins
import fileInclude from "gulp-file-include";


//custom modules
//import LocalServer from "./src/modules/localServer.js";
import CustomRenameFile from "./src/modules/CustomRenameFile.js";
import CustomPurgeCss from "./src/modules/CustomPurgeCss.js";
import CustomIf from "./src/modules/CustomIf.js";
import CustomNewer from "./src/modules/CustomNewer.js";
import { combinePaths, cleanDist } from "./src/modules/utilFuncs.js";


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
//const localServer = new LocalServer(pathData.dist.html);
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

function handleError(taskTypeError) {
    return (err) => {
        console.error(taskTypeError, err.message);
        //console.error(err);
        //this.emit('end'); // halt the pipe
    }
}

function handleHtml() {
    return src(pathData.src.html)
        .pipe(new CustomNewer(pathData.build.html))
        .pipe(plumber({
            errorHandler: handleError("Error at handleHtml...")
        }))
        .pipe(fileInclude(fileIncludeSettings))
        .pipe(dest(pathData.build.html));
}

function handleStyles() {
    return src(pathData.src.styles, { sourcemaps: true })
        .pipe(plumber({
            errorHandler: handleError("Error at handleStyles...")
        }))
        .pipe(new CustomNewer(pathData.build.styles))
        //.pipe(newer({ dest: pathData.build.styles, ext: '.css' }))
        .pipe(size())
        .pipe(dependents())
        .pipe(sass({}, () => {}))
        .pipe(debug({title: "Sass out: "}))
        .pipe(size())
        .pipe(new CustomPurgeCss(pathData.build.html))
        .pipe(debug({title: "PurgeCss out: "}))
        .pipe(size())
        .pipe(postcss(optimizeCss))
        .pipe(debug({title: "css optimized: "}))
        .pipe(size())
        .pipe(dest(pathData.build.styles))
        .pipe(postcss(minifyCss))
        .pipe(debug({title: "css compressed: "}))
        .pipe(size())
        .pipe(new CustomRenameFile(null, 'min'))
        .pipe(dest(pathData.build.styles));
}

function handleImages() {
    return src(pathData.src.img, { encoding: false })
        .pipe(plumber({
            errorHandler: handleError("Error at handleImages...")
        }))
        .pipe(new CustomNewer(pathData.build.img))
        .pipe(dest(pathData.build.img));
}

function handleFonts() {
    return src(pathData.src.fonts, { encoding: false }) //not convert data to text encoding
        .pipe(plumber({
            errorHandler: handleError("Error at handleFonts...")
        }))
        .pipe(new CustomNewer(pathData.build.fonts))
        .pipe(dest(pathData.build.fonts));
}

function handleData() {
    return src(pathData.src.data, { encoding: false })
        .pipe(plumber({
            errorHandler: handleError("Error at handleData...")
        }))
        .pipe(new CustomNewer(pathData.build.data))
        .pipe(dest(pathData.build.data));
}

function watchFiles() {
    gulp.watch(pathData.watch.html, gulp.series(handleHtml));
    //gulp.watch(pathData.watch.html, gulp.series(handleHtml, localServer.reload));

    //optional: browserSync.stream()
    //gulp.watch(pathData.watch.styles, gulp.series(handleStyles, localServer.stream));
    gulp.watch(pathData.watch.styles, gulp.series(handleStyles));
    //gulp.watch(pathData.watch.styles, gulp.series(handleStyles, localServer.reload));

    //gulp.watch(pathData.watch.js, handleJs);

    gulp.watch(pathData.watch.img, gulp.series(handleImages));
    //gulp.watch(pathData.watch.img, gulp.series(handleImages, localServer.reload));

    gulp.watch(pathData.watch.fonts, gulp.series(handleFonts));
    //gulp.watch(pathData.watch.fonts, gulp.series(handleFonts, localServer.reload));
    gulp.watch(pathData.watch.data, gulp.series(handleData));
    //gulp.watch(pathData.watch.data, gulp.series(handleData, localServer.reload));
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
        //localServer.reload,
        watchFiles
    )(cb);
}

