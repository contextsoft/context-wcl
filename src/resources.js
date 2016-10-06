define(["require", "exports"], function (require, exports) {
    "use strict";
    /** Resources collection */
    var Resources = (function () {
        function Resources() {
            /** Resources to load */
            this.resources = [];
            /** Libraries definde in application */
            this.libraries = {};
        }
        /** Resource registration methods */
        Resources.prototype.register = function (libraryName, resources) {
            this.resources.push({ library: libraryName, resources: resources });
        };
        Resources.prototype.setLibraryPath = function (libraryName, path) {
            this.libraries[libraryName] = path;
        };
        Resources.prototype.loadResources = function (baseUrl, afterResourceLoad) {
            var loader = new ResourseLoader();
            var r = [];
            if (this.resources) {
                for (var i = 0; i < this.resources.length; i++) {
                    var res = this.resources[i];
                    var path = this.libraries[res.library] || '';
                    r.push({
                        path: path,
                        baseUrl: baseUrl,
                        resources: this.resources[i].resources
                    });
                }
            }
            if (r.length > 0)
                loader.loadResources(r, null, afterResourceLoad);
        };
        return Resources;
    }());
    exports.Resources = Resources;
    exports.resources = new Resources();
    /** Resources loader */
    var ResourseLoader = (function () {
        function ResourseLoader() {
            this.totalResourceCount = 0;
            this.resourceCount = 0;
        }
        /** Loads application resources */
        ResourseLoader.prototype.loadResources = function (resources, progressHandler, onload) {
            this.onLoad = onload;
            this.progressHandler = progressHandler;
            for (var i = 0; i < resources.length; i++)
                this.resourceCount += resources[i].resources.length;
            this.totalResourceCount = this.resourceCount;
            if (this.totalResourceCount === 0)
                return 0;
            this.showProgress();
            for (var i = 0; i < resources.length; i++) {
                var res = resources[i].resources;
                var url = resources[i].path || '';
                if (url.search("http:") < 0 && url.search("https:") < 0 && resources[i].baseUrl)
                    url = resources[i].baseUrl + url;
                for (var j = 0; j < res.length; j++) {
                    var resType = this.getResourceType(res[j]);
                    this.loadResource(url + res[j], resType);
                }
            }
        };
        ResourseLoader.prototype.showProgress = function () {
            if (this.progressHandler && this.progressHandler.show)
                this.progressHandler.show();
        };
        ResourseLoader.prototype.hideProgress = function () {
            if (this.progressHandler && this.progressHandler.hide)
                this.progressHandler.hide();
        };
        ResourseLoader.prototype.progress = function () {
            if (this.progressHandler && this.progressHandler.progress) {
                var percent = Math.round(100 * (1 - (this.resourceCount / this.totalResourceCount)));
                this.progressHandler.progress(percent);
            }
        };
        ResourseLoader.prototype.baseUri = function (baseUri, uri) {
            if (uri == '')
                return uri;
            if (baseUri && baseUri.length > 0 && uri.indexOf(baseUri) === 0)
                uri = uri.substr(baseUri.length);
            return uri.toLowerCase();
        };
        ResourseLoader.prototype.getResourceType = function (resource) {
            var ext = resource.substring(resource.lastIndexOf('.') + 1).toLowerCase();
            if (ext === 'js' || ext === 'css')
                return ext;
            else
                return 'img';
        };
        ResourseLoader.prototype.checkAllLoaded = function () {
            if (this.resourceCount === 0) {
                this.hideProgress();
                if (this.onLoad)
                    this.onLoad.call(this);
            }
        };
        ResourseLoader.prototype.loadResource = function (url, resourceType) {
            var _this = this;
            url = url.toLowerCase();
            var i, fileref = null;
            if (resourceType === "js") {
                // before loading, try to locate it among loaded scripts
                for (i = 0; i < document.scripts.length; i++)
                    if (this.baseUri(document.baseURI, document.scripts[i].baseURI) === url) {
                        this.loadCallback({
                            target: document.scripts[i]
                        });
                        return;
                    }
                // if resourceType is a JavaScript file
                fileref = document.createElement('script');
                fileref.type = "text/javascript";
                fileref.onload = fileref.onerror = function () { _this.loadCallback(fileref); };
                // fix for IE
                fileref.onreadystatechange = function () {
                    if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                        this.loadCallback.call(this);
                        // Handle memory leak in IE
                        var head = document.getElementsByTagName("head")[0] || document.documentElement;
                        fileref.onload = fileref.onreadystatechange = null;
                        if (head && fileref.parentNode) {
                            head.removeChild(fileref);
                        }
                    }
                };
                fileref.src = url;
            }
            else if (resourceType === "css") {
                for (i = 0; i < document.styleSheets.length; i++)
                    if (this.baseUri(document.baseURI, document.styleSheets[i].href) === url) {
                        this.loadCallback({
                            target: document.styleSheets[i]
                        });
                        return;
                    }
                // if filename is a CSS file
                fileref = document.createElement("link");
                fileref.setAttribute("rel", "stylesheet");
                fileref.type = "text/css";
                fileref.href = url;
                this.loadCallback({ target: fileref });
            }
            else if (resourceType === "img") {
                // if filename is an image file
                var image_1 = new Image();
                image_1.onload = image_1.onerror = function () { _this.loadCallback(image_1); };
                image_1.src = url;
            }
            if (fileref)
                document.getElementsByTagName("head")[0].appendChild(fileref);
        };
        ResourseLoader.prototype.loadCallback = function (event) {
            this.resourceCount--;
            this.progress();
            this.checkAllLoaded();
        };
        return ResourseLoader;
    }());
    exports.ResourseLoader = ResourseLoader;
});
//# sourceMappingURL=resources.js.map