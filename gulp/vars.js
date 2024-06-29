"use strict";

import TerserPlugin from "terser-webpack-plugin";
/////////////// END OF IMPORTS /////////////////////////

export const srcPath = "./src/";
export const distPath = "./dist/";

export const fileIncludeSettings = {
    prefix: "@@",
    basepath: "@file"
};

export const pathData = {
    src: {
        html: `${ srcPath }*.html`,
        styles: `${ srcPath }scss/**/*.scss`,   //only changed files will be processed
        js: `${ srcPath }js/*.js`,
        img: `${ srcPath }assets/img/**/*.{jpg,png,svg,gif,ico,webp,xml,json,webmanifest}`,
        fonts: `${ srcPath }assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
        data: `${ srcPath }assets/data/**/*.{json, pdf, xml}`,
    },
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

export const entries = {
    js: {
        index: `${ srcPath }js/index.js`,
        about: `${ srcPath }js/about.js`,
    }
}

export const webpackConfigJs = {
    dev: {
        mode: "development",
        devtool: 'source-map',
        entry: {
            ...entries.js,
        },
        output: {
            filename: "[name].bundle.js",
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
            ],
        },
    },
    build: {
        mode: "production",
        entry: {
            ...entries.js,
        },
        output: {
            filename: "[name].bundle.js",
        },
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        format: {
                            comments: false,
                        },
                    },
                    extractComments: false,
                }),
            ],
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: ["style-loader", "css-loader"],
                },
            ],
        },
    }
}