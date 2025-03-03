"use strict";

import fs, { constants } from 'fs';
import path from "path";
import { rimraf } from 'rimraf';

/**
 * It checks the path for existence
 * @param {string} targetPath - Full path to the file or directory to check for access
 * @param {number} [mode = fs.constants.F_OK] - Access mode (e.g., fs.constants.F_OK, fs.constants.R_OK, etc.)
 * @returns {Promise<boolean>}
 */
export async function checkAccess(targetPath, mode = constants.F_OK) {
    try {
        await fs.promises.access(targetPath, mode); // async access
        return true;
    } catch {
        return false;
    }
}

/**
 * Checks if the item is a file and matches the target filename.
 * @param {string} fullPath - Full path to the item to be checked with the target filename
 * @param {string} fileName - Target filename
 * @param {number} mode - Access mode
 * @returns {Promise<boolean>}
 */
async function isMatchingFile(fullPath, fileName, mode) {
    const isFile = (await fs.promises.stat(fullPath)).isFile();
    const isMatch = path.basename(fullPath) === fileName;
    const isAccessible = await checkAccess(fullPath, mode);
    return isFile && isMatch && isAccessible;
}

/**
 * Recursively searches for a file in a flat directory, without nesting
 * @param {string} dir - Directory to search in
 * @param {string} fileName - Target filename
 * @param {number} mode - Access mode
 * @returns {Promise<string|boolean>}
 */
async function searchInDirectory(dir, fileName, mode) {
    const items = await fs.promises.readdir(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (await isMatchingFile(fullPath, fileName, mode)) {
            return fullPath;
        }
    }
    return false;
}

/**
 * Recursively searches for a file in a directory and its subdirectories.
 * @param {string} dir - The directory to search in.
 * @param {string} fileName - The name of the file to search for.
 * @param {boolean} [isNested=false] - If true, searches in subdirectories. Default is false.
 * @param {boolean} [returnPath=false] - If true, returns the full path of the found file. Default is false.
 * @param {number} [mode=fs.constants.F_OK] - The access mode to check (e.g., fs.constants.F_OK, fs.constants.R_OK). Default is fs.constants.F_OK.
 * @returns {Promise<string|boolean>} - Returns the full path to the file if found and returnPath is true. Otherwise, returns a boolean indicating whether the file was found.
 * @throws {Error} - Throws an error if the directory cannot be accessed or read.
 * @example
 * // Search for a file in the current directory (non-recursive)
 * const result = await checkFileInDir('./src', 'gallery-thumbs-index.js');
 * console.log(result); // true or false
 *
 * @example
 * // Search for a file recursively and return the full path
 * const result = await checkFileInDir('./src', 'gallery-thumbs-index.js', true, true);
 * console.log(result); // Full path to the file or false
 */
