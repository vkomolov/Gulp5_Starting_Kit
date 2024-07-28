"use strict";

import { Transform } from 'stream';
import path from "path";
import PluginError from 'plugin-error';
import { checkAccess } from "../gulp/utilFuncs.js";

const PLUGIN_NAME = 'customGulpWebpHtml';

export default class CustomGulpWebpHtml extends Transform {
    /**
     * It checks for alternative *.webp format and retina sizes, then it replaces the original <img src> with
     * <picture><source srcset> version of the image, adding alternative webp format and retina sizes if they exist...
     * @param {string} [rootImgSource="dist"] - root folder from which to search for the alternative images
     * @param {string} [retinaSize="2x"] - it will search the following retina sizes
     */
    constructor(rootImgSource = "dist", retinaSize = "2x") {
        super({ objectMode: true });
        this.extensions = ['.jpg', '.jpeg', '.png', '.gif'];
        this.imgRegex = /<img([^>]*)src="(\S+)"([^>]*)>/gi;
        this.rootImgSource = rootImgSource;
        this.retinaSize = retinaSize;
        this.retinaSuffix = `@${this.retinaSize}`;
    }

    async checkRetinaImages(basePath) {
        const webpRetinaPath = basePath.replace(".webp", `${this.retinaSuffix}.webp`);
        const jpgRetinaPath = basePath.replace(".webp", `${this.retinaSuffix}.jpg`);
        const pngRetinaPath = basePath.replace(".webp", `${this.retinaSuffix}.png`);

        const webpRetinaExists = await checkAccess(webpRetinaPath);
        const jpgRetinaExists = await checkAccess(jpgRetinaPath.replace(".webp", ".jpg"));
        const pngRetinaExists = await checkAccess(pngRetinaPath.replace(".webp", ".png"));

        return { webpRetinaExists, jpgRetinaExists, pngRetinaExists };
    }

    generateSrcset(basePath, webpRetinaExists, jpgRetinaExists, pngRetinaExists) {
        const srcsetWebp = `${basePath} 1x${webpRetinaExists ? `, ${basePath.replace('.webp', `${this.retinaSuffix}.webp`)} ${this.retinaSize}` : ""}`;
        const srcsetJpg = jpgRetinaExists ? `${basePath.replace(".webp", ".jpg")} 1x, ${basePath.replace(".webp", `${this.retinaSuffix}.jpg`).replace(".webp", ".jpg")} ${this.retinaSize}` : "";
        const srcsetPng = pngRetinaExists ? `${basePath.replace(".webp", ".png")} 1x, ${basePath.replace(".webp", `${this.retinaSuffix}.png`).replace(".webp", ".png")} ${this.retinaSize}` : "";

        return { srcsetWebp, srcsetJpg, srcsetPng };
    }

    async _transform(file, encoding, callback) {
        try {
            if (file.isNull()) {
                return callback(null, file);
            }

            if (file.isStream()) {
                console.error(`File is null: ${file.base}`);
                return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            }

            let inPicture = false;
            const data = await Promise.all(file.contents
                .toString()
                .split("\n")
                .map(async line => {
                    if (line.indexOf("<picture") !== -1) inPicture = true;
                    if (line.indexOf("</picture") !== -1) inPicture = false;

                    if (line.indexOf("<img") !== -1 && !inPicture) {
                        const matches = Array.from(line.matchAll(this.imgRegex));

                        for (const match of matches) {
                            const [fullMatch, , url] = match;
                            if (this.isGifOrSvg(url)) {
                                continue;
                            }

                            const newUrl = this.replaceExtensions(url);
                            const relativePath = path.normalize(newUrl.replace(/^(\.{1,2}\/)+/, ""));
                            const distImgUrl = path.resolve(this.rootImgSource, relativePath);
                            const webpExists = await checkAccess(distImgUrl);

                            if (webpExists) {
                                const {
                                    webpRetinaExists,
                                    jpgRetinaExists,
                                    pngRetinaExists
                                } = await this.checkRetinaImages(distImgUrl);
                                const newImgTag = this.pictureRender(newUrl, fullMatch, webpRetinaExists, jpgRetinaExists, pngRetinaExists);
                                line = line.replace(fullMatch, newImgTag);
                            }
                        }
                    }
                    return line;
                }));

            file.contents = Buffer.from(data.join("\n"));
            return callback(null, file);
        } catch (err) {
            console.error('[ERROR] Ensure there are no spaces or Cyrillic characters in the image file name');
            return callback(new PluginError(PLUGIN_NAME, err.message, { fileName: file.path }));
        }
    }

    isGifOrSvg(url) {
        return url.includes(".svg") || url.includes(".gif");
    }

    replaceExtensions(url) {
        let newUrl = url;
        this.extensions.forEach(ext => {
            const regex = new RegExp(ext, "gi");
            newUrl = newUrl.replace(regex, ".webp");
        });
        return newUrl;
    }

    pictureRender(url, imgTag, webpRetinaExists, jpgRetinaExists, pngRetinaExists) {
        const {
            srcsetWebp,
            srcsetJpg,
            srcsetPng
        } = this.generateSrcset(url, webpRetinaExists, jpgRetinaExists, pngRetinaExists);

        const webpSource = `<source srcset="${srcsetWebp}" type="image/webp">`;
        const jpgSource = jpgRetinaExists ? `<source srcset="${srcsetJpg}" type="image/jpeg">` : "";
        const pngSource = pngRetinaExists ? `<source srcset="${srcsetPng}" type="image/png">` : "";

        return `<picture>${webpSource}${jpgSource}${pngSource}${imgTag}</picture>`;
    }
}