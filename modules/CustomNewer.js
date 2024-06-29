"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import { LRUCache } from 'lru-cache';
import { statSync } from 'fs';
import path from 'path';

const PLUGIN_NAME = 'custom-newer';

//LRU Cache (Least Recently Used Cache) is used to store temporary data that quickly becomes outdated.
const cache = new LRUCache({
    max: 100, // Maximum number of items that can be stored in the cache
    ttl: 1000 * 60 * 60, // 1 hour of cache
});

/**
 * statSync(filePath): Synchronously obtains information about the file at the given path.
 * .mtime: Returns the last modification time of the file as a Date object.
 *
 * @param { string }filePath
 * @returns {object}
 */

function makeCacheKeyValue(filePath) {
    const baseName = path.basename(filePath);
    return {
        cacheKey: baseName,
        MTimeValue: statSync(filePath).mtime.getTime().toString(),
    }
}

export default class CustomNewer extends Transform {
    constructor() {
        super({ objectMode: true });
    }

    _transform(file, encoding, callback) {
        const { cacheKey, MTimeValue } = makeCacheKeyValue(file.path);

        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return; // No need to return here, just to exit the function
        }
        if (cache.has(cacheKey)) {
            //getting modify time from cache
            const cachedMTime = cache.get(cacheKey);
            if (cachedMTime === MTimeValue) {
                return callback();
            }
            else {
                console.log("updating cache: ", cacheKey);
                cache.set(cacheKey, MTimeValue);
                return callback(null, file);
            }
        }
        else {
            cache.set(cacheKey, MTimeValue);
            console.log("updating cache: ", cacheKey);
            return callback(null, file);
        }
    }
}

//////////// DEV
/*function log(val, _val= null) {
    _val ? console.log(val, _val) : console.log(val);
}*/
