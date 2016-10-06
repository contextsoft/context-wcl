/** 
 * Controls displaing list 
 **/
import * as utils from './utils';
import { resources } from './resources';
import { View } from './view';
import { InputView, ButtonView } from './std.controls';

resources.register('context.vcl',
    [
        'css/list.controls.css'
    ]
);

/**
 * Parent for list-like controls
 * TODO: when Array.isArray(items) Array.prototype extensions from utils.ts used, needs more convient data binding 
 **/
export abstract class Items extends View {
    /** Items List
     * e.g.
     * list.items = ['item 1', 'item 2', 'item 3'];
     */
    public items: any[] = [];

    /** Fires when list requires its items 
     *  Using this excludes use of items property
     *  e.g: 
     *  list.onGetItems = function(addItemCallback) {
     *     addItemCallback({text: 'value 1', value: '1'});
     *     addItemCallback({text: 'value 1', value: '2'});
     *  } 
    **/
    public onGetItems: (addItemCallback: (item) => void) => void;

    /** Fires on item select */
    public onSelectionChange: (index: number) => void;

    protected _selectedIndex;
    //protected filteredItems: any[];

    public get selectedIndex() {
        return this.getSelectedIndex();
    }
    public set selectedIndex(index) {
        this.setSelectedIndex(index);
    }


    public getSelectedIndex() {
        return this._selectedIndex;
    }

    public setSelectedIndex(index) {
        index = parseInt(index);
        if (this._selectedIndex !== index) {
            this.updateSelectedIndex(index);
            // invoke on selection change event
            if (this.onSelectionChange)
                this.onSelectionChange(index);
            //TODO: data binding
            // notify our targets
            //if (this.dataSources.selectedItem)
            //    this.dataSources.selectedItem.notifyDataLinks();
        }
    }

    public indexOfItem(itemValue, startWith = 0) {
        if (this.items)
            for (let i = startWith; i < this.items.getRowCount(); i++)
                if (this.getItemValue(this.items.getRow(i)) === itemValue)
                    return i;
        return -1;
    };

    public getItemValue(anItem) {
        if (anItem === 'undefined' || typeof anItem === "string")
            return anItem;
        else if (typeof anItem === "object") {
            if (anItem.value !== undefined)
                return anItem.value;
            if (anItem.text !== undefined)
                return anItem.text;
        }
        return anItem.toString();
    };

    /** Selected option by value */
    public get value() {
        return this.getValue();
    }

    public set value(value) {
        this.setValue(value);
    }

    public getValue(): any {
        this.updateItems();
        return this.getItemValue(this.items.getRow(this.selectedIndex));
    }

    /** Sets selected option by value */
    public setValue(value) {
        this.updateItems();
        let idx = this.indexOfItem(value);
        this.setSelectedIndex(idx);
        return value;
    }

    /** Returns value of selected option */
    public getSelectedItem(option?: string) {
        this.updateItems();
        let item = this.items.getRow(this.getSelectedIndex());
        if (option)
            return item[option];
        else
            return item;
    }

    public updateItems(forceUpdate = false) {
        if (this.onGetItems && (forceUpdate || this.items.length === 0)) {
            let _newItems = [];
            //TODO: data binding
            /*if (this.dataLinks.items)
                _newItems = this.dataLinks.items.getValue();
            else*/
            if (this.onGetItems)
                this.onGetItems(function (item) {
                    _newItems.push(item);
                });

            //if (this.sort && _newItems.sort)
            //    _newItems.sort(this.sort);

            this.items = _newItems;
            //this.filteredItems = [];
            //this.setSelectedIndex(Math.min(this.items.length - 1, this.selectedIndex));
        }
    }

    protected updateSelectedIndex(newIndex: number) {
        // implement in descendants to update selection
        this._selectedIndex = newIndex;
    }

    protected beforeRender() {
        if (this.onGetItems)
            this.items = null;
    }

}

/**
 * <select> wrapper
 **/
export class SelectView extends Items {
    constructor(parent: View, name?: string) {
        super(parent, name);
        this.tag = 'select';
        this.renderClientArea = false;
    }

    public getSelectedIndex() {
        if (this.element && this.visible)
            return this._selectedIndex = (<any>this.element).selectedIndex;
        else
            return this._selectedIndex;
    }

    public render(): string {
        return this.renderTag(this.internalRenderItems());
    }


    protected updateSelectedIndex(newIndex) {
        super.updateSelectedIndex(newIndex);
        if (this.element && this.visible)
            (<any>this.element).selectedIndex = this._selectedIndex;
    }

