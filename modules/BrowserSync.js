"use strict";

import sync from "browser-sync";

/////////////// END OF IMPORTS /////////////////////////
/**
 * @class
 * @classdesc local server, with methods to reload the page or to stream the changes to the page with no reload
 */
export default class BrowserSync {
    /**
     * @param { string } [baseDir = "dist/"]
     * @param { string } [index = "index.html"]
     * @param { boolean } [open = true]
     * @param { boolean } [notify = true]
     * @param { boolean } [noCacheHeaders = true]
     */
    constructor(
        {
            baseDir = "dist/",
            index = "index.html",
            open = true,
            notify = true,
            noCacheHeaders = true
        }
    ) {
        this.baseDir = baseDir;
        this.index = index;
        this.open = open;
        this.notify = notify;
        this.middleware = noCacheHeaders ? [this._setNoCacheHeaders] : [];
        this.browserSync = sync.create();
        this.hasStarted = false;
        //using methods out of this scope
        this.start = this.start.bind(this);
        this.stream = this.stream.bind(this);
        this.reload = this.reload.bind(this);
    }

    _setNoCacheHeaders(req, res, next) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        res.setHeader("Pragma", "no-cache");
        next(); //middleware complete callback
    }

    async start() {
        if (!this.hasStarted) {
            await this.browserSync.init({
                server: {
                    baseDir: this.baseDir,
                    index: this.index,
                },
                middleware: this.middleware,
                open: this.open,
                notify: this.notify,
            });
            this.hasStarted = true;
        }
    }

    async stream() {
        if (!this.hasStarted) {
            await this.start();
        }
        this.browserSync.stream();
    }

    async reload() {
        if (!this.hasStarted) {
            await this.start();
        }
        //this.browserSync.reload({ stream:true });
        this.browserSync.reload();
    }
}

///////////////// dev
/*function log(it, comments='value: ') {
    console.log(comments, it);
}*/
