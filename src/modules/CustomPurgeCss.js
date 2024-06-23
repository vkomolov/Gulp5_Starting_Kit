"use strict";

import { PurgeCSS } from 'purgecss';
import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';
import { checkAccess } from "./utilFuncs.js";


const PLUGIN_NAME = 'customPurgeCss';
/**
 * CustomPurgeCss transform stream for purging unused CSS based on HTML file content.
 */
export default class CustomPurgeCss extends Transform {
    /**
     * Constructs an instance of CustomPurgeCss.
     * @param {string} srcDir - Source directory path where HTML files are located.
     */
    constructor(srcDir) {
        super({ objectMode: true });
        this.srcDir = srcDir;
    }

    /**
     * Asynchronously transforms each CSS file by purging unused CSS based on associated HTML content.
     */
    async _transform(file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return; // No need to return here, just to exit the function
        }

        try {
            const ext = path.extname(file.path);

            if (ext !== ".css") {
                throw new Error("ext is not '.css' in the file given... ");
            }

            const fullName = path.basename(file.path, ext);
            const basename = fullName.split(".")[0];
            const targetHtml = path.resolve(this.srcDir, `${basename}.html`);

            // Checking for targetHtml to exist using checkFileExistence function
            const exists = await checkAccess(targetHtml);
            if (!exists) {
                return callback(
                    new PluginError(PLUGIN_NAME,
                        `HTML file ${targetHtml} not found... please, make it first `));
            }

            // Create an instance of PurgeCSS
            const purgeCSSResults = await new PurgeCSS().purge({
                content: [targetHtml],
                css: [{ raw: file.contents.toString() }]
            });

            // Ensure we have results
            if (purgeCSSResults && purgeCSSResults.length > 0) {
                const result = purgeCSSResults[0];

                // Update the original file with purged CSS contents
                file.contents = Buffer.from(result.css);
                callback(null, file);
            } else {
                callback(new PluginError(PLUGIN_NAME, 'PurgeCSS returned no results'));
            }

        }
        catch (err) {
            callback(new PluginError(PLUGIN_NAME, err, { fileName: file.path }));
        }
    }
}