    protected internalRenderItems = function () {
        let html = '';
        this.updateItems();
        let selIdx = this.getSelectedIndex();

        for (let i = 0; i < this.items.getRowCount(); i++) {
            let comboItem = /*this._currentItem =*/ this.items.getRow(i);

            let attr = '';
            if (selIdx === i)
                attr += 'selected ';
            if (typeof comboItem === "string")
                html += '<option ' + attr + ' >' + utils.escapeHTML(comboItem) + '</option>';
            else {
                for (let a in comboItem)
                    if (comboItem.hasOwnProperty(a))
                        if (a !== 'text' && a !== 'selected')
                            attr += a + '="' + utils.escapeQuotes(comboItem[a]) + '" ';
                html += '<option ' + attr + '>' + comboItem.text.escapeHTML() + '</option>';
            }
        }
        return html;
    };

    protected afterUpdateView() {
        super.afterUpdateView();
        this.handleEvent('onchange', this.handleChange);
    }

    protected handleChange = function () {
        /*if (this.dataSources.selectedItem)
            this.dataSources.selectedItem.notifyDataLinks();*/

        if (this.element && this.visible)
            this.setSelectedIndex(this.element.selectedIndex);
    };
}

/**
 * Displays list
 **/
export class ListView extends Items {
    public onItemClick: (item) => void;

    /** Fires when item's text need */
    public onGetItemText: (item) => string;

    /** Appends all items properties as element attributes */
    public appendPropertiesToAttributes = false;

    protected selectedElement: HTMLElement;
    protected activeIndex = -1;
    protected activeElement: HTMLElement;
    protected renderedRowCount = 0;
    protected filteredItems: number[] = [];
    protected lastClickedElement: HTMLElement;
    protected maxItemsToRender;
    /** Is it needed to index children  */
    protected needsItemsIndex = true;
    /** Child element which children will be indexed, if not defined ListView itself will be used */
    protected elementToIndex: HTMLElement;


    public getValue(): any {
        // public get value of selected option 
        this.updateItems();
        let idx = 0;
        for (let i = 0; i < this.items.getRowCount(); i++) {
            if (this.filteredItems.indexOf(i) >= 0)
                continue;
            if (idx === this.getSelectedIndex())
                return this.getItemValue(this.items.getRow(i));
            idx++;
        }
    }

    public render() {
        return this.renderTag(this.internalRenderItems());
    }


    protected setElementSelected(element, selected, addClassName?) {
        addClassName = addClassName || 'selected';
        element.className = this.getSelectedCSSClass(element.className, addClassName, selected);
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        if (this.element && this.visible) {
            this.indexItems();
            //this.handleEvent('onclick', this.handleClick);
            this.handleEvent('onkeydown', this.handleKeyDown);
            this.handleEvent('onmousedown', this.handleMouseDown);
            this.handleEvent('ontouchstart', this.handleMouseDown);
            this.handleEvent('onmouseup', this.handleMouseUp);
            this.handleEvent('ontouchend', this.handleMouseUp);
        }
        //this.internalTriggerReady();
    }

    protected indexItems() {
        if (!this.needsItemsIndex)
            return;
        
        let children;

        if (this.elementToIndex)
            children = this.elementToIndex.children;
        else
            children = this.element.children;
        for (let i = 0; i < children.length; i++)
            children[i].setAttribute('index', i);

        this.renderedRowCount = children.length;

        if (this.renderedRowCount === 0)
            this._selectedIndex = -1;
        this.updateSelectedIndex(this.selectedIndex);
    }

