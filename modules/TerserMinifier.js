"use strict";

import { Transform } from "stream";
import { minify } from "terser";
import PluginError from "plugin-error";

const PLUGIN_NAME = 'terserMinifier';

export default class TerserMinifier extends Transform {
    constructor(options = {}) {
        super({ objectMode: true });
        const defaultOptions = {
            parse: {
                bare_returns: true,
                html5_comments: true,
                shebang: true
            }
        };
        /*        this.options = {
                    ...defaultOptions,
                    ...options
                }*/
        this.options = Object.assign(defaultOptions, options);
        this.options.parse = Object.assign(defaultOptions.parse, (options.parse || {}));
        /*        this.options.parse = {
                    ...defaultOptions.parse,
                    ...(options.parse || {})
                }*/
    }

    async _transform(file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return; // to abort the execution of a function in case of an error in the thread.
        }

        try {
            const fileContents = file.contents.toString();
            const minifiedResult = await minify(fileContents, this.options);
            file.contents = Buffer.from(minifiedResult.code);
            callback(null, file);
        }
        catch (err) {
            callback(new PluginError(PLUGIN_NAME, err, { fileName: file.path }));
            /*            const { message, line, col, pos } = err;
                        console.log('message: ' + message);
                        console.log('filename: ' + file.basename);
                        console.log('line: ' + line);
                        console.log('col: ' + col);
                        console.log('pos: ' + pos);*/
        }
    }
}