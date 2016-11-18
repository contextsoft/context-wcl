/** 
 * Controls displaing grid
 **/

import { utils } from './utils';
import { resources } from './resources';
import { View } from './view';
import { EventType, IRecord, RecordSetDataLink, IRecordSetSource } from './data';

resources.register('context-wcl',
    [
        'css/grid.controls.css'
    ]
);

interface IGridColumn {
    /** Column caption */
    caption: string;
    /** Caption element attributes */
    captionAttr?: string;

    /** Field name in DataSource */
    fieldName: string;

    /** View that will rendered instead of text */
    view?: View;

    /** Data row element attributes */
    attributes?: string;

    /** Footer field */
    footerField?: string;
    /** Footer element attributes */
    footerAttributes?: string;
}

/**
 * Grid control
 **/
export class GridView extends View {
    protected static innerGridCounter = 0;

    /** Grid data link */
    public data: RecordSetDataLink;

    /** Grid columns, see IGridColumn */
    public columns: IGridColumn[] = [];

    /** Fires on when row element rendered */
    public onGetRowAttr: (row: number) => string;

    /** Fires when column element rendered */
    public onGetColumnAttr?: (row: number, col: number, value: string) => string;

    /** Show header or not */
    public showHeader = true;

    /** Is header fixed to top or not */
    public fixedHeader = false;

    /** Show footer or not */
    public showFooter = false;

    /** Draw or not selected row background with a different color */
    public drawRowSelection = true;

    /** Fires when footer rendered */
    public onGetFooterText: (column: number) => string;

