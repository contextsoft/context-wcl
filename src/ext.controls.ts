import { resources } from './resources';
// import { utils } from './utils';
import { IVoidEvent } from './component';
import { View } from './view';
import { ListView } from './list.controls';
import { ButtonView, ContainerView, PanelView, TextView } from './std.controls';
import { IRecord, LookupDataLink, RecordSource, RecordSetSource, DataEventType } from './data';

resources.register('context-wcl',
    [
        '../css/ext.controls.css',
        '../css/animations.css'
    ]
);

/**
 * Tabs switch control
 */
export class TabsView extends ListView {
    public static themes = {
        flat: 'flat'
    };

    protected static _listIdCounter = 0;
    protected static _captionIdCounter = 0;
    protected listId;
    protected captionId;
    protected dropDownButton: ButtonView;
    protected droppedDown = false;

    /** Sets tabs */
    public set tabs(tabs: string[]) {
        let tabsSource = new RecordSetSource();
        let tabsRecs = [];
        for (let i = 0; i < tabs.length; i++) {
            tabsRecs.push({
                value: i,
                text: tabs[i]
            });
        }
        tabsSource.records = tabsRecs;
        this.listData.dataSource = tabsSource;

        let valueSource = new RecordSource();
        valueSource.current = {
            value: ''
        };
        this.data.dataSource = valueSource;
        this.data.dataField = 'value';
        if (this.data.dataSource.current)
            this.value = 0;
    }

    /** Set/Gets current tab index */
    public get tabIndex(): number {
        return this.listData.dataSource.currentIndex;
    }
    public set tabIndex(index: number) {
        this.listData.dataSource.currentIndex = index;
    }

    constructor(parent: View, name?: string) {
        super(parent, name);

        this.listData = new LookupDataLink((eventType: DataEventType, data: any): void => {
            if (eventType === DataEventType.CursorMoved)
                this.updateSelectedRecord(document.getElementById(this.listId).children);
            else
                this.updateView();
        });
        this.listData.displayField = 'text';
        this.listData.keyField = 'value';

        this.dropDownButton = new ButtonView(this, 'dropDownButton');
        this.dropDownButton.theme = ButtonView.themes.toggle;
        this.dropDownButton.events.onclick = () => {
            this.dropDownButtonClick();
        };
    }

    protected dropDownButtonClick() {
        this.showDropDown(!this.droppedDown);
    }

    protected showDropDown(show) {
        if (show !== this.droppedDown) {
            this.droppedDown = !this.droppedDown;
            let el = document.getElementById(this.listId);
            if (this.droppedDown)
                el.setAttribute('dropped_down', 'true');
            else
                el.removeAttribute('dropped_down');
        }
    }

    public render() {
        this.listId = 'ctxTabsView' + TabsView._listIdCounter++;
        this.captionId = 'ctxTabsViewCaption' + TabsView._captionIdCounter++;
        let html = View.getTag('div', 'class="tabs" ' + (this.droppedDown ? 'dropped_down="true"' : '') + '" id="' + this.listId + '"', this.renderItems());
        let currRec = this.listData.dataSource.current;
        if (currRec)
            html += View.getTag('div', 'class="caption" id="' + this.captionId + '"', this.listData.getDisplayValue(currRec));
        html = this.renderTag(html + this.dropDownButton.render());
        return html;
    }

    protected getRecordHtml(record: IRecord, index: number, selected: boolean) {
        if (record.hasOwnProperty('visible') && !record['visible'])
            return '';
        return super.getRecordHtml(record, index, selected);
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        if (this.dropDownButton.element)
            this.dropDownButton.element.addEventListener('focusout', (event: FocusEvent) => {
                if (this.droppedDown)
                    this.showDropDown(false);
                this.updateView();
            });
    }
}

// PageView

interface IPageViewPage {
    text: string;
    view: View;
    visible?: boolean;
}

/**
 * Tabs switch with pages inside
 */
export class PageView extends View {
    public static themes = {
        flat: 'flat'
    };

    public set theme(value) {
        if (this.pagesSwitcher)
            this.pagesSwitcher.theme = value;
    }

