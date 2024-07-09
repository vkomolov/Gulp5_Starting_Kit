"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';

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

    _transform(file, encoding, callback) {
        if (file.isNull() || !this.filterBy) {
            return callback(null, file);
        }

        if (file.isStream()) {
            callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        try {
            if (this.filterBy instanceof RegExp) {

                //log("file.relative: ", file.relative);

                const res = this.filterBy.test(file.relative);

                //log(` RegExp ${file.relative}: `, res);
                return res ? callback(null, file) : callback();
            }
            else if (typeof this.filterBy  === "string") {
                //log("filterBy is string...");

                const fileName = path.basename(file.path);  //full name of the file with the extension
                const res = this.isTale ? fileName.endsWith(this.filterBy) : fileName.includes(this.filterBy);
                return res ? callback(null, file) : callback();
            }
            else {
                console.error("the given argument to CustomIf is not string or RegExp...");
                return callback(null, file);
            }
        }
        catch (err) {
            callback(new PluginError(PLUGIN_NAME, err, { fileName: file.path }));
        }
    }
}

//////////// DEV
function log(val, _val= null) {
    _val ? console.log(val, _val) : console.log(val);
}