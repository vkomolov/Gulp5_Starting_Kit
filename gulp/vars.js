"use strict";

import TerserPlugin from "terser-webpack-plugin";
import path from "path";

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
export const fileIncludeSettings = {
    prefix: "@@",
    basepath: "@file"
};

export const pathData = {
    src: {
        html: path.join(srcPath, "*.html"),
        styles: path.join(srcPath, "scss", "**", "*.scss"),   //only changed files will be processed
        js: path.join(srcPath, "js", "*.js"),
        img: path.join(srcPath, "assets", "img", "**", "*.{jpg,png,svg,gif,ico,webp,xml,json,webmanifest}"),
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
        html: path.join(srcPath, "html", "**", "*.html"),
        styles: path.join(srcPath, "scss", "**", "*.scss"),
        js: [
            path.join(srcPath, "js", "**", "*.js"),
            path.join(srcPath, "modules", "**", "*.js"),
        ],
        img: path.join(srcPath, "assets", "img", "**", "*.{jpg,png,svg,gif,ico,webp,xml,json,webmanifest}"),
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

export const webpackConfigJs = {
    dev: {
        mode: "development",
        devtool: 'source-map',
        entry: {
            ...entries.js,
        },
        output: {
            filename: "[name].bundle.js",
            path: pathData.build.js,
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                ["@babel/preset-env", {
                                    "modules": false,
                                }]
                            ],
                            plugins: [
                                "@babel/plugin-transform-runtime",
                                "@babel/plugin-transform-classes",
                            ],
                        },
                    }
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
            path: pathData.build.js,
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
                    use: {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                ["@babel/preset-env", {
                                    "modules": false,
                                }]
                            ],
                            plugins: [
                                "@babel/plugin-transform-runtime",
                                "@babel/plugin-transform-classes",
                            ],
                        },
                    }
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