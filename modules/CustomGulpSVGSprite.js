"use strict";

import { Transform } from 'stream';
import { basename, extname } from 'path';
import Vinyl from 'vinyl';
import { parseString, Builder } from 'xml2js';
import PluginError from 'plugin-error';

const PLUGIN_NAME = 'customGulpSVGSprite';

/**
 * Gulp plugin for creating SVG sprites.
 */
export default class CustomGulpSVGSprite extends Transform {
    /**
     * @param {boolean} removeStyle - If true, removes fill and stroke attributes from SVG elements.
     */
    constructor(removeStyle = false) {
        super({ objectMode: true });
        this.svgs = [];
        this.removeStyle = removeStyle;
    }

    _transform(file, encoding, callback) {
        if (file.isNull()) {
            return callback();
        }

        if (file.isStream()) {
            return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        if (extname(file.path).toLowerCase() !== '.svg') {
            // Pass through non-SVG files
            return callback(null, file);
        }

        const fileName = basename(file.path, '.svg');
        parseString(file.contents.toString(), (err, result) => {
            if (err) {
                return callback(new PluginError(PLUGIN_NAME, err));
            }

            const svgContent = result.svg;
            svgContent.$ = svgContent.$ || {};
            svgContent.$.id = fileName;

            if (this.removeStyle) {
                this.removeFillAndStroke(svgContent);
            }

            this.svgs.push(svgContent);
            callback();
        });
    }

    /**
     * Recursively removes fill and stroke attributes from SVG elements.
     * @param {object} element - The SVG element to process.
     */
    removeFillAndStroke(element) {
        if (element.$) {
            delete element.$.fill;
            delete element.$.stroke;
        }

        for (const key in element) {
            if (typeof element[key] === 'object' && element[key] !== null) {
                if (Array.isArray(element[key])) {
                    element[key].forEach(child => this.removeFillAndStroke(child));
                } else {
                    this.removeFillAndStroke(element[key]);
                }
            }
        }
    }

    _flush(callback) {
        const sprite = {
            svg: {
                $: {
                    xmlns: "http://www.w3.org/2000/svg",
                    style: "display: none;" // Hide the sprite when included directly in HTML
                },
                symbol: this.svgs
            }
        };

        const builder = new Builder();
        const spriteContent = builder.buildObject(sprite);
        const spriteFile = new Vinyl({
            path: "sprite.svg",
            contents: Buffer.from(spriteContent)
        });

        this.push(spriteFile);
        callback();
    }
}