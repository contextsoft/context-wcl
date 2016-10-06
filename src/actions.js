var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './component'], function (require, exports, component_1) {
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
//# sourceMappingURL=actions.js.map