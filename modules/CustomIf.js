"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';
import { processFile } from "../gulp/utilFuncs.js";

/////////////// END OF IMPORTS /////////////////////////

const PLUGIN_NAME = 'customIf';
/**
 * CustomIf transform stream for filtering files based on filename or file nesting conditions.
 */
export default class CustomIf extends Transform {
    /**
     * Constructs an instance of CustomIf.
     * @param {string|null|RegExp} filterBy  - The string or RegExp to filter filenames by, case insensitive.
     * @param {boolean} [isTale=true] - Determines the type of filtering:
     *                                - true: Checks if filename ends with `filterBy`.
     *                                - false: Checks if filename includes `filterBy`.
     */
    constructor(filterBy = null, isTale = true) {
        super({ objectMode: true });
        this.filterBy = filterBy ? filterBy : null;
        this.isTale = isTale;
    }

    _transform(_file, encoding, callback) {
        try {
            const file = processFile(_file);
            if (file === null) {
                console.error("file is null...", _file.baseName);
                return callback(null, _file);
            }

            if (this.filterBy instanceof RegExp) {
                const res = this.filterBy.test(file.relative);
                return res ? callback(null, file) : callback();
            }
            else if (typeof this.filterBy  === "string") {
                const fileName = path.basename(file.path);  //full name of the file with the extension
                const res = this.isTale ? fileName.endsWith(this.filterBy) : fileName.includes(this.filterBy);
                return res ? callback(null, file) : callback();
            }
            else {
                throw new Error(`The given argument ${ this.filterBy } is not string or RegExp...`);
            }
        }
        catch (err) {
            return callback(new PluginError(PLUGIN_NAME, err.message, { fileName: _file.path }));
        }
    }
}

//////////// DEV
function log(val, _val= null) {
    _val ? console.log(val, _val) : console.log(val);
}