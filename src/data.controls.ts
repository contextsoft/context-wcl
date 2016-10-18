import { utils } from './utils';
import { View, ValueView } from './view';
import { InputView, ButtonView } from './std.controls';
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
            if (this.lookupData.keyField)
                val = 'value="' + rec[this.lookupData.keyField] + '"';
            displayText = this.lookupData.getDisplayValue(rec);
            html += '<option ' + utils.escapeHTML(val) + '>' + utils.escapeHTML(displayText) + '</option>';
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
            if (eventType == EventType.CursorMoved)
                this.updateSelectedRecord();
            else
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
        let val = '';
        if (this.listData.keyField)
            val = ' value="' + utils.escapeHTML(record[this.listData.keyField]) + '"';
        let displayText = utils.escapeHTML(this.listData.getDisplayValue(record));
        let attr = utils.formatStr('index="{0}"', [index]) + val;
        if (selected)
            attr += 'class="ctx_selected"';

        return View.getTag('div', attr, displayText) + '\n';
    }

    protected updateSelectedRecord(children?: Element[] | HTMLCollection) {
        let selectedIdx = this.listData.dataSource.currentIndex;
        let el: Element, idx;
        children = children || this.element.children;
        for (let i = 0; i < children.length; i++) {
            el = children[i];
            idx = el.getAttribute('index');
            if (typeof idx !== undefined && idx != selectedIdx)
                el.removeAttribute('class');
            else if (idx == selectedIdx)
                el.setAttribute('class', 'ctx_selected');
        }
    }

    protected afterUpdateView() {
        super.afterUpdateView();
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

/**
 * Lookup control
 */
export class LookupView extends ListView {
    protected static listIdCounter = 1;

    /** Lookup at value beginning or anywhere, default true */
    public partialLookup = true;

    /** Case-sensitive lookup or not, default false */
    public caseSensitive = false;

    /** Max items count that will be shown in the lookup list */
    public maxItemsToRender = 100;

    // TODO: filtering throw dataSource;
    protected filteredRecords = [];

    protected listId;
    protected input: InputView;
    protected inputBtn: ButtonView;
    protected listVisible = false;
    protected updatingValue = false;

    constructor(parent: View, name?: string) {
        super(parent, name);

        this.listData = new LookupDataLink((eventType: EventType, data: any): void => {
            if (eventType == EventType.CursorMoved)
                this.updateSelectedRecord(document.getElementById(this.listId).children);
            else
                this.updateView();
        });

        this.input = new InputView(this, 'ctxInternalInput');
        this.input.onChange = this.onInputChange;
        this.input.events.onblur = this.onInputBlur;
        this.input.events.onkeypress = this.onInputKeyPress;

        this.inputBtn = new ButtonView(this, 'ctxInternalInputButton');
        this.inputBtn.text = '<span class="ctx_icon-caret"</span>';
        this.inputBtn.doNotEscapeHtml = true;
        this.inputBtn.events.onclick = this.onInputBtnClick;
    }

    public render() {
        this.listId = 'ctxLookupView' + LookupView.listIdCounter++;
        return this.renderTag('<div class="ctxInputBlock">' + this.input.internalRender() +
            '<div class="ctxInputBtnGroup">' + this.inputBtn.internalRender() + '</div></div>' +
            View.getTag('div', 'class="ctxInnerList" id="' + this.listId + '"', this.renderItems()));
    }

    public setValue(value) {
        super.setValue(value);
        this.input.value = value;
    }

    public getValue(): any {
        return super.getValue() || this.input.value;
    }

    protected renderItems() {
        let html = '', renderedCnt = 0, rec: IRecord;
        for (let i = 0; i < this.listData.dataSource.recordCount(); i++) {
            if (this.filteredRecords.indexOf(i) >= 0)
                continue;
            if (++renderedCnt > this.maxItemsToRender)
                break;
            rec = this.listData.dataSource.getRecord(i);
            html += this.getRecordHtml(rec, i, this.listData.dataSource.currentIndex == i) + '\n';
        }
        return html;
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        this.handleEvent('onkeydown', this.handleKeyDown);
    }

    protected handleKeyDown(event) {
        let keyCode = ('which' in event) ? event.which : event.keyCode;
        switch (parseInt(keyCode)) {
            case 38:
                this.listData.dataSource.prior();
                break;
            case 40:
                this.listData.dataSource.next();
                break;
            case 13:
                this.value = this.listData.getDisplayValue(this.listData.dataSource.current);
                this.showDropdown(false);
                break;
        }
    };

    protected onInputChange() {
        (<LookupView>this.parent).doInputChange(false);
    }

    protected doInputChange(forceShow: boolean) {
        if (this.updatingValue || !this.getEnabled())
            return;
        let rec, value, pos;

        this.filteredRecords = [];

        if (!forceShow) {
            let inputVal = this.input.value;
            if (!this.caseSensitive)
                inputVal = inputVal.toLowerCase();

            for (let i = 0; i < this.listData.dataSource.recordCount(); i++) {
                rec = this.listData.dataSource.getRecord(i);
                value = this.listData.getDisplayValue(rec);
                if (!this.caseSensitive)
                    value = value.toLowerCase();
                pos = value.indexOf(inputVal);
                if ((this.partialLookup && pos < 0) || (this.partialLookup && pos != 0))
                    this.filteredRecords.push(i);
            }
        }
        let el = document.getElementById(this.listId);
        el.innerHTML = this.renderItems();
        this.showDropdown(el.innerHTML.length > 0);
    }

    protected onInputBlur(event) {
        let lookup: LookupView = <LookupView>this.parent;
        if (event.relatedTarget && event.relatedTarget.className.indexOf('ctxInternalInputButton') >= 0)
            return;
        lookup.showDropdown(false);
    }

    protected onInputKeyPress(event) {
        let lookup: LookupView = <LookupView>this.parent;
        if (!lookup.getEnabled()) {
            event.preventDefault();
            return;
        }

        lookup.handleKeyDown(event);

        let keyCode = ('which' in event) ? event.which : event.keyCode;
        if (parseInt(keyCode) == 38 || parseInt(keyCode) == 40) {
            event.preventDefault();
        }
    }

    protected onInputBtnClick(event) {
        let lookup: LookupView = <LookupView>this.parent;
        if (!lookup.getEnabled())
            return;
        if (!lookup.listVisible)
            lookup.doInputChange(true);
        else
            lookup.showDropdown(false);
        lookup.input.setFocus();
    }

    protected showDropdown(show: boolean) {
        let el = document.getElementById(this.listId);
        if (show)
            el.style.visibility = 'visible';
        else
            el.style.visibility = 'hidden';
        this.listVisible = show;
    }

    protected handleClick(event) {
        let idx = this.getEventElementIndex(event);
        if (idx < 0)
            return;
        super.handleClick(event);
        this.value = this.listData.getDisplayValue(this.listData.dataSource.current);
    }
}
