export namespace utils {
    /**
     * Various handy routines
     **/

    //  Debug utils

    /** Checks if expression true otherwise throws exception and shows alert */
    export function ASSERT(exp, msg) {
        if (exp)
            return;
        alert('Assert: ' + msg);
        throw (msg);
    }

    /** Outputs string formated with fmt to console  */
    export function log(str: string, fmt?: string[]) {
        if (Array.isArray(fmt))
            str = formatStr(str, fmt);
        if (console)
            console.log(str);
    }

    /** Output stack and string formated with fmt to console  */
    export function logStack(str: string, fmt?: string[]) {
        let e: any = new Error();
        str = str || '';
        log(str + '\n' + e.stack, fmt);
    }


    // String utils

    /** Checks if val is undefined or null  */
    export function isDefined(val) {
        return !(typeof val === 'undefined' || val === null);
    }

    export function strOfZero(cnt) {
        return '00000000000000000000000000000000000000000000000'.substr(0, cnt);
    }

    export function strOfSpace(cnt) {
        return '                                               '.substr(0, cnt);
    }

    export function strOfChar(chr, cnt) {
        return strOfSpace(cnt).replace(/ /g, chr);
    }

    export function completeStrLeft(val, chr, newlen) {
        return strOfChar(chr, newlen - val.length) + val;
    }

    export function completeStrRight(val, chr, newlen) {
        return val + strOfChar(chr, newlen - val.length);
    }

    export function completeByZero(val, newlen) {
        return strOfZero(newlen - val.length) + val;
    }

    export function completeBySpace(val, newlen) {
        return strOfSpace(newlen - val.length) + val;
    }

    /** Concatinates 2 strings while @delimeter between */
    export function concatWithChar(str1, str2, delimiter) {
        let res = str1 || '';
        str2 = str2 || '';
        delimiter = delimiter || '';
        if (res)
            res = str2;
        else if (res && str2)
            res += delimiter + str2;

        return res;
    }

    /** Replaces \n with <br> and ' ' with &nbsp; */
    export function textToHtml(value) {
        return value.replace(/\n/g, '<br>\n').replace(/ /g, '&nbsp;');
    }

    /** Replaces < and > with  &lt; and &gt; */
    export function escapeHTML(str: string) {
        let result = "";
        for (let i = 0; i < str.length; i++) {
            if (str.charAt(i) == "<")
                result = result + "&lt;";
            else if (str.charAt(i) == ">")
                result = result + "&gt;";
            else
                result = result + str.charAt(i);
        }
        return result;
    }

    export function escapeQuotes(str: string) {
        return str.replace('"', '&quot;');
    }

    /** Replaces occurrences of {0} {1} .. {n} in the str with values from args */
    export function formatStr(str: string, args: any[]) {
        if (typeof str != 'string')
            throw 'formatStr: input is not a string';
        if (!args || args.length == 0)
            throw 'formatStr: invalid arguments';
        return str.replace(/{(\d+)}/g, function (match, num) {
            return typeof args[num] != 'undefined' ? args[num] : match;
        });
    }


    /** Removes leading and trailing control characters */
    export function trim(str: string) {
        if (!str)
            return '';

        let whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
        for (let i = 0; i < str.length; i++)
            if (whitespace.indexOf(str.charAt(i)) === -1) {
                str = str.substring(i);
                break;
            }
        for (let i = str.length - 1; i >= 0; i--)
            if (whitespace.indexOf(str.charAt(i)) === -1) {
                str = str.substring(0, i + 1);
                break;
            }
        return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
    }

    /** Removes leading and trailing \r\n */
    export function trimCR(value) {
        if (typeof value != 'string')
            return value;
        let i = 0;
        let j = value.length - 1;
        while ((value[i] == '\n' || value[i] == '\r') && (i < value.length))
            i++;
        while ((value[j] == '\n' || value[j] == '\r') && (j > i))
            j--;
        return value.substring(i, j + 1);
    }

    export function indexOfWord(str: string, substr: string) {
        if (!substr || substr === '')
            return -1;

        let s = ' ' + str + ' ';
        let idx = s.indexOf(' ' + substr + ' ');

        if (idx > 0)
            idx++;

        return idx;
    }

    //  Number utils

    export function isValidNumber(val: any) {
        return !isNaN(val);
    }

    export function isValidInteger(val: any) {
        return !isNaN(val) && val == val.toFixed();
    }