    protected innerListId;

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.data = new RecordSetDataLink((eventType: EventType, data: any): void => {
            if (eventType == EventType.CursorMoved)
                this.updateSelectedRow();
            else
                this.updateView();
        });
        this.renderClientArea = true;
    }

    /** Creates grid columns from data.dataSource */
    public createDefaultColumns() {
        let ds = this.data.dataSource;
        if (!ds)
            return;
        if (this.columns.length > 0)
            return;
        if (ds.fields.length > 0)
            for (let f = 0; f < ds.fields.length; f++)
                this.columns.push({
                    caption: ds.fields[f].fieldName,
                    fieldName: ds.fields[f].fieldName
                });
        else {
            let rec = this.data.dataSource.current;
            for (let f in rec) {
                if (rec.hasOwnProperty(f))
                    this.columns.push({
                        caption: f,
                        fieldName: f
                    });
            }
        }
    }

    protected renderSelf(): string {
        var html = '';

        this.createDefaultColumns();

        html = this.renderHeader();
        html += this.renderRows();
        html += this.renderFooter();

        return html;
    }

    /** Returns cell html */
    protected getCellHtml(row, col, attr, text, tag = 'div'): string {
        if (text === null)
            text = '';
        attr = attr || '';
        attr += utils.formatStr('class="ctx_grid_cell" row="{0}" col="{1}"', [row, col]);
        return View.getTag(tag, attr, text);
    }

    /** Returns grid header */
    protected renderHeader(): string {
        if (!this.showHeader || this.columns.length == 0)
            return '';
        let attr, column;
        let h = '<div class="ctx_grid_header_outer">\n<div class="ctx_grid_header">\n';
        for (let col = 0; col < this.columns.length; col++) {
            column = this.columns[col];
            attr = column.captionAttr || column.attributes || '';
            h += this.getCellHtml(0, col, attr, column.caption);
        }
        h += '</div>\n</div>\n';
        return h;
    }

    /** Returns grid footer */
    protected renderFooter(): string {
        if (!this.showFooter || this.columns.length == 0)
            return '';
        let column: IGridColumn, colAttr, v;
        let footer = '<div class="ctx_grid_footer_outer">\n<div class="ctx_grid_footer">\n';
        for (let col = 0; col < this.columns.length; col++) {
            column = this.columns[col];
            colAttr = column.footerAttributes || column.attributes || '';
            if (typeof colAttr === 'object')
                colAttr = utils.attributesToString(colAttr);
            v = '';
            if (typeof this.onGetFooterText == 'function')
                v = this.onGetFooterText(col);
            else if (column.footerField)
                v = this.data.dataSource.current[column.footerField];
            else
                v = column.caption || '';
            footer += this.getCellHtml(0, col, colAttr, v);
        }
        footer += '</div>\n</div>\n';
        return footer;
    }

    /** Returns grid rows */
    protected renderRows(): string {
        this.innerListId = 'ctx_grid_body_' + (++GridView.innerGridCounter).toString();
        let ds = <IRecordSetSource>this.data.dataSource;
        let rec: IRecord;

        if (!ds)
            return;

        //let rows = utils.formatStr('<div class="ctx_grid_body_outer">\n<div class="ctx_grid_body_scroller">\n<div class="ctx_grid_body" id="{0}">\n',
        //     [this.innerListId.toString()]);

        let rows = utils.formatStr('<div class="ctx_grid_body_outer">\n<div class="ctx_grid_body" id="{0}">\n',
            [this.innerListId.toString()]);

        for (let row = 0; row < ds.recordCount(); row++) {
            rec = ds.getRecord(row);

            // rendering row
            let rowClass = 'ctx_grid_row';
            if (ds.currentIndex == row)
                rowClass += ' ctx_selected';

            let rowAttr = '';
            if (typeof this.onGetRowAttr == 'function')
                rowAttr = this.onGetRowAttr(row);
            rows += utils.formatStr('<div class="{0}" row="{1}"', [rowClass, row.toString()]) + rowAttr + '>';

            // rendering row's columns
            for (let col = 0; col < this.columns.length; col++) {
                let v = '';
                let colAttr = '';
                let column = this.columns[col];
                if (column.view) {
                    let wasVisible = column.view.visible;
                    column.view.visible = true;
                    v = column.view.render();
                    (<any>column.view).afterUpdateView();
                    column.view.visible = wasVisible;
                }
                else
                    v = rec[column.fieldName];
                if (typeof this.onGetColumnAttr == 'function')
                    colAttr = this.onGetColumnAttr(row, col, v);
                else if (column.attributes)
                    colAttr = column.attributes;
                rows += this.getCellHtml(row, col, colAttr, v);
            }
            rows += '</div>\n';
        }
        //rows += '</div>\n</div>\n</div>\n';
        rows += '</div>\n</div>\n';
        return rows;
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        this.handleEvent('onmousedown', this.handleMouseDown);
        this.handleEvent('ontouchstart', this.handleClick);
    }

    protected getEventRowElement(event) {
        // active element is the one being currently touched
        let listElement = event.toElement || event.target;
        if (!listElement)
            return null;
        let idx = listElement.getAttribute('row');
        while (listElement && !idx) {
            listElement = listElement.parentElement;
            if (!listElement)
                continue;
            idx = listElement.getAttribute('row');
        }
        if (!idx)
            return null;

        return listElement;
    }

    protected getEventElementRow(event) {
        let el = this.getEventRowElement(event);
        if (!el)
            return -1;
        return el.getAttribute('row');
    }

    protected handleMouseDown(event) {
        if (event instanceof MouseEvent && event.button > 0)
            return;
        this.handleClick(event);
    }

    protected handleClick(event) {
        let idx = this.getEventElementRow(event);
        if (idx < 0)
            return;
        this.data.dataSource.currentIndex = idx;
    }

    protected updateSelectedRow() {
        let innerGrid = document.getElementById(this.innerListId);
        if (!innerGrid)
            return;
        let selectedIdx = this.data.dataSource.currentIndex;
        let children = innerGrid.children;
        let el: Element, row;
        for (let i = 0; i < children.length; i++) {
            el = children[i];
            row = el.getAttribute('row');
            if (typeof row !== undefined && row != selectedIdx)
                el.setAttribute('class', 'ctx_grid_row');
            else if (row == selectedIdx)
                el.setAttribute('class', 'ctx_grid_row ctx_selected');
        }
    }

    protected getTagAttr() {
        let attr = super.getTagAttr();
        let attr2 = {
            drawRowSelection: this.drawRowSelection,
            fixedHeader: this.fixedHeader
        };
        attr += (attr ? ' ' : '') + utils.attributesToString(attr2);
        return attr;
    }



}
