var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/**
 * Application config
 */
define("examples/app01/config", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.config = {
        appUrl: '',
        debug: true,
        libraries: {
            "context-wcl": '../../src/',
            "lib": '../../node_modules/'
        }
    };
});
define("src/utils", ["require", "exports"], function (require, exports) {
    "use strict";
    var utils;
    (function (utils) {
        /**
         * Various handy routines
         **/
        //  Debug utils
        /** Checks if expression true otherwise throws exception and shows alert */
        function ASSERT(exp, msg) {
            if (exp)
                return;
            alert('Assert: ' + msg);
            throw (msg);
        }
        utils.ASSERT = ASSERT;
        /** Outputs string formated with fmt to console  */
        function log(str, fmt) {
            if (Array.isArray(fmt))
                str = formatStr(str, fmt);
            if (console)
                console.log(str);
        }
        utils.log = log;
        /** Output stack and string formated with fmt to console  */
        function logStack(str, fmt) {
            var e = new Error();
            str = str || '';
            log(str + '\n' + e.stack, fmt);
        }
        utils.logStack = logStack;
        // String utils
        /** Checks if val is undefined or null  */
        function isDefined(val) {
            return !(typeof val === 'undefined' || val === null);
        }
        utils.isDefined = isDefined;
        function strOfZero(cnt) {
            return '00000000000000000000000000000000000000000000000'.substr(0, cnt);
        }
        utils.strOfZero = strOfZero;
        function strOfSpace(cnt) {
            return '                                               '.substr(0, cnt);
        }
        utils.strOfSpace = strOfSpace;
        function strOfChar(chr, cnt) {
            return strOfSpace(cnt).replace(/ /g, chr);
        }
        utils.strOfChar = strOfChar;
        function completeStrLeft(val, chr, newlen) {
            return strOfChar(chr, newlen - val.length) + val;
        }
        utils.completeStrLeft = completeStrLeft;
        function completeStrRight(val, chr, newlen) {
            return val + strOfChar(chr, newlen - val.length);
        }
        utils.completeStrRight = completeStrRight;
        function completeByZero(val, newlen) {
            return strOfZero(newlen - val.length) + val;
        }
        utils.completeByZero = completeByZero;
        function completeBySpace(val, newlen) {
            return strOfSpace(newlen - val.length) + val;
        }
        utils.completeBySpace = completeBySpace;
        /** Concatinates 2 strings while @delimeter between */
        function concatWithChar(str1, str2, delimiter) {
            var res = str1 || '';
            str2 = str2 || '';
            delimiter = delimiter || '';
            if (res)
                res = str2;
            else if (res && str2)
                res += delimiter + str2;
            return res;
        }
        utils.concatWithChar = concatWithChar;
        /** Replaces \n with <br> and ' ' with &nbsp; */
        function textToHtml(value) {
            return value.replace(/\n/g, '<br>\n').replace(/ /g, '&nbsp;');
        }
        utils.textToHtml = textToHtml;
        /** Replaces < and > with  &lt; and &gt; */
        function escapeHTML(str) {
            var result = "";
            for (var i = 0; i < str.length; i++) {
                if (str.charAt(i) == "<") {
                    result = result + "&lt;";
                }
                else if (str.charAt(i) == ">") {
                    result = result + "&gt;";
                }
                else {
                    result = result + str.charAt(i);
                }
            }
            return result;
        }
        utils.escapeHTML = escapeHTML;
        function escapeQuotes(str) {
            return str.replace('"', '&quot;');
        }
        utils.escapeQuotes = escapeQuotes;
        /** Replaces occurrences of {0} {1} .. {n} in the str with values from args */
        function formatStr(str, args) {
            if (typeof str != 'string')
                throw 'formatStr: input is not a string';
            if (!args || args.length == 0)
                throw 'formatStr: invalid arguments';
            return str.replace(/{(\d+)}/g, function (match, num) {
                return typeof args[num] != 'undefined' ? args[num] : match;
            });
        }
        utils.formatStr = formatStr;
        /** Removes leading and trailing control characters */
        function trim(str) {
            if (!str)
                return '';
            var whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
            for (var i = 0; i < str.length; i++) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(i);
                    break;
                }
            }
            for (var i = str.length - 1; i >= 0; i--) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
        }
        utils.trim = trim;
        /** Removes leading and trailing \r\n */
        function trimCR(value) {
            if (typeof value != 'string')
                return value;
            var i = 0;
            var j = value.length - 1;
            while ((value[i] == '\n' || value[i] == '\r') && (i < value.length))
                i++;
            while ((value[j] == '\n' || value[j] == '\r') && (j > i))
                j--;
            return value.substring(i, j + 1);
        }
        utils.trimCR = trimCR;
        function indexOfWord(str, substr) {
            if (!substr || substr === '')
                return -1;
            var s = ' ' + str + ' ';
            var idx = s.indexOf(' ' + substr + ' ');
            if (idx > 0)
                idx++;
            return idx;
        }
        utils.indexOfWord = indexOfWord;
        //  Number utils
        function isValidNumber(val) {
            return !isNaN(val);
        }
        utils.isValidNumber = isValidNumber;
        function isValidInteger(val) {
            return !isNaN(val) && val == val.toFixed();
        }
        utils.isValidInteger = isValidInteger;
        /**
         * Formats currency, eg:
         * (123456789.12345).formatMoney({c: 2, d: '.', t: ','}) returns 123,456,789.12
         * (123456789.12345).formatMoney({c: 2})returns 123,456,789.12
         */
        function formatMoney(options) {
            var n = this;
            var o = options || {};
            if (o.blankZero && n == 0.0)
                return '';
            o.currencySymbol = o.currencySymbol || '$';
            o.c = isNaN(o.c = Math.abs(o.c)) ? 2 : o.c;
            o.d = o.d == undefined ? "." : o.d;
            o.t = o.t == undefined ? "," : o.t;
            var s = n < 0 ? "-" : "";
            var i = parseInt(n = Math.abs(+n || 0).toFixed(o.c)) + "";
            var j = i.length;
            j = j > 3 ? j % 3 : 0;
            return s + o.currencySymbol + (j ? i.substr(0, j) + o.t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + o.t) + (o.c ? o.d + Math.abs(n - i).toFixed(o.c).slice(2) : "");
        }
        utils.formatMoney = formatMoney;
        ;
        // Date utils
        function daysBetween(val, than) {
            return (new Date(val) - new Date(than)) / 86400 / 1000;
        }
        utils.daysBetween = daysBetween;
        function isValidDate(val) {
            return !isNaN(Date.parse(val));
        }
        utils.isValidDate = isValidDate;
        /** Formats date as mm/dd/yyyy */
        function dateToStr(val) {
            var date = new Date(val);
            return (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString();
        }
        utils.dateToStr = dateToStr;
        /** Formats date as mm/dd/yyyy hh:nn */
        function dateTimeToStr(val) {
            return formatDate(val, 'mm/dd/yyyy hh:nn t');
        }
        utils.dateTimeToStr = dateTimeToStr;
        /** Formats data as yyyy-mm-dd */
        function dateToSQLStr(val) {
            var date;
            if (!val)
                date = new Date();
            else if (typeof val == "object")
                date = val;
            else
                date = val ? new Date(val) : new Date();
            return completeByZero(date.getFullYear().toString(), 4) + '-' + completeByZero((date.getMonth() + 1).toString(), 2) + '-' + completeByZero(date.getDate().toString(), 2);
        }
        utils.dateToSQLStr = dateToSQLStr;
        /** Converts val formatted as "yyyymmddhhnnss" to date */
        function strTrimmedSQLToDate(val) {
            if (!val)
                throw 'Invalid Date Format';
            var yyyy = val.substr(0, 4);
            var mm = val.substr(4, 2) - 1;
            var dd = val.substr(6, 2);
            var hh = val.substr(8, 2);
            var nn = val.substr(10, 2);
            var ss = val.substr(12, 2);
            return new Date(yyyy, mm, dd, hh, nn, ss);
        }
        utils.strTrimmedSQLToDate = strTrimmedSQLToDate;
        // Converts val formatted as "yyyy-mm-dd hh:nn:ss" to date
        function strSQLToDate(val) {
            if (!val)
                return new Date(0, 0);
            var yyyy = val.substr(0, 4);
            var mm = val.substr(5, 2) - 1;
            var dd = val.substr(8, 2);
            var hh = val.substr(11, 2);
            var nn = val.substr(14, 2);
            var ss = val.substr(17, 2);
            return new Date(yyyy, mm, dd, hh, nn, ss);
        }
        utils.strSQLToDate = strSQLToDate;
        /** Formats date as "yyyymmddHHnnss" */
        function dateToTrimmedSQLStr(val) {
            return formatDate(val, 'yyyymmddHHnnss');
        }
        utils.dateToTrimmedSQLStr = dateToTrimmedSQLStr;
        /**
         * Formats date val with given format.
         * Possible format values: yyyy/yy, mm, dd, HH for 24 hours, hh for 12 hours, t for AM/PM
        */
        function formatDate(val, format) {
            var date = null;
            if (typeof val == "object")
                date = val;
            else
                date = val ? new Date(val) : null;
            if (!date)
                return '';
            else if (!format)
                return date.toLocaleDateString();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            format = format.replace('mm', completeByZero(month.toString(), 2));
            if (format.indexOf('yyyy') > -1)
                format = format.replace('yyyy', year.toString());
            else if (format.indexOf('yy') > -1)
                format = format.replace('yy', year.toString().substr(2, 2));
            format = format.replace('dd', completeByZero(date.getDate().toString(), 2));
            var hours = date.getHours();
            if (format.indexOf('t') > -1) {
                if (hours > 11)
                    format = format.replace('t', 'PM');
                else
                    format = format.replace('t', 'AM');
            }
            if (format.indexOf('HH') > -1)
                format = format.replace('HH', completeByZero(hours.toString(), 2));
            if (format.indexOf('hh') > -1) {
                if (hours > 12)
                    hours = 12;
                if (hours == 0)
                    hours = 12;
                format = format.replace('hh', completeByZero(hours.toString(), 2));
            }
            if (format.indexOf('nn') > -1)
                format = format.replace('nn', completeByZero(date.getMinutes().toString(), 2));
            if (format.indexOf('ss') > -1)
                format = format.replace('ss', completeByZero(date.getSeconds().toString(), 2));
            return format;
        }
        utils.formatDate = formatDate;
        /** Returns date formated as yyyy-mm-dd HH:nn:ss */
        function timeStamp() {
            return formatDate(new Date, 'yyyy-mm-dd HH:nn:ss');
        }
        utils.timeStamp = timeStamp;
        /** Add days to val */
        function incDate(val, days) {
            var date;
            if (!val)
                date = new Date();
            else if (typeof val == "object")
                date = val;
            else
                date = val ? new Date(val) : new Date();
            date.setDate(date.getDate() + days);
            return date;
        }
        utils.incDate = incDate;
        // DOM 
        /** Attaches handler to element's event using element.addEventListener or element.attachEvent */
        function addEvent(element, event, handler) {
            if (element.addEventListener)
                element.addEventListener(event, handler);
            else
                element.attachEvent('on' + event, handler);
        }
        utils.addEvent = addEvent;
        /** Returns attributes = {a1: v1, a2: v2, ...} as 'a1="v1" a2="v2" ...' */
        function attributesToString(attributes) {
            var res = '';
            if (typeof attributes === "object")
                for (var i in attributes)
                    if (attributes.hasOwnProperty(i))
                        res += i + '="' + escapeQuotes(attributes[i].toString()) + '" ';
                    else if (typeof attributes === "string")
                        res = attributes;
            return res;
        }
        utils.attributesToString = attributesToString;
        /** Returns style = {s1: v1, s2: v2, ...} as "s1=v1 \n s2=v2 \n ..."  */
        function styleToString(style) {
            var res = '';
            for (var i in style)
                res += i + ' = ' + style[i] + '\n';
            return res;
        }
        utils.styleToString = styleToString;
        /*
        declare global {
            interface HTMLCollection {
                filterByTagName(tagname): any;
            }
        }
        
        HTMLCollection.prototype.filterByTagName = function (tagname) {
            let filtered = [];
            tagname = tagname.toLowerCase();
        
            for (let i = 0; i < this.length; i++)
                if (this.item(i).tagName.toLowerCase() == tagname)
                    filtered.push(this.item(i));
        
            return filtered;
        };
        
        declare global {
            interface Element {
                hasClass(className): any;
                css(styles);
            }
        }
        
        Element.prototype.hasClass = function (className) {
            // TODO: Replace with brutal ternary for sake of bad readability.
            if (this.classList)
                return this.classList.contains(className);
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.className);
        };
        
        Element.prototype.css = function (styles) {
            if (typeof styles.css == 'undefined') {
                let that = this;
                styles.css = function (styles) {
                    return that.css(styles);
                }
            }
            for (let name in styles)
                if (name != 'css')
                    this.style[name] = styles[name];
            return styles;
        };
        */
        // Cookies
        function setCookie(cookieName, cookieValue, expireDays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + expireDays);
            var c_value = cookieValue + ((expireDays == null) ? "" : "; expires=" + exdate.toUTCString());
            document.cookie = cookieName + "=" + c_value;
        }
        utils.setCookie = setCookie;
        function getCookie(cookieName) {
            var c_value = document.cookie;
            var c_start = c_value.indexOf(" " + cookieName + "=");
            if (c_start == -1) {
                c_start = c_value.indexOf(cookieName + "=");
            }
            if (c_start == -1) {
                c_value = null;
            }
            else {
                c_start = c_value.indexOf("=", c_start) + 1;
                var c_end = c_value.indexOf(";", c_start);
                if (c_end == -1) {
                    c_end = c_value.length;
                }
                c_value = c_value.substring(c_start, c_end);
            }
            return c_value;
        }
        utils.getCookie = getCookie;
        // Other routines
        function paramsToJSON(params) {
            var res = {};
            for (var i in params) {
                var v = params[i];
                res[i] = !v ? '' : v;
            }
            return res;
        }
        utils.paramsToJSON = paramsToJSON;
        /** Returns fast non RFC-compliant GUID */
        function guid() {
            var _p8 = function (s) {
                var p = (Math.random().toString(16) + "000000000").substr(2, 8);
                return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
            };
            return _p8(false) + _p8(true) + _p8(true) + _p8(false);
        }
        utils.guid = guid;
        /** Object deep clone */
        function clone(src) {
            function mixin(dest, source, copyFunc) {
                var name, s, empty = {};
                for (name in source) {
                    // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
                    // inherited from Object.prototype.  For example, if dest has a custom toString() method,
                    // don't overwrite it with the toString() method that source inherited from Object.prototype
                    s = source[name];
                    if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {
                        dest[name] = copyFunc ? copyFunc(s) : s;
                    }
                }
                return dest;
            }
            if (!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]") {
                // null, undefined, any non-object, or function
                return src; // anything
            }
            if (src.nodeType && "cloneNode" in src) {
                // DOM Node
                return src.cloneNode(true); // Node
            }
            if (src instanceof Date) {
                // Date
                return new Date(src.getTime()); // Date
            }
            if (src instanceof RegExp) {
                // RegExp
                return new RegExp(src); // RegExp
            }
            var r, i, l;
            if (src instanceof Array) {
                // array
                r = [];
                for (i = 0, l = src.length; i < l; ++i) {
                    if (i in src) {
                        r.push(clone(src[i]));
                    }
                }
            }
            else {
                // generic objects
                r = src.constructor ? new src.constructor() : {};
            }
            return mixin(r, src, clone);
        }
        utils.clone = clone;
        /** Extends @first with the @second */
        function extend(first, second) {
            var result = {};
            for (var id in first) {
                result[id] = first[id];
            }
            for (var id in second) {
                if (!result.hasOwnProperty(id)) {
                    result[id] = second[id];
                }
            }
            return result;
        }
        utils.extend = extend;
        function setLocaleFunc(localeFunc) {
            utils.L = localeFunc;
        }
        utils.setLocaleFunc = setLocaleFunc;
        utils.L = function (str) { return str; };
    })(utils = exports.utils || (exports.utils = {}));
    Array.prototype.indexOfObject = function (field, value) {
        for (var i = 0; i < this.length; i++)
            if (this[i][field] === value)
                return i;
        return -1;
    };
    Array.prototype.findObject = function (func) {
        for (var i = 0; i < this.length; i++)
            if (func(this[i]))
                return i;
        return -1;
    };
    Array.prototype.getTotalRowCount = function () {
        return this.length;
    };
    Array.prototype.getRowCount = function () {
        return this.length;
    };
    Array.prototype.getRow = function (idx) {
        return this[idx];
    };
    Array.prototype.move = function (old_index, new_index) {
        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this;
    };
});
define("src/component", ["require", "exports", "src/utils"], function (require, exports, utils_1) {
    "use strict";
    /** Root for all components */
    var Component = (function () {
        function Component(name) {
            this.name = name || (this.getDefaultName() + (Component.nextComponentId++));
        }
        Component.getFunctionName = function (func) {
            if (typeof func !== 'function')
                throw ('Not a function');
            var funcNameRegex = /function (.{1,})\(/;
            if (func.name)
                return func.name;
            else {
                var results = funcNameRegex.exec(func.toString());
                return (results && results.length > 1) ? results[1] : '';
            }
        };
        /** Returns object's constructor function name */
        Component.getObjectClassName = function (obj) {
            return Component.getFunctionName(obj.constructor);
        };
        /** Returns component class name i.e. constructor name  */
        Component.prototype.getClassName = function () {
            return Component.getObjectClassName(this);
        };
        /** Localizes string into selected language */
        Component.prototype.L = function (str) {
            return utils_1.utils.L(str);
        };
        Component.prototype.getDefaultName = function () {
            var n = this.getClassName().toLowerCase();
            return n;
        };
        /** Global component counter */
        Component.nextComponentId = 1;
        return Component;
    }());
    exports.Component = Component;
});
define("src/resources", ["require", "exports"], function (require, exports) {
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
define("src/data", ["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Enumeration of possible data types for fields
     */
    (function (DataType) {
        DataType[DataType["Unknown"] = 0] = "Unknown";
        DataType[DataType["String"] = 1] = "String";
        DataType[DataType["Integer"] = 2] = "Integer";
        DataType[DataType["Double"] = 3] = "Double";
        DataType[DataType["Date"] = 4] = "Date";
        DataType[DataType["DateTime"] = 5] = "DateTime";
        DataType[DataType["Boolean"] = 6] = "Boolean";
        DataType[DataType["Blob"] = 7] = "Blob";
    })(exports.DataType || (exports.DataType = {}));
    var DataType = exports.DataType;
    /**
     * RecordState enum - the state of editable record
     */
    (function (RecordState) {
        RecordState[RecordState["Browse"] = 0] = "Browse";
        RecordState[RecordState["Insert"] = 1] = "Insert";
        RecordState[RecordState["Edit"] = 2] = "Edit";
    })(exports.RecordState || (exports.RecordState = {}));
    var RecordState = exports.RecordState;
    /**
     * EventType - enumerates types of events generated by data source
     */
    (function (EventType) {
        EventType[EventType["StateChanged"] = 0] = "StateChanged";
        EventType[EventType["DataChanged"] = 1] = "DataChanged";
        EventType[EventType["CursorMoved"] = 2] = "CursorMoved";
        EventType[EventType["Refreshed"] = 3] = "Refreshed";
    })(exports.EventType || (exports.EventType = {}));
    var EventType = exports.EventType;
    ;
    /**
     * FieldDataLink - a generic implementation of a data link for single field controls
     */
    var FieldDataLink = (function () {
        function FieldDataLink(onChangeEvent, converter) {
            this.onChangeEvent = onChangeEvent;
            this.converter = converter;
        }
        Object.defineProperty(FieldDataLink.prototype, "dataSource", {
            get: function () { return this._dataSource; },
            set: function (value) {
                if (this._dataSource != value) {
                    if (this._dataSource)
                        this._dataSource.removeLink(this);
                    this._dataSource = value;
                    if (this._dataSource)
                        this._dataSource.addLink(this);
                }
            },
            enumerable: true,
            configurable: true
        });
        FieldDataLink.prototype.onChange = function (eventType, data) {
            if (eventType != EventType.StateChanged && this.onChangeEvent)
                this.onChangeEvent(eventType, data);
        };
        Object.defineProperty(FieldDataLink.prototype, "value", {
            get: function () {
                var res = null;
                if (this.dataSource && this.dataSource.current && this.dataField != '') {
                    res = this.dataSource.current[this.dataField];
                    if (this.converter)
                        res = this.converter.decode(this, res);
                }
                return res;
            },
            set: function (val) {
                if (this.dataSource && this.dataSource.current && this.dataField != '') {
                    if (this.dataSource.getState() == RecordState.Browse)
                        this.dataSource.edit();
                    if (this.converter)
                        val = this.converter.decode(this, val);
                    this.dataSource.current[this.dataField] = val;
                    this.dataSource.notifyLinks(EventType.DataChanged, this.dataField);
                }
            },
            enumerable: true,
            configurable: true
        });
        return FieldDataLink;
    }());
    exports.FieldDataLink = FieldDataLink;
    /**
     * CollectionLink - generic implementation of a data link for list controls
     */
    var CollectionLink // implements ICollectionSource
     = (function () {
        function CollectionLink // implements ICollectionSource
            () {
        }
        return CollectionLink // implements ICollectionSource
        ;
    }());
    exports.CollectionLink // implements ICollectionSource
     = CollectionLink // implements ICollectionSource
    ;
});
define("src/actions", ["require", "exports", "src/component"], function (require, exports, component_1) {
    "use strict";
    /** Action handling component */
    var Action = (function (_super) {
        __extends(Action, _super);
        function Action() {
            _super.apply(this, arguments);
        }
        return Action;
    }(component_1.Component));
    exports.Action = Action;
});
define("src/view", ["require", "exports", "src/utils", "src/component", "src/data"], function (require, exports, utils_2, component_2, data_1) {
    "use strict";
    /** Views's Align */
    var Align = (function () {
        function Align() {
        }
        Align.left = { id: 'left', style: 'position: absolute; left: 0; top: 0; bottom: 0' };
        Align.top = { id: 'top', style: 'position: absolute; left: 0; top: 0; right: 0' };
        Align.right = { id: 'right', style: 'position: absolute; top: 0; right: 0; bottom: 0' };
        Align.bottom = { id: 'bottom', style: 'position: absolute; left: 0; right: 0; bottom: 0' };
        Align.client = { id: 'client', style: 'position: absolute; left: 0; top: 0; right: 0; bottom: 0' };
        return Align;
    }());
    exports.Align = Align;
    /* TODO:
       * Actions
       * IScroll???
       * Serialization
    */
    /**
     * Root for all controls
     **/
    var View = (function (_super) {
        __extends(View, _super);
        function View(parent, name) {
            _super.call(this, name);
            /** Control's html tag type e.g. div */
            this.tag = 'div';
            /** Render or not view with client area
             *  the reason for this is to be able to layout child views this allows to use padding to create internal margins
             */
            this.renderClientArea = true;
            /** Control's client area CSS style */
            this.clientAreaStyle = '';
            /** Indicates is control rendered in client area of parent control or not */
            this.renderInNonClientArea = false;
            //public actions: any = {};
            /** Control's child controls */
            this.children = [];
            /** DOM events wich receives view instance as "this" */
            this.events = {};
            // TODO: fix attributes always lowcase
            /** Object with additional control's DOM attributes */
            this.attributes = {};
            /** Align child controls or not, default false */
            this.alignChildren = false;
            /** Escape or not html tags in text value */
            this.doNotEscapeHtml = false;
            //protected isController = false; //TODO: used in serialization 
            this.clientAreaTag = 'div';
            this.clientAreaClass = 'ctx_view_client_area';
            this.hiddenViewClass = 'ctx_view_hidden';
            this.cssPrefix = 'Ctx';
            this.updating = 0;
            this._enabled = true;
            this._visible = true;
            this._id = 'w' + (View.nextViewId++);
            this._parent = parent;
            if (parent)
                parent.addView(this);
            this.initComponents();
        }
        /** Returns html <tag attr>innerHtml</tag>
         * leaveOpen means close or not tag
         */
        View.getTag = function (tag, attr, innerHtml, leaveOpen) {
            if (leaveOpen === void 0) { leaveOpen = false; }
            var t = tag || 'div';
            var res = '<' + t + ' ' + (attr || '');
            res += (t === 'input') ? '/' : '';
            res += '>' + (innerHtml != 'undefined' ? innerHtml : '');
            res += (!leaveOpen) ? '</' + t + '>' : '';
            return res;
        };
        Object.defineProperty(View.prototype, "id", {
            /** Controls's id for DOM */
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "parent", {
            /** Control's parent control */
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "enabled", {
            /** Enables or disabled controls */
            get: function () {
                //let a = this.getAction();
                //return (a) ? (a.getEnabled() && a.execute) : this._enabled;
                return this._enabled;
            },
            set: function (value) {
                if (value !== this._enabled) {
                    this._enabled = value;
                    // let a = this.getAction();
                    // if(a)
                    //     a.setEnabled(value);
                    if (this.element)
                        this.updateView();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "additionalCSSClass", {
            /** Sets/Gets CSS class in addition to generated one e.g. 'TextView View additionalCSSClass'  */
            get: function () {
                return this._additionalCSSClass;
            },
            set: function (value) {
                if (this._additionalCSSClass !== value) {
                    this._additionalCSSClass = value;
                    if (this.visible && this.element)
                        this.element.className = this.getCSSClass();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "bodyElement", {
            /** Cached DOM body element */
            get: function () {
                if (!this._bodyElement && this._bodyElementId)
                    this._bodyElement = document.getElementById(this._bodyElementId);
                if (!this._bodyElement)
                    this._bodyElement = document.getElementsByTagName('body')[0];
                return this._bodyElement;
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(View.prototype, "visible", {
            /** Shows or hides control */
            get: function () {
                // return (this.action) ? this.action.visible : this._visible;
                return this._visible;
            },
            set: function (value) {
                this.setVisible(value);
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setVisible = function (value) {
            if (value !== this._visible) {
                this._visible = value;
                this.updateView();
                this.visibleChanged();
            }
        };
        ;
        Object.defineProperty(View.prototype, "element", {
            /** Control's DOM element */
            get: function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "text", {
            /** Sets/Gets content which will be rendered */
            get: function () {
                var result;
                if (typeof this.onGetText === "function")
                    result = this.onGetText();
                else
                    result = this.L(this._text);
                if (result && !this.doNotEscapeHtml)
                    result = utils_2.utils.escapeHTML(result);
                return (result) ? String(result) : '';
            },
            set: function (value) {
                if (value !== this._text) {
                    this._text = value;
                    if (this.element)
                        this.updateView();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "classPath", {
            /** Class path for css, e.g. "CtxView CtxTextView" */
            get: function () {
                return this._classPath;
            },
            enumerable: true,
            configurable: true
        });
        /** Control's Action  */
        // public public get action() {
        //     return this.action;
        // }    
        // public public set action(value: Action) {
        //     if (this.action !== value) {
        //         // if (this.action)
        //         //     this.action.removeView(this);
        //         this._action = value;
        //         // if (this.action)
        //         //     this.action.addView(this);
        //         this.updateView();
        //     }
        // }
        // protected _action: Action;
        /** Returns control's DOM element */
        View.prototype.getElement = function () {
            return document.getElementById(this.id);
        };
        View.prototype.getClientElementId = function () {
            return this.id + '_client';
        };
        /** Returns   */
        View.prototype.getClientElement = function () {
            return document.getElementById(this.getClientElementId());
        };
        /** Hides and removes control from parent */
        View.prototype.destroy = function () {
            this.hide();
            this.setParent(null);
        };
        /** Returns control's parent' */
        View.prototype.getParent = function () {
            return this.parent;
        };
        /** Moves control to the new parent */
        View.prototype.setParent = function (value) {
            if (value !== this.parent) {
                if (this.parent) {
                    this.parent.removeView(this);
                    // destroy element if it exists within parent view
                    if (this.element && this.parent.element) {
                        if (this.parent.visible) {
                            // let parent redraw itself
                            this._element = null;
                            this.parent.updateView();
                        }
                        else {
                            // simply delete element from DOM
                            this.element.parentElement.removeChild(this.element);
                        }
                    }
                }
                else if (this.element) {
                    // if we belong to body, in this case the parent was null but the element exists
                    this.bodyElement.removeChild(this.element);
                }
                this._element = null;
                this.resetChildrenElements();
                if (value)
                    value.addView(this);
                this._parent = value;
                // update new parent to create it if it's visible - this will keep status quo
                if (this.visible) {
                    if (this.parent)
                        this.parent.updateView();
                    else
                        this.updateView();
                }
            }
        };
        /** While control updating it won't be rerender */
        View.prototype.beginUpdate = function () {
            this.updating++;
        };
        /** Ends control update and renders it */
        View.prototype.endUpdate = function () {
            if (this.updating > 0) {
                this.updating--;
                if (!this.updating)
                    this.updateView();
            }
        };
        /** Calls action and rerenders control */
        View.prototype.update = function (action) {
            this.beginUpdate();
            if (typeof action === "function") {
                try {
                    action.call(this);
                }
                catch (e) {
                    this.endUpdate();
                    throw e;
                }
            }
            this.endUpdate();
        };
        /** Add param view to controls children */
        View.prototype.addView = function (view) {
            if (view && this.children.indexOf(view) < 0)
                this.children.push(view);
        };
        /** Removes view from control's children */
        View.prototype.removeView = function (view) {
            var idx = this.children.indexOf(view);
            if (idx >= 0)
                this.children.splice(idx, 1);
        };
        /** Shows control */
        View.prototype.show = function () {
            this.visible = true;
        };
        /** Hides control */
        View.prototype.hide = function () {
            this.visible = false;
        };
        /** Rerenders control */
        View.prototype.updateView = function () {
            // do nothing if we are in updating mode
            if (this.updating)
                return;
            // update view
            this._element = this.getElement();
            if (this.element) {
                this.beforeUpdateView();
                this.element.outerHTML = this.internalRender();
                this.internalAfterUpdateView();
            }
            else if (this.parent) {
                // update parent
                this._element = null;
                this.parent.internalInsertChild(this);
            }
            else if (!this.parent) {
                this.beforeUpdateView();
                // update body
                this._element = null;
                var e = document.createElement('div');
                this.bodyElement.appendChild(e);
                // it is important to render self while element == null
                // in this case we will not try to use element's style and attributes, otherwise we will
                // effectively erase them all
                e.outerHTML = this.internalRender();
                this._element = e;
                this.internalAfterUpdateView();
            }
        };
        /** Returns control's DOM element attribute */
        View.prototype.getElementAttribute = function (name) {
            if (this.element && this.visible)
                return this.element.getAttribute(name);
            else
                return this.attributes[name];
        };
        /** Sets control's DOM element attribute */
        View.prototype.setElementAttribute = function (name, value) {
            if (this.element && this.visible)
                this.element.setAttribute(name, value);
            return this.attributes[name] = value;
        };
        /** Returns control's or its action's icon url */
        View.prototype.getIcon = function () {
            return this.icon || '';
            // else {
            //     if (this.action && this.action.icon)
            //         return this.action.icon;
            //     else
            //         return '';
            // }
        };
        /** Return icon withing <img> tag */
        View.prototype.renderIcon = function () {
            var icon = this.getIcon();
            if (icon)
                return '<img src="' + icon + '">';
            else
                return '';
        };
        /** Return controls html without children */
        View.prototype.renderTag = function (innerHtml, leaveOpen) {
            return View.getTag(this.tag, this.internalGetTagAttr(), innerHtml, leaveOpen);
        };
        /** Returns control's html with children */
        View.prototype.render = function () {
            var html = this.renderSelf() + this.renderChildren();
            if (this.renderClientArea) {
                html = View.getTag(this.clientAreaTag, this.getClientAreaTagAttr(), html);
                // render non-client area children
                html += this.renderChildren(true);
            }
            return this.renderTag(html);
        };
        /** Return control's html accouting it's visibility */
        View.prototype.internalRender = function () {
            if (this.visible)
                return this.render();
            else
                return '<div class="' + this.hiddenViewClass + '" id=' + this.id + '></div>';
        };
        /** Aligns control's children when alignChildren = true */
        View.prototype.realignChildren = function (offset) {
            if (!this.alignChildren)
                return;
            offset = offset || {
                'left': { left: 0, top: 0, bottom: 0 },
                'top': { left: 0, top: 0, right: 0 },
                'right': { top: 0, right: 0, bottom: 0 },
                'bottom': { left: 0, right: 0, bottom: 0 },
                'client': { left: 0, top: 0, right: 0, bottom: 0 }
            };
            function incOffset(id, value) {
                for (var o in offset)
                    if (offset.hasOwnProperty(o) && offset[o].hasOwnProperty(id))
                        offset[o][id] += value;
            }
            var c, aid, el;
            for (var i = 0; i < this.children.length; i++) {
                c = this.children[i];
                aid = c.align ? c.align.id : Align.left.id;
                el = c.element;
                if (!el)
                    continue;
                el.style['left'] = offset[aid].left + 'px';
                el.style['right'] = offset[aid].right + 'px';
                el.style['top'] = offset[aid].top + 'px';
                el.style['bottom'] = offset[aid].bottom + 'px';
                if (c.align) {
                    if (aid == Align.left.id)
                        incOffset('left', el.offsetWidth);
                    else if (aid == Align.right.id)
                        incOffset('right', el.offsetWidth);
                    else if (aid == Align.top.id)
                        incOffset('top', el.offsetHeight);
                    else if (aid == Align.bottom.id)
                        incOffset('bottom', el.offsetHeight);
                }
                if (c.scrollBar)
                    c.updateScrollBar();
                if (c.alignChildren)
                    this.children[i].realignChildren();
            }
        };
        /** Focuses control's DOM element */
        View.prototype.setFocus = function () {
            if (this.element && this.visible)
                this.element.focus();
        };
        // public updateActionShortcuts(value) {
        //     // if this is not visible we need to disable shortcuts
        //     value = value && this.visible;
        //     for (let m in this)
        //         if (this.hasOwnProperty(m)) {
        //             let a = this[m];
        //             // actions for this view will be
        //             if (a && typeof a.setShortcutActive === "function")
        //                 a.setShortcutActive(value);
        //         }
        //     for (let i = 0; i < this.children.length; i++)
        //         this.children[i].updateActionShortcuts(value);
        // }
        View.prototype.visibleChanged = function () {
            // this.updateActionShortcuts(true);
            if (this.onVisibleChanged)
                this.onVisibleChanged();
        };
        /** Resets all children elements to null */
        View.prototype.resetChildrenElements = function () {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i]._element = null;
                this.children[i].resetChildrenElements();
            }
        };
        /** Assigns event handler to control's DOM-element in addition to control.events handlers */
        View.prototype.handleEvent = function (eventName, handler) {
            var _this = this;
            if (this.element && this.visible) {
                if (handler)
                    this.element[eventName] = function (event) {
                        handler.call(_this, event);
                        if (_this.events[eventName])
                            _this.events[eventName].call(_this, event);
                    };
            }
        };
        // /** Returns topmost parent */
        // public getOwner() {
        //     // controller cannot have an owner, cause it's a topmost owner
        //     if (!this.isController && this.parent)
        //         return this.parent.getChildrenOwner();
        //     return null;
        // }
        // /** Who owns my children */
        // protected getChildrenOwner() {
        //     if (this.isController || !this.parent)
        //         return this;
        //     else
        //         return this.parent.getChildrenOwner();
        // }
        View.prototype.internalTriggerReady = function () {
            if (this.visible && this.element && this.onReady)
                this.onReady();
        };
        View.prototype.beforeUpdateView = function () {
        };
        //TODO: unclear code, looks like internalAfterUpdateView and afterUpdateView should be combined 
        View.prototype.internalAfterUpdateView = function () {
            var _this = this;
            this.afterUpdateView();
            this.initSplitter();
            this.realignChildren();
            setTimeout(function () {
                _this.realignChildren();
            }, 0);
            this.internalTriggerReady();
        };
        View.prototype.afterUpdateView = function () {
            var _this = this;
            // assign DOM element
            this._element = this.getElement();
            if (!this.visible || !this.element) {
                // clear elements for all children
                this.resetChildrenElements();
                return;
            }
            // assign self to DOM element
            this.element.view = this;
            // assign style if it's an object
            if (typeof this.style === "object")
                for (var s in this.style)
                    if (this.style.hasOwnProperty(s))
                        this.element.style[s] = this.style[s];
            // update all children
            for (var i = 0; i < this.children.length; i++)
                this.children[i].internalAfterUpdateView();
            // assign events
            if (typeof this.events === 'object')
                var _loop_1 = function(e) {
                    if (this_1.events.hasOwnProperty(e))
                        this_1.element[e] = function (event) { _this.events[e].call(_this, event); };
                };
                var this_1 = this;
                for (var e in this.events) {
                    _loop_1(e);
                }
            // handle on click if we have action assigned
            // if (this.action || this.events.onclick)
            //     this.handleEvent('onclick', this.handleClick);
        };
        // protected handleClick(event: Event) {
        //     if (this.enabled) {
        //         return (this.action) ? this.action.execute(this, event) : false;
        //     }
        // }
        View.prototype.internalInsertChild = function (child) {
            this.updateView();
        };
        /** Returns control's CSS class */
        View.prototype.getCSSClass = function () {
            var c = this.name ? this.name + ' ' : '';
            if (!this._classPath) {
                var t = Object.getPrototypeOf(this), cp = '';
                while (t) {
                    cp += (cp == '' ? '' : ' ') + this.cssPrefix + component_2.Component.getFunctionName(t.constructor);
                    t = Object.getPrototypeOf(t);
                    if (!t || !t.constructor || t.constructor === component_2.Component)
                        t = null;
                }
                this._classPath = cp;
            }
            c += this._classPath;
            var a = this.additionalCSSClass;
            if (a)
                c += ' ' + a;
            c += !this.enabled ? ' disabled' : '';
            // c += this.float? ' float-' + this.float : '';
            // c += this.position? ' position-' + this.position : '';
            // c += this.scrollbars? ' scrollbars-' + this.scrollbars : '';
            // c += (this.scrollbars && this.scrollToUse) ? ' CtxScroll' : '';
            return c;
        };
        /** Returns all control element's attributes */
        View.prototype.internalGetTagAttr = function () {
            var e = this.element;
            var s = (e && e.className !== this.hiddenViewClass) ? e.style.cssText : (typeof this.style == 'string' ? this.style : '');
            var align = '';
            if (this.align) {
                s += s ? ('; ' + this.align.style) : this.align.style;
                align = utils_2.utils.formatStr(' ctx_align="{0}"', [this.align.id]);
            }
            if (typeof s === "string" && s !== '')
                this.attributes.style = s;
            else
                delete this.attributes.style;
            return 'class="' + this.getCSSClass() + '" ' + this.getTagAttr() + (this.enabled ? '' : 'disabled') + ' id="' + this.id + '"' + align;
        };
        /** Return control element's this.attrubutes */
        View.prototype.getTagAttr = function () {
            return utils_2.utils.attributesToString(this.attributes);
        };
        View.prototype.getClientAreaTagAttr = function () {
            // this renders view with client area
            // the reason for this is to be able to layout child views
            // this allows to use padding to create internal margins
            var clientAreaStyle = (this.clientAreaStyle) ? ' style="' + this.clientAreaStyle + '" ' : '';
            return 'class="' + this.clientAreaClass + '" id="' + this.id + '_client"' + clientAreaStyle;
        };
        /** Returns control's content html */
        View.prototype.renderSelf = function () {
            return this.renderIcon() + this.text;
        };
        /** Returns control's childs html
         * nonClientArea indicates if client area or not rendered at the moment
         * */
        View.prototype.renderChildren = function (nonClientArea) {
            if (nonClientArea === void 0) { nonClientArea = false; }
            var contentHtml = '';
            for (var i = 0; i < this.children.length; i++)
                if (nonClientArea == this.children[i].renderInNonClientArea)
                    contentHtml += this.children[i].internalRender();
            return contentHtml;
        };
        View.prototype.isSplitter = function () {
            return false;
        };
        /** Splitter support */
        View.prototype.initSplitter = function () {
            var c = null, prevc = null;
            for (var i = 0; i < this.children.length; i++) {
                prevc = c;
                c = this.children[i];
                if (c.isSplitter()) {
                    c.control = prevc;
                    c.setVertical(c.align.id == Align.left.id || c.align.id == Align.right.id);
                }
            }
        };
        View.prototype.initComponents = function () {
            // Implement in descendants to init internal components 
        };
        /** Global controls counter */
        View.nextViewId = 1;
        return View;
    }(component_2.Component));
    exports.View = View;
    /**
     * Control with a value
     **/
    var ValueView = (function (_super) {
        __extends(ValueView, _super);
        function ValueView() {
            var _this = this;
            _super.apply(this, arguments);
            this.data = new data_1.FieldDataLink(function (eventType, data) {
                _this.setValue((_this.data).value);
            });
        }
        Object.defineProperty(ValueView.prototype, "value", {
            /** Gets/sets controls's value */
            get: function () {
                return this.getValue();
            },
            set: function (_value) {
                this.setValue(_value);
            },
            enumerable: true,
            configurable: true
        });
        ValueView.prototype.getValue = function () {
            if (this.element && this.visible)
                this._value = this.element.value;
            return this._value;
        };
        ValueView.prototype.setValue = function (_value) {
            if (this._value !== _value) {
                this._value = _value;
                if (this.element && this.visible)
                    this.element.value = this._value;
            }
        };
        ValueView.prototype.beforeUpdateView = function () {
            _super.prototype.beforeUpdateView.call(this);
            this.getValue(); // storing control's value            
        };
        ValueView.prototype.afterUpdateView = function () {
            _super.prototype.afterUpdateView.call(this);
            if (this._element && typeof this._value !== 'undefined')
                this._element.value = this._value;
        };
        return ValueView;
    }(View));
    exports.ValueView = ValueView;
});
define("src/application", ["require", "exports", "src/utils", "src/resources"], function (require, exports, utils_3, resources_1) {
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
            utils_3.utils.setLocaleFunc(function (str) {
                var locale = _this.settings['locale'];
                var localeStr;
                if (Application.locales[locale])
                    localeStr = Application.locales[locale][str];
                if (localeStr)
                    return localeStr;
                else {
                    if (_this.settings['debug'])
                        utils_3.utils.log('NOT TRANSLATED: [' + str + ']');
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
            return utils_3.utils.L(str);
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
define("src/transitions", ["require", "exports"], function (require, exports) {
    "use strict";
    /**
     Allows to create a set of transitions that can be grouped and performed together.
     */
    var CSSTransition = (function () {
        function CSSTransition() {
        }
        /**
         * Adds a CSS transition, parameters are :
         *
         * element:     target element for transition
         * duration:    duration for all transitions in seconds
         * properties:  the properties that are transitioned (will be fed to '-webkit-transition-property')
         * from:        optional list of initial property values to match properties passed as .properties
         * to:          list of final property values to match properties passed as .properties
         *
         * The .duration and .properties parameters are optional and can be defined once for
         * all upcoming transitions by over-riding the Transition.DEFAULTS properties
         *
         * Some operations need to be deferred so that the styles are currently set for the from state
         * of from / to operations
         */
        CSSTransition.prototype.add = function (params) {
            var style = params.element.style;
            // set up properties
            var properties = (params.properties) ? params.properties : CSSTransition.DEFAULTS.properties;
            // set up durations
            var duration = ((params.duration) ? params.duration : CSSTransition.DEFAULTS.duration) + 's';
            var durations = [];
            for (var i = 0; i < properties.length; i++) {
                durations.push(duration);
            }
            // from/to animation
            if (params.from) {
                this.addInstantOperation(function () {
                    style.webkitTransitionProperty = 'none';
                    for (var i = 0; i < properties.length; i++) {
                        style.setProperty(properties[i], params.from[i], '');
                    }
                });
                this.addDeferredOperation(function () {
                    style.webkitTransitionProperty = properties.join(', ');
                    style.webkitTransitionDuration = durations.join(', ');
                    for (var i = 0; i < properties.length; i++) {
                        style.setProperty(properties[i], params.to[i], '');
                    }
                });
            }
            else {
                this.addDeferredOperation(function () {
                    style.webkitTransitionProperty = properties.join(', ');
                    style.webkitTransitionDuration = durations.join(', ');
                    for (var i = 0; i < properties.length; i++) {
                        style.setProperty(properties[i], params.to[i], '');
                    }
                });
            }
        };
        /** Called in order to launch the current group of transitions */
        CSSTransition.prototype.apply = function () {
            this.instantOperations();
            setTimeout(this.deferredOperations, 0);
        };
        /** Adds a new operation to the set of instant operations */
        CSSTransition.prototype.addInstantOperation = function (newOperation) {
            var previousInstantOperations = this.instantOperations;
            this.instantOperations = function () {
                if (previousInstantOperations)
                    previousInstantOperations();
                newOperation();
            };
        };
        /** Adds a new operation to the set of deferred operations */
        CSSTransition.prototype.addDeferredOperation = function (new_operation) {
            var previousDeferredOperations = this.deferredOperations;
            this.deferredOperations = function () {
                if (previousDeferredOperations)
                    previousDeferredOperations();
                new_operation();
            };
        };
        /**
         * Core defaults for the transitions, you can update these members so that all
         * calls to .add() from that point on use this duration and set of properties
         */
        CSSTransition.DEFAULTS = {
            duration: 1,
            properties: []
        };
        return CSSTransition;
    }());
    exports.CSSTransition = CSSTransition;
});
define("src/std.controls", ["require", "exports", "src/utils", "src/resources", "src/view", "src/transitions"], function (require, exports, utils_4, resources_2, view_1, transitions_1) {
    "use strict";
    resources_2.resources.register('context-wcl', [
        'css/std.controls.css',
        'images/expand.png'
    ]);
    /**
     * Topmost control containg other controls, used for layouting
     **/
    var ScreenView = (function (_super) {
        __extends(ScreenView, _super);
        function ScreenView(name) {
            _super.call(this, null, name);
            this._visible = false;
            this.renderClientArea = true;
            //this.isController = true; //TODO: used in serizalization, needs refactoring
        }
        return ScreenView;
    }(view_1.View));
    exports.ScreenView = ScreenView;
    /**
     * <div> wrapper
     **/
    var TextView = (function (_super) {
        __extends(TextView, _super);
        function TextView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = false;
        }
        return TextView;
    }(view_1.View));
    exports.TextView = TextView;
    /**
     * <header> wrapper
     * Additional CSS classes: fixed
     */
    var HeaderView = (function (_super) {
        __extends(HeaderView, _super);
        function HeaderView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = false;
            this.tag = 'header';
            this.additionalCSSClass = ' fixed ';
        }
        return HeaderView;
    }(view_1.View));
    exports.HeaderView = HeaderView;
    /**
     * <footer> wrapper
     * Additional CSS classes: fixed
     */
    var FooterView = (function (_super) {
        __extends(FooterView, _super);
        function FooterView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = false;
            this.tag = 'footer';
            this.additionalCSSClass = ' fixed ';
        }
        return FooterView;
    }(view_1.View));
    exports.FooterView = FooterView;
    /**
     * <div> wrapper used for layouting purposes
     **/
    var PanelView = (function (_super) {
        __extends(PanelView, _super);
        function PanelView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = true;
        }
        return PanelView;
    }(view_1.View));
    exports.PanelView = PanelView;
    /**
     * Container with header and border
     * Additional CSS classes: border
     **/
    var GroupBoxView = (function (_super) {
        __extends(GroupBoxView, _super);
        function GroupBoxView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = true;
            this.additionalCSSClass = ' border ';
        }
        Object.defineProperty(GroupBoxView.prototype, "caption", {
            /** Sets/Gets GroupBox header */
            get: function () {
                return this.text;
            },
            set: function (value) {
                this.text = value;
            },
            enumerable: true,
            configurable: true
        });
        GroupBoxView.prototype.render = function () {
            var html = this.renderChildren();
            if (this.renderClientArea) {
                html = view_1.View.getTag('div', this.getClientAreaTagAttr(), html);
                // render non-client area: text before and children after
                html = (this._text ? view_1.View.getTag('div', 'class=header', this.renderSelf()) : this.renderSelf())
                    + html + this.renderChildren(true);
            }
            return view_1.View.getTag(this.tag, this.internalGetTagAttr(), html);
        };
        return GroupBoxView;
    }(view_1.View));
    exports.GroupBoxView = GroupBoxView;
    (function (ButtonType) {
        ButtonType[ButtonType["default"] = 0] = "default";
        ButtonType[ButtonType["primary"] = 1] = "primary";
        ButtonType[ButtonType["success"] = 2] = "success";
        ButtonType[ButtonType["info"] = 3] = "info";
        ButtonType[ButtonType["warning"] = 4] = "warning";
        ButtonType[ButtonType["danger"] = 5] = "danger";
        //TODO: does these types needed?
        ButtonType[ButtonType["chevronLeft"] = 6] = "chevronLeft";
        ButtonType[ButtonType["chevronRight"] = 7] = "chevronRight";
        ButtonType[ButtonType["toggle"] = 8] = "toggle";
    })(exports.ButtonType || (exports.ButtonType = {}));
    var ButtonType = exports.ButtonType;
    /**
     * <button> wrapper
     */
    var ButtonView = (function (_super) {
        __extends(ButtonView, _super);
        function ButtonView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = true;
            this.tag = 'button';
        }
        Object.defineProperty(ButtonView.prototype, "buttonType", {
            get: function () {
                return this._buttonType;
            },
            set: function (buttonType) {
                this._buttonType = buttonType;
                if (this._element)
                    this.updateView();
            },
            enumerable: true,
            configurable: true
        });
        ButtonView.prototype.getTagAttr = function () {
            var c = _super.prototype.getTagAttr.call(this);
            if (this.buttonType)
                c += ' type="' + ButtonType[this.buttonType] + '"';
            return c;
        };
        ButtonView.prototype.renderSelf = function () {
            if (this.buttonType == ButtonType.toggle)
                return '<span class="ctx_icon-bar"></span><span class="ctx_icon-bar"></span><span class="ctx_icon-bar"></span>';
            else
                return this.renderIcon() + this.text;
        };
        return ButtonView;
    }(view_1.View));
    exports.ButtonView = ButtonView;
    /**
     * <form> wrapper
     **/
    var FormView = (function (_super) {
        __extends(FormView, _super);
        function FormView(parent, name) {
            _super.call(this, parent, name);
            this.tag = 'form';
            this.renderClientArea = false;
        }
        return FormView;
    }(view_1.View));
    exports.FormView = FormView;
    /**
     * <input> wrapper
     **/
    var InputView = (function (_super) {
        __extends(InputView, _super);
        function InputView(parent, name) {
            _super.call(this, parent, name);
            /** Indicates will keypress fire onChange or not, default true */
            this.keyPressFireOnChange = true;
            this.changingDelay = 200;
            this.tag = 'input';
            this.renderClientArea = false;
        }
        InputView.prototype.beforeUpdateView = function () {
            _super.prototype.beforeUpdateView.call(this);
            this.getValue(); // storing control's value            
        };
        InputView.prototype.afterUpdateView = function () {
            _super.prototype.afterUpdateView.call(this);
            this.handleEvent('onchange', this.handleChange);
            this.handleEvent('onkeydown', this.handleKeyDown);
        };
        InputView.prototype.handleKeyDown = function (event) {
            var _this = this;
            if (this.keyPressTimeoutInstance)
                clearTimeout(this.keyPressTimeoutInstance);
            if (this.keyPressFireOnChange)
                this.keyPressTimeoutInstance = setTimeout(function () {
                    if (_this.element && _this.visible && _this._value !== _this.element.value) {
                        _this.handleChange();
                    }
                }, this.changingDelay);
        };
        InputView.prototype.handleChange = function () {
            // retrieve value from element
            this.getValue();
            // update data link
            this.data.value = this._value;
            // invoke event if assigned
            if (typeof this.onChange === 'function')
                this.onChange();
        };
        return InputView;
    }(view_1.ValueView));
    exports.InputView = InputView;
    /**
     * <texarea> wrapper
     */
    var TextAreaView = (function (_super) {
        __extends(TextAreaView, _super);
        function TextAreaView(parent, name) {
            _super.call(this, parent, name);
            this.tag = 'textarea';
            this.renderClientArea = false;
        }
        TextAreaView.prototype.getValue = function () {
            var r = _super.prototype.getValue.call(this) || '';
            r = r.replace(/\n/g, '\r\n');
            return r;
        };
        TextAreaView.prototype.render = function () {
            var t = this.value || '';
            t = utils_4.utils.escapeHTML(t);
            t = t.replace(/\r/g, '');
            return "<textarea " + this.internalGetTagAttr() + " >" + t + "</textarea>";
        };
        return TextAreaView;
    }(InputView));
    exports.TextAreaView = TextAreaView;
    /**
     * Container that allows to display one of several views (as pages) and
     * switch between them using transitions and transformations.
     */
    var ContainerView = (function (_super) {
        __extends(ContainerView, _super);
        function ContainerView(parent, name) {
            _super.call(this, parent, name);
            this.currentView = null;
            this.animation = ContainerView.slideHorizontal;
        }
        ContainerView.cssSlideHorizontal = function (direction) {
            return (direction === 0) ? ['1', 'translate3d(0,0,0)'] : ['0', 'translate3d(' + (direction * 100) + '%,0,0)'];
        };
        ContainerView.cssSlideVertical = function (direction) {
            return (direction === 0) ? ['1', 'translate3d(0,0,0)'] : ['0', 'translate3d(0, ' + (direction * 100) + '%,0)'];
        };
        ContainerView.cssRotateX = function (direction) {
            return (direction === 0) ? ['1', 'rotateX(0deg)'] : ['0', 'rotateX(' + (direction * 180) + 'deg)'];
        };
        ContainerView.cssRotateY = function (direction) {
            return (direction === 0) ? ['1', 'rotateY(0deg)'] : ['0', 'rotateY(' + (direction * 180) + 'deg)'];
        };
        ContainerView.cssFadeInOut = function (direction) {
            return (direction === 0) ? ['1'] : ['0'];
        };
        ContainerView.prototype.updateView = function (view, direction) {
            if (!view)
                return;
            // restore opacity - MB: this should not be necessary, let's leave off for now
            /*
             if (view.element)
             view.element.opacity = 1;
             */
            if (view === this.currentView) {
                view.setElementAttribute("currentPage", "true");
                if (typeof this.afterShowView === "function")
                    this.afterShowView(view, direction);
            }
            else {
                view.setElementAttribute("currentPage", "false");
                // Hide object. It will be updated when we show it next time anyway.
                view.setVisible(false);
                if (typeof this.afterHideView === "function")
                    this.afterHideView(view, direction);
            }
        };
        ;
        ContainerView.prototype.internalInsertChild = function (child) {
            // append child div to self
            if (this._element && this.visible) {
                child._element = null;
                var childElement = document.createElement('div');
                // append child to client area
                this._element.children[0].appendChild(childElement);
                childElement.outerHTML = child.internalRender();
                child._element = childElement;
                child.afterUpdateView();
            }
            else
                this.updateView();
        };
        ;
        ContainerView.prototype.showView = function (nextView, direction) {
            if (this.currentView && nextView && this.currentView === nextView)
                return;
            // Invoke before show and before hide view events
            // Do not proceed if they return false
            if (typeof this.beforeHideView === "function" && this.currentView) {
                if (this.beforeHideView(this.currentView, direction) === false)
                    return;
            }
            if (typeof this.beforeShowView === "function" && nextView) {
                if (this.beforeShowView(nextView, direction) === false)
                    return;
            }
            var _this = this;
            var cur = this.currentView;
            this.currentView = nextView;
            direction = direction || ContainerView.directionForward;
            // update next view, make sure it's out child and is visible
            if (nextView) {
                if (nextView.parent !== _this || !nextView.visible || !nextView.element)
                    nextView.update(function () {
                        // make sure this view is our child
                        nextView.setParent(_this);
                        // this will ensure that we element rendered
                        nextView.setVisible(true);
                    });
                // if we are moving forward remember prior view, so we know where to return by Back button
                if (direction === ContainerView.directionForward)
                    this.priorView = cur;
            }
            // if I'm not rendered or we don't need animation then just assign it and that's it
            if (!this.element || !this.visible || !this.animation || !this.element.style.hasOwnProperty('webkitTransform')) {
                this.updateView(cur, direction);
                this.updateView(nextView, direction);
                return;
            }
            // otherwise we need to bring it into view with animation
            var transitions = new transitions_1.CSSTransition();
            // add transition effect for the current view
            if (cur) {
                transitions.add({
                    element: cur.element,
                    properties: this.animation.properties,
                    from: this.animation.transition(0),
                    to: this.animation.transition(-direction),
                    duration: this.animation.duration
                });
            }
            // add transition effect for the next view
            if (nextView) {
                //nextView.element.opacity = 0; // now it's transparent
                nextView.element.style.opacity = '0';
                nextView.setElementAttribute("currentPage", "true"); // but is actually visible
                transitions.add({
                    element: nextView.element,
                    properties: (this.animation.propertiesTo) ? this.animation.propertiesTo : this.animation.properties,
                    from: (this.animation.transitionTo) ? this.animation.transitionTo(direction) : this.animation.transition(direction),
                    to: (this.animation.transitionTo) ? this.animation.transitionTo(0) : this.animation.transition(0),
                    duration: (this.animation.durationTo) ? this.animation.durationTo : this.animation.duration
                });
            }
            // perform animated transition
            var animateDurationTo = (this.animation.durationTo) ? this.animation.durationTo : this.animation.duration;
            setTimeout(function () {
                _this.updateView(cur, direction);
                _this.updateView(nextView, direction);
            }, animateDurationTo * 1000);
            transitions.apply();
        };
        ;
        ContainerView.prototype.back = function () {
            if (this.currentView)
                this.showView(this.priorView, ContainerView.directionBack);
        };
        ContainerView.directionForward = 1;
        ContainerView.directionBack = -1;
        ContainerView.slideHorizontal = {
            transition: ContainerView.cssSlideHorizontal,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
        ContainerView.slideVertical = {
            transition: ContainerView.cssSlideVertical,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
        ContainerView.fadeInOut = {
            transition: ContainerView.cssFadeInOut,
            properties: ['opacity'],
            duration: 0.5
        };
        ContainerView.rotateY = {
            transition: ContainerView.cssRotateY,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
        ContainerView.rotateX = {
            transition: ContainerView.cssRotateX,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
        return ContainerView;
    }(view_1.View));
    exports.ContainerView = ContainerView;
    /**
     * Splitter Control
     */
    var Splitter = (function (_super) {
        __extends(Splitter, _super);
        function Splitter(parent, name) {
            _super.call(this, parent, name);
            this.moving = false;
            this.renderClientArea = false;
            this.setVertical(false);
        }
        Splitter.prototype.setVisible = function (value) {
            if (this._visible === value)
                return;
            this._visible = value;
            if (!value) {
                this.lastWidth = undefined;
                this.lastHeight = undefined;
                if (this.vertical)
                    this.lastWidth = parseInt(this.control.element.style['width']);
                else
                    this.lastHeight = parseInt(this.control.element.style['height']);
                this.setControlSize(0);
            }
            else {
                this.setControlSize(this.vertical ? this.lastWidth : this.lastHeight);
            }
        };
        Splitter.prototype.isSplitter = function () {
            return true;
        };
        Splitter.prototype.setVertical = function (vertical) {
            this.vertical = vertical;
            this.attributes.vertical = vertical;
            if (this.element)
                this.element.setAttribute('vertical', vertical);
        };
        Splitter.prototype.handleMouseDown = function (event) {
            if (event.button && event.button > 1)
                return;
            this.moving = true;
            if (this.vertical)
                document.body.style.cursor = 'ew-resize';
            else
                document.body.style.cursor = 'ns-resize';
        };
        Splitter.prototype.handleMouseUp = function (event) {
            this.moving = false;
            document.body.style.cursor = 'auto';
        };
        Splitter.prototype.handleMouseMove = function (event) {
            if (!this.moving || !this.control || !this.control.element)
                return;
            var el = this.control.element;
            var prect = this.parent.element.getBoundingClientRect();
            if (this.vertical) {
                if (this.align == view_1.Align.right)
                    el.style['width'] = this.parent.element.offsetWidth + prect['left'] - event.clientX + 'px';
                else
                    el.style['width'] = event.clientX - prect['left'] + 'px';
                this.lastWidth = event.clientX;
            }
            else {
                if (this.align == view_1.Align.bottom)
                    el.style['height'] = this.parent.element.offsetHeight + prect['top'] - event.clientY + 'px';
                else
                    el.style['height'] = event.clientY - prect['top'] + 'px';
                this.lastHeight = parseInt(el.style['height']);
            }
            this.parent.realignChildren();
            if (event)
                event.preventDefault();
        };
        Splitter.prototype.afterUpdateView = function () {
            this.internalAfterUpdateView();
            if (this.element && this.visible) {
                this.handleEvent('onmousedown', this.handleMouseDown);
                this.handleEvent('ontouchstart', this.handleMouseDown);
                //TODO: make sure that "this" in the handlers is correct
                utils_4.utils.addEvent(document, 'mouseup', this.handleMouseUp);
                utils_4.utils.addEvent(document, 'touchend', this.handleMouseUp);
                utils_4.utils.addEvent(document, 'mousemove', this.handleMouseMove);
            }
            this.internalTriggerReady();
        };
        Splitter.prototype.setControlSize = function (size) {
            size += '';
            if (size.indexOf('px') < 0)
                size += 'px';
            var el = this.control.element;
            if (this.vertical)
                el.style['width'] = size;
            else
                el.style['height'] = size;
            this.parent.realignChildren();
        };
        return Splitter;
    }(view_1.View));
    exports.Splitter = Splitter;
});
define("src/list.controls", ["require", "exports", "src/utils", "src/resources", "src/view", "src/std.controls"], function (require, exports, utils_5, resources_3, view_2, std_controls_1) {
    "use strict";
    resources_3.resources.register('context-wcl', [
        'css/list.controls.css'
    ]);
    /**
     * Parent for list-like controls
     * TODO: when Array.isArray(items) Array.prototype extensions from utils.ts used, needs more convient data binding
     **/
    var Items = (function (_super) {
        __extends(Items, _super);
        function Items() {
            _super.apply(this, arguments);
            /** Items List
             * e.g.
             * list.items = ['item 1', 'item 2', 'item 3'];
             */
            this.items = [];
        }
        Object.defineProperty(Items.prototype, "selectedIndex", {
            //protected filteredItems: any[];
            get: function () {
                return this.getSelectedIndex();
            },
            set: function (index) {
                this.setSelectedIndex(index);
            },
            enumerable: true,
            configurable: true
        });
        Items.prototype.getSelectedIndex = function () {
            return this._selectedIndex;
        };
        Items.prototype.setSelectedIndex = function (index) {
            index = parseInt(index);
            if (this._selectedIndex !== index) {
                this.updateSelectedIndex(index);
                // invoke on selection change event
                if (this.onSelectionChange)
                    this.onSelectionChange(index);
            }
        };
        Items.prototype.indexOfItem = function (itemValue, startWith) {
            if (startWith === void 0) { startWith = 0; }
            if (this.items)
                for (var i = startWith; i < this.items.getRowCount(); i++)
                    if (this.getItemValue(this.items.getRow(i)) === itemValue)
                        return i;
            return -1;
        };
        ;
        Items.prototype.getItemValue = function (anItem) {
            if (anItem === 'undefined' || typeof anItem === "string")
                return anItem;
            else if (typeof anItem === "object") {
                if (anItem.value !== undefined)
                    return anItem.value;
                if (anItem.text !== undefined)
                    return anItem.text;
            }
            return anItem.toString();
        };
        ;
        Object.defineProperty(Items.prototype, "value", {
            /** Selected option by value */
            get: function () {
                return this.getValue();
            },
            set: function (value) {
                this.setValue(value);
            },
            enumerable: true,
            configurable: true
        });
        Items.prototype.getValue = function () {
            this.updateItems();
            return this.getItemValue(this.items.getRow(this.selectedIndex));
        };
        /** Sets selected option by value */
        Items.prototype.setValue = function (value) {
            this.updateItems();
            var idx = this.indexOfItem(value);
            this.setSelectedIndex(idx);
            return value;
        };
        /** Returns value of selected option */
        Items.prototype.getSelectedItem = function (option) {
            this.updateItems();
            var item = this.items.getRow(this.getSelectedIndex());
            if (option)
                return item[option];
            else
                return item;
        };
        Items.prototype.updateItems = function (forceUpdate) {
            if (forceUpdate === void 0) { forceUpdate = false; }
            if (this.onGetItems && (forceUpdate || this.items.length === 0)) {
                var _newItems_1 = [];
                //TODO: data binding
                /*if (this.dataLinks.items)
                    _newItems = this.dataLinks.items.getValue();
                else*/
                if (this.onGetItems)
                    this.onGetItems(function (item) {
                        _newItems_1.push(item);
                    });
                //if (this.sort && _newItems.sort)
                //    _newItems.sort(this.sort);
                this.items = _newItems_1;
            }
        };
        Items.prototype.updateSelectedIndex = function (newIndex) {
            // implement in descendants to update selection
            this._selectedIndex = newIndex;
        };
        Items.prototype.beforeRender = function () {
            if (this.onGetItems)
                this.items = null;
        };
        return Items;
    }(view_2.View));
    exports.Items = Items;
    /**
     * <select> wrapper
     **/
    var SelectView = (function (_super) {
        __extends(SelectView, _super);
        function SelectView(parent, name) {
            _super.call(this, parent, name);
            this.internalRenderItems = function () {
                var html = '';
                this.updateItems();
                var selIdx = this.getSelectedIndex();
                for (var i = 0; i < this.items.getRowCount(); i++) {
                    var comboItem = this.items.getRow(i);
                    var attr = '';
                    if (selIdx === i)
                        attr += 'selected ';
                    if (typeof comboItem === "string")
                        html += '<option ' + attr + ' >' + utils_5.utils.escapeHTML(comboItem) + '</option>';
                    else {
                        for (var a in comboItem)
                            if (comboItem.hasOwnProperty(a))
                                if (a !== 'text' && a !== 'selected')
                                    attr += a + '="' + utils_5.utils.escapeQuotes(comboItem[a]) + '" ';
                        html += '<option ' + attr + '>' + comboItem.text.escapeHTML() + '</option>';
                    }
                }
                return html;
            };
            this.handleChange = function () {
                /*if (this.dataSources.selectedItem)
                    this.dataSources.selectedItem.notifyDataLinks();*/
                if (this.element && this.visible)
                    this.setSelectedIndex(this.element.selectedIndex);
            };
            this.tag = 'select';
            this.renderClientArea = false;
        }
        SelectView.prototype.getSelectedIndex = function () {
            if (this.element && this.visible)
                return this._selectedIndex = this.element.selectedIndex;
            else
                return this._selectedIndex;
        };
        SelectView.prototype.render = function () {
            return this.renderTag(this.internalRenderItems());
        };
        SelectView.prototype.updateSelectedIndex = function (newIndex) {
            _super.prototype.updateSelectedIndex.call(this, newIndex);
            if (this.element && this.visible)
                this.element.selectedIndex = this._selectedIndex;
        };
        SelectView.prototype.afterUpdateView = function () {
            _super.prototype.afterUpdateView.call(this);
            this.handleEvent('onchange', this.handleChange);
        };
        return SelectView;
    }(Items));
    exports.SelectView = SelectView;
    /**
     * Displays list
     **/
    var ListView = (function (_super) {
        __extends(ListView, _super);
        function ListView() {
            _super.apply(this, arguments);
            /** Appends all items properties as element attributes */
            this.appendPropertiesToAttributes = false;
            this.activeIndex = -1;
            this.renderedRowCount = 0;
            this.filteredItems = [];
            /** Is it needed to index children  */
            this.needsItemsIndex = true;
            this.updateActiveIndex = function (newIndex) {
                var obj = {
                    selectedElement: this.activeElement,
                    selectedIndex: this.activeIndex,
                    status: 'active'
                };
                this.updateActiveOrSelectedIndex(newIndex, obj);
                this.activeElement = obj.selectedElement;
                this.activeIndex = obj.selectedIndex;
                return true;
            };
            this.getItemHtml = function (item, index, attr, text) {
                var r = view_2.View.getTag('div', attr, text) + '\n';
                return r;
            };
        }
        ListView.prototype.getValue = function () {
            // public get value of selected option 
            this.updateItems();
            var idx = 0;
            for (var i = 0; i < this.items.getRowCount(); i++) {
                if (this.filteredItems.indexOf(i) >= 0)
                    continue;
                if (idx === this.getSelectedIndex())
                    return this.getItemValue(this.items.getRow(i));
                idx++;
            }
        };
        ListView.prototype.render = function () {
            return this.renderTag(this.internalRenderItems());
        };
        ListView.prototype.setElementSelected = function (element, selected, addClassName) {
            addClassName = addClassName || 'selected';
            element.className = this.getSelectedCSSClass(element.className, addClassName, selected);
        };
        ListView.prototype.afterUpdateView = function () {
            _super.prototype.afterUpdateView.call(this);
            if (this.element && this.visible) {
                this.indexItems();
                //this.handleEvent('onclick', this.handleClick);
                this.handleEvent('onkeydown', this.handleKeyDown);
                this.handleEvent('onmousedown', this.handleMouseDown);
                this.handleEvent('ontouchstart', this.handleMouseDown);
                this.handleEvent('onmouseup', this.handleMouseUp);
                this.handleEvent('ontouchend', this.handleMouseUp);
            }
            //this.internalTriggerReady();
        };
        ListView.prototype.indexItems = function () {
            if (!this.needsItemsIndex)
                return;
            var children;
            if (this.elementToIndex)
                children = this.elementToIndex.children;
            else
                children = this.element.children;
            for (var i = 0; i < children.length; i++)
                children[i].setAttribute('index', i);
            this.renderedRowCount = children.length;
            if (this.renderedRowCount === 0)
                this._selectedIndex = -1;
            this.updateSelectedIndex(this.selectedIndex);
        };
        ListView.prototype.getActiveElement = function (event) {
            // active element is the one being currently touched
            var listElement = event.toElement || event.target;
            if (!listElement)
                return null;
            var idx = listElement.getAttribute('index');
            while (listElement && !idx) {
                listElement = listElement.parentElement;
                if (!listElement)
                    continue;
                idx = listElement.getAttribute('index');
            }
            if (!idx)
                return null;
            return listElement;
        };
        ListView.prototype.handleKeyDown = function (event) {
            if (event.eventPhase !== 3)
                return;
            var keyCode = ('which' in event) ? event.which : event.keyCode;
            switch (parseInt(keyCode)) {
                case 38:
                    if (this.activeIndex > 0)
                        this.updateActiveIndex(this.activeIndex - 1);
                    break;
                case 40:
                    if (this.activeIndex < this.renderedRowCount - 1) {
                        if (this.activeIndex < 0)
                            this.updateActiveIndex(0);
                        else
                            this.updateActiveIndex(this.activeIndex + 1);
                    }
                    break;
            }
        };
        ListView.prototype.handleClick = function (event) {
            var listElement = this.getActiveElement(event);
            if (!listElement)
                return;
            var idx = listElement.getAttribute('index');
            this.setSelectedIndex(idx);
            this.setFocus();
        };
        ListView.prototype.handleMouseDown = function (event) {
            if (event instanceof MouseEvent && event.button > 0)
                return;
            var listElement = this.getActiveElement(event);
            if (this.lastClickedElement)
                this.setElementSelected(this.lastClickedElement, false, 'touched');
            if (!listElement)
                return;
            this.lastClickedElement = listElement;
            this.setElementSelected(this.lastClickedElement, true, 'touched');
            this.handleClick(event);
        };
        ListView.prototype.handleMouseUp = function (event) {
            if (event instanceof MouseEvent && event.button > 0)
                return;
            if (this.lastClickedElement)
                this.setElementSelected(this.lastClickedElement, false, 'touched');
            this.lastClickedElement = null;
            //this.handleClick(event);
        };
        ListView.prototype.updateActiveOrSelectedIndex = function (newIndex, obj) {
            // unselect current element
            if (obj.selectedElement)
                this.setElementSelected(obj.selectedElement, false, obj.status);
            obj.selectedElement = null;
            obj.selectedIndex = newIndex;
            if (this.element && this.visible && obj.selectedIndex >= 0) {
                var recurseChildren_1 = function (el) {
                    var idx, e;
                    for (var i = 0; i < el.children.length; i++) {
                        idx = el.children[i].getAttribute('index');
                        //log(el.children[i].getAttribute('class') + ': ' + idx);
                        if (idx == obj.selectedIndex)
                            return el.children[i];
                        else if (el.children[i].children !== 'undefined') {
                            e = recurseChildren_1(el.children[i]);
                            if (e !== null)
                                return e;
                        }
                    }
                    return null;
                };
                obj.selectedElement = recurseChildren_1(this.element);
                if (obj.selectedElement)
                    this.setElementSelected(obj.selectedElement, true, obj.status);
            }
        };
        ListView.prototype.updateSelectedIndex = function (newIndex) {
            var obj = {
                selectedElement: this.selectedElement,
                selectedIndex: this.selectedIndex,
                status: 'selected'
            };
            this.updateActiveOrSelectedIndex(newIndex, obj);
            this.selectedElement = obj.selectedElement;
            this._selectedIndex = obj.selectedIndex;
            this.updateActiveIndex(this.selectedIndex);
        };
        ListView.prototype.internalRenderItems = function () {
            this.updateItems();
            var cnt = 0;
            var html = '';
            var itemsToRender = this.items.getRowCount();
            if (this.maxItemsToRender && this.maxItemsToRender < itemsToRender)
                itemsToRender = this.maxItemsToRender;
            for (var i = 0; i < this.items.getRowCount() && cnt < itemsToRender; i++) {
                if (this.filteredItems.indexOf(i) >= 0)
                    continue;
                cnt++;
                var attr = '';
                if (this._selectedIndex === i)
                    attr += 'class="active" ';
                var item = this.items.getRow(i);
                if (typeof item === "string")
                    html += this.getItemHtml(item, i, attr, item);
                else {
                    if (this.appendPropertiesToAttributes)
                        for (var a in item)
                            if (item.hasOwnProperty(a))
                                if (a !== 'text' && a !== 'selected' && typeof item[a] !== 'function' && typeof item[a] !== 'object')
                                    attr += a + '="' + item[a] + '" ';
                    var text = void 0;
                    if (typeof this.onGetItemText === 'function')
                        text = this.onGetItemText(item);
                    else
                        text = item.text;
                    if (!utils_5.utils.isDefined(text))
                        text = item.value;
                    html += this.getItemHtml(item, i, attr, text);
                }
            }
            return html;
        };
        ListView.prototype.getSelectedCSSClass = function (classNames, className, selected) {
            var hasClassActive = false;
            if (classNames)
                hasClassActive = utils_5.utils.indexOfWord(classNames, className) >= 0;
            if (selected) {
                if (!hasClassActive)
                    classNames = classNames + ' ' + className;
            }
            else if (hasClassActive)
                classNames = classNames.replace(' ' + className, '');
            return classNames;
        };
        return ListView;
    }(Items));
    exports.ListView = ListView;
    /**
     * Lookup control
     */
    var LookupView = (function (_super) {
        __extends(LookupView, _super);
        function LookupView(parent, name) {
            _super.call(this, parent, name);
            /** Lookup at value beginning or anywhere, default true */
            this.partialLookup = true;
            /** Case-sensitive lookup or not, default false */
            this.caseSensitive = false;
            /** Max items count that will be shown in the lookup list */
            this.maxItemsToRender = 100;
            this.listVisible = false;
            this.updatingValue = false;
            this.maxItemsToRender = 100;
            //this.childToIndex = 1;
            this.input = new std_controls_1.InputView(this, 'ctxInternalInput');
            this.input.onChange = this.onInputChange;
            this.input.events.onblur = this.onInputBlur;
            this.input.events.onkeypress = this.onInputKeyPress;
            this.inputBtn = new std_controls_1.ButtonView(this, 'ctxInternalInputButton');
            this.inputBtn.text = '<span class="ctx_icon-caret"</span>';
            this.inputBtn.doNotEscapeHtml = true;
            this.inputBtn.events.onclick = this.onInputBtnClick;
        }
        LookupView.prototype.render = function () {
            this.listId = 'ctxLookupView' + LookupView.listIdCounter++;
            return this.renderTag('<div class="ctxInputBlock">' + this.input.internalRender() +
                '<div class="ctxInputBtnGroup">' + this.inputBtn.internalRender() + '</div></div>' +
                view_2.View.getTag('div', 'class="ctxInnerList" id="' + this.listId + '"', this.internalRenderItems()));
        };
        LookupView.prototype.setSelectedIndex = function (index) {
            _super.prototype.setSelectedIndex.call(this, index);
            if (this.selectedIndex < 0)
                return;
            this.updatingValue = true;
            this.input.value = this.getValue();
            this.showDropdown(false);
            this.updatingValue = false;
        };
        LookupView.prototype.setValue = function (value) {
            _super.prototype.setValue.call(this, value);
            this.input.value = value;
        };
        LookupView.prototype.getValue = function () {
            return _super.prototype.getValue.call(this) || this.input.value;
        };
        LookupView.prototype.afterUpdateView = function () {
            this.elementToIndex = document.getElementById(this.listId);
            _super.prototype.afterUpdateView.call(this);
        };
        LookupView.prototype.handleKeyDown = function (event) {
            _super.prototype.handleKeyDown.call(this, event);
            if (event.eventPhase != 3)
                return;
            var keyCode = ('which' in event) ? event.which : event.keyCode;
            if (parseInt(keyCode) == 13 && this.activeIndex >= 0)
                this.setSelectedIndex(this.activeIndex);
        };
        ;
        LookupView.prototype.onInputChange = function () {
            this.parent.doInputChange(false);
        };
        LookupView.prototype.doInputChange = function (forceShow) {
            if (this.updatingValue || !this.enabled)
                return;
            var item, value, pos;
            this.filteredItems = [];
            if (!forceShow) {
                var inputVal = this.input.value;
                if (!this.caseSensitive)
                    inputVal = inputVal.toLowerCase();
                for (var i = 0; i < this.items.getRowCount(); i++) {
                    item = this.items.getRow(i);
                    if (typeof item === "string")
                        value = item;
                    else if (utils_5.utils.isDefined(item.value))
                        value = item.value;
                    else if (utils_5.utils.isDefined(item.text))
                        value = item.text;
                    else
                        value = '';
                    //TODO: data binding
                    // else
                    // {
                    //     if (this.dataLinks.itemText)
                    //         value = L(_this.dataLinks.itemText.getValue());
                    //     else
                    //         value = item.text;
                    // }
                    if (!this.caseSensitive)
                        value = value.toLowerCase();
                    pos = value.indexOf(inputVal);
                    if ((this.partialLookup && pos < 0) || (this.partialLookup && pos != 0))
                        this.filteredItems.push(i);
                }
            }
            var el = document.getElementById(this.listId);
            el.innerHTML = this.internalRenderItems();
            this.indexItems();
            this.showDropdown(el.innerHTML.length > 0);
        };
        LookupView.prototype.onInputBlur = function (event) {
            var lookup = this.parent;
            if (event.relatedTarget && event.relatedTarget.className.indexOf('ctxInternalInputButton') >= 0)
                return;
            lookup.showDropdown(false);
        };
        LookupView.prototype.onInputKeyPress = function (event) {
            var lookup = this.parent;
            if (!lookup.enabled) {
                event.preventDefault();
                return;
            }
            lookup.handleKeyDown(event);
            var keyCode = ('which' in event) ? event.which : event.keyCode;
            if (parseInt(keyCode) == 38 || parseInt(keyCode) == 40)
                event.preventDefault();
        };
        LookupView.prototype.onInputBtnClick = function (event) {
            var lookup = this.parent;
            if (!lookup.enabled)
                return;
            if (!lookup.listVisible)
                lookup.doInputChange(true);
            else
                lookup.showDropdown(false);
            lookup.input.setFocus();
        };
        LookupView.prototype.showDropdown = function (show) {
            var el = document.getElementById(this.listId);
            if (show)
                el.style.visibility = 'visible';
            else
                el.style.visibility = 'hidden';
            this.listVisible = show;
            this.updateActiveIndex(-1);
            this.setSelectedIndex(-1);
        };
        LookupView.listIdCounter = 1;
        return LookupView;
    }(ListView));
    exports.LookupView = LookupView;
    /**
     *  Date select control
     */
    var DatePicker = (function (_super) {
        __extends(DatePicker, _super);
        function DatePicker(parent, name) {
            _super.call(this, parent, name);
            /** First day of week, 0 - sunday, 1 - monday, default 0 */
            this.firstDayOfWeek = 0;
            /** Date format (as in utils.formatDate function), default locale dependent */
            this.dateFormat = '';
            /** Highlight or not weekends, default true */
            this.highlightWeekends = true;
            this.monthToShow = new Date;
            this.showPrevNextMonthDays = true;
            this.needsItemsIndex = false;
            // edit control
            this.input = new std_controls_1.InputView(this, 'ctxInternalInput');
            this.input.attributes.readonly = true;
            this.input.events.onblur = this.onInputBlur;
            this.input.events.onkeypress = this.onInputKeyPress;
            // show calendar buttom
            this.inputBtn = new std_controls_1.ButtonView(this, 'ctxInternalInputButton');
            this.inputBtn.text = '<span class="ctx_icon-caret"</span>';
            this.inputBtn.doNotEscapeHtml = true;
            this.inputBtn.events.onclick = this.onInputBtnClick;
            // prev month button
            this.prevMonthBtn = new std_controls_1.ButtonView(this, 'ctxPrevMonthBtn');
            this.prevMonthBtn.attributes.type = 'chevronLeft';
            this.prevMonthBtn.events.onclick = this.onPrevMonthBtnClick;
            // next month button
            this.nextMonthBtn = new std_controls_1.ButtonView(this, 'ctxNextMonthBtn');
            this.nextMonthBtn.attributes.type = 'chevronRight';
            this.nextMonthBtn.events.onclick = this.onNextMonthBtnClick;
        }
        Object.defineProperty(DatePicker.prototype, "showPrevNextMonthDays", {
            /** Show or not prev and next month days, default true */
            get: function () {
                return this.attributes.showPrevNextMonthDay;
            },
            set: function (value) {
                if (this.attributes.showPrevNextMonthDay && this.attributes.showPrevNextMonthDay === value)
                    return;
                this.attributes.showPrevNextMonthDay = value;
                if (this.element && this.visible)
                    this.updateView();
            },
            enumerable: true,
            configurable: true
        });
        DatePicker.prototype.getValue = function () {
            return this.selectedDate;
        };
        DatePicker.prototype.setValue = function (value) {
            this.selectedDate = value;
            if (value)
                this.input.setValue(utils_5.utils.formatDate(this.selectedDate, this.dateFormat));
            else
                this.input.setValue(value);
            this.updateCalendar(false);
        };
        DatePicker.prototype.setSelectedIndex = function (index) {
            //super.setSelectedIndex(index);
            index = parseInt(index);
            if (this._selectedIndex !== index) {
                this.updateSelectedIndex(index);
                // invoke on selection change event
                if (this.onSelectionChange)
                    this.onSelectionChange(index);
            }
            if (this.selectedIndex < 0)
                return;
            this.updatingValue = true;
            if (this.selectedElement)
                this.setValue(new Date(this.selectedElement.getAttribute('value')));
            else
                this.setValue(null);
            this.showDropdown(false);
            this.updatingValue = false;
        };
        DatePicker.prototype.onInputBlur = function (event) {
            if (event.relatedTarget && (event.relatedTarget.className.indexOf('internalInputButton') >= 0
                || event.relatedTarget.className.indexOf('ctxPrevMonthBtn') >= 0
                || event.relatedTarget.className.indexOf('ctxNextMonthBtn') >= 0))
                return;
            this.parent.showDropdown(false);
        };
        DatePicker.prototype.onInputKeyPress = function (event) {
            this.handleKeyDown(event);
            var keyCode = ('which' in event) ? event.which : event.keyCode;
            if (parseInt(keyCode) == 38 || parseInt(keyCode) == 40)
                event.preventDefault();
        };
        DatePicker.prototype.onInputBtnClick = function (event) {
            var picker = this.parent;
            if (!picker.listVisible)
                picker.showDropdown(true);
            else
                picker.showDropdown(false);
            picker.input.setFocus();
        };
        DatePicker.prototype.onPrevMonthBtnClick = function (event) {
            var picker = this.parent;
            picker.monthToShow.setMonth(picker.monthToShow.getMonth() - 1);
            picker.updateCalendar(true);
        };
        DatePicker.prototype.onNextMonthBtnClick = function (event) {
            var picker = this.parent;
            picker.monthToShow.setMonth(picker.monthToShow.getMonth() + 1);
            picker.updateCalendar(true);
        };
        DatePicker.prototype.updateCalendar = function (dontGoToSelectedDate) {
            if (!this.listId)
                return;
            var el = document.getElementById(this.listId);
            el.innerHTML = this.doInternalRenderItems(dontGoToSelectedDate);
            this.prevMonthBtn.updateView();
            this.nextMonthBtn.updateView();
            this.input.setFocus();
        };
        DatePicker.prototype.weekday = function (dayOfWeek) {
            if (this.firstDayOfWeek == 0)
                return dayOfWeek == 0 || dayOfWeek == 6 ? ' weekend' : '';
            else
                return dayOfWeek == 5 || dayOfWeek == 6 ? ' weekend' : '';
        };
        DatePicker.prototype.internalRenderItems = function () {
            return this.doInternalRenderItems();
        };
        DatePicker.prototype.doInternalRenderItems = function (dontGoToSelectedDate) {
            if (dontGoToSelectedDate === void 0) { dontGoToSelectedDate = false; }
            this.updateItems();
            var html = '', i, j, d;
            var monthToShow = this.monthToShow;
            if (!dontGoToSelectedDate && this.getValue())
                monthToShow = this.getValue();
            this.monthToShow.setDate(1);
            var daysInMonth = new Date(monthToShow.getFullYear(), monthToShow.getMonth() + 1, 0).getDate();
            var dayOfWeek = new Date(monthToShow.getFullYear(), monthToShow.getMonth(), 1).getDay() - this.firstDayOfWeek;
            var daysInPrevMonth = new Date(monthToShow.getFullYear(), monthToShow.getMonth(), 0).getDate();
            var weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            // month name
            html += '<div class="ctxMonthNameTable">\n<div class="ctxRow">\n';
            html += view_2.View.getTag('div', 'class="ctxMonthBtnContainer"', this.prevMonthBtn.internalRender());
            html += view_2.View.getTag('div', 'class="ctxMonthName"', utils_5.utils.formatStr('<b>{0}</b> {1}', [this.L(months[monthToShow.getMonth()]), monthToShow.getFullYear()]));
            html += view_2.View.getTag('div', 'class="ctxMonthBtnContainer"', this.nextMonthBtn.internalRender());
            html += '</div>\n</div>\n';
            // week days names
            j = this.firstDayOfWeek;
            html += '<div class="ctxDaysTable"><div class="ctxRow">\n';
            for (i = 0; i <= 6; i++) {
                html += view_2.View.getTag('div', 'class="ctxWeekDay"' + this.weekday(i), this.L(weekDays[j]));
                j++;
                if (j > 6)
                    j = 0;
            }
            html += '</div><div class="ctxRow">\n';
            // prev month days
            daysInPrevMonth = daysInPrevMonth - dayOfWeek;
            for (i = 0; i < dayOfWeek; i++) {
                daysInPrevMonth++;
                html += view_2.View.getTag('div', 'class="ctxPrevMonthDay"' + this.weekday(i), daysInPrevMonth.toString());
            }
            // days
            var s, today = new Date();
            for (i = 1; i <= daysInMonth; i++) {
                if (dayOfWeek > 6) {
                    html += '\n</div>\n<div class="ctxRow">\n';
                    dayOfWeek = 0;
                }
                d = new Date(monthToShow.getFullYear(), monthToShow.getMonth(), i);
                s = d.toDateString() == today.toDateString() ? ' today' : '';
                if (this.getValue() && this.getValue().toDateString() == d.toDateString())
                    s += ' selected';
                html += view_2.View.getTag('div', utils_5.utils.formatStr('class="ctxDay" value="{0}" index="{1}"' + this.weekday(dayOfWeek) + s, [utils_5.utils.formatDate(d, this.dateFormat), i]), i.toString());
                dayOfWeek++;
            }
            // next month days
            for (i = dayOfWeek, j = 1; i <= 6; i++, j++)
                html += view_2.View.getTag('div', 'class="ctxNextMonthDay"' + this.weekday(i), j);
            html += '</div></div>';
            return html;
        };
        return DatePicker;
    }(LookupView));
    exports.DatePicker = DatePicker;
});
define("src/ext.controls", ["require", "exports", "src/resources", "src/view", "src/list.controls", "src/std.controls"], function (require, exports, resources_4, view_3, list_controls_1, std_controls_2) {
    "use strict";
    resources_4.resources.register('context-wcl', [
        'css/ext.controls.css'
    ]);
    /**
     * Tabs switch control
     */
    var TabsView = (function (_super) {
        __extends(TabsView, _super);
        function TabsView(parent, name) {
            _super.call(this, parent, name);
            this.droppedDown = '';
            var _this = this;
            this.droppedDown = '';
            this.dropDownButton = new std_controls_2.ButtonView(this, 'dropDownButton');
            this.dropDownButton.buttonType = std_controls_2.ButtonType.toggle;
            this.dropDownButton.events.onclick = function () {
                _this.droppedDown = _this.droppedDown ? '' : 'droppedDown';
                _this.updateView();
            };
        }
        TabsView.prototype.render = function () {
            var html = view_3.View.getTag('div', 'class="tabs ' + this.droppedDown + '"', this.internalRenderItems());
            var selItm = this.getSelectedItem();
            if (selItm && selItm.text)
                html += view_3.View.getTag('div', 'class="caption" ', this.getSelectedItem().text);
            html = this.renderTag(html + this.dropDownButton.render());
            return html;
        };
        TabsView.prototype.updateSelectedIndex = function (newIndex) {
            // unselect current element
            if (this.selectedElement)
                this.setElementSelected(this.selectedElement, false);
            this.selectedElement = null;
            this._selectedIndex = newIndex;
            // select new element
            if (this.element && this.visible && this.selectedIndex >= 0) {
                this.selectedElement = this.element.firstChild.children[this.selectedIndex];
                if (this.selectedElement)
                    this.setElementSelected(this.selectedElement, true);
                else
                    this.selectedIndex = -1;
            }
            return true;
        };
        TabsView.prototype.afterUpdateView = function () {
            _super.prototype.afterUpdateView.call(this);
            if (this.element && this.visible) {
                var children = this.element.firstChild.children;
                this.renderedRowCount = children.length;
                for (var i = 0; i < children.length; i++)
                    children[i].setAttribute('index', i.toString());
                this.updateSelectedIndex(this.selectedIndex);
                this.handleEvent('onclick', this.handleClick);
            }
            this.internalTriggerReady();
        };
        TabsView.prototype.handleClick = function (event) {
            var listElement = this.getActiveElement(event);
            if (!listElement)
                return;
            var idx = listElement.getAttribute('index');
            this.setSelectedIndex(idx);
        };
        return TabsView;
    }(list_controls_1.ListView));
    exports.TabsView = TabsView;
    /**
     * Tabs switch with pages inside
     */
    var PageView = (function (_super) {
        __extends(PageView, _super);
        function PageView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = true;
            // Tabs switcher
            this.pagesSwitcher = new TabsView(this, 'pagesSwitcher');
            this.pagesSwitcher.onGetItems = this.onGetItems;
            // Container for pages
            this.pagesContainer = new std_controls_2.ContainerView(this, 'pagesContainer');
            this.pagesContainer.animation = std_controls_2.ContainerView.fadeInOut;
            var _this = this;
            this.pagesSwitcher.onSelectionChange = function (index) {
                _this.pagesContainer.showView(_this.pagesSwitcher.getValue(), std_controls_2.ContainerView.directionForward);
            };
        }
        Object.defineProperty(PageView.prototype, "items", {
            /** Pages list
             * e.g.
             * pagesList.items = [{text: 'Page 1', value: myView1}, {text: 'Page 2', value: myView2}]
            */
            get: function () {
                return this.pagesSwitcher.items;
            },
            set: function (items) {
                this.pagesSwitcher.items = items;
            },
            enumerable: true,
            configurable: true
        });
        PageView.prototype.setPageIndex = function (index) {
            this.pagesSwitcher.setSelectedIndex(index);
            this.pagesSwitcher.updateView();
        };
        PageView.prototype.showPage = function (view) {
            for (var i = 0; i < this.pagesSwitcher.items.length; i++)
                if (this.pagesSwitcher.items[i].value = view) {
                    this.setPageIndex(i);
                    return;
                }
        };
        PageView.prototype.updateItems = function (forceUpdate) {
            this.pagesSwitcher.updateItems(forceUpdate);
            this.updateView();
        };
        return PageView;
    }(view_3.View));
    exports.PageView = PageView;
    /**
     * View displayed at top of all controls
     **/
    var ModalView = (function (_super) {
        __extends(ModalView, _super);
        function ModalView(parent, name) {
            _super.call(this, parent, name);
            this._visible = false;
            this.renderClientArea = false;
            this.modalContainer = new std_controls_2.PanelView(this, 'cxtModalContainer');
        }
        return ModalView;
    }(view_3.View));
    exports.ModalView = ModalView;
    /**
     * Dialog control
     */
    var Dialog = (function (_super) {
        __extends(Dialog, _super);
        function Dialog(parent, name) {
            _super.call(this, parent, name);
            this._buttons = [];
            this.captionView = new std_controls_2.TextView(this.modalContainer, 'ctxCaption');
            this.buttonsContainer = new std_controls_2.PanelView(this.modalContainer, 'ctxButtonsContainer');
            this.buttons = [Dialog.buttonType.ok];
        }
        Object.defineProperty(Dialog.prototype, "buttons", {
            /** Set/gets dialog's buttons set */
            get: function () {
                return this._buttons;
            },
            set: function (buttons) {
                if (buttons)
                    this._buttons = buttons;
                this.buttonsContainer.children = [];
                for (var i = 0; i < this._buttons.length; i++) {
                    var btn = new std_controls_2.ButtonView(this.buttonsContainer, this.buttons[i].id);
                    btn.text = this.buttons[i].buttonType.text;
                    btn.buttonType = this.buttons[i].buttonType;
                    btn.parentDialog = this;
                    btn.events.onclick = function (event) {
                        if (this.onClick)
                            this.onClick();
                        else
                            this.parentDialog.hide();
                    };
                }
            },
            enumerable: true,
            configurable: true
        });
        //TODO: make static variant
        Dialog.prototype.showMessage = function (caption, onOkClick, onCancelClick) {
            var btn, buttons = [];
            this.captionView.text = caption;
            if (typeof onCancelClick === 'function') {
                btn = Dialog.buttonType.cancel;
                btn.onClick = onCancelClick;
                buttons.push(btn);
            }
            if (typeof onOkClick === 'function') {
                btn = Dialog.buttonType.cancel;
                btn.onClick = onOkClick;
                buttons.push(btn);
            }
            this.buttons = buttons;
            this.show();
        };
        //TODO: refactor this
        Dialog.buttonType = {
            ok: {
                id: 'ctxOkButton',
                text: 'OK',
                buttonType: std_controls_2.ButtonType.primary,
                onClick: null
            },
            cancel: {
                id: 'ctxCancelButton',
                text: 'Cancel',
                buttonType: std_controls_2.ButtonType.default,
                onClick: null
            }
        };
        return Dialog;
    }(ModalView));
    exports.Dialog = Dialog;
});
define("src/index", ["require", "exports", "src/utils", "src/resources", "src/component", "src/data", "src/actions", "src/view", "src/application", "src/std.controls", "src/ext.controls", "src/list.controls"], function (require, exports, utils_6, resources_5, component_3, data_2, actions_1, view_4, application_1, std_controls_3, ext_controls_1, list_controls_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    __export(utils_6);
    __export(resources_5);
    __export(component_3);
    __export(data_2);
    __export(actions_1);
    __export(view_4);
    __export(application_1);
    __export(std_controls_3);
    __export(ext_controls_1);
    __export(list_controls_2);
});
define("examples/app01/myapp", ["require", "exports", 'breeze-client', "src/index", "src/index", "src/index", "examples/app01/config", 'jquery'], function (require, exports, breeze, context_wcl_1, context_wcl_2, context_wcl_3, config_1) {
    "use strict";
    /* Example of using breeze and jquery */
    function test() {
        var c = $('#myid');
        var c2 = breeze.core;
    }
    /* add resource files to resource boundle/library, they will be loaded when app initializes */
    context_wcl_2.resources.register('MyApp', [
        'myapp.css'
    ]);
    /** Main routine that's called by requirejs script in index.html */
    function main() {
        new MyApp(config_1.config);
    }
    exports.main = main;
    /**
     * Our application class. It's sufficient to override method run.
     * In reality there's no need to subclass Application, but we can do it anyway.
     */
    var MyApp = (function (_super) {
        __extends(MyApp, _super);
        function MyApp() {
            _super.apply(this, arguments);
            this.mainScreen = new MainScreen('mainScreen');
        }
        MyApp.prototype.run = function () {
            this.mainScreen.show();
            test();
        };
        return MyApp;
    }(context_wcl_1.Application));
    var MainScreen = (function (_super) {
        __extends(MainScreen, _super);
        function MainScreen() {
            _super.apply(this, arguments);
        }
        MainScreen.prototype.initComponents = function () {
            // let pages = new PageView(this, 'pages');        
            this.testHeaderFooter();
            this.testEdit();
            this.testList();
            this.testTabs();
        };
        // Header, Footer    
        MainScreen.prototype.testHeaderFooter = function () {
            var header = new context_wcl_2.HeaderView(this, 'header');
            header.text = 'Context Web Components Library - Test Project';
            var footer = new context_wcl_2.FooterView(this, 'footer');
            footer.text = '(c) 2016 Context Software LLC.';
        };
        // GroupBoxView, InputView, TextAreaView, ButtonView
        MainScreen.prototype.testEdit = function () {
            var grpBox = new context_wcl_2.GroupBoxView(this);
            grpBox.caption = 'Input Test';
            grpBox.style = 'margin-bottom: 10px';
            var inputLabel = new context_wcl_2.TextView(grpBox);
            inputLabel.text = 'Input: ';
            var input = new context_wcl_2.InputView(grpBox);
            input.style = 'margin-right: 10px';
            input.data.dataSource = null; // on data change and on state change events
            input.data.dataField = 'lastName';
            var enableInputBtn = new context_wcl_2.ButtonView(grpBox);
            enableInputBtn.text = 'Disable';
            enableInputBtn.buttonType = context_wcl_2.ButtonType.danger;
            enableInputBtn.events.onclick = function (event) {
                if (input.enabled) {
                    input.enabled = false;
                    enableInputBtn.text = 'Enable';
                    enableInputBtn.buttonType = context_wcl_2.ButtonType.primary;
                }
                else {
                    input.enabled = true;
                    enableInputBtn.text = 'Disable';
                    enableInputBtn.buttonType = context_wcl_2.ButtonType.danger;
                }
            };
            var readOnlyBtn = new context_wcl_2.ButtonView(grpBox);
            readOnlyBtn.text = 'Read Only';
            readOnlyBtn.buttonType = context_wcl_2.ButtonType.warning;
            readOnlyBtn.events.onclick = function (event) {
                if (input.attributes.readonly) {
                    delete input.attributes.readonly;
                    readOnlyBtn.buttonType = context_wcl_2.ButtonType.warning;
                    readOnlyBtn.text = 'Read Only';
                }
                else {
                    input.attributes.readonly = true;
                    readOnlyBtn.buttonType = context_wcl_2.ButtonType.info;
                    readOnlyBtn.text = 'Writable';
                }
                input.updateView();
            };
            var textareaLabel = new context_wcl_2.TextView(grpBox);
            textareaLabel.text = 'Text Area: ';
            var textarea = new context_wcl_2.TextAreaView(grpBox);
            textarea.style = "display: block; width: 355px; height: 60px";
        };
        // ListView, LookupView, DatePicker
        MainScreen.prototype.testList = function () {
            var grpBox = new context_wcl_2.GroupBoxView(this);
            grpBox.style = 'margin-bottom: 10px';
            grpBox.caption = 'List Test';
            var label1 = new context_wcl_2.TextView(grpBox);
            label1.style = 'margin-bottom: 10px';
            label1.text = 'LookupView:';
            var lookup = new context_wcl_2.LookupView(grpBox);
            for (var i = 0; i < 200; i++)
                lookup.items.push({
                    text: 'item ' + i
                });
            var label2 = new context_wcl_2.TextView(grpBox);
            label2.style = 'margin-bottom: 10px';
            label2.text = 'DatePicker:';
            var datePicker = new context_wcl_2.DatePicker(grpBox);
            var label3 = new context_wcl_2.TextView(grpBox);
            label3.style = 'margin-bottom: 10px';
            label3.text = 'SelectView:';
            var select = new context_wcl_2.SelectView(grpBox);
            var label4 = new context_wcl_2.TextView(grpBox);
            label4.style = 'margin-bottom: 10px';
            label4.text = 'ListView:';
            var list = new context_wcl_2.ListView(grpBox);
            list.onGetItems = function (addItem) {
                addItem('added item 1');
                addItem('added item 2');
                addItem('added item 3');
                addItem('added item 4');
                addItem('added item 5');
                addItem('added item 6');
            };
            select.items = [
                'item 1',
                'item 2',
                'item 3',
                'item 4',
                'item 5',
            ];
        };
        MainScreen.prototype.testTabs = function () {
            var grpBox = new context_wcl_2.GroupBoxView(this);
            grpBox.style = 'margin-bottom: 10px';
            grpBox.caption = 'Tabs Test';
            var tabs = new context_wcl_2.TabsView(grpBox);
            tabs.items = ['Tab 1', 'Tab 2', 'Tab 3'];
            tabs.selectedIndex = 0;
            var label = new context_wcl_2.TextView(grpBox);
            label.style = 'margin-top: 10px; margin-bottom: 20px';
            tabs.onSelectionChange = function (index) {
                label.text = context_wcl_3.utils.formatStr('Tab {0} selected.', [index + 1]);
            };
            var pages = new context_wcl_2.PageView(grpBox);
            var page1 = new context_wcl_2.PanelView(null);
            page1.text = 'This is Page 1';
            var page2 = new context_wcl_2.PanelView(null);
            page2.text = 'This is Page 2';
            page1.style = page2.style = "padding: 10px";
            pages.items = [
                { text: 'Page 1', value: page1 },
                { text: 'Page 2', value: page2 }
            ];
            pages.setPageIndex(0);
        };
        return MainScreen;
    }(context_wcl_2.ScreenView));
});
/**
 * Controls that layouts its content
 */
define("src/layout.controls", ["require", "exports", "src/utils", "src/view"], function (require, exports, utils_7, view_5) {
    "use strict";
    /**
     * Cotrols layouter that discretely/responsively changes its size
     **/
    var WorkAreaLayout = (function (_super) {
        __extends(WorkAreaLayout, _super);
        function WorkAreaLayout(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = false;
        }
        return WorkAreaLayout;
    }(view_5.View));
    exports.WorkAreaLayout = WorkAreaLayout;
    /**
     *  Layouts controls within grid
     */
    var GridLayout = (function (_super) {
        __extends(GridLayout, _super);
        function GridLayout() {
            _super.apply(this, arguments);
            this.rows = [];
        }
        GridLayout.prototype.render = function () {
            var bodyOfTable = '';
            for (var r = 0; r < this.rows.length; r++) {
                bodyOfTable += utils_7.utils.formatStr('<div class="ctx_row" row="{0}">', [r]);
                var cols = this.rows[r];
                for (var c = 0; c < cols.length; c++) {
                    var cell = cols[c];
                    var controls = null;
                    var cellAttr = '';
                    var cellHtml = '';
                    if (typeof cell === "string")
                        cell = this[cell];
                    if (cell && typeof cell === "object") {
                        if (cell.views)
                            controls = cell.views;
                        else
                            controls = cell;
                        if (typeof cell.style == 'string')
                            cellAttr = utils_7.utils.formatStr('style="{0}" ', [cell.style]);
                        cellAttr += utils_7.utils.attributesToString(cell.cellAttributes);
                    }
                    if (controls) {
                        if (!Array.isArray(controls))
                            controls = [controls];
                        for (var i = 0; i < controls.length; i++)
                            cellHtml += controls[i].internalRender();
                    }
                    if (cellHtml === '')
                        cellHtml = '<div class="ctx_transparent">null</div>';
                    bodyOfTable += utils_7.utils.formatStr('<div class="ctx_cell" ctx_row="{0}" ctx_cell="{1}"{2}>{3}</div>', [r, c, cellAttr, cellHtml]);
                }
                if (cols.length === 0)
                    bodyOfTable += '<div><div class=ctx_null></div></div>';
                bodyOfTable += '</div>';
            }
            return this.renderTag(bodyOfTable);
        };
        return GridLayout;
    }(view_5.View));
});
define("src/tree.contols", ["require", "exports", "src/utils", "src/view"], function (require, exports, utils_8, view_6) {
    "use strict";
    /**
     * Base class for tree-like controls
     **/
    var Nodes = (function (_super) {
        __extends(Nodes, _super);
        function Nodes() {
            _super.apply(this, arguments);
            this.nodes = [];
        }
        /**
         * Call this after assigning nodes array
         */
        Nodes.prototype.initNodes = function () {
            for (var i = 0; i < this.nodes.length; i++) {
                this.nodes[i].isLast = i == this.nodes.length - 1;
                this.internalInitNode(this.nodes[i]);
            }
        };
        Nodes.prototype.expandNode = function (node, expand, recursive) {
            if (expand === void 0) { expand = true; }
            if (recursive === void 0) { recursive = false; }
            if (node.canExpand)
                node.expanded = expand;
            else
                node.expanded = false;
            if (node.canExpand && recursive)
                for (var i = 0; i < node.nodes.length; i++)
                    this.expandNode(node.nodes[i], expand, recursive);
        };
        Nodes.prototype.collapseNode = function (node) {
            this.expandNode(node, false);
        };
        Nodes.prototype.expandAll = function (expand) {
            if (expand === void 0) { expand = true; }
            for (var i = 0; i < this.nodes.length; i++)
                this.expandNode(this.nodes[i], expand, true);
        };
        Nodes.prototype.collapseAll = function () {
            this.expandAll(false);
        };
        Nodes.prototype.getNodeById = function (id) {
            var getChildById = function (node, id) {
                if (node.id == id)
                    return node;
                else if (Array.isArray(node.nodes)) {
                    var result = null;
                    for (var i = 0; result == null && i < node.nodes.length; i++)
                        result = getChildById(node.nodes[i], id);
                    return result;
                }
                return null;
            };
            var result = null;
            for (var i = 0; result == null && i < this.nodes.length; i++)
                result = getChildById(this.nodes[i], id);
            return result;
        };
        Nodes.prototype.deleteNode = function (node) {
            var idx;
            if (node.parent) {
                idx = node.parent.nodes.indexOf(node);
                node.parent.nodes.splice(idx, 1);
            }
            else {
                idx = this.nodes.indexOf(node);
                this.nodes.splice(idx, 1);
            }
            this.initNodes();
        };
        /** Sorts nodes with compareCallback */
        Nodes.prototype.sort = function (compareCallback) {
            var sortNodes = function (nodes) {
                nodes.sort(compareCallback);
                for (var i = 0; i < nodes.length - 1; i++)
                    if (nodes[i].nodes)
                        sortNodes(nodes[i].nodes);
            };
            sortNodes(this.nodes);
        };
        Nodes.prototype.internalInitNode = function (node) {
            node.canExpand = (node.nodes !== null) && Array.isArray(node.nodes) && node.nodes.length > 0;
            if (!node.id)
                node.id = (Nodes.nodeCounter++).toString();
            if ((node.expanded == null) || !node.canExpand)
                node.expanded = false;
            if (node.canExpand)
                for (var i = 0; i < node.nodes.length; i++) {
                    node.nodes[i].parent = node;
                    node.nodes[i].isLast = i == node.nodes.length - 1;
                    this.internalInitNode(node.nodes[i]);
                }
        };
        Nodes.nodeCounter = 0;
        return Nodes;
    }(view_6.View));
    exports.Nodes = Nodes;
    /**
     * Displays tree
     **/
    var TreeView = (function (_super) {
        __extends(TreeView, _super);
        function TreeView() {
            _super.apply(this, arguments);
        }
        TreeView.prototype.render = function () {
            this.initNodes();
            return this.renderTag(this.internalRenderNodes());
        };
        /** Returns node and it's element for DOM event */
        TreeView.prototype.getEventNode = function (event) {
            // active element is the one being currently touched
            var nodeElement = event.toElement || event.target;
            if (!nodeElement)
                return null;
            nodeElement = nodeElement.parentElement;
            if (!nodeElement)
                return null;
            var id = nodeElement.getAttribute('ctx_node_id');
            return { node: this.getNodeById(id), element: nodeElement };
        };
        TreeView.prototype.getNodeHtml = function (node) {
            var nodeAttr = node.attr || '';
            var text = node.text || '';
            var innerHtml = '';
            var attr = '';
            if (typeof this.onGetNodeText === 'function')
                text = this.onGetNodeText(node);
            text = view_6.View.getTag('div', 'class="ctx_node_text"', text);
            if (node.canExpand)
                if (node.expanded)
                    innerHtml = view_6.View.getTag('span', 'class="ctx_collapse_node"', '');
                else
                    innerHtml = view_6.View.getTag('span', 'class="ctx_expand_node"', '');
            if (node.isLast)
                attr += 'class="ctx_node ctx_last_node" ';
            else
                attr += 'class="ctx_node" ';
            if (node.icon)
                innerHtml += view_6.View.getTag('img', utils_8.utils.formatStr('class="ctx_icon" src="{0}"', [node.icon]), '');
            //if(this.activeNode == node)
            //    attr += 'active ';
            return view_6.View.getTag('li', attr + nodeAttr + utils_8.utils.formatStr('ctx_node_id="{0}"', [node.id]), innerHtml + text) + '\n';
        };
        TreeView.prototype.internalRenderNode = function (html, node) {
            var style = '';
            html.html += this.getNodeHtml(node);
            if (!node.nodes)
                return;
            for (var i = 0; i < node.nodes.length; i++) {
                if (i == 0) {
                    if (node.expanded)
                        style = 'style="display: block"';
                    else
                        style = 'style="display: none"';
                    html.html += '<ul class="ctx_tree" ' + style + '>\n';
                }
                this.internalRenderNode(html, node.nodes[i]);
                if (i == node.nodes.length - 1)
                    html.html += '</ul>\n';
            }
        };
        TreeView.prototype.internalRenderNodes = function () {
            var html = { html: '', level: 0 };
            for (var i = 0; i < this.nodes.length; i++)
                this.internalRenderNode(html, this.nodes[i]);
            html.html = view_6.View.getTag('ul', 'class="ctx_tree ctx_root"', html.html);
            return html.html;
        };
        TreeView.prototype.afterUpdateView = function () {
            this.internalAfterUpdateView();
            if (this.element && this.visible) {
                this.handleEvent('onclick', this.handleClick);
                this.handleEvent('ondblclick', this.handleDblClick);
            }
            this.internalTriggerReady();
        };
        TreeView.prototype.setActiveNodeElement = function (node, element) {
            if (this.activeNodeElement)
                this.activeNodeElement.removeAttribute('active');
            this.activeNodeElement = element;
            this.activeNodeElement.setAttribute('active', '');
            this.activeNode = node;
        };
        TreeView.prototype.handleClick = function (event) {
            var n = this.getEventNode(event);
            if (!n.node)
                return;
            var cl = (event.toElement || event.target).getAttribute('class');
            if (cl == 'ctx_collapse_node' || cl == 'ctx_expand_node') {
                this.expandNode(n.node, !n.node.expanded);
                this.updateView();
                return;
            }
            ;
            this.setActiveNodeElement(n.node, n.element);
            if (this.onNodeClick)
                this.onNodeClick(n.node);
        };
        TreeView.prototype.handleDblClick = function (event) {
            if (!this.activeNode)
                return;
            if (this.activeNode.canExpand) {
                this.expandNode(this.activeNode, !this.activeNode.expanded);
                this.updateView();
            }
            if (this.onNodeDblClick)
                this.onNodeDblClick(this.activeNode);
        };
        return TreeView;
    }(Nodes));
    exports.TreeView = TreeView;
});
//# sourceMappingURL=myapp.js.map