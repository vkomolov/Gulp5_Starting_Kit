## Gulp 5 Front-End package 
### Gulp version: "^5.0.0" !
### Node version: "v22.2.0" !

Task: to compile the npm plugins in production with HTML, CSS, JS, PHP and IMAGES files.

## Feature:
- "gulp-rename";   //deprecations with fs.stats. Favor to CustomRenameFile
- "postcss-preset-env" is included in cssnano
- "autoprefixer"  is included in cssnano
- "through2" is redundant in favor to Simplified Stream Construction: https://nodejs.org/api/stream.html#stream_simplified_construction




### Getting Started:

- just clone the rep, then run 'npm install' for dependencies;
- 'npm run dev': please, init in the console for the single build of
  the target files, starting Browser and following watching of the
  files to be changed;
- 'npm run build': please, init in the console for the single build of
  the target files and starting Browser. The following changes of the
  target files will not be checked;

### Directory Structure

<pre>
.
|-- build
     |-- css
        main.css        //piped with dependencies
        main.min.css    //to be linked to *.html

     |-- assets 
        |-- fonts
        |-- images      //already compressed files

     |-- js
        |-- partial     //partial js files
        main.js
        main.min.js     //to be linked to *.html

     main.html         //minimized html
|-- src
    |-- assets
        |-- fonts
        |-- images

    |-- js
        |-- partial
            funcs.js
            .......
        main.js                 //*.js will be piped from here

    |-- scss
        |-- global_styles
            _mixins.scss
            .......
        styles.scss

    |-- templates
        |-- data
         dataRu.json   //json data
         ...        
        |-- layouts            //*.html layouts
        |-- partials            //*.html partials

    main.html                 //*.html will be piped from here

.gitignore
gulpfile.js
package.json
package-lock.json
README.md
</pre>

### Instructions

- The Browser Reloading is realized with "browser-sync": "^3.0.2"

#### HTML:



##### Plugins:

###### !!! "gulp-notify": (version latest: "^4.0.0",) is not used because of 2 high severity vulnerabilities, connected to vulnerable versions of lodash.template.
Also, through2 (which is in dependency) can be replaced with Simplified Stream Construction,
introduced by Node.js: https://nodejs.org/api/stream.html#stream_simplified_construction
To make a custom module stays in TODO...


###### "gulp-filesize": "0.0.6"

- to log the sizes of the files before and after minimizing;

###### "gulp-htmlmin": "^5.0.1"

- to minimize *.html with white space collapsing;

#### CSS:

Each scss file, located in 'src/scss' (except inner
directories), will be piped to 'build/css' as minimized
file (with 'min' prefix) and not minimized version
for convenience; The minimized version of css file will
be linked in html page;

##### Plugins:

###### "gulp-filesize": "0.0.6"

- to log the sizes of the files before and after minimizing;

###### "gulp-sass": "^4.0.2"

- to compile .scss files to css;

###### "gulp-autoprefixer": "^6.0.0"

to parse CSS and add vendor prefixes to CSS rules;

###### "gulp-rename": "^1.4.0"

- to rename the file in stream and passing further;

###### "gulp-clean-css": "^4.0.0"

- to minify CSS file;

###### "gulp-filesize": "0.0.6"

- to log the sizes of the files before and after minimizing;

#### JS:

Each js file, located in 'src/js' (except inner
directories), will be piped to 'build/js' as minimized
file (with 'min' prefix) and not minimized version
for convenience; The minimized version of js file can
be linked in html page;

##### Plugins:

###### node-js path

will be required for path.basename property;

###### "browserify": "^16.2.3"

- to require module.exports from the separate js files;
  It gives convenience in importing files as in node.js
  by using 'require';
- browserify will recursively analyze all the require()
  calls in the app in order to build a bundle, which can
  be served up to the browser in a single <script> tag.

###### "babelify": "^10.0.0"

###### "@babel/core": "^7.3.4"

###### "@babel/preset-env": "^7.3.4"

- works in combination with "browserify", converting
  ECMAScript 2015+ code into a backwards compatible version
  of JavaScript in current and older browsers or environments;

###### "watchify": "^3.11.1"

- works in combination with "browserify", watching for
  the changes, then the "browserify" bundle will be recompiled;

###### "gulp-watch": "^5.0.1"

- is used for watching the files in the target path, then
  the callback function repipes the files to the 'build' path;

###### "exorcist": "^1.0.1"

- is used in combination with "browserify" to create
  separate map.js files in the pipe;

###### "vinyl-buffer": "^1.0.1"

###### "vinyl-source-stream": "^2.0.0"

- Convert streaming vinyl files to use buffers.
  "vinyl-source-stream" module is just a bridge that makes it simple to
  use conventional text streams such as this in combination
  with gulp.

###### "gulp-uglify": "^3.0.2"

- Uglifying JavaScript involves changing variable and
  function names to reduce their size;

#### IMAGES:

Each image file, located in 'src/img', will be piped to 'build/img'
as minimized file

###### "gulp-newer": "^1.4.0"

- to check the 'build' directory and to pipe the images
  from 'src/img' only if a new file exists;

###### "gulp-imagemin": "^5.0.3"

- to compress the image files, corresponding to the rules
  for compressing: gif, jpeg, png and svg files;
