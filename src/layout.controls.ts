/**
 * Controls that layouts its content 
 */

import {utils} from './utils';
import {View} from './view';

/**
 * Cotrols layouter that discretely/responsively changes its size
 **/
export class WorkAreaLayout extends View {
    constructor(parent, name) {
        super(parent, name);
        this.renderClientArea = false;
    }
}


/**
 *  Layouts controls within grid
 */
class GridLayout extends View {
    public rows = [];

    public render() {
        let bodyOfTable = '';

        for (let r = 0; r < this.rows.length; r++) {
            bodyOfTable += utils.formatStr('<div class="ctx_row" row="{0}">', [r]);
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
                        cellAttr = utils.formatStr('style="{0}" ', [cell.style]);
                    cellAttr += utils.attributesToString(cell.cellAttributes);
                }
                if (controls) {
                    if (!Array.isArray(controls))
                        controls = [controls];

                    for (var i = 0; i < controls.length; i++)
                        cellHtml += controls[i].internalRender();
                }

                if (cellHtml === '')
                    cellHtml = '<div class="ctx_transparent">null</div>';

                bodyOfTable += utils.formatStr('<div class="ctx_cell" ctx_row="{0}" ctx_cell="{1}"{2}>{3}</div>', [r, c, cellAttr, cellHtml]);
            }

            if (cols.length === 0)
                bodyOfTable += '<div><div class=ctx_null></div></div>';

            bodyOfTable += '</div>';
        }

        return this.renderTag(bodyOfTable);
    }
}
