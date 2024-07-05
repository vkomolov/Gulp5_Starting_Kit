"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import { LRUCache } from 'lru-cache';
import { promises as fsPromises } from 'fs';
import path from 'path';

/////////////// END OF IMPORTS /////////////////////////

const PLUGIN_NAME = 'custom-newer';

//LRU Cache (Least Recently Used Cache) is used to store temporary data that quickly becomes outdated.
const cache = new LRUCache({
    max: 100, // Maximum number of items that can be stored in the cache
    ttl: 1000 * 60 * 60, // 1 hour of cache
});

async function makeCacheKeyValue(filePath) {
    const baseName = path.basename(filePath);
    try {
        const stats = await fsPromises.stat(filePath);
        return {
            cacheKey: baseName,
            MTimeValue: stats.mtime.getTime().toString(),
        };
    } catch (err) {
        console.error(`Error getting file stats for ${filePath}:`, err);
        return null;
    }
}

export default class CustomNewer extends Transform {
    constructor() {
        super({ objectMode: true });
    }

    async _transform(file, encoding, callback) {
        try {
            const { cacheKey, MTimeValue } = await makeCacheKeyValue(file.path);

            if (file.isNull()) {
                return callback(null, file);
            }
            if (file.isStream()) {
                callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
                return; // No need to return here, just to exit the function
            }
            if (cache.has(cacheKey)) {
                // Getting modify time from cache
                const cachedMTime = cache.get(cacheKey);
                if (cachedMTime === MTimeValue) {
                    return callback();
                } else {
                    console.log("Updating cache: ", cacheKey);
                    cache.set(cacheKey, MTimeValue);
                    return callback(null, file);
                }
            } else {
                cache.set(cacheKey, MTimeValue);
                console.log("Updating cache: ", cacheKey);
                return callback(null, file);
            }
        } catch (err) {
            callback(new PluginError(PLUGIN_NAME, `Error processing file: ${err.message}`));
        }
    }
}

//////////// DEV
/*function log(val, _val= null) {
    _val ? console.log(val, _val) : console.log(val);
}*/
