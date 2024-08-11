"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';
import { processFile } from "../gulp/utilFuncs.js";

/////////////// END OF IMPORTS /////////////////////////

/**
 * CustomRenameFile transform stream for renaming files based on specified parameters.
 */
const PLUGIN_NAME = 'customRenameFile';
export default class CustomRenameFile extends Transform {
    /**
     * Constructs an instance of CustomRenameFile.
     * @param {string|null} [baseName=null] - The base name to use for renaming (without extension).
     * @param {string|null} [suffix=null] - The suffix to append to the base name (without dot).
     */
    constructor(baseName = null, suffix = null) {
        super({ objectMode: true });
        this.baseName = baseName;
        this.suffix = suffix;
    }

    _transform(_file, encoding, callback) {
        try {
            const file = processFile(_file);
            if (file === null) {
                console.error("file is null...", _file.baseName);
                return callback(null, _file);
            }

            const ext = path.extname(file.path);
            const basename = this.baseName || path.basename(file.path, ext);
            const newFileName = this.suffix
                ? `${basename}.${this.suffix}${ext}`
                : `${basename}${ext}`;
            file.path = path.resolve(path.dirname(file.path), newFileName);

            return callback(null, file);
        } catch (err) {
            return callback(new PluginError(PLUGIN_NAME, err.message, { fileName: _file.path }));
        }
    }
}