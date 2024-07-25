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
                                const newImgTag = this.pictureRender(newUrl, fullMatch);
                                line = line.replace(fullMatch, newImgTag);
                            }
                        }
                    }
                    return line;
                })
            );

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

    pictureRender(url, imgTag) {
        if (imgTag.indexOf("data-src") !== -1) {
            imgTag = imgTag.replace("<img", '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ');
            return `<picture><source data-srcset="${url}" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" type="image/webp">${imgTag}</picture>`;
        } else {
            return `<picture><source srcset="${url}" type="image/webp">${imgTag}</picture>`;
        }
    }
}

///////////////// dev
function log(it, comments='value: ') {
    console.log(comments, it);
}