    /** Sets pages 
     * e.g.
     * pagesList.pages = [{text: 'Page 1', view: myView1}, {text: 'Page 2', view: myView2}]
     */
    public set pages(pages: IPageViewPage[]) {
        let pagesSource = new RecordSetSource();
        pagesSource.records = pages;
        this.pagesSwitcher.listData.dataSource = pagesSource;

        let valueSource = new RecordSource();
        valueSource.current = {
            value: ''
        };
        this.pagesSwitcher.data.dataSource = valueSource;
        this.pagesSwitcher.data.dataField = 'value';
        if (this.pagesSwitcher.listData.dataSource.current) {
            let page: any = this.pagesSwitcher.listData.dataSource.current;
            this.pagesSwitcher.value = page.view;
        }
    }

    protected pagesSwitcher: TabsView;
    protected pagesContainer: ContainerView;

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.renderClientArea = true;

        // Tabs switcher
        this.pagesSwitcher = new TabsView(this, 'ctxPagesSwitcher');
        this.pagesSwitcher.listData.displayField = 'text';
        this.pagesSwitcher.listData.keyField = 'view';
        this.pagesSwitcher.onChange = (page) => {
            this.pagesContainer.showView(this.pagesSwitcher.getValue(), ContainerView.directionForward);
        };

        // Container for pages
        this.pagesContainer = new ContainerView(this, 'ctxPagesContainer');
        this.pagesContainer.animation = null;
    }

    public setPageIndex(index) {
        this.pagesSwitcher.listData.dataSource.currentIndex = index;
    }

    public showPage(view) {
        let rec: IPageViewPage;
        for (let i = 0; i < this.pagesSwitcher.listData.dataSource.recordCount(); i++) {
            rec = <IPageViewPage>(this.pagesSwitcher.listData.dataSource.getRecord(i));
            if (rec.view === view) {
                this.setPageIndex(i);
                return;
            }
        }
    }

    protected renderChildren(nonClientArea = false): string {
        let contentHtml = '';
        for (let i = 0; i < this.children.length; i++)
            if (nonClientArea === this.children[i].renderInNonClientArea)
                if (this.children[i] === this.pagesSwitcher || this.children[i] === this.pagesContainer)
                    contentHtml += this.children[i].internalRender();
        return contentHtml;
    }

}

/** 
 * View displayed at top of all controls 
 */
export class ModalView extends View {
    public modalContainer: PanelView;

    constructor(name?: string, initComponents = true) {
        super(null, name, false);
        this.visible = false;
        this.modalContainer = new PanelView(this, 'cxtModalContainer');
        if (initComponents)
            this.initComponents();
    }
}

/** 
 * View displayed at top of all controls that has caption and close button 
 */
export class DialogView extends ModalView {
    /** Sets/Gets dialog caption */
    public get caption() {
        return this._caption.text;
    }
    public set caption(caption: string) {
        this._caption.text = caption;
    }
    /** Fires when user closes dialog */
    public onClose: IVoidEvent;

    protected _caption: TextView;

    constructor(name?: string, caption?: string) {
        super(name, false);
        let captionContainer = new PanelView(this.modalContainer, 'ctxCaptionContainer');
        this._caption = new TextView(captionContainer, 'ctxCaption');
        this._caption.text = caption;

        let closeBtn = new TextView(captionContainer, 'ctxClose');
        closeBtn.events.onclick = () => {
            this.close();
        };

        this.initComponents();
    }

    public close() {
        this.hide();
        if (this.onClose)
            this.onClose();
    }
}

// MessageBox control

interface IMessageBoxButton {
    id?: string;
    text: string;
    buttonTheme?: string;
    onClick?: (dialog: MessageBox) => void;
}

/**
 * MessageBox control
 */
export class MessageBox extends ModalView {
    protected destroyOnHide = false;

    public static buttonOk(): IMessageBoxButton {
        return {
            id: 'ctxOkButton',
            text: 'OK',
            buttonTheme: ButtonView.themes.primary,
            onClick: null
        };
    }
    public static buttonCancel(): IMessageBoxButton {
        return {
            id: 'ctxCancelButton',
            text: 'Cancel',
            buttonTheme: ButtonView.themes.default,
            onClick: null
        };
    }

