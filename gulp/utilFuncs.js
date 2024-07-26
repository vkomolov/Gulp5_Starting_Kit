"use strict";

import fs, { constants } from 'fs';
import path from "path";
import { rimraf } from 'rimraf';

const fsAsync = fs.promises;

/**
 * It checks the path for existence
 * @param {string} targetPath - path to check for existence
 * @param {number} [mode = fs.constants.F_OK] - access mode
 * @returns {Promise<boolean>}
 */
export async function checkAccess(targetPath, mode = constants.F_OK) {
    try {
        await fsAsync.access(targetPath, mode); // async access
        return true;
    } catch {
        return false;
    }
}

/**
 * It recursively searches for a file in the specified directory and its subdirectories
 * @param {string} dir - The directory to search in
 * @param {string} fileName - File name to search for
 * @param {boolean} [isNested=false] - If true, to search in subfolders
 * @param {boolean} [returnPath=false] - If true, to return the full path of the found file
 * @param {number} [mode = fs.constants.F_OK] - access mode
 * @returns {Promise<string|boolean>} - Full path to file if found, or boolean (true/false) depending on returnPath
 */
export async function checkFileInDir(
    dir,
    fileName,
    isNested = false,
    returnPath = false,
    mode = fs.constants.F_OK
) {
    try {
        const items = await fsAsync.readdir(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stats = await fsAsync.stat(fullPath);

            if (stats.isDirectory()) {
                if (isNested) {
                    const result = await checkFileInDir(fullPath, fileName, isNested, returnPath, mode);
                    if (result) return result;
                }
                // If isNested is false, don't search in subdirectories, continue traversing the current level
            }
            else if (path.basename(fullPath) === fileName) {
                try {
                    await fsAsync.access(fullPath, mode);
                    return returnPath ? fullPath : true;
                } catch {
                    return false;
                }
            }
        }
        //If the file is not found in the current level and isNested is false, simply return false
        return false;
    } catch {
        // In case of an error (for example, no access to the directory), return false
        return false;
    }
}

/**
 * If the path exists, it returns the Promise of the path to be deleted; else it returns an empty Promise
 * @param {string | [string]} targetPaths - path or array of paths to delete
 * @returns {Promise<void>}
 */
export async function cleanDist(targetPaths) {
    const pathArr = [].concat(targetPaths);
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