export async function checkFileInDir(
  dir,
  fileName,
  isNested = false,
  returnPath = false,
  mode = fs.constants.F_OK
) {
    try {
        const items = await fs.promises.readdir(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stats = await fs.promises.stat(fullPath);

            if (stats.isDirectory() && isNested) {
                const result = await checkFileInDir(fullPath, fileName, isNested, returnPath, mode);
                if (result) return result;
            } else if (await isMatchingFile(fullPath, fileName, mode)) {
                return returnPath ? fullPath : true;
            }
        }

        return false;
    } catch (error) {
        console.error(`Error in checkFileInDir: ${error.message}`);
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
    if (!fs.existsSync(path.resolve(pathToFiles))) {
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

/**
 * Reads data from a JSON file and returns the parsed content.
 * This function checks if the provided file path is valid. If the path is incorrect or the file doesn't exist,
 * it logs an error and returns `false`.
 * If the path is valid, it reads the file and parses the JSON content.
 *
 * @param {string} [pathToFile=""] - The path to the JSON file to read. If no path is provided or the path
 * is invalid, the function returns `false`.
 * @returns {object|boolean} Returns the parsed JSON object if the file exists and is valid, otherwise `false`.
 *
 * @example
 * const data = getDataFromJSON('path/to/file.json');
 * if (data) {
 *   console.log(data);
 * } else {
 *   console.log('Failed to read data');
 * }
 */
export function getDataFromJSON(pathToFile = "") {
    // Checking for the correct path
    if (!pathToFile.length || !fs.existsSync(pathToFile)) {
        console.error("No argument given or No such path found at getDataFromJSON:", pathToFile);
        return false;
    }

    return JSON.parse(fs.readFileSync(pathToFile, "utf8"));
}

/**
 * Generates a meta HTML link or script tag based on the provided parameters.
 *
 * @param {Object} [params={}] - An object containing configuration for the meta tag.
 * @param {string} [params.type] - The type of the meta tag. Can be either 'stylesheet' or 'script'.
 * @param {string} [params.dataSrc] - The source URL for the resource (CSS or JS file).
 * @param {string} [params.loadMode] - The load mode for the script (e.g., 'async', 'defer').
 * @param {Record<string, string>} [params.optionalAttrs={}] - Optional additional attributes for the meta tag (e.g., 'id', 'class').
 * @returns {string|undefined} - The generated HTML string for the meta tag (either `<link>` or `<script>`).
 */
export function getMetaTag(params = {}) {

    /**
     * Converts an object of attributes into a string representation.
     *
     * @param {Object} [optionalAttrs={}] - An object of string key-value pairs representing attributes.
     * @returns {string} - A string representation of the attributes in the form of 'key="value"'.
     */
    const stringifyAttrs = (optionalAttrs = {}) => {
        if (!Object.keys(optionalAttrs).length) {
            return "";
        }

        return Object.entries(optionalAttrs).map(([k, v]) => `${k}="${v}"`).join(" ");
    };

    const metaTypes = {
        stylesheet: (dataSrc, attrs) => `<link rel="stylesheet" href="${dataSrc}" ${attrs}>`,
        script: (dataSrc, attrs, loadMode) => (
          `<script type="module" src="${dataSrc}" ${attrs} ${loadMode}></script>`
        ),
    }

    const { type, dataSrc, loadMode, ...optionalAttrs } = params;

    // Validation of parameters
    if (!type || !metaTypes.hasOwnProperty(type) || !dataSrc) {
        console.error(`at getMetaLink: Unrecognized type: "${type}" or data source: "${dataSrc}"`);
        return; // Exit function without returning an invalid value
    }

    const attrs = stringifyAttrs(optionalAttrs);

    // Return the appropriate meta tag based on the type
    return metaTypes[type](dataSrc, attrs, loadMode || "");
}

/**
 * It gets the data for pages from json files and transforms their content depending on the language versions specified.
 * @param {Object.<string, string>} pageJsonEntries - the paths to the json files by language where:
 ** - `key`: language ("ru", "ua"...)
 ** - `value`: path to the json file  ("src/assets/data/pagesVersions/ru.json").
 ** pageJsonEntries can be achieved with the function getFilesEntries("src/assets/data/pagesVersions", "json");
 * @param {Object} initialData - initial data for the pages` content
 * @param {string} initialData.robotsParams - the params for robots at <head>
 * @param {Object.<string, string[]>} initialData.linkStyles - styles to be included in <head> (key - page name)
 * @param {Object.<string, Array<Object.<string, string>>>} [initialData.linkScripts] - Optional scripts to be included in
 * the <head>. The key is the page name, and the value is an Array of Objects where:
 **  - `link`: the path to the script file (string),
 **  - `loadMode`: optional (string, can be "async", "defer", or omitted).
 * @param {string} initialData.rootUrl - the base root url at the server... example: "https://example.com"
 * @param {string[]} initialData.metaCanonical - the list of pages to be canonical in the <head>
 * @param {string[]} initialData.languages - the list of languages to be alternate in the <head>
 * @param {string|null} [lang=null] - optional: null or a language version ("ru" or "ua", etc...)
 ** - if `null`, it gets the pages` data for all language versions...
 ** - if a language version, for instance "ru", it gets the pages` data for the given language...
 * @returns {Object.<string, Object>} where the key is the language version: "ua", "ru", etc...
 */
export function getPagesContentVersions(
  pageJsonEntries,
  initialData = {},
  lang = null
) {
    validateInput(pageJsonEntries, initialData);

    const pagesContentVersions = {};  //all pages data will be assigned here...

    if (lang) {
        if (!pageJsonEntries[lang]) {
            throw new Error(`the given lang version ${lang} is no found in "assets/data/pagesVersions/${lang}.json"`);
        }
        pagesContentVersions[lang] = getPagesDataByLang(pageJsonEntries, initialData, lang);
    }
    else {
        for (const lang of Object.keys(pageJsonEntries)) {
            pagesContentVersions[lang] = getPagesDataByLang(pageJsonEntries, initialData, lang);
        }
    }

    return pagesContentVersions;
}

function validateInput(pageJsonEntries, initialData) {
    if (!pageJsonEntries || typeof pageJsonEntries !== "object") {
        throw new Error('pageJsonEntries must be an object');
    }
    if (!initialData || typeof initialData !== "object") {
        throw new Error('initialData must be an object');
    }
}

function getPagesDataByLang(pageJsonEntries, initialData, lang) {
    const dataByLang = getDataFromJSON(pageJsonEntries[lang]);
    const data = {};

    for (const [pageName, value] of Object.entries(dataByLang)) {
        const params = {
            ...initialData,
            lang,
            pageName
        };

        data[pageName] = getPageContent(value, params);
    }

    return data;
}

function buildHeadData(auxHeadData, initialData) {
    const {
        robotsParams,
        linkStyles,
        linkScripts,
        rootUrl,
        metaCanonical,
        lang,
        languages,
        pageName
    } = initialData;

    if (!linkStyles[pageName]) {
        throw new Error(`No styles found for page: ${pageName}`);
    }

    const headData = {
        ...auxHeadData,
        robots: robotsParams,
        linkStyles: linkStyles[pageName].map(styleHref => {
            return getMetaTag({ type: "stylesheet", dataSrc: styleHref });
        }).join('\n'),
        alternate: languages.map(lang => {
            return `<link rel="alternate" href="${rootUrl}/${lang}/${pageName}.html" hreflang="${lang}">`;
        }).join("\n"),
    }

    if (linkScripts?.[pageName]?.length) {
        headData.linkScripts = linkScripts[pageName].map(scriptObj =>
          getMetaTag({ type: "script", dataSrc: scriptObj.link, loadMode: scriptObj.loadMode || "" })
        ).join("\n");
    }

    if (metaCanonical?.includes(lang)) {
        headData.canonical = `<link rel="canonical" href="${rootUrl}/${lang}/${pageName}.html">`;
    }

    return headData;
}

function getPageContent(pageData, initialData) {
    const {
        lang,
        languages,
    } = initialData;

    const pageContent = {};

    for (const [key, value] of Object.entries(pageData)) {
        pageContent[key] = key === "head"
          ? buildHeadData(value, initialData)
          : { ...value, ...(key === "main" && { lang, languages }) }
    }

    return pageContent;
}