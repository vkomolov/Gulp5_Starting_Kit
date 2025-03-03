"use strict";

import sync from "browser-sync";

/**
 * @class
 * @classdesc Local server with methods to reload the page or update changes without reloading.
 */
export default class BrowserSync {
    /**
     * @param {Object} options - Server settings
     * @param {string|Array<string>} [options.baseDir="dist/"] - Server root directory
     * @param {string} [options.startPath="index.html"] - Initial path when starting the server
     * @param {boolean} [options.open=true] - Auto open browser
     * @param {boolean} [options.notify=true] - Show BrowserSync notifications
     * @param {boolean} [options.noCacheHeaders=true] - Disable caching
     * @param {boolean} [options.injectChanges=false] - Inject CSS/JS changes without full reload
     * @param {boolean} [options.reloadOnRestart=true] - Reload page after server restart
     * @param {boolean} [options.ui=false] - Disable BrowserSync UI
     */
    constructor({
                    baseDir = "dist/",
                    startPath = "index.html",
                    open = true,
                    notify = true,
                    noCacheHeaders = true,
                    injectChanges = false,
                    reloadOnRestart = true,
                    ui = false,
                } = {}) {
        this.baseDir = Array.isArray(baseDir) ? baseDir : [baseDir];
        this.startPath = startPath;
        this.open = open;
        this.notify = notify;
        this.middleware = noCacheHeaders ? [this._setNoCacheHeaders] : [];
        this.browserSync = sync.create();
        this.hasStarted = false;
        this.injectChanges = injectChanges;
        this.reloadOnRestart = reloadOnRestart;
        this.ui = ui;


        // Bind methods to the current class context
        this.start = this.start.bind(this);
        this.stream = this.stream.bind(this);
        this.reload = this.reload.bind(this);
    }

    /**
     * Middleware to disable caching
     * @private
     */
    _setNoCacheHeaders(req, res, next) {
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        res.setHeader("Pragma", "no-cache");
        next();
    }

    /**
     * Starting BrowserSync
     * @returns {Promise<void>}
     */
    async start() {
        if (!this.hasStarted) {
            await this.browserSync.init({
                server: {
                    baseDir: this.baseDir,
                },
                startPath: this.startPath,
                middleware: this.middleware,
                open: this.open,
                notify: this.notify,
                injectChanges: this.injectChanges, // Inject CSS/JS changes
                reloadOnRestart: this.reloadOnRestart, // Reload page after restart
                ui: this.ui, // Disable BrowserSync UI
            });
            this.hasStarted = true;
        }
    }

    /**
     * Обновление страницы с перезагрузкой
     * @returns {Promise<void>}
     */
    async reload() {
        if (!this.hasStarted) {
            await this.start();
        }
        this.browserSync.reload();
    }

    /**
     * Обновление страницы без перезагрузки (live reload)
     * @returns {Promise<void>}
     */
    async stream() {
        if (!this.hasStarted) {
            await this.start();
        }
        this.browserSync.stream();
    }
}