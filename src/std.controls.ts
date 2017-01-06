/** 
 * Standart Controls 
 */
import { utils } from './utils';
import { resources } from './resources';
import { Align, IAlign, View, ValueView } from './view';
import { CSSTransition } from './transitions';
// import { FieldDataLink, EventType } from './data';

resources.register('context-wcl',
    [
        '../css/std.controls.css'
    ]
);

/** 
 * Topmost control containg other controls, used for layouting 
 */
export class ScreenView extends View {
    constructor(name?: string) {
        super(null, name);
        this._visible = false;
        this.renderClientArea = true;
        // this.isController = true; //TODO: used in serizalization, needs refactoring
    }
}

/** 
 * <div> wrapper 
 */
export class TextView extends View {
    constructor(parent: View, name?: string) {
        super(parent, name);
        this.renderClientArea = false;
    }
}

/**
 * <header> wrapper
 */
export class HeaderView extends View {
    public static themes = {
        fixed: 'fixed'
    };

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.renderClientArea = false;
        this.tag = 'header';
        this.theme = HeaderView.themes.fixed;
    }
}

/**
 * <footer> wrapper
 */
export class FooterView extends View {
    public static themes = {
        fixed: 'fixed'
    };

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.renderClientArea = false;
        this.tag = 'footer';
        this.theme = FooterView.themes.fixed;
    }
}

/** 
 * <div> wrapper used for layouting purposes 
 */
export class PanelView extends View {
    constructor(parent: View, name?: string) {
        super(parent, name);
    }
}

/**
 * Container with header and border
 */
export class GroupBoxView extends View {
    public static themes = {
        drawBorder: 'border'
    };

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.renderClientArea = true;
        this.theme = GroupBoxView.themes.drawBorder;
    }

    /** Sets/Gets GroupBox header */
    public get caption() {
        return this.getText();
    }
    public set caption(value) {
        this.text = value;
    }

    public render() {
        let html = this.renderChildren();
        if (this.renderClientArea) {
            html = View.getTag('div', this.getClientAreaTagAttr(), html);
            // render non-client area: text before and children after
            html = (this._text ? View.getTag('div', 'class=header', this.renderSelf()) : this.renderSelf())
                + html + this.renderChildren(true);
        }
        return View.getTag(this.tag, this.internalGetTagAttr(), html);
    }
}

/**
 * <button> wrapper
 */
export class ButtonView extends View {
    public static themes = {
        default: 'default',
        primary: 'primary',
        success: 'success',
        info: 'info',
        warning: 'warning',
        danger: 'danger',
        toggle: 'toggle',
        chevronLeft: 'chevronLeft',
        chevronRight: 'chevronRight'
    };

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.renderClientArea = true;
        this.tag = 'button';
    }

    public getTagAttr() {
        let c = super.getTagAttr();
        if (this.theme)
            c += ' type="' + this.theme + '"';
        return c;
    }

    public renderSelf() {
        if (this.theme === ButtonView.themes.toggle)
            return '<span class="ctx_icon-bar"></span><span class="ctx_icon-bar"></span><span class="ctx_icon-bar"></span>';
        else
            return this.renderIcon() + this.getText();
    }
}

/**
 * <form> wrapper
 */
export class FormView extends View {
    constructor(parent: View, name?: string) {
        super(parent, name);
        this.tag = 'form';
        this.renderClientArea = false;
    }
}

/**
 * <input> wrapper
 */
export class InputView extends ValueView {
    /** Indicates will keypress fire onChange or not, default true */
    public keyPressFireOnChange = true;

    protected changingDelay = 200;
    protected keyPressTimeoutInstance;

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.tag = 'input';
        this.renderClientArea = false;
    }

    protected beforeUpdateView() {
        super.beforeUpdateView();
        this.getValue(); // storing control's value            
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        this.handleEvent('onchange', this.handleChange);
        this.handleEvent('onkeydown', this.handleKeyDown);
    }

    protected handleKeyDown(event: Event) {
        if (this.keyPressTimeoutInstance)
            clearTimeout(this.keyPressTimeoutInstance);

        if (this.keyPressFireOnChange)
            this.keyPressTimeoutInstance = setTimeout(() => {
                if (this.element && this.visible && this._value !== (<any>this.element).value) {
                    this.handleChange();
                }
            }, this.changingDelay);
    }

    protected handleChange() {
        // retrieve value from element
        this.getValue();
        // update data link
        this.data.value = this._value;
        // invoke event if assigned
        if (typeof this.onChange === 'function')
            this.onChange(this._value);
    }
}

