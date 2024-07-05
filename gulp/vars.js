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
        img: path.join(srcPath, "assets", "img", "**", "*.{jpe?g,png,svg,gif,webp,avif}"),
        imgBase: path.join(srcPath, "assets", "img"),
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
        html: [
            path.join(srcPath, "*.html"),
            path.join(srcPath, "html", "**", "*.html")
        ],
        styles: path.join(srcPath, "scss", "**", "*.scss"),
        js: [
            path.join(srcPath, "js", "**", "*.js"),
            path.join(srcPath, "modules", "**", "*.js"),
        ],
        img: path.join(srcPath, "assets", "img", "**", "*.{jpe?g,png,svg,gif,webp,avif}"),
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

const svgoOptions = {
    dev: {
        plugins: [
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        // disable a default plugin
                        cleanupIds: false,

                        // customize the params of a default plugin
                        inlineStyles: {
                            onlyMatchedOnce: false,
                        },
                    },
                },
            },
        ],
    },
    build: {
        plugins: [
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        // disable a default plugin
                        cleanupIds: false,

                        // customize the params of a default plugin
                        inlineStyles: {
                            onlyMatchedOnce: false,
                        },
                    },
                },
            },
        ],
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

export const webConfigImg = {
    dev: {
        mode: "development",
        module: {
            rules: [
                {
                    test: /\.(jpe?g|png|webp|avif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: (data) => {
                            const relativePath = path.relative(pathData.src.imgBase, data.filename);
                            return path.join(pathData.build.img, relativePath);
                        }
                    },
                    use: [
                        {
                            loader: 'sharp-loader',
                            options: {
                                quality: 75,
                                progressive: true,
                                withMetadata: false,
                            },
                        },
                    ],
                },
                {
                    test: /\.svg$/,
                    type: 'asset/resource',
                    generator: {
                        filename: (data) => {
                            const relativePath = path.relative(pathData.src.imgBase, data.filename);
                            return path.join(pathData.build.img, relativePath);
                        }
                    },
                    use: [
                        {
                            loader: 'svgo-loader',
                            options: svgoOptions.dev,
                        },
                    ],
                },
                {
                    test: /\.(gif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: (data) => {
                            const relativePath = path.relative(pathData.src.imgBase, data.filename);
                            return path.join(pathData.build.img, relativePath);
                        }
                    },
                },
            ],
        },
    },
    build: {
        mode: "production",
        module: {
            rules: [
                {
                    test: /\.(jpe?g|png|webp|avif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: (data) => {
                            const relativePath = path.relative(pathData.src.imgBase, data.filename);
                            return path.join(pathData.build.img, relativePath);
                        }
                    },
                    use: [
                        {
                            loader: 'sharp-loader',
                            options: {
                                quality: 75,
                                progressive: true,
                                withMetadata: false,
                            },
                        },
                    ],
                },
                {
                    test: /\.svg$/,
                    type: 'asset/resource',
                    generator: {
                        filename: (data) => {
                            const relativePath = path.relative(pathData.src.imgBase, data.filename);
                            return path.join(pathData.build.img, relativePath);
                        }
                    },
                    use: [
                        {
                            loader: 'svgo-loader',
                            options: svgoOptions.build,
                        },
                    ],
                },
                {
                    test: /\.(gif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: (data) => {
                            const relativePath = path.relative(pathData.src.imgBase, data.filename);
                            return path.join(pathData.build.img, relativePath);
                        }
                    },
                },
            ],
        },
    },
};
