var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './utils', './resources', './view', './std.controls'], function (require, exports, utils_1, resources_1, view_1, std_controls_1) {
    "use strict";
    resources_1.resources.register('context-wcl', [
        'css/list.controls.css'
    ]);
    /**
     * Parent for list-like controls
     * TODO: when Array.isArray(items) Array.prototype extensions from utils.ts used, needs more convient data binding
     **/
    var Items = (function (_super) {
        __extends(Items, _super);
        function Items() {
            _super.apply(this, arguments);
            /** Items List
             * e.g.
             * list.items = ['item 1', 'item 2', 'item 3'];
             */
            this.items = [];
        }
        Object.defineProperty(Items.prototype, "selectedIndex", {
            //protected filteredItems: any[];
            get: function () {
                return this.getSelectedIndex();
            },
            set: function (index) {
                this.setSelectedIndex(index);
            },
            enumerable: true,
            configurable: true
        });
        Items.prototype.getSelectedIndex = function () {
            return this._selectedIndex;
        };
        Items.prototype.setSelectedIndex = function (index) {
            index = parseInt(index);
            if (this._selectedIndex !== index) {
                this.updateSelectedIndex(index);
                // invoke on selection change event
                if (this.onSelectionChange)
                    this.onSelectionChange(index);
            }
        };
        Items.prototype.indexOfItem = function (itemValue, startWith) {
            if (startWith === void 0) { startWith = 0; }
            if (this.items)
                for (var i = startWith; i < this.items.getRowCount(); i++)
                    if (this.getItemValue(this.items.getRow(i)) === itemValue)
                        return i;
            return -1;
        };
        ;
        Items.prototype.getItemValue = function (anItem) {
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
        ;
        Object.defineProperty(Items.prototype, "value", {
            /** Selected option by value */
            get: function () {
                return this.getValue();
            },
            set: function (value) {
                this.setValue(value);
            },
            enumerable: true,
            configurable: true
        });
        Items.prototype.getValue = function () {
            this.updateItems();
            return this.getItemValue(this.items.getRow(this.selectedIndex));
        };
        /** Sets selected option by value */
        Items.prototype.setValue = function (value) {
            this.updateItems();
            var idx = this.indexOfItem(value);
            this.setSelectedIndex(idx);
            return value;
        };
        /** Returns value of selected option */
        Items.prototype.getSelectedItem = function (option) {
            this.updateItems();
            var item = this.items.getRow(this.getSelectedIndex());
            if (option)
                return item[option];
            else
                return item;
        };
        Items.prototype.updateItems = function (forceUpdate) {
            if (forceUpdate === void 0) { forceUpdate = false; }
            if (this.onGetItems && (forceUpdate || this.items.length === 0)) {
                var _newItems_1 = [];
                //TODO: data binding
                /*if (this.dataLinks.items)
                    _newItems = this.dataLinks.items.getValue();
                else*/
                if (this.onGetItems)
                    this.onGetItems(function (item) {
                        _newItems_1.push(item);
                    });
                //if (this.sort && _newItems.sort)
                //    _newItems.sort(this.sort);
                this.items = _newItems_1;
            }
        };
        Items.prototype.updateSelectedIndex = function (newIndex) {
            // implement in descendants to update selection
            this._selectedIndex = newIndex;
        };
        Items.prototype.beforeRender = function () {
            if (this.onGetItems)
                this.items = null;
        };
        return Items;
    }(view_1.View));
    exports.Items = Items;
    /**
     * <select> wrapper
     **/
    var SelectView = (function (_super) {
        __extends(SelectView, _super);
        function SelectView(parent, name) {
            _super.call(this, parent, name);
            this.internalRenderItems = function () {
                var html = '';
                this.updateItems();
                var selIdx = this.getSelectedIndex();
                for (var i = 0; i < this.items.getRowCount(); i++) {
                    var comboItem = this.items.getRow(i);
                    var attr = '';
                    if (selIdx === i)
                        attr += 'selected ';
                    if (typeof comboItem === "string")
                        html += '<option ' + attr + ' >' + utils_1.utils.escapeHTML(comboItem) + '</option>';
                    else {
                        for (var a in comboItem)
                            if (comboItem.hasOwnProperty(a))
                                if (a !== 'text' && a !== 'selected')
                                    attr += a + '="' + utils_1.utils.escapeQuotes(comboItem[a]) + '" ';
                        html += '<option ' + attr + '>' + comboItem.text.escapeHTML() + '</option>';
                    }
                }
                return html;
            };
            this.handleChange = function () {
                /*if (this.dataSources.selectedItem)
                    this.dataSources.selectedItem.notifyDataLinks();*/
                if (this.element && this.visible)
                    this.setSelectedIndex(this.element.selectedIndex);
            };
            this.tag = 'select';
            this.renderClientArea = false;
        }
        SelectView.prototype.getSelectedIndex = function () {
            if (this.element && this.visible)
                return this._selectedIndex = this.element.selectedIndex;
            else
                return this._selectedIndex;
        };
        SelectView.prototype.render = function () {
            return this.renderTag(this.internalRenderItems());
        };
        SelectView.prototype.updateSelectedIndex = function (newIndex) {
            _super.prototype.updateSelectedIndex.call(this, newIndex);
            if (this.element && this.visible)
                this.element.selectedIndex = this._selectedIndex;
        };
        SelectView.prototype.afterUpdateView = function () {
            _super.prototype.afterUpdateView.call(this);
            this.handleEvent('onchange', this.handleChange);
        };
        return SelectView;
    }(Items));
    exports.SelectView = SelectView;
    /**
     * Displays list
     **/
    var ListView = (function (_super) {
        __extends(ListView, _super);
        function ListView() {
            _super.apply(this, arguments);
            /** Appends all items properties as element attributes */
            this.appendPropertiesToAttributes = false;
            this.activeIndex = -1;
            this.renderedRowCount = 0;
            this.filteredItems = [];
            /** Is it needed to index children  */
            this.needsItemsIndex = true;
            this.updateActiveIndex = function (newIndex) {
                var obj = {
                    selectedElement: this.activeElement,
                    selectedIndex: this.activeIndex,
                    status: 'active'
                };
                this.updateActiveOrSelectedIndex(newIndex, obj);
                this.activeElement = obj.selectedElement;
                this.activeIndex = obj.selectedIndex;
                return true;
            };
            this.getItemHtml = function (item, index, attr, text) {
                var r = view_1.View.getTag('div', attr, text) + '\n';
                return r;
            };
        }
        ListView.prototype.getValue = function () {
            // public get value of selected option 
            this.updateItems();
            var idx = 0;
            for (var i = 0; i < this.items.getRowCount(); i++) {
                if (this.filteredItems.indexOf(i) >= 0)
                    continue;
                if (idx === this.getSelectedIndex())
                    return this.getItemValue(this.items.getRow(i));
                idx++;
            }
        };
        ListView.prototype.render = function () {
            return this.renderTag(this.internalRenderItems());
        };
        ListView.prototype.setElementSelected = function (element, selected, addClassName) {
            addClassName = addClassName || 'selected';
            element.className = this.getSelectedCSSClass(element.className, addClassName, selected);
        };
        ListView.prototype.afterUpdateView = function () {
            _super.prototype.afterUpdateView.call(this);
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
        };
        ListView.prototype.indexItems = function () {
            if (!this.needsItemsIndex)
                return;
            var children;
            if (this.elementToIndex)
                children = this.elementToIndex.children;
            else
                children = this.element.children;
            for (var i = 0; i < children.length; i++)
                children[i].setAttribute('index', i);
            this.renderedRowCount = children.length;
            if (this.renderedRowCount === 0)
                this._selectedIndex = -1;
            this.updateSelectedIndex(this.selectedIndex);
        };
        ListView.prototype.getActiveElement = function (event) {
            // active element is the one being currently touched
            var listElement = event.toElement || event.target;
            if (!listElement)
                return null;
            var idx = listElement.getAttribute('index');
            while (listElement && !idx) {
                listElement = listElement.parentElement;
                if (!listElement)
                    continue;
                idx = listElement.getAttribute('index');
            }
            if (!idx)
                return null;
            return listElement;
        };
        ListView.prototype.handleKeyDown = function (event) {
            if (event.eventPhase !== 3)
                return;
            var keyCode = ('which' in event) ? event.which : event.keyCode;
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
        };
        ListView.prototype.handleClick = function (event) {
            var listElement = this.getActiveElement(event);
            if (!listElement)
                return;
            var idx = listElement.getAttribute('index');
            this.setSelectedIndex(idx);
            this.setFocus();
        };
        ListView.prototype.handleMouseDown = function (event) {
            if (event instanceof MouseEvent && event.button > 0)
                return;
            var listElement = this.getActiveElement(event);
            if (this.lastClickedElement)
                this.setElementSelected(this.lastClickedElement, false, 'touched');
            if (!listElement)
                return;
            this.lastClickedElement = listElement;
            this.setElementSelected(this.lastClickedElement, true, 'touched');
            this.handleClick(event);
        };
        ListView.prototype.handleMouseUp = function (event) {
            if (event instanceof MouseEvent && event.button > 0)
                return;
            if (this.lastClickedElement)
                this.setElementSelected(this.lastClickedElement, false, 'touched');
            this.lastClickedElement = null;
            //this.handleClick(event);
        };
        ListView.prototype.updateActiveOrSelectedIndex = function (newIndex, obj) {
            // unselect current element
            if (obj.selectedElement)
                this.setElementSelected(obj.selectedElement, false, obj.status);
            obj.selectedElement = null;
            obj.selectedIndex = newIndex;
            if (this.element && this.visible && obj.selectedIndex >= 0) {
                var recurseChildren_1 = function (el) {
                    var idx, e;
                    for (var i = 0; i < el.children.length; i++) {
                        idx = el.children[i].getAttribute('index');
                        //log(el.children[i].getAttribute('class') + ': ' + idx);
                        if (idx == obj.selectedIndex)
                            return el.children[i];
                        else if (el.children[i].children !== 'undefined') {
                            e = recurseChildren_1(el.children[i]);
                            if (e !== null)
                                return e;
                        }
                    }
                    return null;
                };
                obj.selectedElement = recurseChildren_1(this.element);
                if (obj.selectedElement)
                    this.setElementSelected(obj.selectedElement, true, obj.status);
            }
        };
        ListView.prototype.updateSelectedIndex = function (newIndex) {
            var obj = {
                selectedElement: this.selectedElement,
                selectedIndex: this.selectedIndex,
                status: 'selected'
            };
            this.updateActiveOrSelectedIndex(newIndex, obj);
            this.selectedElement = obj.selectedElement;
            this._selectedIndex = obj.selectedIndex;
            this.updateActiveIndex(this.selectedIndex);
        };
        ListView.prototype.internalRenderItems = function () {
            this.updateItems();
            var cnt = 0;
            var html = '';
            var itemsToRender = this.items.getRowCount();
            if (this.maxItemsToRender && this.maxItemsToRender < itemsToRender)
                itemsToRender = this.maxItemsToRender;
            for (var i = 0; i < this.items.getRowCount() && cnt < itemsToRender; i++) {
                if (this.filteredItems.indexOf(i) >= 0)
                    continue;
                cnt++;
                var attr = '';
                if (this._selectedIndex === i)
                    attr += 'class="active" ';
                var item = this.items.getRow(i);
                if (typeof item === "string")
                    html += this.getItemHtml(item, i, attr, item);
                else {
                    if (this.appendPropertiesToAttributes)
                        for (var a in item)
                            if (item.hasOwnProperty(a))
                                if (a !== 'text' && a !== 'selected' && typeof item[a] !== 'function' && typeof item[a] !== 'object')
                                    attr += a + '="' + item[a] + '" ';
                    var text = void 0;
                    if (typeof this.onGetItemText === 'function')
                        text = this.onGetItemText(item);
                    else
                        text = item.text;
                    if (!utils_1.utils.isDefined(text))
                        text = item.value;
                    html += this.getItemHtml(item, i, attr, text);
                }
            }
            return html;
        };
        ListView.prototype.getSelectedCSSClass = function (classNames, className, selected) {
            var hasClassActive = false;
            if (classNames)
                hasClassActive = utils_1.utils.indexOfWord(classNames, className) >= 0;
            if (selected) {
                if (!hasClassActive)
                    classNames = classNames + ' ' + className;
            }
            else if (hasClassActive)
                classNames = classNames.replace(' ' + className, '');
            return classNames;
        };
        return ListView;
    }(Items));
    exports.ListView = ListView;
    /**
     * Lookup control
     */
    var LookupView = (function (_super) {
        __extends(LookupView, _super);
        function LookupView(parent, name) {
            _super.call(this, parent, name);
            /** Lookup at value beginning or anywhere, default true */
            this.partialLookup = true;
            /** Case-sensitive lookup or not, default false */
            this.caseSensitive = false;
            /** Max items count that will be shown in the lookup list */
            this.maxItemsToRender = 100;
            this.listVisible = false;
            this.updatingValue = false;
            this.maxItemsToRender = 100;
            //this.childToIndex = 1;
            this.input = new std_controls_1.InputView(this, 'ctxInternalInput');
            this.input.onChange = this.onInputChange;
            this.input.events.onblur = this.onInputBlur;
            this.input.events.onkeypress = this.onInputKeyPress;
            this.inputBtn = new std_controls_1.ButtonView(this, 'ctxInternalInputButton');
            this.inputBtn.text = '<span class="ctx_icon-caret"</span>';
            this.inputBtn.doNotEscapeHtml = true;
            this.inputBtn.events.onclick = this.onInputBtnClick;
        }
        LookupView.prototype.render = function () {
            this.listId = 'ctxLookupView' + LookupView.listIdCounter++;
            return this.renderTag('<div class="ctxInputBlock">' + this.input.internalRender() +
                '<div class="ctxInputBtnGroup">' + this.inputBtn.internalRender() + '</div></div>' +
                view_1.View.getTag('div', 'class="ctxInnerList" id="' + this.listId + '"', this.internalRenderItems()));
        };
        LookupView.prototype.setSelectedIndex = function (index) {
            _super.prototype.setSelectedIndex.call(this, index);
            if (this.selectedIndex < 0)
                return;
            this.updatingValue = true;
            this.input.value = this.getValue();
            this.showDropdown(false);
            this.updatingValue = false;
        };
        LookupView.prototype.setValue = function (value) {
            _super.prototype.setValue.call(this, value);
            this.input.value = value;
        };
        LookupView.prototype.getValue = function () {
            return _super.prototype.getValue.call(this) || this.input.value;
        };
        LookupView.prototype.afterUpdateView = function () {
            this.elementToIndex = document.getElementById(this.listId);
            _super.prototype.afterUpdateView.call(this);
        };
        LookupView.prototype.handleKeyDown = function (event) {
            _super.prototype.handleKeyDown.call(this, event);
            if (event.eventPhase != 3)
                return;
            var keyCode = ('which' in event) ? event.which : event.keyCode;
            if (parseInt(keyCode) == 13 && this.activeIndex >= 0)
                this.setSelectedIndex(this.activeIndex);
        };
        ;
        LookupView.prototype.onInputChange = function () {
            this.parent.doInputChange(false);
        };
        LookupView.prototype.doInputChange = function (forceShow) {
            if (this.updatingValue || !this.enabled)
                return;
            var item, value, pos;
            this.filteredItems = [];
            if (!forceShow) {
                var inputVal = this.input.value;
                if (!this.caseSensitive)
                    inputVal = inputVal.toLowerCase();
                for (var i = 0; i < this.items.getRowCount(); i++) {
                    item = this.items.getRow(i);
                    if (typeof item === "string")
                        value = item;
                    else if (utils_1.utils.isDefined(item.value))
                        value = item.value;
                    else if (utils_1.utils.isDefined(item.text))
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
            var el = document.getElementById(this.listId);
            el.innerHTML = this.internalRenderItems();
            this.indexItems();
            this.showDropdown(el.innerHTML.length > 0);
        };
        LookupView.prototype.onInputBlur = function (event) {
            var lookup = this.parent;
            if (event.relatedTarget && event.relatedTarget.className.indexOf('ctxInternalInputButton') >= 0)
                return;
            lookup.showDropdown(false);
        };
        LookupView.prototype.onInputKeyPress = function (event) {
            var lookup = this.parent;
            if (!lookup.enabled) {
                event.preventDefault();
                return;
            }
            lookup.handleKeyDown(event);
            var keyCode = ('which' in event) ? event.which : event.keyCode;
            if (parseInt(keyCode) == 38 || parseInt(keyCode) == 40)
                event.preventDefault();
        };
        LookupView.prototype.onInputBtnClick = function (event) {
            var lookup = this.parent;
            if (!lookup.enabled)
                return;
            if (!lookup.listVisible)
                lookup.doInputChange(true);
            else
                lookup.showDropdown(false);
            lookup.input.setFocus();
        };
        LookupView.prototype.showDropdown = function (show) {
            var el = document.getElementById(this.listId);
            if (show)
                el.style.visibility = 'visible';
            else
                el.style.visibility = 'hidden';
            this.listVisible = show;
            this.updateActiveIndex(-1);
            this.setSelectedIndex(-1);
        };
        LookupView.listIdCounter = 1;
        return LookupView;
    }(ListView));
    exports.LookupView = LookupView;
    /**
     *  Date select control
     */
    var DatePicker = (function (_super) {
        __extends(DatePicker, _super);
        function DatePicker(parent, name) {
            _super.call(this, parent, name);
            /** First day of week, 0 - sunday, 1 - monday, default 0 */
            this.firstDayOfWeek = 0;
            /** Date format (as in utils.formatDate function), default locale dependent */
            this.dateFormat = '';
            /** Highlight or not weekends, default true */
            this.highlightWeekends = true;
            this.monthToShow = new Date;
            this.showPrevNextMonthDays = true;
            this.needsItemsIndex = false;
            // edit control
            this.input = new std_controls_1.InputView(this, 'ctxInternalInput');
            this.input.attributes.readonly = true;
            this.input.events.onblur = this.onInputBlur;
            this.input.events.onkeypress = this.onInputKeyPress;
            // show calendar buttom
            this.inputBtn = new std_controls_1.ButtonView(this, 'ctxInternalInputButton');
            this.inputBtn.text = '<span class="ctx_icon-caret"</span>';
            this.inputBtn.doNotEscapeHtml = true;
            this.inputBtn.events.onclick = this.onInputBtnClick;
            // prev month button
            this.prevMonthBtn = new std_controls_1.ButtonView(this, 'ctxPrevMonthBtn');
            this.prevMonthBtn.attributes.type = 'chevronLeft';
            this.prevMonthBtn.events.onclick = this.onPrevMonthBtnClick;
            // next month button
            this.nextMonthBtn = new std_controls_1.ButtonView(this, 'ctxNextMonthBtn');
            this.nextMonthBtn.attributes.type = 'chevronRight';
            this.nextMonthBtn.events.onclick = this.onNextMonthBtnClick;
        }
        Object.defineProperty(DatePicker.prototype, "showPrevNextMonthDays", {
            /** Show or not prev and next month days, default true */
            get: function () {
                return this.attributes.showPrevNextMonthDay;
            },
            set: function (value) {
                if (this.attributes.showPrevNextMonthDay && this.attributes.showPrevNextMonthDay === value)
                    return;
                this.attributes.showPrevNextMonthDay = value;
                if (this.element && this.visible)
                    this.updateView();
            },
            enumerable: true,
            configurable: true
        });
        DatePicker.prototype.getValue = function () {
            return this.selectedDate;
        };
        DatePicker.prototype.setValue = function (value) {
            this.selectedDate = value;
            if (value)
                this.input.setValue(utils_1.utils.formatDate(this.selectedDate, this.dateFormat));
            else
                this.input.setValue(value);
            this.updateCalendar(false);
        };
        DatePicker.prototype.setSelectedIndex = function (index) {
            //super.setSelectedIndex(index);
            index = parseInt(index);
            if (this._selectedIndex !== index) {
                this.updateSelectedIndex(index);
                // invoke on selection change event
                if (this.onSelectionChange)
                    this.onSelectionChange(index);
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
        };
        DatePicker.prototype.onInputBlur = function (event) {
            if (event.relatedTarget && (event.relatedTarget.className.indexOf('internalInputButton') >= 0
                || event.relatedTarget.className.indexOf('ctxPrevMonthBtn') >= 0
                || event.relatedTarget.className.indexOf('ctxNextMonthBtn') >= 0))
                return;
            this.parent.showDropdown(false);
        };
        DatePicker.prototype.onInputKeyPress = function (event) {
            this.handleKeyDown(event);
            var keyCode = ('which' in event) ? event.which : event.keyCode;
            if (parseInt(keyCode) == 38 || parseInt(keyCode) == 40)
                event.preventDefault();
        };
        DatePicker.prototype.onInputBtnClick = function (event) {
            var picker = this.parent;
            if (!picker.listVisible)
                picker.showDropdown(true);
            else
                picker.showDropdown(false);
            picker.input.setFocus();
        };
        DatePicker.prototype.onPrevMonthBtnClick = function (event) {
            var picker = this.parent;
            picker.monthToShow.setMonth(picker.monthToShow.getMonth() - 1);
            picker.updateCalendar(true);
        };
        DatePicker.prototype.onNextMonthBtnClick = function (event) {
            var picker = this.parent;
            picker.monthToShow.setMonth(picker.monthToShow.getMonth() + 1);
            picker.updateCalendar(true);
        };
        DatePicker.prototype.updateCalendar = function (dontGoToSelectedDate) {
            if (!this.listId)
                return;
            var el = document.getElementById(this.listId);
            el.innerHTML = this.doInternalRenderItems(dontGoToSelectedDate);
            this.prevMonthBtn.updateView();
            this.nextMonthBtn.updateView();
            this.input.setFocus();
        };
        DatePicker.prototype.weekday = function (dayOfWeek) {
            if (this.firstDayOfWeek == 0)
                return dayOfWeek == 0 || dayOfWeek == 6 ? ' weekend' : '';
            else
                return dayOfWeek == 5 || dayOfWeek == 6 ? ' weekend' : '';
        };
        DatePicker.prototype.internalRenderItems = function () {
            return this.doInternalRenderItems();
        };
        DatePicker.prototype.doInternalRenderItems = function (dontGoToSelectedDate) {
            if (dontGoToSelectedDate === void 0) { dontGoToSelectedDate = false; }
            this.updateItems();
            var html = '', i, j, d;
            var monthToShow = this.monthToShow;
            if (!dontGoToSelectedDate && this.getValue())
                monthToShow = this.getValue();
            this.monthToShow.setDate(1);
            var daysInMonth = new Date(monthToShow.getFullYear(), monthToShow.getMonth() + 1, 0).getDate();
            var dayOfWeek = new Date(monthToShow.getFullYear(), monthToShow.getMonth(), 1).getDay() - this.firstDayOfWeek;
            var daysInPrevMonth = new Date(monthToShow.getFullYear(), monthToShow.getMonth(), 0).getDate();
            var weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            // month name
            html += '<div class="ctxMonthNameTable">\n<div class="ctxRow">\n';
            html += view_1.View.getTag('div', 'class="ctxMonthBtnContainer"', this.prevMonthBtn.internalRender());
            html += view_1.View.getTag('div', 'class="ctxMonthName"', utils_1.utils.formatStr('<b>{0}</b> {1}', [this.L(months[monthToShow.getMonth()]), monthToShow.getFullYear()]));
            html += view_1.View.getTag('div', 'class="ctxMonthBtnContainer"', this.nextMonthBtn.internalRender());
            html += '</div>\n</div>\n';
            // week days names
            j = this.firstDayOfWeek;
            html += '<div class="ctxDaysTable"><div class="ctxRow">\n';
            for (i = 0; i <= 6; i++) {
                html += view_1.View.getTag('div', 'class="ctxWeekDay"' + this.weekday(i), this.L(weekDays[j]));
                j++;
                if (j > 6)
                    j = 0;
            }
            html += '</div><div class="ctxRow">\n';
            // prev month days
            daysInPrevMonth = daysInPrevMonth - dayOfWeek;
            for (i = 0; i < dayOfWeek; i++) {
                daysInPrevMonth++;
                html += view_1.View.getTag('div', 'class="ctxPrevMonthDay"' + this.weekday(i), daysInPrevMonth.toString());
            }
            // days
            var s, today = new Date();
            for (i = 1; i <= daysInMonth; i++) {
                if (dayOfWeek > 6) {
                    html += '\n</div>\n<div class="ctxRow">\n';
                    dayOfWeek = 0;
                }
                d = new Date(monthToShow.getFullYear(), monthToShow.getMonth(), i);
                s = d.toDateString() == today.toDateString() ? ' today' : '';
                if (this.getValue() && this.getValue().toDateString() == d.toDateString())
                    s += ' selected';
                html += view_1.View.getTag('div', utils_1.utils.formatStr('class="ctxDay" value="{0}" index="{1}"' + this.weekday(dayOfWeek) + s, [utils_1.utils.formatDate(d, this.dateFormat), i]), i.toString());
                dayOfWeek++;
            }
            // next month days
            for (i = dayOfWeek, j = 1; i <= 6; i++, j++)
                html += view_1.View.getTag('div', 'class="ctxNextMonthDay"' + this.weekday(i), j);
            html += '</div></div>';
            return html;
        };
        return DatePicker;
    }(LookupView));
    exports.DatePicker = DatePicker;
});
//# sourceMappingURL=list.controls.js.map