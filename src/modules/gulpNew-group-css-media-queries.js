"use strict";

import { Transform } from "stream";
import PluginError from "plugin-error";
import gcmq from 'group-css-media-queries';

////// END OF IMPORTS
const PLUGIN_NAME = 'gulpNew-group-css-media-queries';

class GroupCSSMediaQueriesTransform extends Transform {
    constructor() {
        super({ objectMode: true });
    }

    _transform(chunk, encoding, callback) {
        if (chunk.isNull()) {
            return callback(null, chunk);
        }
        if (chunk.isStream()) {
            return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        }

        try {
            const contents = chunk.contents.toString();
            const groupedContent = gcmq(contents);
            //TODO: to make it clean with no overwriting code
            chunk.contents = Buffer.from(groupedContent);
            callback(null, chunk);
        }
        catch (err) {
            return callback(new PluginError(PLUGIN_NAME, err, { fileName: chunk.path }));
        }
    }
}

export default function GroupAllCSSMediaQueries() {
    return new GroupCSSMediaQueriesTransform();
}
