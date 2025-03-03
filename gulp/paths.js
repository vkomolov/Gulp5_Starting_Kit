"use strict";

import path from "path";
import { getFilesEntries } from "./utilFuncs.js";

/**
 * As all *.js files are treated as ES modules (package.json contains "type": "module"),
 * we get the Node current working directory with process.cwd...
 * Finally, we use path.resolve to construct the absolute path of the src and dist directories
 * relative to the current working directory process.cwd.
 * @type {string}
 */
const curWD = process.cwd();
//import * as nodePath from "path";
const rootFolder = path.basename(path.resolve());

const srcPath = path.resolve(curWD, "src");
const distPath = path.resolve(curWD, "dist");
const tempPath = path.resolve(srcPath, "temp");
export const pathData = {
	rootFolder,
	srcPath,
	distPath,
	tempPath,
	ftp: "",
	src: {
		html: path.join(srcPath, "html", "*.html"),
		styles: path.join(srcPath, "scss", "*.scss"),
		js: path.join(srcPath, "js", "*.js"),
		img: [
			path.join(srcPath, "assets", "img", "**", "*.{jpg,jpeg,png,svg,gif,webp,avif,ico}"),
			`!${ path.join(srcPath, "assets", "img", "svgIcons", "mono", "**", "*") }`,
			`!${ path.join(srcPath, "assets", "img", "svgIcons", "multi", "**", "*") }`
		],
		svgIconsMono: [
			path.join(srcPath, "assets", "img", "svgIcons", "mono", "**", "*.svg")
		],
		svgIconsMulti: [
			path.join(srcPath, "assets", "img", "svgIcons", "multi", "**", "*.svg")
		],
		fonts: path.join(srcPath, "assets", "fonts", "**", "*.{eot,woff,woff2,ttf,otf}"),
		data: path.join(srcPath, "assets", "data", "**", "*.{json, pdf, xml}"),
		utils: [
			path.join(srcPath, "*"),
			path.join(srcPath, ".*"),
		],
	},
	build: {
		html: distPath,
		styles: path.join(distPath, "css"),
		js: path.join(distPath, "js"),
		img: path.join(distPath, "assets", "img"),
		svgIcons: path.join(distPath, "assets", "img", "svgIcons"),
		fonts: path.join(distPath, "assets", "fonts"),
		data: path.join(distPath, "assets", "data"),
		utils: distPath,
	},
	watch: {
		htmlNested: [
			`${ srcPath }/html/**/*.html`,
		],
		stylesNested: [
			`${ srcPath }/scss/**/*.scss`,
			`${ srcPath }/js/modulesPack/**/scss/*.scss`,
		],
		jsNested: [
			`${ srcPath }/js/**/*.js`,
			`${ srcPath }/js/modulesPack/**/*.js`,
		],
		img: [
			`${ srcPath }/assets/img/**/*.{jpg,jpeg,png,svg,gif,webp,avif,ico}`,
			`!${ srcPath }/assets/img/svgIcons/mono/**/*`,
			`!${ srcPath }/assets/img/svgIcons/multi/**/*`
		],
		svgIconsMono: [
			`${ srcPath }/assets/img/svgIcons/mono/**/*.svg`
		],
		svgIconsMulti: [
			`${ srcPath }/assets/img/svgIcons/multi/**/*.svg`
		],
		fonts: `${ srcPath }/assets/fonts/**/*.{eot,woff,woff2,ttf,otf}`,
		data: `${ srcPath }/assets/data/**/*.{json, pdf, xml}`,
	},
	clean: [
		distPath,
		path.resolve(curWD, "zip"),
		//path.resolve(curWD, "zip", `${ rootFolder }.zip`),
		tempPath,
	],
}
export const entries = {
	js: getFilesEntries(path.resolve(pathData.srcPath, "js"), "js"),
}
