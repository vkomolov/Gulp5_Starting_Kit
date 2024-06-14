"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';

const PLUGIN_NAME = 'customRenameFile';

export default class CustomRenameFile extends Transform {
    constructor(baseName = null, suffix = null) {
        super({ objectMode: true });
        this.baseName = baseName;
        this.suffix = suffix;
    }

    _transform(file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        try {
            const ext = path.extname(file.path);
            const basename = this.baseName || path.basename(file.path, ext);
            const newFileName = this.suffix
                ? `${basename}.${this.suffix}${ext}`
                : `${basename}${ext}`;
            file.path = path.resolve(path.dirname(file.path), newFileName);
            callback(null, file);
        } catch (err) {
            callback(new PluginError(PLUGIN_NAME, err, { fileName: file.path }));
        }
    }
}