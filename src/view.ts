import { utils } from './utils';
import { IVoidEvent, Component } from './component';
import { FieldDataLink, DataEventType } from './data';
import { IAction } from './actions';

/** Views's Align */
export class Align {
    public static left: IAlign = { id: 'left', style: 'position: absolute; left: 0; top: 0; bottom: 0' };
    public static top: IAlign = { id: 'top', style: 'position: absolute; left: 0; top: 0; right: 0' };
    public static right: IAlign = { id: 'right', style: 'position: absolute; top: 0; right: 0; bottom: 0' };
    public static bottom: IAlign = { id: 'bottom', style: 'position: absolute; left: 0; right: 0; bottom: 0' };
    public static client: IAlign = { id: 'client', style: 'position: absolute; left: 0; top: 0; right: 0; bottom: 0' };
}

export interface IAlign {
    id: string;
    style: string;
}

/* TODO:
   * IScroll???
   * Serialization
*/

/** 
 * Root for all controls 
 */
export abstract class View extends Component {
    /** Returns html <tag attr>innerHtml</tag>
     * leaveOpen means close or not tag
     */
    public static getTag(tag: string, attr: string, innerHtml: string, leaveOpen = false): string {
        let t = tag || 'div';
        let res = '<' + t + ' ' + (attr || '');
        res += (t === 'input') ? '/' : '';
        res += '>' + (innerHtml || '');
        res += (!leaveOpen) ? '</' + t + '>' : '';
        return res;
    }

    /** Available control's themes/styles  */
    public static themes = {
        // inherit in descendants
    };

    /** Global controls counter */
    protected static nextViewId = 1;

    // Standard events 

    //public onClick: IVoidEvent;

    /** Controls's id for DOM */
    public get id() {
        return this._id;
    }

    /** Control's html tag type e.g. div */
    public tag = 'div';

    /** Render or not view with client area
     *  the reason for this is to be able to layout child views this allows to use padding to create internal margins
     */
    public renderClientArea = false;
    /** Control's client area CSS style */
    public clientAreaStyle = '';
    /** Indicates is control rendered in client area of parent control or not */
    public renderInNonClientArea = false;

    /** Control's child controls */
    public children: View[] = [];

    /** DOM events wich receives view instance as "this" */
    public events: any = {};

    /** Control style, may be string or object with styles list */
    public style: any;

    // TODO: fix attributes always lowcase
    /** Object with additional control's DOM attributes */
    public attributes: any = [];

    /** Fires on show/hide */
    public onVisibleChanged: IVoidEvent;

    /** Fires after control was shown */
    public onReady: IVoidEvent;

    /** Type of control's align, see Align class */
    public align: IAlign;

    /** Align child controls or not, default false */
    public alignChildren = false;

    /** Control's icon url */
    public icon: string;

    /** Fires when text value needed */
    public onGetText: () => string;

    /** Escape or not html tags in text value */
    public doNotEscapeHtml = false;

    /** Control style/theme. Use ControlType.themes to assign */
    public theme: string = '';

    // protected isController = false; //TODO: used in serialization 
    protected clientAreaTag = 'div';
    protected clientAreaClass = 'ctx_view_client_area';
    protected hiddenViewClass = 'ctx_view_hidden';
    protected cssPrefix = 'Ctx';
    protected updating = 0;

    protected _id: string;
    protected _parent: View;
    protected _enabled = true;
    protected _additionalCSSClass: string;
    protected _bodyElement: HTMLElement;
    protected _bodyElementId: string;
    protected _visible = true;
    protected _element: HTMLElement;
    protected _text: any;
    protected _classPath: string;

    constructor(parent: View, name?: string, text?: string, initComponents = true) {
        super(name);
        this._id = 'w' + (View.nextViewId++);
        this._parent = parent;
        this._text = text;
        if (parent)
            parent.addView(this);
        if (initComponents)
            this.initComponents();
    }

    /** Gets/Set control's parent control */
    public get parent() {
        return this._parent;
    }
    public set parent(parent: View) {
        this.setParent(parent);
    }

