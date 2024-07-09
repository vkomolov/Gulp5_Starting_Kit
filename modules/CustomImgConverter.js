"use strict";

import { Transform } from 'stream';
import PluginError from 'plugin-error';
import path from 'path';
import sharp from 'sharp';

const PLUGIN_NAME = 'customImgConverter';

export default class CustomImgConverter extends Transform {
    constructor(format) {
        super({ objectMode: true });
        this.format = format;
    }

    async _transform(file, encoding, callback) {
        if (file.isNull()) {
            console.error("file is null...", file.baseName);
            return callback(null, file);
        }

        if (file.isStream()) {
            callback(new PluginError(PLUGIN_NAME, "Streaming not supported"));
            return;
        }

        // Ensure file.contents is a buffer
        if (!Buffer.isBuffer(file.contents)) {
            file.contents = Buffer.from(file.contents);
        }

        const formatMap = {
            ".jpg": "jpeg",
            ".jpeg": "jpeg",
            ".png": "png",
            ".svg": "svg",
            ".gif": "gif",
            ".webp": "webp",
            ".avif": "avif"
        };

        if (!(this.format in formatMap)) {
            console.log(`The given format "${this.format}" is not known or not correct`);
            return callback(null, file);
        }

        const fileExt = path.extname(file.path).toLowerCase();

        try {
            if (fileExt in formatMap && formatMap[fileExt] !== "webp") {
                const format = formatMap[fileExt];

                // Convert to WebP
                const convertedBuffer = await sharp(file.contents)
                    .resize(this.options.resize || {})  // Optional: Resize options if needed
                    .toFormat("webp", { quality: 75 })  // Adjust quality as needed
                    .toBuffer();

                // Replace original content with WebP content
                file.contents = convertedBuffer;

                // Change file extension to .webp
                file.path = file.path.replace(path.extname(file.path), ".webp");
            }
            // For formats already in WebP, or unsupported formats, pass through unchanged
            return callback(null, file);
        } catch (err) {
            return callback(new PluginError(PLUGIN_NAME, err.message, { fileName: file.path }));
        }
    }
}