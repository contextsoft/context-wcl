import { utils } from './utils';
import { View, ValueView } from './view';
import { InputView, ButtonView } from './std.controls';
import { IRecord, IExpression, LookupDataLink, EventType, IUpdatable, RecordSetSource } from './data';


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

    /** filter function used to filter records when user types into input box */
    protected _filter: IExpression = null;

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
        let html = '', renderedCnt = 0;
        for (let i = 0; i < this.listData.dataSource.recordCount(); i++) {
            let rec = this.listData.dataSource.getRecord(i);
            /*if (!this._filter || this._filter(rec)) {
                if (++renderedCnt > this.maxItemsToRender)
                    break;
                html += this.getRecordHtml(rec, i, this.listData.dataSource.currentIndex == i) + '\n';
            }*/
            if (++renderedCnt > this.maxItemsToRender)
                break;
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

        this._filter = null;

        if (!forceShow) {
            let inputVal = this.input.value;
            if (!this.caseSensitive)
                inputVal = inputVal.toLowerCase();

            /*this._filter = (rec: IRecord): any => {
                let value = this.listData.getDisplayValue(rec);
                if (!this.caseSensitive)
                    value = value.toLowerCase();
                let pos = value.indexOf(inputVal);
                return (this.partialLookup && pos >= 0) || (!this.partialLookup && pos == 0);
            };*/

            //(<RecordSetSource>this.listData.dataSource).beginUpdate();
            let rec: IRecord, value: string, filteredItems: number[] = [];
            this.listData.dataSource.setFilteredRecords([]);
            for (let i = 0; i < this.listData.dataSource.recordCount(); i++) {
                rec = this.listData.dataSource.getRecord(i);
                value = this.listData.getDisplayValue(rec);
                if (!this.caseSensitive)
                    value = value.toLowerCase();
                let pos = value.indexOf(inputVal);
                if ((this.partialLookup && pos >= 0) || (!this.partialLookup && pos == 0))
                    filteredItems.push(i);
            }
            this.listData.dataSource.setFilteredRecords(filteredItems);
            //(<RecordSetSource>this.listData.dataSource).endUpdate();
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

/**
 *  Date select control
 */
export class DatePicker extends LookupView {
    /** First day of week, 0 - sunday, 1 - monday, default 0 */
    public firstDayOfWeek = 0;

    /** Date format (as in utils.formatDate function), default locale dependent */
    public dateFormat = '';

    /** Show or not prev and next month days, default true */
    get showPrevNextMonthDays() {
        return this.attributes.showPrevNextMonthDay;
    }
    set showPrevNextMonthDays(value) {
        if (this.attributes.showPrevNextMonthDay && this.attributes.showPrevNextMonthDay === value)
            return;
        this.attributes.showPrevNextMonthDay = value;
        if (this.element && this.visible)
            this.updateView();
    }

    /** Highlight or not weekends, default true */
    public highlightWeekends = true;

    protected monthToShow: Date = new Date;

    protected input: InputView;
    protected inputBtn: ButtonView;
    protected prevMonthBtn: ButtonView;
    protected nextMonthBtn: ButtonView;

    constructor(parent: View, name?: string) {
        super(parent, name);

        this.showPrevNextMonthDays = true;

        // edit control
        this.input = new InputView(this, 'ctxInternalInput');
        this.input.attributes.readonly = true;
        this.input.events.onblur = this.onInputBlur;
        this.input.events.onkeypress = this.onInputKeyPress;

        // show calendar buttom
        this.inputBtn = new ButtonView(this, 'ctxInternalInputButton');
        this.inputBtn.text = '<span class="ctx_icon-caret"</span>';
        this.inputBtn.doNotEscapeHtml = true;
        this.inputBtn.events.onclick = this.onInputBtnClick;

        // prev month button
        this.prevMonthBtn = new ButtonView(this, 'ctxPrevMonthBtn');
        this.prevMonthBtn.attributes.type = 'chevronLeft';
        this.prevMonthBtn.events.onclick = this.onPrevMonthBtnClick;

        // next month button
        this.nextMonthBtn = new ButtonView(this, 'ctxNextMonthBtn');
        this.nextMonthBtn.attributes.type = 'chevronRight';
        this.nextMonthBtn.events.onclick = this.onNextMonthBtnClick;
    }

    public getValue(): Date {
        return this._value;
    }

    public setValue(value: Date) {
        this._value = value;
        if (value)
            this.input.setValue(utils.formatDate(this._value, this.dateFormat));
        else
            this.input.setValue('');
        this.updateCalendar(false);
    }

    protected onInputBlur(event) {
        if (event.relatedTarget && (event.relatedTarget.className.indexOf('internalInputButton') >= 0
            || event.relatedTarget.className.indexOf('ctxPrevMonthBtn') >= 0
            || event.relatedTarget.className.indexOf('ctxNextMonthBtn') >= 0))
            return;
        (<DatePicker>this.parent).showDropdown(false);
    }

    protected onInputKeyPress(event) {
        this.handleKeyDown(event);
        let keyCode = ('which' in event) ? event.which : event.keyCode;
        if (parseInt(keyCode) == 38 || parseInt(keyCode) == 40)
            event.preventDefault();
    }

    protected onInputBtnClick(event) {
        let picker = (<DatePicker>this.parent);
        if (!picker.listVisible)
            picker.showDropdown(true);
        else
            picker.showDropdown(false);
        picker.input.setFocus();
    }

    protected onPrevMonthBtnClick(event) {
        let picker = (<DatePicker>this.parent);
        picker.monthToShow.setMonth(picker.monthToShow.getMonth() - 1);
        picker.updateCalendar(true);
    }

    protected onNextMonthBtnClick(event) {
        let picker = (<DatePicker>this.parent);
        picker.monthToShow.setMonth(picker.monthToShow.getMonth() + 1);
        picker.updateCalendar(true);
    }


    protected updateCalendar(dontGoToSelectedDate: boolean) {
        if (!this.listId)
            return;
        let el = document.getElementById(this.listId);
        el.innerHTML = this.doRenderItems(dontGoToSelectedDate);
        this.prevMonthBtn.updateView();
        this.nextMonthBtn.updateView();
        this.input.setFocus();
    }

    protected weekday(dayOfWeek) {
        if (this.firstDayOfWeek == 0)
            return dayOfWeek == 0 || dayOfWeek == 6 ? ' weekend' : '';
        else
            return dayOfWeek == 5 || dayOfWeek == 6 ? ' weekend' : '';
    }

    protected renderItems() {
        return this.doRenderItems();
    }

    protected doRenderItems(dontGoToSelectedDate = false) {
        let html = '', i, j, d;
        let monthToShow = this.monthToShow;
        if (!dontGoToSelectedDate && this.getValue())
            monthToShow = this.getValue();
        this.monthToShow.setDate(1);
        let daysInMonth = new Date(monthToShow.getFullYear(), monthToShow.getMonth() + 1, 0).getDate();
        let dayOfWeek = new Date(monthToShow.getFullYear(), monthToShow.getMonth(), 1).getDay() - this.firstDayOfWeek;
        let daysInPrevMonth = new Date(monthToShow.getFullYear(), monthToShow.getMonth(), 0).getDate();
        let weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // month name
        html += '<div class="ctxMonthNameTable">\n<div class="ctxRow">\n';
        html += View.getTag('div', 'class="ctxMonthBtnContainer"', this.prevMonthBtn.internalRender());
        html += View.getTag('div', 'class="ctxMonthName"', utils.formatStr('<b>{0}</b> {1}', [this.L(months[monthToShow.getMonth()]), monthToShow.getFullYear()]));
        html += View.getTag('div', 'class="ctxMonthBtnContainer"', this.nextMonthBtn.internalRender());
        html += '</div>\n</div>\n';

        // week days names
        j = this.firstDayOfWeek;
        html += '<div class="ctxDaysTable"><div class="ctxRow">\n';
        for (i = 0; i <= 6; i++) {
            html += View.getTag('div', 'class="ctxWeekDay"' + this.weekday(i), this.L(weekDays[j]));
            j++;
            if (j > 6)
                j = 0;
        }
        html += '</div><div class="ctxRow">\n';

        // prev month days
        daysInPrevMonth = daysInPrevMonth - dayOfWeek;
        for (i = 0; i < dayOfWeek; i++) {
            daysInPrevMonth++;
            html += View.getTag('div', 'class="ctxPrevMonthDay"' + this.weekday(i), daysInPrevMonth.toString());
        }

        // days
        let s, today = new Date();
        for (i = 1; i <= daysInMonth; i++) {
            if (dayOfWeek > 6) {
                html += '\n</div>\n<div class="ctxRow">\n';
                dayOfWeek = 0;
            }
            d = new Date(monthToShow.getFullYear(), monthToShow.getMonth(), i);
            s = d.toDateString() == today.toDateString() ? ' today' : '';
            if (this.getValue() && this.getValue().toDateString() == d.toDateString())
                s += ' selected';
            html += View.getTag('div',
                utils.formatStr('class="ctxDay" value="{0}" index="{1}"' + this.weekday(dayOfWeek) + s, [utils.formatDate(d, this.dateFormat), i]),
                i.toString());

            dayOfWeek++;
        }

        // next month days
        for (i = dayOfWeek, j = 1; i <= 6; i++ , j++)
            html += View.getTag('div', 'class="ctxNextMonthDay"' + this.weekday(i), j);

        html += '</div></div>';
        return html;
    }

    protected handleClick(event: Event) {
        let el = this.getEventListElement(event);
        if (!el)
            return;
        this.updatingValue = true;
        //this.setValue(new Date(el.getAttribute('value')));
        this.value = new Date(el.getAttribute('value'));
        this.showDropdown(false);
        this.updatingValue = false;
    }
}