    /** Enables or disabled controls */
    public get enabled() {
        return this._enabled;
    }
    public set enabled(value) {
        if (value !== this._enabled) {
            this._enabled = value;
            if (this.element && !this._action)
                this.updateView();
        }
    }
    public getEnabled(): boolean {
        return (this._action) ? this._action.enabled : this.enabled;
    }

    /** Sets/Gets CSS class in addition to generated one e.g. 'TextView View additionalCSSClass'  */
    public get additionalCSSClass() {
        let cl = '';
        if (this.theme)
            cl = this.theme;
        if (this._additionalCSSClass)
            cl += (cl ? ' ' : '') + this._additionalCSSClass;
        return cl;
    }
    public set additionalCSSClass(value) {
        if (this._additionalCSSClass !== value) {
            this._additionalCSSClass = value;
            if (this.getVisible() && this.element)
                this.element.className = this.getCSSClass();
        }
    }

    /** Cached DOM body element */
    public get bodyElement() {
        if (!this._bodyElement && this._bodyElementId)
            this._bodyElement = document.getElementById(this._bodyElementId);
        if (!this._bodyElement)
            this._bodyElement = document.getElementsByTagName('body')[0];
        return this._bodyElement;
    };

    /** Shows or hides control */
    public get visible() {
        return this._visible;
    }
    public set visible(value: boolean) {
        this.setVisible(value);
    }
    public getVisible(): boolean { return (this._action) ? this._action.visible : this.visible; }
    public setVisible(value) {
        if (value !== this._visible) {
            this._visible = value;
            if (!this._action) {
                this.updateView();
                this.visibleChanged();
            }
        }
    };

    /** Control's DOM element */
    public get element() {
        return this._element;
    }

    /** Sets/Gets content which will be rendered */
    public get text() { return this._text; }
    public set text(value) {
        if (value !== this._text) {
            this._text = value;
            if (this.element)
                this.updateView();
        }
    }
    public getText(): string {
        let result = '';
        if (typeof this.onGetText === 'function')
            result = this.onGetText();
        else if (this._text)
            result = this.L(this._text);
        else if (this.action && this.action.caption)
            result = this.L(this.action.caption);
        if (result && !this.doNotEscapeHtml)
            result = utils.escapeHTML(result);
        return result;
    }
    /** Class path for css, e.g. "CtxView CtxTextView" */
    public get classPath(): string {
        return this._classPath;
    }

    /** Control's Action  */
    protected _action: IAction;

    public onActionChanged(action: IAction) {
        this.updateView();
    }
    public get action() {
        return this._action;
    }
    public set action(value: IAction) {
        if (this._action !== value) {
            if (this._action)
                this._action.removeTarget(this);
            this._action = value;
            if (this._action)
                this._action.addTarget(this);
            this.updateView();
        }
    }
    /** Returns control's DOM element */
    public getElement() {
        return document.getElementById(this.id);
    }

    public getClientElementId() {
        return this.id + '_client';
    }

    /** Returns   */
    public getClientElement() {
        return document.getElementById(this.getClientElementId());
    }

    /** Hides and removes control from parent */
    public destroy() {
        this.hide();
        this.setParent(null);
    }

    /** Returns control's parent' */
    // public getParent() {
    //     return this._parent;
    // }

    /** Moves control to the new parent */
    public setParent(value) {
        if (value !== this.parent || (value == undefined && this.parent == undefined)) {
            if (this.parent) {
                this.parent.removeView(this);

                // destroy element if it exists within parent view
                if (this.element && this.parent.element) {
                    if (this.parent.getVisible()) {
                        // let parent redraw itself
                        this._element = null;
                        this.parent.updateView();
                    }
                    else {
                        // simply delete element from DOM
                        this.element.parentElement.removeChild(this.element);
                    }
                }
            }
            else if (this.element) {
                // if we belong to body, in this case the parent was null but the element exists
                this.bodyElement.removeChild(this.element);
            }

            this._element = null;
            this.resetChildrenElements();

            if (value)
                value.addView(this);

            this._parent = value;

            // update new parent to create it if it's visible - this will keep status quo
            if (this.getVisible()) {
                if (this.parent)
                    this.parent.updateView();
                else
                    this.updateView();
            }
        }
    }