/**
 * <texarea> wrapper
 */
export class TextAreaView extends InputView {
    protected _element: HTMLTextAreaElement;

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.tag = 'textarea';
        this.renderClientArea = false;
    }

    public getValue(): string {
        let r = super.getValue() || '';
        r = r.replace(/\n/g, '\r\n');
        return r;
    }

    public render(): string {
        let t = this.value || '';
        t = utils.escapeHTML(t);
        t = t.replace(/\r/g, '');
        return '<textarea ' + this.internalGetTagAttr() + ' >' + t + '</textarea>';
    }

    // doesn't work
    // public doAutoResize() {
    //     if (!this.element)
    //         return;
    //     let el = (<HTMLTextAreaElement>this.element);
    //     let a = this.getValue().split('\n');
    //     let b = 1;
    //     for (let x = 0; x < a.length; x++) {
    //         if (a[x].length >= el.cols) 
    //             b += Math.floor(a[x].length / el.cols);
    //     }
    //     b += a.length;
    //     if (b > el.rows)
    //         el.rows = b;
    // }
}

interface ICSSTransitionType {
    transition: (direction) => string[];
    duration: number;
    properties: string[];
    transitionTo?: (direction) => string[];
    propertiesTo?: string[];
    durationTo?: number;
}

/**
 * Container that allows to display one of several views (as pages) and 
 * switch between them using transitions and transformations.
 */
export class ContainerView extends View {
    public static directionForward = 1;
    public static directionBack = -1;

