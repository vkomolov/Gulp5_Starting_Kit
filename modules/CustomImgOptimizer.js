"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';
import sharp from 'sharp';
import { optimize as svgoOptimize } from 'svgo';

const PLUGIN_NAME = 'customImgOptimizer';

export default class CustomImgOptimizer extends Transform {
    constructor(options = {}) {
        super({ objectMode: true });
        this.options = options;
    }

    async _transform(file, encoding, callback) {
        if (file.isNull()) {
            console.error("file is null...", file.baseName);
            return callback(null, file);
        }

        if (file.isStream()) {
            callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        const formatMap = {
            '.jpg': 'jpeg',
            '.jpeg': 'jpeg',
            '.png': 'png',
            '.webp': 'webp',
            '.avif': 'avif'
        };

        const formatOptionsMap = {
            jpeg: { quality: 75 },
            png: { compressionLevel: 5 },
            webp: { quality: 75 },
            avif: { quality: 50 },
            //svg: { plugins: [{ removeViewBox: false }] }
            svg: {
                js2svg: { indent: 2, pretty: true },
                plugins: [
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                //Removes the viewBox attribute where it matches the documents width and height.
                                //https://svgo.dev/docs/plugins/removeViewBox/
                                removeViewBox: false,
                                // Removes unused IDs, and minifys IDs that are referenced by other elements.
                                //https://svgo.dev/docs/plugins/cleanupIds/
                                cleanupIds: false,

                                // Merges styles from <style> elements to the style attribute of matching elements.
                                //https://svgo.dev/docs/plugins/inlineStyles/
                                inlineStyles: {
                                    onlyMatchedOnce: false,
                                },
                            },
                        },
                    },
                ],
            }
        };

        const fileExt = path.extname(file.path).toLowerCase();
        console.log("fileExt: ", fileExt);

        try {
            if (formatMap[fileExt]) {
                const format = formatMap[fileExt];
                //const formatOptions = { quality: this.options.quality || 75 };
                const formatOptions = Object.assign({}, formatOptionsMap[format], this.options[format] || {});
                file.contents = await sharp(file.contents)
                    .resize(this.options.resize || {})
                    .toFormat(format, formatOptions)
                    .toBuffer();
            }
            else if (fileExt === '.svg') {
                const formatOptions = Object.assign({}, formatOptionsMap.svg, this.options.svg || {});
                const result = svgoOptimize(file.contents.toString(), formatOptions);

                if (result.error) {
                    throw new Error(result.error);
                }

                file.contents = Buffer.from(result.data);
            }
            else {
                console.log("file is not identified...", file.baseName);
                return callback(null, file);
            }

            return callback(null, file);
        } catch (err) {
           return callback(new PluginError(PLUGIN_NAME, err.message, { fileName: file.path }));
        }
    }
}