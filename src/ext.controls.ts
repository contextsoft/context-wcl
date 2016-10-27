//import {utils} from './utils';
import { resources } from './resources';
import { View } from "./view";
import { ListView } from './list.controls';
import { ButtonView, ContainerView, PanelView, TextView, InputView } from './std.controls';
import { LookupDataLink, RecordSource, RecordSetSource, EventType } from './data';

resources.register('context-wcl',
    [
        'css/ext.controls.css'
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
    protected _listId;
    protected _dropDownButton: ButtonView;
    protected _droppedDown = '';

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

        this.listData = new LookupDataLink((eventType: EventType, data: any): void => {
            if (eventType == EventType.CursorMoved)
                this.updateSelectedRecord(document.getElementById(this._listId).children);
            else
                this.updateView();
        });
        this.listData.displayField = 'text';
        this.listData.keyField = 'value';

        var __this = this;
        this._droppedDown = '';
        this._dropDownButton = new ButtonView(this, 'dropDownButton');
        this._dropDownButton.theme = ButtonView.themes.toggle;
        this._dropDownButton.events.onclick = function () {
            __this._droppedDown = __this._droppedDown ? '' : 'droppedDown';
            __this.updateView();
        };
    }

    public render() {
        this._listId = 'ctxTabsView' + TabsView._listIdCounter++;
        let html = View.getTag('div', 'class="tabs ' + this._droppedDown + '" id="' + this._listId + '"', this.renderItems());
        let currRec = this.listData.dataSource.current;
        if (currRec)
            html += View.getTag('div', 'class="caption" ', this.listData.getDisplayValue(currRec));
        html = this.renderTag(html + this._dropDownButton.render());
        return html;
    }
}

// PageView

interface IPageViewPage {
    text: string;
    view: View;
}

/**
 * Tabs switch with pages inside
 */
export class PageView extends View {
    /** Sets pages 
     * e.g.
     * pagesList.pages = [{text: 'Page 1', value: myView1}, {text: 'Page 2', value: myView2}]
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
        this.pagesSwitcher = new TabsView(this, 'pagesSwitcher');
        this.pagesSwitcher.listData.displayField = 'text';
        this.pagesSwitcher.listData.keyField = 'view';
        var _this = this;
        this.pagesSwitcher.onChange = function (page) {
            _this.pagesContainer.showView(_this.pagesSwitcher.getValue(), ContainerView.directionForward);
        };

        // Container for pages
        this.pagesContainer = new ContainerView(this, 'pagesContainer');
        this.pagesContainer.animation = null;
    }

    public setPageIndex(index) {
        this.pagesSwitcher.listData.dataSource.currentIndex = index;
    }

    public showPage(view) {
        let rec: IPageViewPage;
        for (let i = 0; i < this.pagesSwitcher.listData.dataSource.recordCount(); i++) {
            rec = <IPageViewPage>(this.pagesSwitcher.listData.dataSource.getRecord(i));
            if (rec.view = view) {
                this.setPageIndex(i);
                return;
            }
        }
    }

    protected renderChildren(nonClientArea = false): string {
        let contentHtml = '';
        for (let i = 0; i < this.children.length; i++)
            if (nonClientArea == this.children[i].renderInNonClientArea)
                if (this.children[i] == this.pagesSwitcher || this.children[i] == this.pagesContainer)
                    contentHtml += this.children[i].internalRender();
        return contentHtml;
    }

}

/** 
 * View displayed at top of all controls 
 **/
export class ModalView extends View {
    public modalContainer: PanelView;

    constructor(parent: View, name?: string) {
        super(parent, name);
        this._visible = false;
        this.renderClientArea = false;
        this.modalContainer = new PanelView(this, 'cxtModalContainer');
    }
}

interface IDialogButton {
    id?: string;
    text: string;
    buttonTheme?: string;
    onClick?: (dialog: Dialog) => void;
}

/**
 * Dialog control
 */
export class Dialog extends ModalView {
    public static buttonOk(): IDialogButton {
        return {
            id: 'ctxOkButton',
            text: 'OK',
            buttonTheme: ButtonView.themes.primary,
            onClick: null
        };
    }
    public static buttonCancel(): IDialogButton {
        return {
            id: 'ctxCancelButton',
            text: 'Cancel',
            buttonTheme: ButtonView.themes.default,
            onClick: null
        };
    }

    public static showOkCancelDialog(caption: string, onOkClick: (dialog: Dialog) => void, onCancelClick?: (dialog: Dialog) => void) {
        let dlg = new Dialog();
        let btn, buttons = [];
        dlg.captionView.text = caption;
        if (typeof onCancelClick === 'function') {
            btn = Dialog.buttonCancel();
            btn.onClick = onCancelClick;
            buttons.push(btn);
        }
        if (typeof onOkClick === 'function') {
            btn = Dialog.buttonOk();
            btn.onClick = onOkClick;
            buttons.push(btn);
        }
        dlg.buttons = buttons;
        dlg.show();
    }

    public static showDialog(caption: string, buttons?: IDialogButton[]) {
        let dlg = new Dialog();
        if (!buttons || buttons.length == 0)
            buttons = [Dialog.buttonOk()];
        dlg.buttons = buttons;
        dlg.captionView.text = caption;
        dlg.show();
    }


    /** Set/gets dialog's buttons set */
    public get buttons(): IDialogButton[] {
        return this._buttons;
    }
    public set buttons(buttons: IDialogButton[]) {
        if (buttons)
            this._buttons = buttons;

        for (let i = 0; i < this.buttonsContainer.children.length; i++)
            this.buttonsContainer.children[i].destroy();
        //this.buttonsContainer.children = [];

        for (let i = 0; i < this._buttons.length; i++) {
            let btn = new ButtonView(this.buttonsContainer, this._buttons[i].id);
            btn.text = this._buttons[i].text;
            btn.theme = this._buttons[i].buttonTheme;
            (<any>btn).onClick = this._buttons[i].onClick;
            (<any>btn).parentDialog = this;
            btn.events.onclick = function (event) {
                if (this.onClick)
                    this.onClick(this.parentDialog);
                else
                    this.parentDialog.hide();
            };
        }
    }

    protected captionView: TextView;
    protected buttonsContainer: PanelView;
    protected _buttons: IDialogButton[] = [];

    constructor(name?: string) {
        super(null, name);
        this.captionView = new TextView(this.modalContainer, 'ctxCaption');
        this.buttonsContainer = new PanelView(this.modalContainer, 'ctxButtonsContainer');
        this.buttons = [Dialog.buttonOk()];
    }

}

// MenuView

interface IMenuItem {
    icon?: string;
    text: string;
    onclick?: (item: IMenuItem) => void;
}

/** Popup Menu showed under selected target control 
 *  e.g. popupMenu.popup(someButton) 
 * */
export class PopupMenu extends ListView {
    protected target: View;
    protected fakeEdit: View;

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

    public popup(target: View) {
        this.target = target;
        this.visible = !this.visible;
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        if (!this.element || !this.target || !this.target.element)
            return;
        this.element.style.top = (this.target.element.offsetTop + this.target.element.offsetHeight) + 'px';
        this.element.style.left = this.target.element.offsetLeft.toString() + 'px';
        this.element.addEventListener('focusout', (event) => { this.onFocusOut(); });

        this.element.focus();
    }

    protected onFocusOut() {
        this.hide();
    }

    protected handleClick(event) {
        let idx = this.getEventElementIndex(event);
        if (idx < 0)
            return;
        let itm: any = this.listData.dataSource.getRecord(idx);
        if (itm.onclick)
            itm.onclick(itm);
        this.hide();
    }
}