    /** While control updating it won't be rerender */
    public beginUpdate() {
        this.updating++;
    }

    /** Ends control update and renders it */
    public endUpdate() {
        if (this.updating > 0) {
            this.updating--;
            if (!this.updating)
                this.updateView();
        }
    }

    /** Calls action and rerenders control */
    public update(action) {
        this.beginUpdate();
        if (typeof action === 'function') {
            try {
                action.call(this);
            } catch (e) {
                this.endUpdate();
                throw e;
            }
        }
        this.endUpdate();
    }

    /** Add view to control's children */
    public addView(view) {
        if (view && this.children.indexOf(view) < 0)
            this.children.push(view);
    }

    /** Removes view from control's children */
    public removeView(view) {
        let idx = this.children.indexOf(view);
        if (idx >= 0)
            this.children.splice(idx, 1);
    }

    /** Shows control */
    public show() {
        this.visible = true;
    }

    /** Hides control */
    public hide() {
        this.visible = false;
    }

    /** Rerenders control */
    public updateView() {
        // do nothing if we are in updating mode
        if (this.updating) return;

        // update view
        this._element = this.getElement();
        if (this.element) {
            this.beforeUpdateView();
            this.element.outerHTML = this.internalRender();
            this.internalAfterUpdateView();
        }
        else if (this.parent) {
            // update parent
            this._element = null;
            this.parent.internalInsertChild(this);
        }
        else if (!this.parent) {
            this.beforeUpdateView();
            // update body
            this._element = null;
            let e = document.createElement('div');
            this.bodyElement.appendChild(e);
            // it is important to render self while element == null
            // in this case we will not try to use element's style and attributes, otherwise we will
            // effectively erase them all
            e.outerHTML = this.internalRender();
            this._element = e;
            this.internalAfterUpdateView();
        }
    }

    /** Returns control's DOM element attribute */
    public getElementAttribute(name) {
        if (this.element && this.getVisible())
            return this.element.getAttribute(name);
        else return this.attributes[name];
    }

    /** Sets control's DOM element attribute */
    public setElementAttribute(name, value) {
        if (this.element && this.getVisible())
            this.element.setAttribute(name, value);
        return this.attributes[name] = value;
    }

    /** Returns control's or its action's icon url */
    public getIcon(): string {
        if (this.icon)
            return this.icon;
        else if (this.action && this.action.icon)
            return this.action.icon;
        else
            return '';
    }

    /** Return icon withing <img> tag */
    public renderIcon(): string {
        let icon = this.getIcon();
        if (icon)
            return '<img class="ctx_icon" src="' + icon + '">';
        else
            return '';
    }

    /** Return controls html without children */
    public renderTag(innerHtml: string, leaveOpen?: boolean): string {
        return View.getTag(this.tag, this.internalGetTagAttr(), innerHtml, leaveOpen);
    }

    /** Returns control's html with children */
    public render(): string {
        let html = this.renderSelf() + this.renderChildren();

        if (this.renderClientArea) {
            html = View.getTag(this.clientAreaTag, this.getClientAreaTagAttr(), html);
            // render non-client area children
            html += this.renderChildren(true);
        }

        return this.renderTag(html);
    }

    /** Returns control's html accouting it's visibility */
    public internalRender(): string {
        if (this.getVisible())
            return this.render();

        else
            return '<div class="' + this.hiddenViewClass + '" id=' + this.id + '></div>';
    }