    /**
     * Formats currency, eg:
     * (123456789.12345).formatMoney({c: 2, d: '.', t: ','}) returns 123,456,789.12
     * (123456789.12345).formatMoney({c: 2})returns 123,456,789.12
     */
    export function formatMoney(options) {
        let n = this;
        let o = options || {};
        if (o.blankZero && n == 0.0)
            return '';
        o.currencySymbol = o.currencySymbol || '$';
        o.c = isNaN(o.c = Math.abs(o.c)) ? 2 : o.c;
        o.d = o.d == undefined ? "." : o.d;
        o.t = o.t == undefined ? "," : o.t;
        let s = n < 0 ? "-" : "";
        let i = parseInt(n = Math.abs(+n || 0).toFixed(o.c)) + "";
        let j = i.length;
        j = j > 3 ? j % 3 : 0;
        return s + o.currencySymbol + (j ? i.substr(0, j) + o.t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + o.t) + (o.c ? o.d + Math.abs(n - <any>i).toFixed(o.c).slice(2) : "");
    };


    // Date utils

    export function daysBetween(val: any, than: any) {
        return (<any>new Date(val) - <any>new Date(than)) / 86400 / 1000;
    }

    export function isValidDate(val: any) {
        return !isNaN(Date.parse(val));
    }

