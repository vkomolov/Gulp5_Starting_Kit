"use strict";

import TerserPlugin from "terser-webpack-plugin";
import sortMediaQueries from "postcss-sort-media-queries";
import autoprefixer from "autoprefixer";
import discardUnused from "postcss-discard-unused";
import cssnano from "cssnano";
import normalizeWhitespace from "postcss-normalize-whitespace";
import { entries } from "./paths.js";

/////////////// END OF IMPORTS /////////////////////////
export const modes = {
    dev: "dev",
    build: "build"
}
const headParams = {
    index: {
        description: "description of the Page index.html",
        keywords: "keywords of the Page index.html",
        pageTopic: "page-topic of the Page index.html",
        robots: "noindex",
        title: "Title of the Page 'index.html'",
        linkStyles: "css/index.min.css",
        root: ".", //some *.html can be nested in src/html/somePages/ which requires correct path to root: "..", "../.." etc...
        //if the scripts are to be written in the end of body, the property linkScripts may not exits
/*        linkScripts: {
            link: "js/index.bundle.js", //this property must exist in linkScripts
            //loadMode: "async"   //"differ" this property may not exist in linkScripts
        }*/
    },
    about: {
        description: "description of the Page about.html",
        keywords: "keywords of the Page about.html",
        pageTopic: "page-topic of the Page about.html",
        robots: "noindex",
        title: "Title of the Page 'about.html'",
        linkStyles: "css/about.min.css",
        root: ".", //some *.html can be nested in src/html/somePages/ which requires correct path to root: "..", "../.." etc...
        //if the scripts are to be written in the end of body, the property linkScripts may not exits
        /*        linkScripts: {
                    link: "js/about.bundle.js", //this property must exist in linkScripts
                    //loadMode: "async"   //"differ" this property may not exist in linkScripts
                }*/
    },
    somePage: {
        description: "description of the Page somePage.html",
        keywords: "keywords of the Page somePage.html",
        pageTopic: "page-topic of the Page somePage.html",
        robots: "noindex",
        title: "Title of the Page 'somePage.html'",
        linkStyles: "../css/somePage.min.css",
        root: "..",  //some *.html can be nested in src/html/somePages/ which requires correct path to root: "..", "../.." etc...
        //if the scripts are to be written in the end of body, the property linkScripts may not exits
        /*        linkScripts: {
                    link: "js/index.bundle.js", //this property must exist in linkScripts
                    //loadMode: "async"   //"differ" this property may not exist in linkScripts
                }*/
    },
}
export const fileIncludeSettings = {
    prefix: "@@",
    basepath: "@file",
    context: {
        headParams
    }
};
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