    public static showOkCancelMessage(caption: string, onOkClick: (dialog: MessageBox) => void, onCancelClick?: (dialog: MessageBox) => void) {
        let dlg = new MessageBox(null, true);
        let btn, buttons = [];
        dlg.captionView.text = caption;
        if (typeof onCancelClick === 'function') {
            btn = MessageBox.buttonCancel();
            btn.onClick = onCancelClick;
            buttons.push(btn);
        }
        if (typeof onOkClick === 'function') {
            btn = MessageBox.buttonOk();
            btn.onClick = onOkClick;
            buttons.push(btn);
        }
        dlg.buttons = buttons;
        dlg.show();
    }

    public static showMessage(caption: string, buttons?: IMessageBoxButton[]) {
        let dlg = new MessageBox(null, true);
        if (!buttons || buttons.length === 0)
            buttons = [MessageBox.buttonOk()];
        dlg.buttons = buttons;
        dlg.captionView.text = caption;
        dlg.show();
    }

    /** Set/gets dialog's buttons set */
    public get buttons(): IMessageBoxButton[] {
        return this._buttons;
    }
    public set buttons(buttons: IMessageBoxButton[]) {
        if (buttons)
            this._buttons = buttons;

        for (let i = 0; i < this.buttonsContainer.children.length; i++)
            this.buttonsContainer.children[i].destroy();
        // this.buttonsContainer.children = [];

        for (let i = 0; i < this._buttons.length; i++) {
            let btn = new ButtonView(this.buttonsContainer, this._buttons[i].id);
            btn.text = this._buttons[i].text;
            btn.theme = this._buttons[i].buttonTheme;
            (<any>btn).onClick = this._buttons[i].onClick;
            (<any>btn).parentDialog = this;
            btn.events.onclick = (event, sender) => {
                if (sender.onClick)
                    sender.onClick(this);
                if (this.destroyOnHide)
                    this.destroy();
            };
        }
    }

    protected captionView: TextView;
    protected buttonsContainer: PanelView;
    protected _buttons: IMessageBoxButton[] = [];

    constructor(name?: string, destroyOnHide = false) {
        super(name);
        this.visible = false;
        this.destroyOnHide = destroyOnHide;
        this.captionView = new TextView(this.modalContainer, 'ctxCaption');
        this.captionView.doNotEscapeHtml = true;
        this.buttonsContainer = new PanelView(this.modalContainer, 'ctxButtonsContainer');
        this.buttons = [MessageBox.buttonOk()];
    }

}

// PopupMenu

export interface IMenuItem {
    icon?: string;
    text: string;
    disabled?: boolean;
    caption?: boolean;
    onclick?: (item: IMenuItem) => void;
    data?: any;
}

/** Popup Menu showed under selected target control 
 *  e.g. popupMenu.popup(someButton) 
 */
export class PopupMenu extends ListView {
    public static separator = '-';
    public static get targetHorPositionType() {
        return { left: 'left', right: 'right'/*, auto: 'auto'*/ };
    };
    public static get targetVerPositionType() {
        return { under: 'under', above: 'above'/*, auto: 'auto'*/ };
    };
    /** Fires when menu closed */
    public onClose: IVoidEvent;

    protected target: View;
    protected targetHorPosition: string;
    protected targetVerPosition: string;
    protected fakeEdit: View;
    protected offsetX: number;
    protected offsetY: number;

    /** Sets menu 
     * e.g.
     * poupMenu.items = [{text: 'Item 1', onclick: clickHandler1}, {text: 'Item 2', onclick: clickHandler2}]
     */
    public set menu(items: IMenuItem[]) {
        let menuSource = new RecordSetSource();
        menuSource.records = items;
        this.listData.dataSource = menuSource;
        this.listData.displayField = 'text';
        this.listData.keyField = 'text';
    }

    constructor(name?: string) {
        super(null, name);
        this.visible = false;
        this.attributes.tabindex = 0;
    }

