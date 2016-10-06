define(["require", "exports", './utils', './resources'], function (require, exports, utils_1, resources_1) {
    "use strict";
    /** Application control and config */
    var Application = (function () {
        function Application(config, onReady) {
            var _this = this;
            /** General app-wide configuration params */
            this.config = {
                /** Path to application */
                appUrl: '',
            };
            /** Fires on window resize */
            this.onWindowResize = [];
            /** Default settings */
            this.defaultSettings = {
                locale: 'en'
            };
            if (config)
                this.config = config;
            if (onReady)
                this.onReady = onReady;
            utils_1.utils.setLocaleFunc(function (str) {
                var locale = _this.settings['locale'];
                var localeStr;
                if (Application.locales[locale])
                    localeStr = Application.locales[locale][str];
                if (localeStr)
                    return localeStr;
                else {
                    if (_this.settings['debug'])
                        utils_1.utils.log('NOT TRANSLATED: [' + str + ']');
                    return str;
                }
            });
            this.initLibraries();
            this.sessionInfo = {};
            this.loadSettings();
            exports.application = this;
            this.init();
        }
        /** Returns WebBrowser info */
        Application.getAgentInfo = function () {
            var r = {};
            r.vendor = (/webkit/i).test(navigator.appVersion) ? 'webkit' : (/firefox/i).test(navigator.userAgent) ? 'moz' : (/trident/i).test(navigator.userAgent) ? 'ms' : 'opera' in window ? 'o' : '';
            // Browser capabilities
            r.isAndroid = (/android/gi).test(navigator.appVersion);
            r.isIDevice = (/iphone|ipad/gi).test(navigator.appVersion);
            r.isPlaybook = (/playbook/gi).test(navigator.appVersion);
            r.isTouchPad = (/hp-tablet/gi).test(navigator.appVersion);
            r.hasTouch = 'ontouchstart' in window && !r.isTouchPad;
            r.isMobileDevice = false; // this will be set in device ready event
            // Events
            r.CLICK_EV = r.hasTouch ? 'touchstart' : 'click';
            return r;
        };
        ;
        Application.prototype.initLibraries = function () {
            var libs = this.config.libraries;
            for (var id in libs)
                if (libs.hasOwnProperty(id))
                    resources_1.resources.setLibraryPath(id, libs[id]);
        };
        Object.defineProperty(Application.prototype, "agentInfo", {
            /** Information about Browser */
            get: function () {
                if (!this._agentInfo)
                    this._agentInfo = Application.getAgentInfo();
                return this._agentInfo;
            },
            enumerable: true,
            configurable: true
        });
        /** Save options to localStorage */
        Application.prototype.saveSettings = function () {
            localStorage['settings'] = JSON.stringify(this.settings);
        };
        /** Load options from localStorage */
        Application.prototype.loadSettings = function () {
            if (localStorage['settings'])
                this.settings = JSON.parse(localStorage['settings']);
            else
                this.settings = this.defaultSettings;
        };
        /** Shows localized alert */
        Application.prototype.showMessage = function (msg) {
            if (msg && msg !== '')
                alert(this.L(msg));
        };
        /** Throws localized exception */
        Application.prototype.error = function (msg) {
            if (msg && msg !== '')
                throw (this.L(msg));
        };
        /** Inits application instance */
        Application.prototype.init = function () {
            var _this = this;
            this.getBody().onresize = this.handleBodyResize;
            resources_1.resources.loadResources(this.config.appUrl, function () { _this.afterResourcesLoaded(); });
        };
        ;
        /** Returns DOM body element*/
        Application.prototype.getBody = function () {
            return document.getElementsByTagName('body')[0];
        };
        /** Localizes string into selected language */
        Application.prototype.L = function (str) {
            return utils_1.utils.L(str);
        };
        /** Makes DOM body unmovable on mobile devices */
        Application.prototype.makeBodyUnmoveable = function () {
            var body = this.getBody();
            var bodyTouchMove = function (event) {
                event.preventDefault();
            };
            if (body.addEventListener)
                body.addEventListener('touchmove', bodyTouchMove, false);
        };
        ;
        /** Returns body's size as {width, height}  */
        Application.prototype.getViewportSize = function () {
            var e = window, a = 'inner';
            if (!('innerWidth' in window)) {
                a = 'client';
                e = document.documentElement || document.body;
            }
            return { width: e[a + 'Width'], height: e[a + 'Height'] };
        };
        Application.prototype.run = function () {
            // inherit to implement 
        };
        Application.prototype.afterResourcesLoaded = function () {
            if (this.onReady)
                this.onReady();
            this.run();
        };
        Application.prototype.handleBodyResize = function (event) {
            if (this.onWindowResize)
                for (var i = 0; i < this.onWindowResize.length; i++)
                    this.onWindowResize[i](event);
        };
        /** Locales supported by application */
        Application.locales = {
            en: {
                "$locale": "English"
            }
        };
        return Application;
    }());
    exports.Application = Application;
    /** Global Application instance */
    exports.application = null;
});
//# sourceMappingURL=application.js.map