    /** Formats date as mm/dd/yyyy */
    export function dateToStr(val: any) {
        let date = new Date(val);
        return (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString();
    }

    /** Formats date as mm/dd/yyyy hh:nn */
    export function dateTimeToStr(val: any) {
        return formatDate(val, 'mm/dd/yyyy hh:nn t');
    }

    /** Formats data as yyyy-mm-dd */
    export function dateToSQLStr(val: any) {
        let date;
        if (!val)
            date = new Date();
        else if (typeof val == "object")
            date = val;
        else
            date = val ? new Date(val) : new Date();
        return completeByZero(date.getFullYear().toString(), 4) + '-' + completeByZero((date.getMonth() + 1).toString(), 2) + '-' + completeByZero(date.getDate().toString(), 2);
    }

    /** Converts val formatted as "yyyymmddhhnnss" to date */
    export function strTrimmedSQLToDate(val: string) {
        if (!val)
            throw 'Invalid Date Format';
        let yyyy = <any>val.substr(0, 4);
        let mm = <any>val.substr(4, 2) - 1;
        let dd = <any>val.substr(6, 2);
        let hh = <any>val.substr(8, 2);
        let nn = <any>val.substr(10, 2);
        let ss = <any>val.substr(12, 2);
        return new Date(yyyy, mm, dd, hh, nn, ss);
    }

    // Converts val formatted as "yyyy-mm-dd hh:nn:ss" to date
    export function strSQLToDate(val: string) {
        if (!val)
            return new Date(0, 0);
        let yyyy = <any>val.substr(0, 4);
        let mm = <any>val.substr(5, 2) - 1;
        let dd = <any>val.substr(8, 2);
        let hh = <any>val.substr(11, 2);
        let nn = <any>val.substr(14, 2);
        let ss = <any>val.substr(17, 2);
        return new Date(yyyy, mm, dd, hh, nn, ss);
    }

    /** Formats date as "yyyymmddHHnnss" */
    export function dateToTrimmedSQLStr(val) {
        return formatDate(val, 'yyyymmddHHnnss');
    }

    /** 
     * Formats date val with given format. 
     * Possible format values: yyyy/yy, mm, dd, HH for 24 hours, hh for 12 hours, t for AM/PM   
    */
    export function formatDate(val, format) {
        let date = null;
        if (typeof val == "object")
            date = val;
        else
            date = val ? new Date(val) : null;

        if (!date)
            return '';
        else if (!format)
            return date.toLocaleDateString();

        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        format = format.replace('mm', completeByZero(month.toString(), 2));

        if (format.indexOf('yyyy') > -1)
            format = format.replace('yyyy', year.toString());
        else if (format.indexOf('yy') > -1)
            format = format.replace('yy', year.toString().substr(2, 2));

        format = format.replace('dd', completeByZero(date.getDate().toString(), 2));

        let hours = date.getHours();
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

    /** Returns date formated as yyyy-mm-dd HH:nn:ss */
    export function timeStamp() {
        return formatDate(new Date, 'yyyy-mm-dd HH:nn:ss');
    }

    /** Add days to val */
    export function incDate(val, days) {
        let date;
        if (!val)
            date = new Date();
        else if (typeof val == "object")
            date = val;
        else
            date = val ? new Date(val) : new Date();

        date.setDate(date.getDate() + days);

        return date;
    }

    // DOM 

    /** Returns attributes = {a1: v1, a2: v2, ...} as 'a1="v1" a2="v2" ...' */
    export function attributesToString(attributes) {
        let res = '';
        if (typeof attributes === "object")
            for (let i in attributes)
                if (attributes.hasOwnProperty(i))
                    res += i + '="' + escapeQuotes(attributes[i].toString()) + '" ';
                else if (typeof attributes === "string")
                    res = attributes;
        return res;
    }

    /** Returns style = {s1: v1, s2: v2, ...} as "s1=v1 \n s2=v2 \n ..."  */
    export function styleToString(style) {
        let res = '';
        for (let i in style)
            res += i + ' = ' + style[i] + '\n';
        return res;
    }

    // Cookies

    export function setCookie(cookieName: string, cookieValue: string, expireDays?: number) {
        let exdate = new Date();
        exdate.setDate(exdate.getDate() + expireDays);
        let c_value = cookieValue + ((expireDays == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = cookieName + "=" + c_value;
    }

    export function getCookie(cookieName) {
        let c_value = document.cookie;
        let c_start = c_value.indexOf(" " + cookieName + "=");
        if (c_start == -1)
            c_start = c_value.indexOf(cookieName + "=");
        if (c_start == -1)
            c_value = null;
        else {
            c_start = c_value.indexOf("=", c_start) + 1;
            let c_end = c_value.indexOf(";", c_start);
            if (c_end == -1)
                c_end = c_value.length;
            c_value = c_value.substring(c_start, c_end);
        }
        return c_value;
    }

    // Other routines

    export function paramsToJSON(params: any) {
        let res = {};
        for (let i in params) {
            let v = params[i];
            res[i] = !v ? '' : v;
        }
        return res;
    }

    /** Returns fast non RFC-compliant GUID */
    export function guid() {
        let _p8 = function (s) {
            let p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        };

        return _p8(false) + _p8(true) + _p8(true) + _p8(false);
    }

    /** Object deep clone */
    export function clone(src) {
        function mixin(dest, source, copyFunc) {
            let name, s, empty = {};
            for (name in source) {
                // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
                // inherited from Object.prototype.  For example, if dest has a custom toString() method,
                // don't overwrite it with the toString() method that source inherited from Object.prototype
                s = source[name];
                if (!(name in dest) || (dest[name] !== s && (!(name in empty) || empty[name] !== s)))
                    dest[name] = copyFunc ? copyFunc(s) : s;
            }
            return dest;
        }

        if (!src || typeof src != "object" || Object.prototype.toString.call(src) === "[object Function]")
            // null, undefined, any non-object, or function
            return src; // anything
        if (src.nodeType && "cloneNode" in src)
            // DOM Node
            return src.cloneNode(true); // Node
        if (src instanceof Date)
            // Date
            return new Date(src.getTime()); // Date
        if (src instanceof RegExp)
            // RegExp
            return new RegExp(src);   // RegExp
        let r, i, l;
        if (src instanceof Array) {
            // array
            r = [];
            for (i = 0, l = src.length; i < l; ++i) {
                if (i in src) {
                    r.push(clone(src[i]));
                }
            }
        }
        // we don't clone functions for performance reasons
        // else if (d.isFunction(src)) {
        //     // function
        //     r = function () {
        //         return src.apply(this, arguments);
        //     };
        // } 
        else {
            // generic objects
            r = src.constructor ? new src.constructor() : {};
        }
        return mixin(r, src, clone);
    }

    /** Extends @first with the @second */
    export function extend<T, U>(first: T, second: U): T & U {
        let result = <T & U>{};
        for (let id in first) {
            (<any>result)[id] = (<any>first)[id];
        }
        for (let id in second) {
            if (!result.hasOwnProperty(id)) {
                (<any>result)[id] = (<any>second)[id];
            }
        }
        return result;
    }


    export interface IStringFunc {
        (str: string): string;
    }

    export function setLocaleFunc(localeFunc: IStringFunc): void {
        L = localeFunc;
    }

    export var L: IStringFunc = (str: string): string => { return str; };


}

// Object extensions, polyfill

declare global {
    interface Array<T> {
        indexOfObject(field, value): number;
        findObject(value): number;
        getRowCount(): number;
        getTotalRowCount(): number;
        getRow(idx): number;
        move(old_index, new_index): Array<T>;
    }
}

Array.prototype.indexOfObject = function (field, value) {
    for (let i = 0; i < this.length; i++)
        if (this[i][field] === value)
            return i;
    return -1;
};

Array.prototype.findObject = function (func) {
    for (let i = 0; i < this.length; i++)
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
        let k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this;
};

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
