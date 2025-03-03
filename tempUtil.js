"use strict";

import { getDataFromJSON, getFilesEntries, getMetaTag } from "./gulp/utilFuncs.js";
import { getMatchedFromArray } from "./src/js/helpers/funcs.js";

const robotsParams = "noindex";
const linkStyles = {
	index: ["./css/index.min.css"],
	gates: ["./css/index.min.css"],
	rollers: ["./css/index.min.css"],
	automation: ["./css/index.min.css"],
	barriers: ["./css/index.min.css"],
	awnings: ["./css/index.min.css"],
	windows: ["./css/index.min.css"],
	security: ["./css/index.min.css"],
}

/**
 * the scripts can be written at the end of the tag <body> omitting writing it in the tag <head>
 * In this case the script links can be empty in the lower linkScripts...
 * @type {{}}
 */
const linkScripts = {
	/*    index: [
					{
							link: "./js/index.bundle.js", //this property must exist in linkScripts
							loadMode: "async"   //"differ" this property may not exist in linkScripts
					},
			],*/
	/*    gates: [
					{
							link: "./js/index.bundle.js", //this property must exist in linkScripts
							loadMode: "async"   //"differ" this property may not exist in linkScripts
					},
			],*/
	/*    rollers: [
					{
							link: "./js/index.bundle.js", //this property must exist in linkScripts
							loadMode: "async"   //"differ" this property may not exist in linkScripts
					},
			],*/
	/*    automation: [
					{
							link: "./js/index.bundle.js", //this property must exist in linkScripts
							loadMode: "async"   //"differ" this property may not exist in linkScripts
					},
			],*/
	/*    barriers: [
					{
							link: "./js/index.bundle.js", //this property must exist in linkScripts
							loadMode: "async"   //"differ" this property may not exist in linkScripts
					},
			],*/
	/*    awnings: [
					{
							link: "./js/index.bundle.js", //this property must exist in linkScripts
							loadMode: "async"   //"differ" this property may not exist in linkScripts
					},
			],*/
	/*    windows: [
					{
							link: "./js/index.bundle.js", //this property must exist in linkScripts
							loadMode: "async"   //"differ" this property may not exist in linkScripts
					},
			],*/
	/*    security: [
					{
							link: "./js/index.bundle.js", //this property must exist in linkScripts
							loadMode: "async"   //"differ" this property may not exist in linkScripts
					},
			],*/
}

//base root url at the server... example: "https://example.com"
const rootUrl = "https://example.com"

const pageJsonEntries = getFilesEntries("src/assets/data/pagesVersions", "json");
const languages = Object.keys(pageJsonEntries);

//what languages are to be canonical... checking if they exist in the const languages...
const metaCanonical = getMatchedFromArray(languages, ["ua", "ru"]);

///////////////////
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

//////////////

console.log(getPagesContentVersions(
	pageJsonEntries, {
	robotsParams,
	linkStyles,
	//linkScripts,  //optional
	rootUrl,
	metaCanonical,
	languages,
},
	"ru"
));