    protected getActiveElement(event) {
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

    protected handleKeyDown(event) {
        if (event.eventPhase !== 3)
            return;
        let keyCode = ('which' in event) ? event.which : event.keyCode;
        switch (parseInt(keyCode)) {
            case 38:
                if (this.activeIndex > 0)
                    this.updateActiveIndex(this.activeIndex - 1);
                break;
            case 40:
                if (this.activeIndex < this.renderedRowCount - 1) {
                    if (this.activeIndex < 0)
                        this.updateActiveIndex(0);
                    else
                        this.updateActiveIndex(this.activeIndex + 1);
                }
                break;
        }
    }

    protected handleClick(event) {
        let listElement = this.getActiveElement(event);
        if (!listElement)
            return;
        let idx = listElement.getAttribute('index');

        this.setSelectedIndex(idx);

        this.setFocus();
    }

    protected handleMouseDown(event) {
        if (event instanceof MouseEvent && event.button > 0)
            return;
        let listElement = this.getActiveElement(event);
        if (this.lastClickedElement)
            this.setElementSelected(this.lastClickedElement, false, 'touched');
        if (!listElement)
            return;
        this.lastClickedElement = listElement;
        this.setElementSelected(this.lastClickedElement, true, 'touched');
        this.handleClick(event);
    }

    protected handleMouseUp(event) {
        if (event instanceof MouseEvent && event.button > 0)
            return;
        if (this.lastClickedElement)
            this.setElementSelected(this.lastClickedElement, false, 'touched');
        this.lastClickedElement = null;
        //this.handleClick(event);
    }

    protected updateActiveOrSelectedIndex(newIndex, obj: { selectedElement; selectedIndex; status }) {
        // unselect current element
        if (obj.selectedElement)
            this.setElementSelected(obj.selectedElement, false, obj.status);
        obj.selectedElement = null;

        obj.selectedIndex = newIndex;

        if (this.element && this.visible && obj.selectedIndex >= 0) {
            let recurseChildren = function (el) {
                let idx, e;
                for (let i = 0; i < el.children.length; i++) {
                    idx = el.children[i].getAttribute('index');
                    //log(el.children[i].getAttribute('class') + ': ' + idx);
                    if (idx == obj.selectedIndex)
                        return el.children[i];
                    else if (el.children[i].children !== 'undefined') {
                        e = recurseChildren(el.children[i]);
                        if (e !== null)
                            return e;
                    }
                }
                return null;
            };
            obj.selectedElement = recurseChildren(this.element);
            if (obj.selectedElement)
                this.setElementSelected(obj.selectedElement, true, obj.status);
        }
    }


    protected updateSelectedIndex(newIndex) {
        let obj = {
            selectedElement: this.selectedElement,
            selectedIndex: this.selectedIndex,
            status: 'selected'
        };

        this.updateActiveOrSelectedIndex(newIndex, obj);
        this.selectedElement = obj.selectedElement;
        this._selectedIndex = obj.selectedIndex;

        this.updateActiveIndex(this.selectedIndex);
    }

    protected updateActiveIndex = function (newIndex) {
        let obj = {
            selectedElement: this.activeElement,
            selectedIndex: this.activeIndex,
            status: 'active'
        };

        this.updateActiveOrSelectedIndex(newIndex, obj);
        this.activeElement = obj.selectedElement;
        this.activeIndex = obj.selectedIndex;

        return true;
    };

    protected internalRenderItems() {
        this.updateItems();
        let cnt = 0;
        let html = '';
        let itemsToRender = this.items.getRowCount();
        if (this.maxItemsToRender && this.maxItemsToRender < itemsToRender)
            itemsToRender = this.maxItemsToRender;
        for (let i = 0; i < this.items.getRowCount() && cnt < itemsToRender; i++) {
            if (this.filteredItems.indexOf(i) >= 0)
                continue;
            cnt++;
            let attr = '';
            if (this._selectedIndex === i)
                attr += 'class="active" ';

            let item: any = /*this._currentItem =*/ this.items.getRow(i);
            if (typeof item === "string")
                html += this.getItemHtml(item, i, attr, item);
            else {
                if (this.appendPropertiesToAttributes)
                    for (let a in item)
                        if (item.hasOwnProperty(a))
                            if (a !== 'text' && a !== 'selected' && typeof item[a] !== 'function' && typeof item[a] !== 'object')
                                attr += a + '="' + item[a] + '" ';
                let text;
                if (typeof this.onGetItemText === 'function')
                    text = this.onGetItemText(item);
                //TODO: data binding
                // else if (this.dataLinks.itemText)
                //     text = this.L(this.dataLinks.itemText.getValue());
                else
                    text = item.text;
                if (!utils.isDefined(text))
                    text = item.value;
                html += this.getItemHtml(item, i, attr, text);
            }
        }
        return html;
    }

    protected getItemHtml = function (item, index, attr, text) {
        let r = View.getTag('div', attr, text) + '\n';
        return r;
    };

    protected getSelectedCSSClass(classNames, className, selected) {
        let hasClassActive = false;
        if (classNames)
            hasClassActive = utils.indexOfWord(classNames, className) >= 0;

        if (selected) {
            if (!hasClassActive)
                classNames = classNames + ' ' + className;
        }
        else if (hasClassActive)
            classNames = classNames.replace(' ' + className, '');
        return classNames;
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

    protected input: InputView;
    protected inputBtn: ButtonView;
    protected listVisible = false;
    protected updatingValue = false;
    protected listId;

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.maxItemsToRender = 100;
        //this.childToIndex = 1;

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
            View.getTag('div', 'class="ctxInnerList" id="' + this.listId + '"', this.internalRenderItems()));
    }

