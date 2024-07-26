"use strict";

import { Transform } from 'stream';
import path from "path";
import PluginError from 'plugin-error';
import { checkAccess } from "../gulp/utilFuncs.js";

const PLUGIN_NAME = 'customGulpWebpHtml';

export default class CustomGulpWebpHtml extends Transform {
    constructor(rootImgSource = "./dist/") {
        super({ objectMode: true });
        this.extensions = ['.jpg', '.jpeg', '.png', '.gif'];
        this.imgRegex = /<img([^>]*)src="(\S+)"([^>]*)>/gi;
        this.rootImgSource = rootImgSource;
    }

    async checkRetinaImages(basePath) {
        const webp2xPath = basePath.replace('.webp', '@2x.webp');
        const jpg2xPath = basePath.replace('.webp', '@2x.jpg');
        const png2xPath = basePath.replace('.webp', '@2x.png');

        const webp2xExists = await checkAccess(webp2xPath);
        const jpg2xExists = await checkAccess(jpg2xPath.replace('.webp', '.jpg'));
        const png2xExists = await checkAccess(png2xPath.replace('.webp', '.png'));

        return { webp2xExists, jpg2xExists, png2xExists };
    }

    generateSrcset(basePath, webp2xExists, jpg2xExists, png2xExists) {
        const srcsetWebp = `${basePath} 1x${webp2xExists ? `, ${basePath.replace('.webp', '@2x.webp')} 2x` : ''}`;
        const srcsetJpg = jpg2xExists ? `${basePath.replace('.webp', '.jpg')} 1x, ${basePath.replace('.webp', '@2x.jpg').replace('.webp', '.jpg')} 2x` : '';
        const srcsetPng = png2xExists ? `${basePath.replace('.webp', '.png')} 1x, ${basePath.replace('.webp', '@2x.png').replace('.webp', '.png')} 2x` : '';

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
                .split('\n')
                .map(async line => {
                    if (line.indexOf('<picture') !== -1) inPicture = true;
                    if (line.indexOf('</picture') !== -1) inPicture = false;

                    if (line.indexOf('<img') !== -1 && !inPicture) {
                        const matches = Array.from(line.matchAll(this.imgRegex));

                        for (const match of matches) {
                            const [fullMatch, , url] = match;
                            if (this.isGifOrSvg(url)) {
                                continue;
                            }

                            const newUrl = this.replaceExtensions(url);
                            const relativePath = path.normalize(newUrl.replace(/^(\.{1,2}\/)+/, ""));
                            const distImgUrl = path.join(this.rootImgSource, relativePath);
                            const webpExists = await checkAccess(distImgUrl);

                            if (webpExists) {
                                const { webp2xExists, jpg2xExists, png2xExists } = await this.checkRetinaImages(distImgUrl);
                                const newImgTag = this.pictureRender(newUrl, fullMatch, webp2xExists, jpg2xExists, png2xExists);
                                line = line.replace(fullMatch, newImgTag);
                            }
                        }
                    }
                    return line;
                }));

            file.contents = Buffer.from(data.join('\n'));
            return callback(null, file);
        } catch (err) {
            console.error('[ERROR] Ensure there are no spaces or Cyrillic characters in the image file name');
            return callback(new PluginError(PLUGIN_NAME, err.message, { fileName: file.path }));
        }
    }

    isGifOrSvg(url) {
        return url.includes('.svg') || url.includes('.gif');
    }

    replaceExtensions(url) {
        let newUrl = url;
        this.extensions.forEach(ext => {
            const regex = new RegExp(ext, "gi");
            newUrl = newUrl.replace(regex, ".webp");
        });
        return newUrl;
    }

    pictureRender(url, imgTag, webp2xExists, jpg2xExists, png2xExists) {
        const { srcsetWebp, srcsetJpg, srcsetPng } = this.generateSrcset(url, webp2xExists, jpg2xExists, png2xExists);

        const webpSource = `<source srcset="${srcsetWebp}" type="image/webp">`;
        const jpgSource = jpg2xExists ? `<source srcset="${srcsetJpg}" type="image/jpeg">` : '';
        const pngSource = png2xExists ? `<source srcset="${srcsetPng}" type="image/png">` : '';

        return `<picture>${webpSource}${jpgSource}${pngSource}${imgTag}</picture>`;
    }
}