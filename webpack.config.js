"use strict";
import { entries } from "./gulp/vars.js";

export default {
    mode: "production",
    entry: {
        ...entries.js,
    },
    output: {
        filename: "[name].bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};