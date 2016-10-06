define(["require", "exports"], function (require, exports) {
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
//# sourceMappingURL=utils.js.map