    /** Popups menu under/above target control */
    public popup(target: View, targetHorPosition = PopupMenu.targetHorPositionType.left, targetVerPosition = PopupMenu.targetVerPositionType.under, offsetX = 0, offsetY = 0) {
        this.target = target;
        this.targetHorPosition = targetHorPosition;
        this.targetVerPosition = targetVerPosition;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        if (!this.visible)
            this.visible = true;
        else
            this.close();
    }

    public close() {
        if (this.onClose)
            this.onClose();
        this.hide();
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        if (!this.element || !this.target || !this.target.element)
            return;

        let rec = this.target.element.getBoundingClientRect();

        if (this.targetVerPosition === PopupMenu.targetVerPositionType.under)
            this.element.style.top = rec.top + rec.height + this.offsetY + 'px';
        else
            this.element.style.top = rec.top - rec.height + this.offsetY + 'px';

        if (this.targetHorPosition === PopupMenu.targetHorPositionType.left)
            this.element.style.left = rec.left + this.offsetX + 'px';
        else
            this.element.style.left = rec.left + rec.width - this.element.offsetWidth + this.offsetX + 'px';

        this.element.addEventListener('focusout', (event) => { this.onFocusOut(); });
        this.element.focus();
    }

    protected onFocusOut() {
        this.close();
    }

    protected handleClick(event) {
        let idx = this.getEventElementIndex(event);
        if (idx < 0)
            return;
        let itm: any = this.listData.dataSource.getRecord(idx);
        if (!itm.disabled && itm.onclick)
            itm.onclick(itm);
        this.close();
    }

    protected getRecordCSSClass(record) {
        let val = '';
        if (this.listData.keyField && record[this.listData.keyField])
            val = record[this.listData.keyField].toString();
        if (val === PopupMenu.separator)
            return 'ctx_separator';
        else if (<IMenuItem>record.caption)
            return 'ctx_caption';
        else if (<IMenuItem>record.disabled)
            return 'ctx_disabled';
        else
            return '';

    }

    protected getRecordDisplayText(record) {
        let t = this.listData.getDisplayValue(record);
        if (t === PopupMenu.separator)
            t = '';
        return t;
    }
}

/** Navigation panel */
export class NavPanel extends PanelView {
    public static workModes() {
        return { closable: 'closable', collapsable: 'collapsable' };
    }

    protected _workMode: string;
    public get workMode() {
        return this._workMode;
    }
    public set workMode(value) {
        if (value == this._workMode)
            return;
        this._workMode = value;
        this._closeButton.visible = this._workMode == NavPanel.workModes().closable;
    }

    /** Caption control */
    public get caption(): TextView {
        return this._caption;
    }
    /** Close button */
    public get closeButton(): TextView {
        return this._closeButton;
    }
    /** Fires when user closes panel */
    public onClose: IVoidEvent;

    public get closed() {
        return this._closed;
    }

    protected _caption: TextView;
    protected _closeButton: TextView;
    protected _closed: boolean;


    constructor(parent: View, name?: string, caption?: string, workMode?: string) {
        super(parent, name);
        this.renderClientArea = true;

        let captionContainer = new PanelView(this, 'ctxCaptionContainer');
        this._caption = new TextView(captionContainer, 'ctxCaption');
        this._caption.text = caption;

        this._closeButton = new TextView(captionContainer, 'ctxClose');
        this._closeButton.events.onclick = () => {
            this.close();
        };

        if (workMode)
            this.workMode = workMode;
        else
            this.workMode = NavPanel.workModes().closable;
    }

    public toggle() {
        if (this._closed)
            this.visible = true;
        else
            this.close();
    }

    public close() {
        this._closed = true;
        if (this.workMode == NavPanel.workModes().closable)
            this.hide();
        else {
            this.element.setAttribute('collapsed', '');
        }
        if (this.onClose)
            this.onClose();
    }

    public setVisible(value) {
        super.setVisible(value);
        if (this._visible)
            if (this._closed) {
                this._closed = false;
                this.element.removeAttribute('collapsed');
            }
    };
}
