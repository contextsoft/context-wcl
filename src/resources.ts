/**
 * Resources & resource loader classes
 */
import { utils } from './utils';
import { IVoidEvent, IDOMEvent } from './component';

interface ILibraryResource {
    library: string;
    resources: string[];
}

interface IResource {
    path: string;
    baseUrl: string;
    resources: string[];
}

interface ILibraries {
    [library: string]: string;
}

/** Resources collection */
export class Resources {
    /** Resources to load */
    public resources: ILibraryResource[] = [];

    /** Libraries definde in application */
    public libraries: ILibraries = {};

    /** Resource registration methods */
    public register(libraryName: string, resources: string[]) {
        this.resources.push({ library: libraryName, resources: resources });
    }

    public setLibraryPath(libraryName: string, path: string) {
        this.libraries[libraryName] = path;
    }

    public loadResources(baseUrl: string, afterResourceLoad: () => void) {
        let loader = new ResourseLoader();
        let r: IResource[] = [];
        if (this.resources) {
            for (let i = 0; i < this.resources.length; i++) {
                let res = this.resources[i];
                let path = this.libraries[res.library] || '';
                r.push({
                    path: path,
                    baseUrl: baseUrl,
                    resources: this.resources[i].resources
                });
            }
        }

        if (r.length > 0)
            loader.loadResources(r, null, afterResourceLoad);
    }
}

export var resources = new Resources();

/** Resources loader */
export class ResourseLoader {
    protected progressHandler;
    protected onLoad: IVoidEvent;
    protected totalResourceCount = 0;
    protected resourceCount = 0;

    /** Loads application resources */
    public loadResources(resources: IResource[], progressHandler: any, onload: IVoidEvent) {
        this.onLoad = onload;
        this.progressHandler = progressHandler;

        for (let i = 0; i < resources.length; i++)
            this.resourceCount += resources[i].resources.length;

        this.totalResourceCount = this.resourceCount;

        if (this.totalResourceCount === 0)
            return 0;

        this.showProgress();

        for (let i = 0; i < resources.length; i++) {
            let res = resources[i].resources;
            let url = resources[i].path || '';
            if (url.search("http:") < 0 && url.search("https:") < 0 && resources[i].baseUrl)
                url = resources[i].baseUrl + url;
            for (let j = 0; j < res.length; j++) {
                let resType = this.getResourceType(res[j]);
                this.loadResource(url + res[j], resType);
            }
        }
    }

    protected showProgress() {
        if (this.progressHandler && this.progressHandler.show)
            this.progressHandler.show();
    }

    protected hideProgress() {
        if (this.progressHandler && this.progressHandler.hide)
            this.progressHandler.hide();
    }

    protected progress() {
        if (this.progressHandler && this.progressHandler.progress) {
            let percent = Math.round(100 * (1 - (this.resourceCount / this.totalResourceCount)));
            this.progressHandler.progress(percent);
        }
    }

    protected baseUri(baseUri: string, uri: string) {
        if (uri == '')
            return uri;
        if (baseUri && baseUri.length > 0 && uri.indexOf(baseUri) === 0)
            uri = uri.substr(baseUri.length);
        return uri.toLowerCase();
    }

    protected getResourceType(resource) {
        let ext = resource.substring(resource.lastIndexOf('.') + 1).toLowerCase();
        if (ext === 'js' || ext === 'css')
            return ext;
        else
            return 'img';
    }

    protected checkAllLoaded() {
        if (this.resourceCount === 0) {
            this.hideProgress();
            if (this.onLoad)
                this.onLoad.call(this);
        }
    }

    protected loadResource(url, resourceType) {
        url = url.toLowerCase();
        let i, fileref = null;
        if (resourceType === "js") {
            // before loading, try to locate it among loaded scripts
            for (i = 0; i < document.scripts.length; i++)
                if (this.baseUri(document.baseURI, document.scripts[i].baseURI) === url) {
                    this.loadCallback(
                        {
                            target: document.scripts[i]
                        });
                    return;
                }

            // if resourceType is a JavaScript file
            fileref = document.createElement('script');
            fileref.type = "text/javascript";
            fileref.onload = fileref.onerror = () => { this.loadCallback(fileref); };

            // fix for IE
            fileref.onreadystatechange = function () {
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                    this.loadCallback.call(this);
                    // Handle memory leak in IE
                    let head = document.getElementsByTagName("head")[0] || document.documentElement;
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
                    this.loadCallback(
                        {
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
            let image = new Image();
            image.onload = image.onerror = () => { this.loadCallback(image); };
            image.src = url;
        }
        if (fileref)
            document.getElementsByTagName("head")[0].appendChild(fileref);
    }

    protected loadCallback(event) {
        this.resourceCount--;
        this.progress();
        this.checkAllLoaded();
    }

}
