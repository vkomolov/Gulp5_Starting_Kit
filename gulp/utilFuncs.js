"use strict";

import fs, { constants } from 'fs';
import { rimraf } from 'rimraf';

/**
 * Checks availability and access mode of the given path
 * @param {string} path - given the path of the directory or the file
 * @param {number} [mode = constants.F_OK] - the mode of the access
 * @returns {Promise<boolean>}
 */
export async function checkAccess(path, mode = constants.F_OK) {
    try {
        await fs.promises.access(path, mode); // async access
        return true;
    } catch {
        return false;
    }
}

/**
 * If the path exists, it returns the Promise of the path to be deleted; else it returns an empty Promise
 * @param {string | [string]} path - path or array of paths to delete
 * @returns {Promise<void>}
 */
export async function cleanDist(path) {
    const pathArr = [].concat(path);
    const deletePromises = pathArr.map(async pathStr => {
        const pathExists = await checkAccess(pathStr);
        if (pathExists) {
            await rimraf(pathStr);
        }
    });
    await Promise.all(deletePromises);
}

export function handleError(taskTypeError) {
    return (err) => {
        console.error(taskTypeError, err.message);
        //console.error(err);
        //this.emit('end'); // halt the pipe
    }
}

/**
 * Combine paths into a single array of strings.
 * @param {(string | string[])} paths - Strings or arrays of strings to combine.
 * @returns {string[]} - Combined array of strings.
 */
export const combinePaths = (...paths) => {
    return paths.reduce((acc, path) => {
        return acc.concat(Array.isArray(path) ? path : [path]);
    }, []);
}



