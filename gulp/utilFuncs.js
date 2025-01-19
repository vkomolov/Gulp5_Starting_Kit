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
    return function(err) {
        console.error(taskTypeError, err.message);
        this.emit('end'); // halt the pipe gracefully
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

/**
 * Processes file to ensure its contents are in buffer format, handles null and stream files.
 * @param {object} file - The file object from the stream.
 * @throws {Error} - Throws an error if file is a stream or has null contents.
 * @returns {object} - The processed file object with its contents in buffer format.
 */
export function processFile(file) {
    // Check if file.contents is a buffer; if not, convert it to buffer
    if (!(Buffer.isBuffer(file.contents))) {
        file.contents = Buffer.from(file.contents);
    }

    // Handle null file
    if (file.isNull()) {
        console.error("file is null...", file.baseName);
        return null;
    }

    // Handle stream file
    if (file.isStream()) {
        throw new Error("Streaming is not supported...");
    }

    return file;
}

/**
 * It searches the files with the target extension at the given path
 * @param {string} pathToFiles - path to the files in search
 * @param {string} targetExt - target extension of the files with or without dot!!! ".js", ".html", "js", "html"
 * @returns {Object} returns the object with the name of the file as the property and the path as the value
 */
export function getFilesEntries(pathToFiles, targetExt) {
    const entries = {};
    const fileExt = targetExt.startsWith(".") ? targetExt : `.${targetExt}`;

    // Checking for the correct path
    if (!fs.existsSync(pathToFiles)) {
        console.error("No such path found at getFilesEntries:", pathToFiles);
        return entries; // Return an empty object
    }

    // Searching for the files
    const files = fs.readdirSync(pathToFiles);
    let foundFiles = false;

    files.forEach(file => {
        if (file.endsWith(fileExt)) {
            const fileName = path.basename(file, fileExt); // Getting the file name without extension
            entries[fileName] = path.resolve(pathToFiles, file); // Creating the path with the file
            foundFiles = true;
        }
    });

    // Checking for the found files
    if (!foundFiles) {
        console.error(`at getFilesEntries: no files found with ${targetExt} at ${pathToFiles}`);
    }

    return entries; // Return the object with or without found files
}



