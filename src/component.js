define(["require", "exports", './utils'], function (require, exports, utils_1) {
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
//# sourceMappingURL=component.js.map