    /** Aligns control's children when alignChildren = true */
    public realignChildren(offset?) {
        if (!this.alignChildren)
            return;

        offset = offset || {
            left: { left: 0, top: 0, bottom: 0 },
            top: { left: 0, top: 0, right: 0 },
            right: { top: 0, right: 0, bottom: 0 },
            bottom: { left: 0, right: 0, bottom: 0 },
            client: { left: 0, top: 0, right: 0, bottom: 0 }
        };

        function incOffset(id, value) {
            for (let o in offset)
                if (offset.hasOwnProperty(o) && offset[o].hasOwnProperty(id))
                    offset[o][id] += value;
        }

        let c, aid, el;
        for (let i = 0; i < this.children.length; i++) {
            c = this.children[i];
            aid = c.align ? c.align.id : Align.left.id;
            el = c.element;
            if (!el)
                continue;

            el.style['left'] = offset[aid].left + 'px';
            el.style['right'] = offset[aid].right + 'px';
            el.style['top'] = offset[aid].top + 'px';
            el.style['bottom'] = offset[aid].bottom + 'px';

            if (c.align) {
                if (aid === Align.left.id)
                    incOffset('left', el.offsetWidth);
                else if (aid === Align.right.id)
                    incOffset('right', el.offsetWidth);
                else if (aid === Align.top.id)
                    incOffset('top', el.offsetHeight);
                else if (aid === Align.bottom.id)
                    incOffset('bottom', el.offsetHeight);
            }

            if (c.scrollBar)
                c.updateScrollBar();

            if (c.alignChildren)
                this.children[i].realignChildren();
        }
    }

    /** Focuses control's DOM element */
    public setFocus() {
        if (this.element && this.getVisible())
            this.element.focus();
    }

    // public updateActionShortcuts(value) {
    //     // if this is not visible we need to disable shortcuts
    //     value = value && this.visible;
    //     for (let m in this)
    //         if (this.hasOwnProperty(m)) {
    //             let a = this[m];
    //             // actions for this view will be
    //             if (a && typeof a.setShortcutActive === "function")
    //                 a.setShortcutActive(value);
    //         }
    //     for (let i = 0; i < this.children.length; i++)
    //         this.children[i].updateActionShortcuts(value);
    // }

    protected initComponents() {
        // Implement in descendants to init internal components 
    }

    protected visibleChanged() {
        // this.updateActionShortcuts(true);
        if (this.onVisibleChanged)
            this.onVisibleChanged();
    }

