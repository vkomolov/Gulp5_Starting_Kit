"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';
import sharp from 'sharp';
import { optimize as svgoOptimize } from 'svgo';
import { processFile } from "../gulp/utilFuncs.js";

const PLUGIN_NAME = 'customImgOptimizer';

export default class CustomImgOptimizer extends Transform {
    /**
     * @param {Object} [options={}] - params of the image file to be optimized. It may be empty to use the default settings...
     * @param {Object} [options.resize] - possible property for resizing the image
     * @param {Object} [options.jpeg] - possible settings for jpeg
     * @param {Object} [options.png] - possible settings for png
     * @param {Object} [options.webp] - possible settings for webp
     * @param {Object} [options.avif] - possible settings for avif
     * @param {Object} [options.svg] - possible settings for svg
     * @example {
     *                     resize: { width: 1000 },
     *                     jpeg: { quality: 75 },
     *                     png: { quality: 80, compressionLevel: 5 },
     *                     webp: { quality: 75 },
     *                     avif: { quality: 60 },
     *                     svg: {
     *                         js2svg: { indent: 2, pretty: true },
     *                         plugins: [
     *                             {
     *                                 name: 'preset-default',
     *                                 params: {
     *                                     overrides: {
     *                                         removeViewBox: false,
     *                                         cleanupIds: false,
     *                                         inlineStyles: {
     *                                             onlyMatchedOnce: false,
     *                                         },
     *                                     },
     *                                 },
     *                             },
     *                         ],
     *                     }
     *                 }
     */
    constructor(options = {}) {
        super({ objectMode: true });
        this.options = options;
        this.formatMap = {
            "jpg": "jpeg",
            "jpeg": "jpeg",
            "png": "png",
            "webp": "webp",
            "avif": "avif",
            "svg": "svg"
        };

        /**
         * sharp output options: https://sharp.pixelplumbing.com/api-output
         *
         **** JPEG: ****
         * - quality: Sets the quality of the JPEG image. The higher the value, the better the quality,
         * but the larger the file size.
         * quality: 75 - This is an average JPEG quality value that provides a good balance between quality and file size.
         * If you need higher quality, you can increase it to 80-85 or even 90, but this will increase the file size.
         * - progressive: Makes the JPEG image progressive, which improves its display when loading gradually.
         * progressive: true - It is recommended to use progressive JPEG for loading images incrementally.
         * - chromaSubsampling: Sets chroma subsampling to reduce JPEG file size.
         * - trellisQuantisation: Uses tree quantisation to improve JPEG compression.
         * - overshootDeringing: Applies derringing and overshooting to reduce compression artifacts.
         *
         **** PNG ****
         * - compressionLevel: Sets the compression level (0 to 9).
         * Higher value provide greater compression but may increase processing time.
         * - adaptiveFiltering: Enables adaptive filtering, which can improve image quality when compressed.
         * - quality: Sets the image quality (0 to 100). Only supported when using palette or adaptive filtering.
         * - palette: Uses palette-based quantization to compress the image.
         * - dither: Sets the dithering algorithm to smooth out color transitions. Number between 0.0 and 1.0
         * 0.5 - optimal value
         *
         **** WEBP ****
         * - quality: Sets the quality of the WebP image (0-100).
         * quality: 75 - This is the standard quality for WEBP, which is usually sufficient.
         * If high quality is required, you can increase it to 80-85.
         * - alphaQuality: Sets the quality of the WebP alpha channel (0-100).
         * alphaQuality: 50 - Alpha channel quality.
         * - lossless: Sets lossless (true) or lossy (false) for WebP images.
         * lossless: false - If images do not require lossless, it is better to use false to reduce file size.
         * - nearLossless: Sets near-lossless options for WebP images (false/true).
         * false - This helps in maintaining high quality with reduced file size with combination of lossless: false.
         * - reductionEffort: Sets the level of effort to reduce the size of the WebP file (0-6)
         * optimal reductionEffort: 4-6
         *
         **** avif ****
         * - quality: Sets the AVIF image quality (0-100).
         * quality: 50 - Average AVIF quality. Can be increased to 60-70 with a moderate increase in file size.
         * - speed: Sets the encoding speed of AVIF (0-10).
         * speed: 3 - The encoding speed level. Can be increased to speed up the process if it is not critical for quality.
         * - lossless: Sets lossless (true) or lossy (false) for AVIF images.
         *
         **** GIF ****
         * - quality: Sets the quality of the GIF image (0-100).
         * quality: 75 - Medium quality GIF. The value 75 provides a good balance between quality and file size.
         * - optimizationLevel: Sets the optimization level of the GIF (0-3).
         * optimizationLevel: 3 - The highest GIF optimization level usually gives the best results.
         * You can try lowering it to 2 or 1 for faster processing.
         * - colors: Sets the number of colors in the GIF palette (2-256).
         * colors: 256 - The maximum number of colors in the GIF palette.
         * If the image has a limited color palette, you can reduce this value.
         * - dither: Applies dithering to improve the quality of the GIF.
         * - threshold: Sets the threshold for GIF dithering (0-1).
         *
         **** SVG ****
         * - js2svg: { indent: 2, pretty: true } option in SVGO's settings affects how SVG data is formatted
         * after it is processed. Here are the effects it has:
         * indent: 2 - it specifies the number of spaces (or tabs) used for indentation when formatting an SVG document.
         * A value of 2 specifies that each level of nesting (each new block or element) will be indented by two spaces.
         * This makes the SVG more readable for developers when viewing the code in a text editor.
         * pretty: true - it enables the "pretty" formatting mode of SVG. In this mode, SVGO will add extra spaces
         * and line breaks between the various attributes and elements of the SVG.
         * This also improves the readability of the SVG file and makes it easier to debug.
         *
         * - removeViewBox: false
         * Explanation: The viewBox attribute in SVG defines the viewable area and scale of the image.
         * Leaving it in allows SVG to be scaled without losing quality.
         * https://svgo.dev/docs/plugins/removeViewBox/
         *
         * - cleanupIDs: false
         * Explanation: Sometimes IDs in SVG are used to style elements or to reference them in
         * JavaScript. Disabling ID cleanup allows you to preserve them for external use.
         * https://svgo.dev/docs/plugins/cleanupIds/
         *
         * - inlineStyles: { onlyMatchedOnce: false }
         * Explanation: Allows styles defined in <style> to be inlined directly into the corresponding elements,
         * which can reduce the amount of CSS and improve performance.
         * https://svgo.dev/docs/plugins/inlineStyles/
         *
         * - mergePaths: true
         * Explanation: Merging some SVG paths can significantly reduce the number of elements in the SVG,
         * which will reduce its size and improve performance.
         *
         * - convertShapeToPath: true
         * Explanation: Converts some geometric shapes (such as rectangles or circles) to <path> elements.
         * This helps reduce the number of different elements in the SVG and simplify its structure.
         *
         * sortAttrs: true
         * Explanation: Sorting the attributes of SVG elements helps reduce the differences between SVG files
         * when optimizing them for web use.
         *
         * These settings are common and may be optimal for most cases.
         *
         * @type {{
         * gif: {dither: boolean, threshold: number, colors: number, quality: number, optimizationLevel: number},
         * svg: {
         *  js2svg: {pretty: boolean, indent: number},
         *  plugins: [{
         *      name: string,
         *      params: {
         *          overrides: {
         *              removeViewBox: boolean,
         *              cleanupIds: boolean,
         *              inlineStyles: {
         *                  onlyMatchedOnce: boolean
         *              }
         *          }
         *      }
         *  }]
         * },
         * png: {
         *  dither: number,
         *  adaptiveFiltering: boolean,
         *  palette: boolean,
         *  compressionLevel: number,
         *  quality: number
         * },
         * jpeg: {
         *  chromaSubsampling: string,
         *  progressive: boolean,
         *  trellisQuantisation: boolean,
         *  overshootDeringing: boolean,
         *  quality: number
         * },
         * webp: {
         *  alphaQuality: number,
         *  reductionEffort: number,
         *  nearLossless: boolean,
         *  lossless: boolean,
         *  quality: number
         * },
         * avif: {
         *  lossless: boolean,
         *  speed: number,
         *  quality: number
         * }
         *}}
         */
        this.formatOptionsMap = {
            jpeg: {
                quality: 75,
                progressive: true,
                chromaSubsampling: '4:2:0',
                trellisQuantisation: true,
                overshootDeringing: true,
            },
            png: {
                compressionLevel: 5,
                adaptiveFiltering: true,
                quality: 80,
                palette: true,
                dither: 0.5,
            },
            webp: {
                quality: 75,
                alphaQuality: 50,
                lossless: false,
                nearLossless: false,
                reductionEffort: 4,
            },
            avif: {
                quality: 75,
                alphaQuality: 50,
                speed: 3,
                lossless: false,
                effort: 4
            },
            gif: {
                quality: 75,
                optimizationLevel: 3,
                colors: 256,
                dither: true,
                threshold: 0.6,
            },
            svg: {
                js2svg: { indent: 2, pretty: true },
                plugins: [
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                removeViewBox: false,
                                cleanupIds: false,
                                inlineStyles: {
                                    onlyMatchedOnce: false,
                                },
                                mergePaths: true,
                                convertShapeToPath: true,
                                sortAttrs: true
                            },
                        },
                    },
                ],
            }
        };
    }

    async _transform(_file, encoding, callback) {
        try {
            const file = processFile(_file);
            if (file === null) {
                console.error("file is null...", _file.baseName);
                return callback(null, _file);
            }

            const fileExt = path.extname(file.path).toLowerCase().slice(1);
            if (!(fileExt in this.formatMap)) {
                console.log(`omitting not supported file: ${ path.basename(file.path) }`);
                return callback(null, file);
            }

            const format = this.formatMap[fileExt];
            const formatOptions = Object.assign({}, this.formatOptionsMap[format], this.options[format] || {});

            if (format === "svg") {
                const result = svgoOptimize(file.contents.toString(), formatOptions);
                if (result.error) {
                    throw new Error(`SVG optimization failed: ${result.error}`);
                }
                file.contents = Buffer.from(result.data);
            }
            else {
                file.contents = await sharp(file.contents)
                    .resize(this.options.resize || {})
                    .toFormat(format, formatOptions)
                    .toBuffer();
            }

            return callback(null, file);
        } catch (err) {
           return callback(new PluginError(PLUGIN_NAME, err.message, { fileName: _file.path }));
        }
    }
}

//////////// DEV
/*
function log(val, _val= null) {
    _val ? console.log(val, _val) : console.log(val);
}*/
