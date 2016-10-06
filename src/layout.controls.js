/**
 * Controls that layouts its content
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './utils', './view'], function (require, exports, utils_1, view_1) {
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
    }(view_1.View));
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
                bodyOfTable += utils_1.utils.formatStr('<div class="ctx_row" row="{0}">', [r]);
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
                            cellAttr = utils_1.utils.formatStr('style="{0}" ', [cell.style]);
                        cellAttr += utils_1.utils.attributesToString(cell.cellAttributes);
                    }
                    if (controls) {
                        if (!Array.isArray(controls))
                            controls = [controls];
                        for (var i = 0; i < controls.length; i++)
                            cellHtml += controls[i].internalRender();
                    }
                    if (cellHtml === '')
                        cellHtml = '<div class="ctx_transparent">null</div>';
                    bodyOfTable += utils_1.utils.formatStr('<div class="ctx_cell" ctx_row="{0}" ctx_cell="{1}"{2}>{3}</div>', [r, c, cellAttr, cellHtml]);
                }
                if (cols.length === 0)
                    bodyOfTable += '<div><div class=ctx_null></div></div>';
                bodyOfTable += '</div>';
            }
            return this.renderTag(bodyOfTable);
        };
        return GridLayout;
    }(view_1.View));
});
//# sourceMappingURL=layout.controls.js.map