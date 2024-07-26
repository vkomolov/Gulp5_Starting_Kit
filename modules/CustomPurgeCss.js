"use strict";

import { PurgeCSS } from 'purgecss';
import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';
import { checkFileInDir } from "../gulp/utilFuncs.js";

/////////////// END OF IMPORTS /////////////////////////

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
        try {
            if (file.isNull()) {
                console.error("file is null...", file.baseName);
                return callback(null, file);
            }

            if (file.isStream()) {
                throw new Error("Streaming is not supported...");
            }

            const ext = path.extname(file.path);

            if (ext !== ".css") {
                throw new Error(`ext is not '.css' in the file given ${ path.basename(file.path) }`);
            }

            const fullName = path.basename(file.path, ext); //file name without extension
            const baseName = fullName.split(".")[0]; //splitting suffixes (.min...)
            const targetHtml = `${baseName}.html`;

            // Checking for targetHtml to exist in the nested folders of the path
            const checkedPath = await checkFileInDir(
                this.srcDir,
                targetHtml,
                true,
                true
            );
            if (!checkedPath) {
               throw new Error(`HTML file ${ targetHtml } not found... please, make it first...`);
            }

            // Create an instance of PurgeCSS
            const purgeCSSResults = await new PurgeCSS().purge({
                content: [checkedPath],
                css: [{ raw: file.contents.toString() }]
            });

            // Ensure we have results
            if (purgeCSSResults && purgeCSSResults.length > 0) {
                const result = purgeCSSResults[0];

                // Update the original file with purged CSS contents
                file.contents = Buffer.from(result.css);

                return callback(null, file);
            } else {
                throw new Error(`PurgeCSS with file: ${ path.basename(file.path) } returned no results...`);
            }
        }
        catch (err) {
            return callback(new PluginError(PLUGIN_NAME, err.message, { fileName: file.path }));
        }
    }
}