    /** Resets all children elements to null */
    protected resetChildrenElements() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i]._element = null;
            this.children[i].resetChildrenElements();
        }
    }

    /** Assigns event handler to control's DOM-element in addition to control.events handlers */
    protected handleEvent(eventName: string, handler: any) {
        if (this.element && this.getVisible()) {
            if (handler)
                this.element[eventName] = (event) => {
                    handler.call(this, event);
                    if (this.events[eventName])
                        this.events[eventName].call(this, event, this);
                };
        }
    }

    // /** Returns topmost parent */
    // public getOwner() {
    //     // controller cannot have an owner, cause it's a topmost owner
    //     if (!this.isController && this.parent)
    //         return this.parent.getChildrenOwner();
    //     return null;
    // }

    // /** Who owns my children */
    // protected getChildrenOwner() {
    //     if (this.isController || !this.parent)
    //         return this;
    //     else
    //         return this.parent.getChildrenOwner();
    // }

    protected internalTriggerReady() {
        if (this.getVisible() && this.element && this.onReady)
            this.onReady();
    }

    protected beforeUpdateView() {
        // Override in descendants
    }

    protected internalAfterUpdateView() {
        this.afterUpdateView();
        // this.realignChildren();
        setTimeout(() => {
            this.realignChildren();
        }, 0);
        this.internalTriggerReady();
    }

    protected afterUpdateView() {
        // assign DOM element
        this._element = this.getElement();

        if (!this.getVisible() || !this.element) {
            // clear elements for all children
            this.resetChildrenElements();
            return;
        }

        // assign self to DOM element
        (<any>this.element).view = this;

        //  TODO: check this
        // assign style if it's an object
        if (typeof this.style === 'object') {
            for (let s in this.style)
                if (this.style.hasOwnProperty(s))
                    this.element.style[s] = this.style[s];
        }
        else if (this.style)
            this.element.style.cssText = this.style;

        // update all children
        for (let i = 0; i < this.children.length; i++)
            this.children[i].internalAfterUpdateView();

        // assign events
        if (typeof this.events === 'object')
            for (let e in this.events)
                if (this.events.hasOwnProperty(e))
                    this.element[e] = (event) => { this.events[e].call(this, event, this); };

        // handle on click if we have action assigned
        if (this.action)
            this.handleEvent('onclick', this.handleClick);
    }

    protected handleClick(event: Event) {
        if (this.getEnabled())
            return (this.action) ? this.action.execute(this, event) : false;
    }

    protected internalInsertChild(child) {
        this.updateView();
    }

    /** Returns control's CSS class */
    protected getCSSClass() {
        let c = this.name ? this.name + ' ' : '';
        if (!this._classPath) {
            let t: any = Object.getPrototypeOf(this), cp = '';
            while (t) {
                cp += (cp === '' ? '' : ' ') + this.cssPrefix + Component.getFunctionName(t.constructor);
                t = Object.getPrototypeOf(t);
                if (!t || !t.constructor || t.constructor === Component)
                    t = null;
            }
            this._classPath = cp;
        }

        c += this._classPath;
        let a = this.additionalCSSClass;
        if (a)
            c += ' ' + a;
        c += !this.getEnabled() ? ' ctx_disabled' : '';
        // c += this.float? ' float-' + this.float : '';
        // c += this.position? ' position-' + this.position : '';
        // c += this.scrollbars? ' scrollbars-' + this.scrollbars : '';
        // c += (this.scrollbars && this.scrollToUse) ? ' CtxScroll' : '';
        return c;
    }

    /** Returns all control element's attributes */
    protected internalGetTagAttr(): string {
        let e = this.element;
        let s = (e && e.className !== this.hiddenViewClass) ? e.style.cssText : (typeof this.style === 'string' ? this.style : '');
        let align = '';

        if (this.alignChildren)
            s += (s ? '; ' : '') + 'position: relative';

        if (this.align) {
            s += s ? ('; ' + this.align.style) : this.align.style;
            align = utils.formatStr(' ctx_align="{0}"', [this.align.id]);
        }

        if (typeof s === 'string' && s !== '')
            this.attributes.style = s;
        else
            delete this.attributes.style;

        return 'class="' + this.getCSSClass() + '" ' + this.getTagAttr() + (this.getEnabled() ? '' : 'ctx_disabled') + ' id="' + this.id + '"' + align;
    }

    /** Return control element's this.attrubutes */
    protected getTagAttr() {
        return utils.attributesToString(this.attributes);
    }

    protected getClientAreaTagAttr() {
        // this renders view with client area
        // the reason for this is to be able to layout child views
        // this allows to use padding to create internal margins
        let clientAreaStyle = (this.clientAreaStyle) ? ' style="' + this.clientAreaStyle + '" ' : '';
        return 'class="' + this.clientAreaClass + '" id="' + this.id + '_client"' + clientAreaStyle;
    }

    /** Returns control's content html */
    protected renderSelf(): string {
        return this.renderIcon() + this.getText();
    }

    /** Returns control's childs html 
     * nonClientArea indicates if client area or not rendered at the moment 
     */
    protected renderChildren(nonClientArea = false): string {
        let contentHtml = '';
        for (let i = 0; i < this.children.length; i++)
            if (nonClientArea === this.children[i].renderInNonClientArea)
                contentHtml += this.children[i].internalRender();
        return contentHtml;
    }
}

/** 
 * Control with a value 
 */
export abstract class ValueView extends View {
    /** Fires on value change */
    public onChange: (newValue) => void;

    /** FieldDataLink used as value store */
    public data = new FieldDataLink((eventType: DataEventType, field: any): void => {
        if (field && this.data.dataField && field == this.data.dataField)
            this.setValue((this.data).value || '');
    });

    protected _value: any;

    /** Gets/sets controls's value */
    public get value() {
        return this.getValue();
    }
    public set value(_value) {
        this.setValue(_value);
        // update data link
        this.data.value = this._value;
        if (this.onChange)
            this.onChange(_value);
    }
    public getValue() {
        if (this.element && this.getVisible())
            this._value = (<any>this.element).value;
        return this._value;
    }
    public setValue(_value) {
        if (this._value !== _value) {
            this._value = _value;
            if (this.element && this.getVisible())
                (<any>this.element).value = this._value;
        }
    }
    protected beforeUpdateView() {
        super.beforeUpdateView();
        this.getValue(); // storing control's value            
    }
    protected afterUpdateView() {
        super.afterUpdateView();
        if (this._element && typeof this._value !== 'undefined')
            (<any>this._element).value = this._value;
    }
}
