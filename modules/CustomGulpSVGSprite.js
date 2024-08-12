"use strict";

import { Transform } from 'stream';
import { basename, extname } from 'path';
import Vinyl from 'vinyl';
import { parseString, Builder } from 'xml2js';
import PluginError from 'plugin-error';
import { processFile } from "../gulp/utilFuncs.js";
import { optimize as svgoOptimize } from "svgo";
import { svgoSpriteOptions } from "../gulp/settings.js";

const PLUGIN_NAME = 'customGulpSVGSprite';

/**
 * Gulp plugin for creating SVG sprites.
 */
export default class CustomGulpSVGSprite extends Transform {
    /**
     *
     * @param {("mono"|"multi")} [svgColor="mono"] - for multi and mono colored svg files
     * @param {string} [spriteFileName="sprite.mono.svg"] - the resulting file name with the sprite of svgs...
     */
    constructor(svgColor = "mono", spriteFileName = "sprite.mono.svg") {
        super({ objectMode: true });
        this.svgs = [];
        this.svgColor = svgColor;
        this.spriteFileName = spriteFileName;
    }

    _transform(_file, encoding, callback) {
        try {
            const file = processFile(_file);
            if (file === null) {
                console.error("file is null...", _file.baseName);
                return callback(null, _file);
            }

            if (extname(file.path).toLowerCase() !== '.svg') {
                // Pass through non-SVG files
                return callback(null, file);
            }

            const svgoConfig = svgoSpriteOptions[this.svgColor];
            const optimizedSvg = svgoOptimize(file.contents.toString(), svgoConfig);
            if (optimizedSvg.error) {
                throw optimizedSvg.error;
            }

            parseString(optimizedSvg.data, (err, result) => {
                if (err) {
                    throw err;
                }

                const fileName = basename(file.path, '.svg');
                const svgContent = result.svg;
                svgContent.$ = svgContent.$ || {};
                svgContent.$.id = fileName;

                this.svgs.push(svgContent);
                callback();
            });
        } catch (err) {
            return callback(new PluginError(PLUGIN_NAME, err, { fileName: _file.path }));
        }
    }

    _flush(callback) {
        const sprite = {
            svg: {
                $: {
                    xmlns: "http://www.w3.org/2000/svg",
                    style: "display: none;" // Скрываем спрайт при прямом включении в HTML
                },
                symbol: this.svgs
            }
        };

        const builder = new Builder({});
        const spriteContent = builder.buildObject(sprite);
        const spriteFile = new Vinyl({
            path: this.spriteFileName,
            contents: Buffer.from(spriteContent)
        });

        this.push(spriteFile);
        callback();
    }
}