    public static animSlideHorizontal(): ICSSTransitionType {
        return {
            transition: ContainerView.cssSlideHorizontal,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
            // we may additionally specify To transition
            // transitionTo: ContainerView.cssSlideHorizontal
            // propertiesTo: ['opacity', '-webkit-transform'],
        };
    }
    public static animSlideVertical(): ICSSTransitionType {
        return {
            transition: ContainerView.cssSlideVertical,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
    }
    public static animFadeInOut(): ICSSTransitionType {
        return {
            transition: ContainerView.cssFadeInOut,
            properties: ['opacity'],
            duration: 0.5
        };
    }
    public static animRotateY(): ICSSTransitionType {
        return {
            transition: ContainerView.cssRotateY,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
    }
    public static animRotateX(): ICSSTransitionType {
        return {
            transition: ContainerView.cssRotateX,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
    }

    protected static cssSlideHorizontal(direction) {
        return (direction === 0) ? ['1', 'translate3d(0,0,0)'] : ['0', 'translate3d(' + (direction * 100) + '%,0,0)'];
    }
    protected static cssSlideVertical(direction) {
        return (direction === 0) ? ['1', 'translate3d(0,0,0)'] : ['0', 'translate3d(0, ' + (direction * 100) + '%,0)'];
    }
    protected static cssRotateX(direction) {
        return (direction === 0) ? ['1', 'rotateX(0deg)'] : ['0', 'rotateX(' + (direction * 180) + 'deg)'];
    }
    protected static cssRotateY(direction) {
        return (direction === 0) ? ['1', 'rotateY(0deg)'] : ['0', 'rotateY(' + (direction * 180) + 'deg)'];
    }
    protected static cssFadeInOut(direction) {
        return (direction === 0) ? ['1'] : ['0'];
    }

    public animation: ICSSTransitionType;
    public beforeHideView: (view: View, direction: number) => boolean;
    public beforeShowView: (view: View, direction: number) => boolean;
    public afterShowView: (view: View, direction: number) => void;
    public afterHideView: (view: View, direction: number) => void;

    protected currentView: View;
    protected priorView: View;

    constructor(parent, name?) {
        super(parent, name);
        this.currentView = null;
        this.animation = ContainerView.animSlideHorizontal();
    }

    public updateView(view?: View, direction?: number) {
        if (!view) return;

        // restore opacity - MB: this should not be necessary, let's leave off for now
        /*
         if (view.element)
         view.element.opacity = 1;
         */

        if (view === this.currentView) {
            view.setElementAttribute('currentPage', 'true');
            if (typeof this.afterShowView === 'function')
                this.afterShowView(view, direction);
        } else {
            view.setElementAttribute('currentPage', 'false');
            // Hide object. It will be updated when we show it next time anyway.
            view.setVisible(false);
            if (typeof this.afterHideView === 'function')
                this.afterHideView(view, direction);
        }
    };

    public internalInsertChild(child: any) {
        // append child div to self
        if (this._element && this.visible) {
            child._element = null;
            let childElement = document.createElement('div');
            // append child to client area
            this._element.children[0].appendChild(childElement);
            childElement.outerHTML = child.internalRender();
            child._element = childElement;
            child.afterUpdateView();
        } else
            this.updateView();
    };

    /** Shows view (page) using selected transition */
    public showView(nextView: View, direction: number = ContainerView.directionForward) {
        if (this.currentView && nextView && this.currentView === nextView)
            return;

        // Invoke before show and before hide view events
        // Do not proceed if they return false
        if (typeof this.beforeHideView === 'function' && this.currentView) {
            if (this.beforeHideView(this.currentView, direction) === false)
                return;
        }

        if (typeof this.beforeShowView === 'function' && nextView) {
            if (this.beforeShowView(nextView, direction) === false)
                return;
        }

        // let me = this;
        let cur = this.currentView;
        this.currentView = nextView;

        // update next view, make sure it's our child and is visible
        if (nextView) {
            if (nextView.parent !== this || !nextView.visible || !nextView.element)
                nextView.update(() => {
                    // make sure this view is our child
                    nextView.setParent(this);
                    // this will ensure that we element rendered
                    nextView.setVisible(true);
                });

            // if we are moving forward remember prior view, so we know where to return by Back button
            if (direction === ContainerView.directionForward)
                this.priorView = cur;
        }

        // if I'm not rendered or we don't need animation then just assign it and that's it
        if (!this.element || !this.visible || !this.animation || !this.element.style.hasOwnProperty('webkitTransform')) {
            this.updateView(cur, direction);
            this.updateView(nextView, direction);
            return;
        }

        // otherwise we need to bring it into view with animation
        let transitions = new CSSTransition();

        // add transition effect for the current view
        if (cur) {
            transitions.add({
                element: cur.element,
                properties: this.animation.properties,
                from: this.animation.transition(0),
                to: this.animation.transition(-direction),
                duration: this.animation.duration
            });
        }

        // add transition effect for the next view
        if (nextView) {
            // nextView.element.opacity = 0; // now it's transparent
            nextView.element.style.opacity = '0';
            nextView.setElementAttribute('currentPage', 'true'); // but is actually visible
            transitions.add({
                element: nextView.element,
                properties: (this.animation.propertiesTo) ? this.animation.propertiesTo : this.animation.properties,
                from: (this.animation.transitionTo) ? this.animation.transitionTo(direction) : this.animation.transition(direction),
                to: (this.animation.transitionTo) ? this.animation.transitionTo(0) : this.animation.transition(0),
                duration: (this.animation.durationTo) ? this.animation.durationTo : this.animation.duration
            });
        }

        // perform animated transition
        // let animateDurationTo = (this.animation.durationTo) ? this.animation.durationTo : this.animation.duration;
        // setTimeout(() => {
        //     this.updateView(cur, direction);
        //     this.updateView(nextView, direction);
        // }, animateDurationTo * 1000);
        this.updateView(cur, direction);
        this.updateView(nextView, direction);
        transitions.apply();
    };

    public back() {
        if (this.currentView)
            this.showView(this.priorView, ContainerView.directionBack);
    }
}

/**
 * Splitter Control
 */
export class Splitter extends View {
    protected control: View;
    protected moving = false;
    protected vertical: boolean;
    protected lastWidth: number;
    protected lastHeight: number;

    constructor(parent: View, name?: string) {
        super(parent, name);
        this.renderClientArea = false;
        this.setVertical(false);
    }

    public init(control: View, align: IAlign) {
        this.control = control;
        this.setVertical(align.id === Align.left.id || align.id === Align.right.id);
    }

    public setVisible(value) {
        if (this._visible === value)
            return;
        this._visible = value;
        if (!value) {
            this.lastWidth = undefined;
            this.lastHeight = undefined;
            if (this.vertical)
                this.lastWidth = parseInt(this.control.element.style['width']);
            else
                this.lastHeight = parseInt(this.control.element.style['height']);
            this.setControlSize(0);
        }
        else {
            this.setControlSize(this.vertical ? this.lastWidth : this.lastHeight);
        }
    }

    protected setVertical(vertical) {
        this.vertical = vertical;
        this.attributes.vertical = vertical;
        if (this._element)
            this._element.setAttribute('vertical', vertical);
    }

    protected afterUpdateView() {
        super.afterUpdateView();

        // associating splitter with a control
        let c: View = null, prevC: View = null;
        for (let i = 0; i < this.parent.children.length; i++) {
            c = this.parent.children[i];
            if (c instanceof Splitter && c === this) {
                c.control = prevC;
                c.setVertical(c.align.id === Align.left.id || c.align.id === Align.right.id);
            }
            prevC = this.parent.children[i];
        }

        if (this._element && this.visible) {
            this.handleEvent('onmousedown', this.handleMouseDown);
            this.handleEvent('ontouchstart', this.handleMouseDown);
            document.addEventListener('mouseup', (event) => {
                this.handleMouseUp(event);
            });
            document.addEventListener('touchend', (event) => {
                this.handleMouseUp(event);
            });
            document.addEventListener('mousemove', (event) => {
                this.handleMouseMove(event);
            });
        }

        this.internalTriggerReady();
    }

    protected handleMouseDown(event) {
        if (event.button && event.button > 1)
            return;
        this.moving = true;
        if (this.vertical)
            document.body.style.cursor = 'ew-resize';
        else
            document.body.style.cursor = 'ns-resize';
    }

    protected handleMouseUp(event) {
        this.moving = false;
        document.body.style.cursor = 'auto';
    }

    protected handleMouseMove(event) {
        if (!this.moving || !this.control || !this.control.element)
            return;

        let el = this.control.element;
        let prect = this.parent.element.getBoundingClientRect();

        if (this.vertical) {
            if (this.align === Align.right)
                el.style['width'] = this.parent.element.offsetWidth + prect['left'] - event.clientX + 'px';
            else
                el.style['width'] = event.clientX - prect['left'] + 'px';
            this.lastWidth = event.clientX;
        }
        else {
            if (this.align === Align.bottom)
                el.style['height'] = this.parent.element.offsetHeight + prect['top'] - event.clientY + 'px';
            else
                el.style['height'] = event.clientY - prect['top'] + 'px';
            this.lastHeight = parseInt(el.style['height']);
        }
        this.parent.realignChildren();

        if (event)
            event.preventDefault();
    }

    protected setControlSize(size) {
        size += '';
        if (size.indexOf('px') < 0)
            size += 'px';
        let el = this.control.element;
        if (this.vertical)
            el.style['width'] = size;
        else
            el.style['height'] = size;
        this.parent.realignChildren();
    }

}

/** Check box control */
export class CheckView extends ValueView {
    constructor(parent: View, name?: string) {
        super(parent, name);
        this.renderClientArea = false;
    }

    public renderSelf() {
        let checked = '';
        if (this.value)
            checked = View.getTag('span', 'class="ctx_cb_checked_icon"', '');
        let html = View.getTag('div', 'class="ctx_cb_icon"', checked);
        html += View.getTag('div', 'class="ctx_cb_text"', super.renderSelf());
        return html;
    }

    protected getCSSClass(): string {
        let cl = super.getCSSClass();
        if (this.value)
            cl += ' ctx_cb_checked';
        return cl;
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        let cb = this.element.getElementsByClassName('ctx_cb_icon');
        if (cb.length > 0)
            cb[0].addEventListener('click', (event) => { this.onCheckBoxClick(event); });
    }

    protected onCheckBoxClick(event: Event) {
        if (!this.enabled)
            return;
        this.value = this.value ? false : true;
        this.updateView();
    }

}

/** Radio box control */
export class RadioView extends CheckView {
    /** Specifies radio group that will identify which group belongs radio inside its parent */
    public groupId = 0;

    protected onCheckBoxClick(event: Event) {
        if (!this.enabled)
            return;

        if (!this.value) {
            this.value = true;
            this.updateView();
        }

        let r: RadioView;
        for (let i = 0; i < this.parent.children.length; i++) {
            if (this.parent.children[i] instanceof RadioView) {
                r = <RadioView>this.parent.children[i];
                if (r !== this && r.groupId === this.groupId) {
                    r.value = false;
                    r.updateView();
                }
            }
        }
    }
}
