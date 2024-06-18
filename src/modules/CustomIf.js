"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';

const PLUGIN_NAME = 'customIf';
/**
 * CustomIf transform stream for filtering files based on filename conditions.
 */
export default class CustomIf extends Transform {
    /**
     * Constructs an instance of CustomIf.
     * @param {string|null} filterBy  - The string to filter filenames by, case insensitive.
     * @param {boolean} [isTale=true] - Determines the type of filtering:
     *                                - true: Checks if filename ends with `filterBy`.
     *                                - false: Checks if filename includes `filterBy`.
     */
    constructor(filterBy = null, isTale = true) {
        super({ objectMode: true });
        this.filterBy = filterBy ? filterBy.toLowerCase() : null;
        this.isTale = isTale;
    }

    _transform(file, encoding, callback) {
        if (file.isNull() || !this.filterBy) {
            return callback(null, file);
        }

        if (file.isStream()) {
            callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return; // No need to return here, just to exit the function
        }

        try {
            const fileName = path.basename(file.path);  //full name of the file with the extension
            const res = this.isTale ? fileName.endsWith(this.filterBy) : fileName.includes(this.filterBy);
            return res ? callback(null, file) : callback();
        }
        catch (err) {
            callback(new PluginError(PLUGIN_NAME, err, { fileName: file.path }));
        }
    }
}