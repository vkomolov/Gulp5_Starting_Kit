"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';

const PLUGIN_NAME = 'customGulpWebpHtml';

export default class CustomGulpWebpHtml extends Transform {
    constructor() {
        super({ objectMode: true });
        this.extensions = ['.jpg', '.jpeg', '.png', '.gif'];
        this.imgRegex = /<img([^>]*)src="(\S+)"([^>]*)>/gi;
    }
    _transform(file, encoding, callback) {
        try {
            if (file.isNull()) {
                return callback(null, file);
            }

            if (file.isStream()) {
                console.error(`File is null: ${file.base}`);
                return callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            }

            let inPicture = false;
            const data = file.contents
                .toString()
                .split('\n')
                .map(line => {
                    if (line.indexOf('<picture') !== -1) inPicture = true;
                    if (line.indexOf('</picture') !== -1) inPicture = false;

                    if (line.indexOf('<img') !== -1 && !inPicture) {
                        const matches = Array.from(line.matchAll(this.imgRegex));

                        matches.forEach(match => {
                            const [fullMatch, , url] = match;
                            if (this.isGifOrSvg(url)) {
                                return;
                            }
                            const newUrl = this.replaceExtensions(url);
                            const newImgTag = this.pictureRender(newUrl, fullMatch);
                            line = line.replace(fullMatch, newImgTag);
                        });
                    }
                    return line;
                })
                .join('\n');

            file.contents = Buffer.from(data);
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