"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import { LRUCache } from 'lru-cache'
import { statSync, stat } from 'fs';
import path from 'path';

const PLUGIN_NAME = 'custom-newer';

//LRU Cache (Least Recently Used Cache) is used to store temporary data that quickly becomes outdated.
const cache = new LRUCache({
    max: 1000, // Maximum number of items that can be stored in the cache
    maxAge: 1000 * 60 * 60, // 1 hour of cache
});

/**
 * statSync(filePath): Synchronously obtains information about the file at the given path.
 * .mtime: Returns the last modification time of the file as a Date object.
 *
 * @param { string }filePath
 * @returns {string}
 */
function cacheKey(filePath) {
    return `${filePath}:${statSync(filePath).mtime.getTime()}`;
}

export default class CustomNewer extends Transform {
    constructor(dest) {
        super({ objectMode: true });
        this.dest = dest;
    }

    _transform(file, encoding, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }

        if (file.isStream()) {
            callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return; // No need to return here, just to exit the function
        }

        //file.relative contains the file path relative to the current Gulp working directory
        const destPath = path.join(this.dest, file.relative);
        const key = cacheKey(file.path);

        if (cache.has(key)) {
            const cachedTime = cache.get(key);
            /**
             * stat(destPath, callback): Asynchronously retrieves information about the file at the given path.
             * Options:
             * destPath: Path to the file.
             * callback: A callback function called after receiving file information.
             * Takes two parameters: error (err) and a stats object containing information about the file.
             */
            stat(destPath, (err, stats) => {
                if (!err && stats.mtime.getTime() === cachedTime) {
                    return callback();  //if cachedTime equals to stats.mtime then to omit the file...
                }
                cache.set(key, statSync(file.path).mtime.getTime());    //setting new cache time
                callback(null, file);   //returning the file with cache time differences...
            });
        } else {
            stat(destPath, (err, stats) => {
                if (!err && statSync(file.path).mtime.getTime() === stats.mtime.getTime()) {
                    cache.set(key, stats.mtime.getTime());
                    return callback();
                }
                callback(null, file);
            });
        }
    }
}

/*
export default function customNewer(dest) {
    return new CustomNewer(dest);
}*/
