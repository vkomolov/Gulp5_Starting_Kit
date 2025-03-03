"use strict";

import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import discardUnused from "postcss-discard-unused";
import normalizeWhitespace from "postcss-normalize-whitespace";
import sortMediaQueries from "postcss-sort-media-queries";
import TerserPlugin from "terser-webpack-plugin";
import { getMatchedFromArray } from "../src/js/helpers/funcs.js";
import { entries } from "./paths.js";
import { getFilesEntries, getPagesContentVersions } from "./utilFuncs.js";

/////////////// END OF IMPORTS /////////////////////////

////////////// INITIAL SETTINGS ///////////////////////
export const modes = {
    dev: "dev",
    build: "build"
}
const robotsParams = "noindex";
const linkStyles = {
    index: ["/css/index.min.css"],
    gates: ["/css/index.min.css"],
    rollers: ["/css/index.min.css"],
}

/**
 * the scripts can be written at the end of the tag <body> omitting writing it in the tag <head>
 * In this case the script links can be empty in the lower linkScripts...
 * @type {{}}
 */
const linkScripts = {
/*    index: [
        {
            link: "/js/index.bundle.js", //this property must exist in linkScripts
            loadMode: "async"   //"differ" this property may not exist in linkScripts
        },
    ],*/
/*    gates: [
        {
            link: "/js/index.bundle.js", //this property must exist in linkScripts
            loadMode: "async"   //"differ" this property may not exist in linkScripts
        },
    ],*/
/*    rollers: [
        {
            link: "/js/index.bundle.js", //this property must exist in linkScripts
            loadMode: "async"   //"differ" this property may not exist in linkScripts
        },
    ],*/
}

//base root url at the server... example: "https://example.com"
const rootUrl = "https://example.com"

/**
 * getting the file entries for all *.json with the pages` content.
 * Each json file contains the pages` data with particular language version.
 * Gulp automatically compiles pages for each ${lang}.json and passes them to dist/html/${lang}
 * Gulp automatically adds language version navigation at <header> of the pages...
 */
const pageJsonEntries = getFilesEntries("src/assets/data/pagesVersions", "json");

export const languages = Object.keys(pageJsonEntries);

//what languages are to be canonical... checking if they exist in the const languages...
const metaCanonical = getMatchedFromArray(languages, ["ua", "ru"]);

////////////// END OF INITIAL SETTINGS ///////////////////////

//collecting data from 'assets/data/pagesVersions/*.json'
const getPageData = (lang) => {
    try {
        const pagesContent = getPagesContentVersions(pageJsonEntries, {
            robotsParams,
            linkStyles,
            //linkScripts,  //optional
            rootUrl,
            metaCanonical,
            languages,
            lang
        });
        //console.log(`pageContent by ${lang}: `, pagesContent[lang]);
        return pagesContent[lang];
    }
    catch (error) {
        console.error(`Failed to process data for lang ${lang}: ${error.message}`);
        return {}
    }

}

//it returns the page`s data context with the language version for the gulp-file-include settings
export const setFileIncludeSettings = (lang) => {
    return {
        prefix: "@@",
        basepath: "@file",
        context: {
            data: getPageData(lang),
        }
    }
}
export const beautifySettings = {
    html: {
        //indent_size: 2,
        //indent_char: ' ',
        indent_with_tabs: true,
        preserve_newlines: false,
        //max_preserve_newlines: 0,
        //wrap_line_length: 80,
        //extra_liners: ['head', 'body', '/html']
    }
}
export const optimizeCss = [
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
export const minifyCss = [
    normalizeWhitespace(),
];
export const useGulpSizeConfig = (params = {}) => {
    return Object.assign({
        showFiles: true,
        pretty: true,
        showTotal: false,
        gzip: false,
    }, params);
};
export const webpackConfigJs = {
    dev: {
        mode: "development",
        devtool: 'source-map',
        entry: {
            ...entries.js,
        },
        output: {
            filename: "[name].bundle.js",
            //path: pathData.build.js,  //will be piped to gulp.dest with the path: pathData.build.js
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    [
                                        "@babel/preset-env",
                                        { "modules": false, }
                                    ]
                                ],
                                plugins: [
                                    "@babel/plugin-transform-runtime",
                                    "@babel/plugin-transform-classes",
                                ],
                            },
                        },
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        "style-loader",
                        "css-loader"
                    ],
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
            //path: pathData.build.js,  //will be piped to gulp.dest with the path: pathData.build.js
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
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    [
                                        "@babel/preset-env",
                                        { "modules": false, }
                                    ]
                                ],
                                plugins: [
                                    "@babel/plugin-transform-runtime",
                                    "@babel/plugin-transform-classes",
                                ],
                            },
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        "style-loader",
                        "css-loader"
                    ],
                },
            ],
        },
    }
}
export const svgoSpriteOptions = {
    mono: {
        plugins: [
            {
                name: "removeAttrs",
                params: {
                    attrs: ["class", "pagesVersions-name", "fill", "stroke.*"], //"stroke.*" removing all stroke-related attributes
                },
            },
            {
                name: "removeDimensions", // it removes width and height
            }
        ]
    },
    multi: {
        plugins: [
            {
                name: "removeAttrs",
                params: {
                    attrs: ["class", "pagesVersions-name"],
                },
            },
            {
                name: "removeDimensions", // it removes width and height
            },
            {
                name: "removeUselessStrokeAndFill",
                active: false,
            },
            {
                name: "inlineStyles",
                active: true,
            }
        ]
    }
};



