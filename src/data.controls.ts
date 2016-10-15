import { utils } from './utils';
import { View, ValueView } from './view';
import { IRecord, LookupDataLink, EventType, RecordSetSource } from './data';


/**
 * <select> wrapper
 **/
export class SelectView extends ValueView {
    /** Source of records displayed inside the list */
    public lookupData: LookupDataLink;

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.tag = 'select';
        this.renderClientArea = false;
        this.lookupData = new LookupDataLink((eventType: EventType, data: any): void => {
            this.updateView();
        });
    }
    public render() {
        return this.renderTag(this.renderItems());
    }
    protected renderItems() {
        let html = '', rec: IRecord, val: string, displayText: string;
        for (let i = 0; i < this.lookupData.dataSource.recordCount(); i++) {
            rec = this.lookupData.dataSource.getRecord(i);
            val = rec[this.lookupData.keyField];
            displayText = this.lookupData.getDisplayValue(rec);
            html += '<option value="' + utils.escapeHTML(val) + '">' + utils.escapeHTML(displayText) + '</option>';
        }
        return html;
    }
    protected afterUpdateView() {
        super.afterUpdateView();
        this.handleEvent('onchange', this.handleChange);
    }
    protected handleChange() {
        // retrieve value from element
        this.getValue();
        // update data link
        this.data.value = this._value;
        // invoke event if assigned
        if (this.onChange)
            this.onChange();
    }
}

/**
 * Displays list
 **/
export class ListView extends ValueView {
    /** Source of records displayed inside the list */
    public listData: LookupDataLink;

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.listData = new LookupDataLink((eventType: EventType, data: any): void => {
            this.updateView();
        });
    }

    public render() {
        return this.renderTag(this.renderItems());
    }

    protected renderItems() {
        let html = '', rec: IRecord;
        for (let i = 0; i < this.listData.dataSource.recordCount(); i++) {
            rec = this.listData.dataSource.getRecord(i);
            html += this.getRecordHtml(rec, i, this.listData.dataSource.currentIndex == i) + '\n';
        }
        return html;
    }

    protected getRecordHtml(record: IRecord, index: number, selected: boolean) {
        let val = utils.escapeHTML(record[this.listData.keyField]);
        let displayText = utils.escapeHTML(this.listData.getDisplayValue(record));
        let attr = utils.formatStr('index="{0}" value="{1}"', [index, val]);
        if (selected)
            attr += 'class="ctx_selected"';

        return View.getTag('div', attr, displayText) + '\n';
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        //this.handleEvent('onkeydown', this.handleKeyDown);
        this.handleEvent('onmousedown', this.handleMouseDown);
        this.handleEvent('ontouchstart', this.handleClick);

    }

    protected handleChange() {
        // retrieve value from element
        this.getValue();
        // update data link
        this.data.value = this._value;
        // invoke event if assigned
        if (this.onChange)
            this.onChange();
    }

    protected getEventListElement(event) {
        // active element is the one being currently touched
        let listElement = event.toElement || event.target;
        if (!listElement)
            return null;
        let idx = listElement.getAttribute('index');
        while (listElement && !idx) {
            listElement = listElement.parentElement;
            if (!listElement)
                continue;
            idx = listElement.getAttribute('index');
        }
        if (!idx)
            return null;

        return listElement;
    }

    protected getEventElementIndex(event) {
        let el = this.getEventListElement(event);
        if (!el)
            return -1;
        return el.getAttribute('index');
    }

    // doesn't work because control doesn't has focus
    /*protected handleKeyDown(event) {
        if (event.eventPhase !== 3)
            return;
        let keyCode = ('which' in event) ? event.which : event.keyCode;
        switch (parseInt(keyCode)) {
            case 38:
                this.listData.dataSource.prior();
                break;
            case 40:
                this.listData.dataSource.next();
                break;
        }
    }*/

    protected handleMouseDown(event) {
        if (event instanceof MouseEvent && event.button > 0)
            return;
        this.handleClick(event);
    }

    protected handleClick(event) {
        let idx = this.getEventElementIndex(event);
        if (idx < 0)
            return;
        this.listData.dataSource.currentIndex = idx;
    }

}