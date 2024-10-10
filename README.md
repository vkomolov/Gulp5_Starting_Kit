# Gulp 5 Front-End package 
## Overview
The Gulp v5 Starting Pack was constructed using modern features such as [Simplified Stream Constructions](https://nodejs.org/api/stream.html#stream_simplified_construction) with
Transform stream, omitting the use of through2 and vinyl.

### Motivation:
- to get rid of annoying deprecations and vulnerabilities installing npm plugins;
- to finally apply the long-suffering Gulp version 5, hoping for its further support and development;
- 0 vulnerabilities and 0 deprecations of the chosen plugins on the current time...

Some useful and popular plugins were omitted because of their vulnerabilities and deprecations...
<br>Some plugins were replaced with the custom modules in `modules` folder.
<br>Anyway, the pack is recommended to add with additional plugins for the operations with the files, images (svg sprites), etc...
<br>Presently this package is equipped with the basic frontend needs: HTML, SCSS, ES6, image optimizations with the conversion to webp and automation of the alternative versions in html, etc...

### Features:
| Features                | Details                                                                                          |
|-------------------------|--------------------------------------------------------------------------------------------------|
| Gulp version: "^5.0.0"  |                                                                                                  |
| Node version: "v22.2.0" |                                                                                                  |
| Plugins:                |                                                                                                  |
|                         | [@babel/core](https://www.npmjs.com/package/@babel/core)                                         |
|                         | [@babel/plugin-transform-classes](https://www.npmjs.com/package/@babel/plugin-transform-classes) |
|                         | [@babel/plugin-transform-runtime](https://www.npmjs.com/package/@babel/plugin-transform-runtime) |
|                         | [@babel/preset-env](https://www.npmjs.com/package/@babel/preset-env)                             |
|                         | [@babel/runtime](https://www.npmjs.com/package/@babel/runtime)                                   |
|                         | [autoprefixer](https://www.npmjs.com/package/autoprefixer)                                       |
|                         | [babel-loader](https://www.npmjs.com/package/babel-loader)                                       |
|                         | [browser-sync](https://www.npmjs.com/package/browser-sync)                                       |
|                         | [css-loader](https://www.npmjs.com/package/css-loader)                                           |
|                         | [cssnano](https://www.npmjs.com/package/cssnano)                                                 |
|                         | [gulp](https://www.npmjs.com/package/gulp)                                                       |
|                         | [gulp-beautify](https://www.npmjs.com/package/gulp-beautify)                                     |
| can be removed...       | [gulp-cached](https://www.npmjs.com/package/gulp-cached)                                         |
|                         | [gulp-changed](https://www.npmjs.com/package/gulp-changed)                                       |
|                         | [gulp-cli](https://www.npmjs.com/package/gulp-cli)                                               |
|                         | [gulp-debug](https://www.npmjs.com/package/gulp-debug)                                           |
|                         | [gulp-file-include](https://www.npmjs.com/package/gulp-file-include)                             |
|                         | [gulp-htmlclean](https://www.npmjs.com/package/gulp-htmlclean)                                   |
|                         | [gulp-plumber](https://www.npmjs.com/package/gulp-plumber)                                       |
|                         | [gulp-postcss](https://www.npmjs.com/package/gulp-postcss)                                       |
|                         | [gulp-replace](https://www.npmjs.com/package/gulp-replace)                                       |
|                         | [gulp-sass](https://www.npmjs.com/package/gulp-sass)                                             |
|                         | [gulp-size](https://www.npmjs.com/package/gulp-size)                                             |
|                         | [gulp-zip](https://www.npmjs.com/package/gulp-zip)                                               |
|                         | [lru-cache](https://www.npmjs.com/package/lru-cache)                                             |
|                         | [plugin-error](https://www.npmjs.com/package/plugin-error)                                       |
|                         | [postcss](https://www.npmjs.com/package/postcss)                                                 |
|                         | [postcss-discard-unused](https://www.npmjs.com/package/postcss-discard-unused)                   |
|                         | [postcss-normalize-whitespace](https://www.npmjs.com/package/postcss-normalize-whitespace)       |
|                         | [postcss-sort-media-queries](https://www.npmjs.com/package/postcss-sort-media-queries)           |
|                         | [purgecss](https://www.npmjs.com/package/purgecss)                                               |
|                         | [rimraf](https://www.npmjs.com/package/rimraf)                                                   |
|                         | [sass](https://www.npmjs.com/package/sass)                                                       |
|                         | [sharp](https://www.npmjs.com/package/sharp)                                                     |
|                         | [style-loader](https://www.npmjs.com/package/style-loader)                                       |
|                         | [svgo](https://www.npmjs.com/package/svgo)                                                       |
|                         | [terser-webpack-plugin](https://www.npmjs.com/package/terser-webpack-plugin)                     |
|                         | [webpack](https://www.npmjs.com/package/webpack)                                                 |
|                         | [webpack-stream](https://www.npmjs.com/package/webpack-stream)                                   |
| can be removed...       | [air-datepicker](https://www.npmjs.com/package/air-datepicker)                                   |


#### `gulp/settings.js` all the settings are stored here for convenience:
| Feature               | Summary                                                                                                                                |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| `modes`               | Two modes are used: "build" and "development"                                                                                          |
| development mode:     |                                                                                                                                        |
| `headParams`          | Is used for writing meta data to head section of each page                                                                             |
| `fileIncludeSettings` | Settings for [gulp-file-include](https://www.npmjs.com/package/gulp-file-include)                                                      |
| `beautifySettings`    | Settings for [gulp-beautify](https://www.npmjs.com/package/gulp-beautify)                                                              |
| `optimizeCss`         | Settings for [postcss](https://www.npmjs.com/package/postcss):                                                                         |
|                       | [postcss-sort-media-queries](https://www.npmjs.com/package/postcss-sort-media-queries)                                                 |
|                       | [autoprefixer](https://www.npmjs.com/package/autoprefixer)                                                                             |
|                       | [discardUnused](https://www.npmjs.com/package/postcss-discard-unused)                                                                  |
|                       | [cssnano](https://www.npmjs.com/package/cssnano)                                                                                       |
| `minifyCss`           | Settings for [postcss](https://www.npmjs.com/package/postcss):                                                                         |
|                       | [normalizeWhitespace](https://www.npmjs.com/package/postcss-normalize-whitespace)                                                      |
| `useGulpSizeConfig`   | Configuration for [gulp-size](https://www.npmjs.com/package/gulp-size)                                                                 |
| `webpackConfigJs`     | Settings for webpack in "development" mode:                                                                                            |
|                       | `entry`: the entry js file for the each page, written in `gulp/paths.js: entries`                                                      |
|                       | `output`: the output js file with "[name].bundle.js"                                                                                   |
|                       | `module.rules` with loaders:                                                                                                           |
|                       | `babel-loader` with presets: "@babel/preset-env",<br>plugins: "@babel/plugin-transform-runtime", <br>"@babel/plugin-transform-classes" |
|                       | `style-loader`, `css-loader`                                                                                                           |
| `webpackConfigJs`     | Settings for webpack in "production" mode:                                                                                             |
|                       | `entry`: the entry js file for the each page, written in `gulp/paths.js: entries`                                                      |
|                       | `output`: the output js file with "[name].bundle.js"                                                                                   |
|                       | `optimization`: [terser-webpack-plugin](https://www.npmjs.com/package/terser-webpack-plugin)                                           |
|                       | `module.rules` with loaders:                                                                                                           |
|                       | `babel-loader` with presets: "@babel/preset-env",<br>plugins: "@babel/plugin-transform-runtime", <br>"@babel/plugin-transform-classes" |
|                       | `style-loader`, `css-loader`                                                                                                           |

### Notes
- The root html files and scss files, linked to them, must have the same basename: it is necessary for the correct work 
of `purgeCss` to remove the unused style selectors which are not found in the attached html file of the same name;
- `gulp-rename` was replaced to the custom module `CustomRenameFile`  //deprecations with fs.stats;
- `postcss-preset-env` is included in `cssnano`;
- `autoprefixer`  is included in `cssnano`
- `through2` is redundant in favor to [Simplified Stream Construction](https://nodejs.org/api/stream.html#stream_simplified_construction);
- `gulp-clean` has deprecations in dependencies and was replaced with `rimraf` with the custom async function `cleanDist` avoiding stream and cleaning the path directly;
  Advantages:
  * Directory existence check: We directly check if the directory exists, and only if it exists, we delete it.
  * No stream creation: We do not create a file stream and do not pass it through the plugin chain, which saves resources and time.
  * Performance: Faster because it only scans and deletes without any additional file processing.
- `gulp-newer` has deprecations and was replaced with the custom [CustomNewer](modules/CustomNewer.js),
<br> It uses [lru-cache](https://www.npmjs.com/package/lru-cache) and Simplified Stream Construction.
  Advantages:
     * Full control over dependencies and logic, avoiding outdated and vulnerable packages;
     * LRU Cache efficiently manage asynchronous operations and reduce the number of file system accesses;
     * Simplified Stream Construction: Readable and maintainable code that simplifies stream processing;
     * Using modern Node.js features like stream, Transform makes the code more idiomatic and understandable;
- `gulp-ttf2woff2` has a mass of deprecations. So, You are free to install additional plugins for Your need. But here is a simple piping of fonts to dist...;
- `gulp-imagemin` has 17 vulnerabilities (9 moderate, 8 high).
<br>So it was replaced with [CustomImgOptimizer](modules/CustomImgOptimizer.js) which effectively optimizes the images of different types, using `sharp`; 
- [CustomImgConverter](modules/CustomImgConverter.js) is also a custom module which utilizes `sharp` for converting images of different types;
- `gulp-htmlmin` is replace with `gulp-htmlclean`...

### Getting Started:

- just clone the rep, then run `npm install` for dependencies;
- `npm run dev`: is used for starting development with the local server reloaded on changes..;
- `npm run build`: it makes the optimized production of files to `dist` and opens the local server with the root html file: index.html;
- `npm run pipesDev`: it simply pipes the tasks to `dist` with no local server to open in the browser;
- `npm run pipesBuild`: it simply pipes the optimized files to `dist` with no local server to open in the browser;
- `npm run clean`: is used for cleaning the `dist` folder;

### Directory Structure

<pre>
|-- build
     |-- css
        main.css        //piped with dependencies
        main.min.css    //to be linked to *.html
        main.min.css.map //in development mode

     |-- assets 
        |-- data
            *.{json, pdf}    //data files of different types
        |-- fonts
        |-- img      //already compressed and converted files

     |-- js
        |-- partials
            *.js            //partial js files
        index.bundle.js     //to be linked to *.html
        index.bundle.js.map

    |-- somePages //can be additional folders with pages *.html
     main.html         //minimized html

|-- gulp   //settings and tasks of gulp

|-- modules  //custom modules

|-- src
    |-- assets
        |-- data
        |-- fonts
        |-- img

    |-- html //partial html files to be included

    |-- js
        |-- partials //partial js files

        index.js //*.js will be bundled from here

    |-- scss
        |-- global_styles
            _mixins.scss
        |-- partials
        index.scss //root scss files will be piped to `dist`

    index.html  //*.html will be piped from here

.gitignore
gulpfile.js
package.json
package-lock.json
README.md
</pre>

***
#### HTML:
It takes all `*.html` from `.src/html/*.html` including in nested folders except `.src/html/templates/*.html`.

[gulp-file-include](https://www.npmjs.com/package/gulp-file-include) will assemble all @@include partial html files from `from .src/html/templates/*.html` 
to the root html files in`dist/`

The [settings](gulp/settings.js) of `gulp-file-include`, located in `const fileIncludeSettings` has `context` property
for every root *.html page, which is useful for writing special data in common included *.html files...

Then it removes extra spaces and line breaks inside a tag `<img>`.  
Then it is piped to [CustomGulpWebpHtml](modules/CustomGulpWebpHtml.js) to replace the `<img>` tags 
with the alternative `srcset` with the converted webp format of the file (if exists) and the default the original `<img>`.  
Then it is beautified and written to .dist/

**NOTE!!!** No comments in html is allowed before the `<img>` tags, as `CustomGulpWebpHtml` will not convert `<img>` to `<picture><source>` structure.
***

#### CSS:

Each scss file, located in `src/scss/*.scss` (except inner directories), will be piped to `build/css` as minimized
file (with `min` prefix) and additionally not minimized version for dev convenience; 
The minimized version of css file will be loaded from the html file;

#### IMAGES:
All images inside `src/assets/img/**/*.{jpg,jpeg,png,svg,gif,webp,avif}` will be piped to `dist/assets/img/`
with the included folders...
[CustomImgOptimizer](modules/CustomImgOptimizer.js) will optimize the following images: `jpeg/jpg, png, webp, avif, svg`

In production mode the [CustomImgConverter](modules/CustomImgConverter.js) will automatically convert the images `"jpg", "jpeg", "png"` 
to the alternative `webp`.
All retina images will be converted correspondingly: image@2x.jpg to image@2x.webp

***
