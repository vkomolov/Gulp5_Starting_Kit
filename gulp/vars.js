"use strict";

import TerserPlugin from "terser-webpack-plugin";
import path from "path";
import sortMediaQueries from "postcss-sort-media-queries";
import autoprefixer from "autoprefixer";
import discardUnused from "postcss-discard-unused";
import cssnano from "cssnano";
import normalizeWhitespace from "postcss-normalize-whitespace";

/////////////// END OF IMPORTS /////////////////////////
/**
 * As all *.js files are treated as ES modules (package.json contains "type": "module"),
 * we get the Node current working directory with process.cwd...
 * Finally, we use path.resolve to construct the absolute path of the src and dist directories
 * relative to the current working directory process.cwd.
 * @type {string}
 */
//
const curWD = process.cwd();
export const modes = {
    dev: "dev",
    build: "build"
}
export const srcPath = path.resolve(curWD, "src");
export const distPath = path.resolve(curWD, "dist");

const headParams = {
    index: {
        description: "description of the Page index.html",
        keywords: "keywords of the Page index.html",
        pageTopic: "page-topic of the Page index.html",
        robots: "noindex",
        title: "Title of the Page 'index.html'",
        linkStyles: "css/index.min.css",
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
        linkStyles: "css/about.min.css"
        //if the scripts are to be written in the end of body, the property linkScripts may not exits
        /*        linkScripts: {
                    link: "js/about.bundle.js", //this property must exist in linkScripts
                    //loadMode: "async"   //"differ" this property may not exist in linkScripts
                }*/
    }
}
export const fileIncludeSettings = {
    prefix: "@@",
    basepath: "@file",
    context: {
        headParams: headParams
    }
};

export const pathData = {
    src: {
        html: path.join(srcPath, "*.html"),
        stylesNested: path.join(srcPath, "scss", "**", "*.scss"),   //only changed files will be processed
        styles: path.join(srcPath, "scss", "*.scss"),   //root *.scss, connected to html (for build tasks)
        js: path.join(srcPath, "js", "*.js"),
        img: path.join(srcPath, "assets", "img", "**", "*.{jpg,jpeg,png,svg,gif,webp,avif}"),
        fonts: path.join(srcPath, "assets", "fonts", "**", "*.{eot,woff,woff2,ttf,otf}"),
        data: path.join(srcPath, "assets", "data", "**", "*.{json, pdf, xml}"),
    },
    build: {
        html: distPath,
        styles: path.join(distPath, "css"),
        js: path.join(distPath, "js"),
        img: path.join(distPath, "assets", "img"),
        fonts: path.join(distPath, "assets", "fonts"),
        data: path.join(distPath, "assets", "data"),
    },
    watch: {
        htmlNested: [
            path.join(srcPath, "*.html"),
            path.join(srcPath, "html", "**", "*.html")
        ],
        stylesNested: path.join(srcPath, "scss", "**", "*.scss"),
        jsNested: [
            path.join(srcPath, "js", "**", "*.js"),
            path.join(srcPath, "modules", "**", "*.js"),
        ],
        img: path.join(srcPath, "assets", "img", "**", "*.{jpg,jpeg,png,svg,gif,webp,avif}"),
        fonts: path.join(srcPath, "assets", "fonts", "**", "*.{eot,woff,woff2,ttf,otf}"),
        data: path.join(srcPath, "assets", "data", "**", "*.{json, pdf, xml}"),
    },
    clean: distPath,
};

export const entries = {
    js: {
        index: path.join(srcPath, "js", "index.js"),
        about: path.join(srcPath, "js", "about.js"),
    },
    html: {
        index: path.join(srcPath, "index.html"),
        about: path.join(srcPath, "about.html"),
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

