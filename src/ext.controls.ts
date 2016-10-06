import * as utils from './utils';
import {resources} from './resources';
import {View} from "./view";
import {ListView} from './list.controls';
import {ButtonType, ButtonView, ContainerView, PanelView, TextView} from './std.controls';

resources.register('context.vcl',
    [
        'css/ext.controls.css'
    ]
);


/**
 * Tabs switch control
 */
export class TabsView extends ListView {
    protected dropDownButton: ButtonView;
    protected droppedDown = '';

    constructor(parent: View, name?: string) {
        super(parent, name);
        var _this = this;
        this.droppedDown = '';
        this.dropDownButton = new ButtonView(this, 'dropDownButton');
        this.dropDownButton.buttonType = ButtonType.toggle;
        this.dropDownButton.events.onclick = function () {
            _this.droppedDown = _this.droppedDown ? '' : 'droppedDown';
            _this.updateView();
        };
    }

    public render() {
        let html = View.getTag('div', 'class="tabs ' + this.droppedDown + '"', this.internalRenderItems());
        let selItm = this.getSelectedItem();
        if (selItm && selItm.text)
            html += View.getTag('div', 'class="caption" ', this.getSelectedItem().text);
        html = this.renderTag(html + this.dropDownButton.render());
        return html;
    }

    protected updateSelectedIndex(newIndex) {
        // unselect current element
        if (this.selectedElement)
            this.setElementSelected(this.selectedElement, false);
        this.selectedElement = null;

        this._selectedIndex = newIndex;

        // select new element
        if (this.element && this.visible && this.selectedIndex >= 0) {
            this.selectedElement = <HTMLElement>(<HTMLElement>this.element.firstChild).children[this.selectedIndex];
            if (this.selectedElement)
                this.setElementSelected(this.selectedElement, true);
            else
                this.selectedIndex = -1;
        }
        return true;
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        if (this.element && this.visible) {
            let children = (<HTMLElement>this.element.firstChild).children;
            this.renderedRowCount = children.length;
            for (let i = 0; i < children.length; i++)
                children[i].setAttribute('index', i.toString());
            this.updateSelectedIndex(this.selectedIndex);
            this.handleEvent('onclick', this.handleClick);
        }
        this.internalTriggerReady();
    }

    protected handleClick(event: Event) {
        let listElement = this.getActiveElement(event);
        if (!listElement)
            return;

        let idx = listElement.getAttribute('index');
        this.setSelectedIndex(idx);
    }
}

export interface IPageViewPage {
    text: string;
    value: View; 
}

/**
 * Tabs switch with pages inside
 */
export class PageView extends View {
    /** Pages list 
     * e.g.
     * pagesList.items = [{text: 'Page 1', value: myView1}, {text: 'Page 2', value: myView2}]
    */
    public get items(): IPageViewPage[] {
        return this.pagesSwitcher.items;
    }
    public set items(items: IPageViewPage[]) {
        this.pagesSwitcher.items = items;
    }

    /** Fires when PageView requires its pages 
     *  Using this excludes use of items property
     *  e.g: 
     *  pageView.onGetItems = function(addPageCallback) {
     *     addItemCallback({text: 'Page 1', value: someView}, {text: 'Page 2', value: someView2})
     *  } 
    **/
    public onGetItems: (addPageCallback: (item: IPageViewPage) => void) => void;

    protected pagesSwitcher: TabsView;
    protected pagesContainer: ContainerView;

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.renderClientArea = true;

        // Tabs switcher
        this.pagesSwitcher = new TabsView(this, 'pagesSwitcher');
        this.pagesSwitcher.onGetItems = this.onGetItems;

        // Container for pages
        this.pagesContainer = new ContainerView(this, 'pagesContainer');
        this.pagesContainer.animation = ContainerView.fadeInOut;
        var _this = this;
        this.pagesSwitcher.onSelectionChange = function(index) {
            _this.pagesContainer.showView(_this.pagesSwitcher.getValue(), ContainerView.directionForward);
        };
    }

    public setPageIndex(index) {
        this.pagesSwitcher.setSelectedIndex(index);
        this.pagesSwitcher.updateView();
    }

    public showPage(view) {
        for (let i = 0; i < this.pagesSwitcher.items.length; i++)
            if (this.pagesSwitcher.items[i].value = view) {
                this.setPageIndex(i);
                return;
            }
    }

    public updateItems(forceUpdate) {
        this.pagesSwitcher.updateItems(forceUpdate);
        this.updateView();
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

/**
 * Dialog control
 */
export class Dialog extends ModalView {
    //TODO: refactor this
    static buttonType = {
        ok: {
            id: 'ctxOkButton',
            text: 'OK',
            buttonType: ButtonType.primary,
            onClick: null
        },
        cancel: {
            id: 'ctxCancelButton',
            text: 'Cancel',
            buttonType: ButtonType.default,
            onClick: null
        }
    };

    /** Set/gets dialog's buttons set */
    public get buttons(): any[] {
        return this._buttons;
    }
    public set buttons(buttons: any[]) {
        if (buttons)
            this._buttons = buttons;
        this.buttonsContainer.children = [];
        for (let i = 0; i < this._buttons.length; i++) {
            let btn = new ButtonView(this.buttonsContainer, this.buttons[i].id);
            btn.text = this.buttons[i].buttonType.text;
            btn.buttonType = this.buttons[i].buttonType;
            (<any>btn).parentDialog = this;
            btn.events.onclick = function(event) {
                if (this.onClick)
                    this.onClick();
                else
                    this.parentDialog.hide();    
            };
        }
    }

    protected captionView: TextView;
    protected buttonsContainer: PanelView;
    protected _buttons = [];

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.captionView = new TextView(this.modalContainer, 'ctxCaption');
        this.buttonsContainer = new PanelView(this.modalContainer, 'ctxButtonsContainer');
        this.buttons = [Dialog.buttonType.ok];
    }

    //TODO: make static variant
    public showMessage(caption, onOkClick, onCancelClick) {
        let btn, buttons = [];
        this.captionView.text = caption;
        if (typeof onCancelClick === 'function') {
            btn = Dialog.buttonType.cancel;
            btn.onClick = onCancelClick;
            buttons.push(btn);
        }
        if (typeof onOkClick === 'function') {
            btn = Dialog.buttonType.cancel;
            btn.onClick = onOkClick;
            buttons.push(btn);
        }
        this.buttons = buttons;
        this.show();
    }
}