    public setSelectedIndex(index) {
        super.setSelectedIndex(index);
        if (this.selectedIndex < 0)
            return;
        this.updatingValue = true;
        this.input.value = this.getValue();
        this.showDropdown(false);
        this.updatingValue = false;
    }

    public setValue(value) {
        super.setValue(value);
        this.input.value = value;
    }

    public getValue(): any {
        return super.getValue() || this.input.value;
    }

    protected afterUpdateView() {
        this.elementToIndex = document.getElementById(this.listId);
        super.afterUpdateView();
    }


    protected handleKeyDown(event) {
        super.handleKeyDown(event);
        if (event.eventPhase != 3)
            return;
        let keyCode = ('which' in event) ? event.which : event.keyCode;
        if (parseInt(keyCode) == 13 && this.activeIndex >= 0)
            this.setSelectedIndex(this.activeIndex);
    };

    protected onInputChange() {
        (<LookupView>this.parent).doInputChange(false);
    }

    protected doInputChange(forceShow: boolean) {
        if (this.updatingValue || !this.enabled)
            return;
        let item, value, pos;

        this.filteredItems = [];

        if (!forceShow) {
            let inputVal = this.input.value;
            if (!this.caseSensitive)
                inputVal = inputVal.toLowerCase();

            for (let i = 0; i < this.items.getRowCount(); i++) {
                item = this.items.getRow(i);

                if (typeof item === "string")
                    value = item;
                else if (utils.isDefined(item.value))
                    value = item.value;
                else if (utils.isDefined(item.text))
                    value = item.text;
                else
                    value = '';
                //TODO: data binding
                // else
                // {
                //     if (this.dataLinks.itemText)
                //         value = L(_this.dataLinks.itemText.getValue());
                //     else
                //         value = item.text;
                // }
                if (!this.caseSensitive)
                    value = value.toLowerCase();
                pos = value.indexOf(inputVal);
                if ((this.partialLookup && pos < 0) || (this.partialLookup && pos != 0))
                    this.filteredItems.push(i);
            }
        }
        let el = document.getElementById(this.listId);
        el.innerHTML = this.internalRenderItems();
        this.indexItems();
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
        if (!lookup.enabled) {
            event.preventDefault();
            return;
        }

        lookup.handleKeyDown(event);

        let keyCode = ('which' in event) ? event.which : event.keyCode;
        if (parseInt(keyCode) == 38 || parseInt(keyCode) == 40)
            event.preventDefault();
    }

    protected onInputBtnClick(event) {
        let lookup: LookupView = <LookupView>this.parent;
        if (!lookup.enabled)
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
        this.updateActiveIndex(-1);
        this.setSelectedIndex(-1);
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
    protected selectedDate: Date;

    protected input: InputView;
    protected inputBtn: ButtonView;
    protected prevMonthBtn: ButtonView;
    protected nextMonthBtn: ButtonView;

    constructor(parent: View, name?: string) {
        super(parent, name);

        this.showPrevNextMonthDays = true;
        this.needsItemsIndex = false;

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

    public getValue() {
        return this.selectedDate;
    }

    public setValue(value) {
        this.selectedDate = value;
        if (value)
            this.input.setValue(utils.formatDate(this.selectedDate, this.dateFormat));
        else
            this.input.setValue(value);
        this.updateCalendar(false);
    }

    public setSelectedIndex(index) {
        //super.setSelectedIndex(index);
        index = parseInt(index);
        if (this._selectedIndex !== index) {
            this.updateSelectedIndex(index);
            // invoke on selection change event
            if (this.onSelectionChange)
                this.onSelectionChange(index);
            //TODO: data binding
            // notify our targets
            //if (this.dataSources.selectedItem)
            //    this.dataSources.selectedItem.notifyDataLinks();
        }
        if (this.selectedIndex < 0)
            return;
        this.updatingValue = true;
        if (this.selectedElement)
            this.setValue(new Date(this.selectedElement.getAttribute('value')));
        else
            this.setValue(null);
        this.showDropdown(false);
        this.updatingValue = false;
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
        el.innerHTML = this.doInternalRenderItems(dontGoToSelectedDate);
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

    protected internalRenderItems() {
        return this.doInternalRenderItems();
    }

    protected doInternalRenderItems(dontGoToSelectedDate = false) {
        this.updateItems();
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
}

