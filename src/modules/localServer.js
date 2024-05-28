"use strict";

import sync from "browser-sync";

/**
 * @class
 * @classdesc local server, with methods to reload the page or to stream the changes to the page with no reload
 */
export default class LocalServer {
    /**
     * @param { string } [baseDir = "dist/"]
     * @param { boolean } [open = true]
     * @param { boolean } [notify = true]
     * @param { boolean } [noCacheHeaders = true]
     */
    constructor(
        baseDir = "dist/",
        open = true,
        notify = true,
        noCacheHeaders = true
    ) {
        this.baseDir = baseDir;
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
        res.setHeader("Cash-Control", "no-store, no-cache, must-revalidate, max-age=0");
        res.setHeader("Pragma", "no-cache");
        next(); //middleware complete callback
    }

    async start() {
        if (!this.hasStarted) {
            await this.browserSync.init({
                server: {
                    baseDir: this.baseDir,
                    middleware: this.middleware,
                },
                open: this.open,
                notify: this.notify,
            });
            this.hasStarted = true;
        }
        else {
            console.log("The local server has already started...");
            //being used in gulp.series, it needs to be completed
            return Promise.resolve();
        }
    }

    async stream() {
        if (!this.hasStarted) {
            await this.start();
            this.browserSync.stream();
        }
        else {
            this.browserSync.stream();
            //being used in gulp.series, it needs to be completed
            return Promise.resolve();
        }
    }

    async reload() {
        if (!this.hasStarted) {
            await this.start();
            this.browserSync.reload();
        }
        else {
            this.browserSync.reload();
            //being used in gulp.series, it needs to be completed
            return Promise.resolve();
        }
    }
}

///////////////// dev
function log(it, comments='value: ') {
    console.log(comments, it);
}