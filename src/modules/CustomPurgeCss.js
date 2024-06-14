"use strict";

import { PurgeCSS } from 'purgecss';
import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';
import fs from 'fs';

const PLUGIN_NAME = 'customPurgeCss';

export default class CustomPurgeCss extends Transform {
    constructor(srcDir) {
        super({ objectMode: true });
        this.srcDir = srcDir;
    }

    async _transform(file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        try {
            const ext = path.extname(file.path);
            const basename = path.basename(file.path, ext);
            const targetHtml = path.resolve(this.srcDir, `${basename}.html`);

            // Проверка на наличие HTML-файла
            if (!fs.existsSync(targetHtml)) {
                return callback(new PluginError(PLUGIN_NAME, `HTML file not found: ${targetHtml}`));
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
        } catch (err) {
            callback(new PluginError(PLUGIN_NAME, err, { fileName: file.path }));
        }
    }
}