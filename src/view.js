var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './utils', './component', './data'], function (require, exports, utils_1, component_1, data_1) {
    "use strict";
    /** Views's Align */
    var Align = (function () {
        function Align() {
        }
        Align.left = { id: 'left', style: 'position: absolute; left: 0; top: 0; bottom: 0' };
        Align.top = { id: 'top', style: 'position: absolute; left: 0; top: 0; right: 0' };
        Align.right = { id: 'right', style: 'position: absolute; top: 0; right: 0; bottom: 0' };
        Align.bottom = { id: 'bottom', style: 'position: absolute; left: 0; right: 0; bottom: 0' };
        Align.client = { id: 'client', style: 'position: absolute; left: 0; top: 0; right: 0; bottom: 0' };
        return Align;
    }());
    exports.Align = Align;
    /* TODO:
       * Actions
       * IScroll???
       * Serialization
    */
    /**
     * Root for all controls
     **/
    var View = (function (_super) {
        __extends(View, _super);
        function View(parent, name) {
            _super.call(this, name);
            /** Control's html tag type e.g. div */
            this.tag = 'div';
            /** Render or not view with client area
             *  the reason for this is to be able to layout child views this allows to use padding to create internal margins
             */
            this.renderClientArea = true;
            /** Control's client area CSS style */
            this.clientAreaStyle = '';
            /** Indicates is control rendered in client area of parent control or not */
            this.renderInNonClientArea = false;
            //public actions: any = {};
            /** Control's child controls */
            this.children = [];
            /** DOM events wich receives view instance as "this" */
            this.events = {};
            // TODO: fix attributes always lowcase
            /** Object with additional control's DOM attributes */
            this.attributes = {};
            /** Align child controls or not, default false */
            this.alignChildren = false;
            /** Escape or not html tags in text value */
            this.doNotEscapeHtml = false;
            //protected isController = false; //TODO: used in serialization 
            this.clientAreaTag = 'div';
            this.clientAreaClass = 'ctx_view_client_area';
            this.hiddenViewClass = 'ctx_view_hidden';
            this.cssPrefix = 'Ctx';
            this.updating = 0;
            this._enabled = true;
            this._visible = true;
            this._id = 'w' + (View.nextViewId++);
            this._parent = parent;
            if (parent)
                parent.addView(this);
            this.initComponents();
        }
        /** Returns html <tag attr>innerHtml</tag>
         * leaveOpen means close or not tag
         */
        View.getTag = function (tag, attr, innerHtml, leaveOpen) {
            if (leaveOpen === void 0) { leaveOpen = false; }
            var t = tag || 'div';
            var res = '<' + t + ' ' + (attr || '');
            res += (t === 'input') ? '/' : '';
            res += '>' + (innerHtml != 'undefined' ? innerHtml : '');
            res += (!leaveOpen) ? '</' + t + '>' : '';
            return res;
        };
        Object.defineProperty(View.prototype, "id", {
            /** Controls's id for DOM */
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "parent", {
            /** Control's parent control */
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "enabled", {
            /** Enables or disabled controls */
            get: function () {
                //let a = this.getAction();
                //return (a) ? (a.getEnabled() && a.execute) : this._enabled;
                return this._enabled;
            },
            set: function (value) {
                if (value !== this._enabled) {
                    this._enabled = value;
                    // let a = this.getAction();
                    // if(a)
                    //     a.setEnabled(value);
                    if (this.element)
                        this.updateView();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "additionalCSSClass", {
            /** Sets/Gets CSS class in addition to generated one e.g. 'TextView View additionalCSSClass'  */
            get: function () {
                return this._additionalCSSClass;
            },
            set: function (value) {
                if (this._additionalCSSClass !== value) {
                    this._additionalCSSClass = value;
                    if (this.visible && this.element)
                        this.element.className = this.getCSSClass();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "bodyElement", {
            /** Cached DOM body element */
            get: function () {
                if (!this._bodyElement && this._bodyElementId)
                    this._bodyElement = document.getElementById(this._bodyElementId);
                if (!this._bodyElement)
                    this._bodyElement = document.getElementsByTagName('body')[0];
                return this._bodyElement;
            },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(View.prototype, "visible", {
            /** Shows or hides control */
            get: function () {
                // return (this.action) ? this.action.visible : this._visible;
                return this._visible;
            },
            set: function (value) {
                this.setVisible(value);
            },
            enumerable: true,
            configurable: true
        });
        View.prototype.setVisible = function (value) {
            if (value !== this._visible) {
                this._visible = value;
                this.updateView();
                this.visibleChanged();
            }
        };
        ;
        Object.defineProperty(View.prototype, "element", {
            /** Control's DOM element */
            get: function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "text", {
            /** Sets/Gets content which will be rendered */
            get: function () {
                var result;
                if (typeof this.onGetText === "function")
                    result = this.onGetText();
                else
                    result = this.L(this._text);
                if (result && !this.doNotEscapeHtml)
                    result = utils_1.utils.escapeHTML(result);
                return (result) ? String(result) : '';
            },
            set: function (value) {
                if (value !== this._text) {
                    this._text = value;
                    if (this.element)
                        this.updateView();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(View.prototype, "classPath", {
            /** Class path for css, e.g. "CtxView CtxTextView" */
            get: function () {
                return this._classPath;
            },
            enumerable: true,
            configurable: true
        });
        /** Control's Action  */
        // public public get action() {
        //     return this.action;
        // }    
        // public public set action(value: Action) {
        //     if (this.action !== value) {
        //         // if (this.action)
        //         //     this.action.removeView(this);
        //         this._action = value;
        //         // if (this.action)
        //         //     this.action.addView(this);
        //         this.updateView();
        //     }
        // }
        // protected _action: Action;
        /** Returns control's DOM element */
        View.prototype.getElement = function () {
            return document.getElementById(this.id);
        };
        View.prototype.getClientElementId = function () {
            return this.id + '_client';
        };
        /** Returns   */
        View.prototype.getClientElement = function () {
            return document.getElementById(this.getClientElementId());
        };
        /** Hides and removes control from parent */
        View.prototype.destroy = function () {
            this.hide();
            this.setParent(null);
        };
        /** Returns control's parent' */
        View.prototype.getParent = function () {
            return this.parent;
        };
        /** Moves control to the new parent */
        View.prototype.setParent = function (value) {
            if (value !== this.parent) {
                if (this.parent) {
                    this.parent.removeView(this);
                    // destroy element if it exists within parent view
                    if (this.element && this.parent.element) {
                        if (this.parent.visible) {
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
                if (this.visible) {
                    if (this.parent)
                        this.parent.updateView();
                    else
                        this.updateView();
                }
            }
        };
        /** While control updating it won't be rerender */
        View.prototype.beginUpdate = function () {
            this.updating++;
        };
        /** Ends control update and renders it */
        View.prototype.endUpdate = function () {
            if (this.updating > 0) {
                this.updating--;
                if (!this.updating)
                    this.updateView();
            }
        };
        /** Calls action and rerenders control */
        View.prototype.update = function (action) {
            this.beginUpdate();
            if (typeof action === "function") {
                try {
                    action.call(this);
                }
                catch (e) {
                    this.endUpdate();
                    throw e;
                }
            }
            this.endUpdate();
        };
        /** Add param view to controls children */
        View.prototype.addView = function (view) {
            if (view && this.children.indexOf(view) < 0)
                this.children.push(view);
        };
        /** Removes view from control's children */
        View.prototype.removeView = function (view) {
            var idx = this.children.indexOf(view);
            if (idx >= 0)
                this.children.splice(idx, 1);
        };
        /** Shows control */
        View.prototype.show = function () {
            this.visible = true;
        };
        /** Hides control */
        View.prototype.hide = function () {
            this.visible = false;
        };
        /** Rerenders control */
        View.prototype.updateView = function () {
            // do nothing if we are in updating mode
            if (this.updating)
                return;
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
                var e = document.createElement('div');
                this.bodyElement.appendChild(e);
                // it is important to render self while element == null
                // in this case we will not try to use element's style and attributes, otherwise we will
                // effectively erase them all
                e.outerHTML = this.internalRender();
                this._element = e;
                this.internalAfterUpdateView();
            }
        };
        /** Returns control's DOM element attribute */
        View.prototype.getElementAttribute = function (name) {
            if (this.element && this.visible)
                return this.element.getAttribute(name);
            else
                return this.attributes[name];
        };
        /** Sets control's DOM element attribute */
        View.prototype.setElementAttribute = function (name, value) {
            if (this.element && this.visible)
                this.element.setAttribute(name, value);
            return this.attributes[name] = value;
        };
        /** Returns control's or its action's icon url */
        View.prototype.getIcon = function () {
            return this.icon || '';
            // else {
            //     if (this.action && this.action.icon)
            //         return this.action.icon;
            //     else
            //         return '';
            // }
        };
        /** Return icon withing <img> tag */
        View.prototype.renderIcon = function () {
            var icon = this.getIcon();
            if (icon)
                return '<img src="' + icon + '">';
            else
                return '';
        };
        /** Return controls html without children */
        View.prototype.renderTag = function (innerHtml, leaveOpen) {
            return View.getTag(this.tag, this.internalGetTagAttr(), innerHtml, leaveOpen);
        };
        /** Returns control's html with children */
        View.prototype.render = function () {
            var html = this.renderSelf() + this.renderChildren();
            if (this.renderClientArea) {
                html = View.getTag(this.clientAreaTag, this.getClientAreaTagAttr(), html);
                // render non-client area children
                html += this.renderChildren(true);
            }
            return this.renderTag(html);
        };
        /** Return control's html accouting it's visibility */
        View.prototype.internalRender = function () {
            if (this.visible)
                return this.render();
            else
                return '<div class="' + this.hiddenViewClass + '" id=' + this.id + '></div>';
        };
        /** Aligns control's children when alignChildren = true */
        View.prototype.realignChildren = function (offset) {
            if (!this.alignChildren)
                return;
            offset = offset || {
                'left': { left: 0, top: 0, bottom: 0 },
                'top': { left: 0, top: 0, right: 0 },
                'right': { top: 0, right: 0, bottom: 0 },
                'bottom': { left: 0, right: 0, bottom: 0 },
                'client': { left: 0, top: 0, right: 0, bottom: 0 }
            };
            function incOffset(id, value) {
                for (var o in offset)
                    if (offset.hasOwnProperty(o) && offset[o].hasOwnProperty(id))
                        offset[o][id] += value;
            }
            var c, aid, el;
            for (var i = 0; i < this.children.length; i++) {
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
                    if (aid == Align.left.id)
                        incOffset('left', el.offsetWidth);
                    else if (aid == Align.right.id)
                        incOffset('right', el.offsetWidth);
                    else if (aid == Align.top.id)
                        incOffset('top', el.offsetHeight);
                    else if (aid == Align.bottom.id)
                        incOffset('bottom', el.offsetHeight);
                }
                if (c.scrollBar)
                    c.updateScrollBar();
                if (c.alignChildren)
                    this.children[i].realignChildren();
            }
        };
        /** Focuses control's DOM element */
        View.prototype.setFocus = function () {
            if (this.element && this.visible)
                this.element.focus();
        };
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
        View.prototype.visibleChanged = function () {
            // this.updateActionShortcuts(true);
            if (this.onVisibleChanged)
                this.onVisibleChanged();
        };
        /** Resets all children elements to null */
        View.prototype.resetChildrenElements = function () {
            for (var i = 0; i < this.children.length; i++) {
                this.children[i]._element = null;
                this.children[i].resetChildrenElements();
            }
        };
        /** Assigns event handler to control's DOM-element in addition to control.events handlers */
        View.prototype.handleEvent = function (eventName, handler) {
            var _this = this;
            if (this.element && this.visible) {
                if (handler)
                    this.element[eventName] = function (event) {
                        handler.call(_this, event);
                        if (_this.events[eventName])
                            _this.events[eventName].call(_this, event);
                    };
            }
        };
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
        View.prototype.internalTriggerReady = function () {
            if (this.visible && this.element && this.onReady)
                this.onReady();
        };
        View.prototype.beforeUpdateView = function () {
        };
        //TODO: unclear code, looks like internalAfterUpdateView and afterUpdateView should be combined 
        View.prototype.internalAfterUpdateView = function () {
            var _this = this;
            this.afterUpdateView();
            this.initSplitter();
            this.realignChildren();
            setTimeout(function () {
                _this.realignChildren();
            }, 0);
            this.internalTriggerReady();
        };
        View.prototype.afterUpdateView = function () {
            var _this = this;
            // assign DOM element
            this._element = this.getElement();
            if (!this.visible || !this.element) {
                // clear elements for all children
                this.resetChildrenElements();
                return;
            }
            // assign self to DOM element
            this.element.view = this;
            // assign style if it's an object
            if (typeof this.style === "object")
                for (var s in this.style)
                    if (this.style.hasOwnProperty(s))
                        this.element.style[s] = this.style[s];
            // update all children
            for (var i = 0; i < this.children.length; i++)
                this.children[i].internalAfterUpdateView();
            // assign events
            if (typeof this.events === 'object')
                var _loop_1 = function(e) {
                    if (this_1.events.hasOwnProperty(e))
                        this_1.element[e] = function (event) { _this.events[e].call(_this, event); };
                };
                var this_1 = this;
                for (var e in this.events) {
                    _loop_1(e);
                }
            // handle on click if we have action assigned
            // if (this.action || this.events.onclick)
            //     this.handleEvent('onclick', this.handleClick);
        };
        // protected handleClick(event: Event) {
        //     if (this.enabled) {
        //         return (this.action) ? this.action.execute(this, event) : false;
        //     }
        // }
        View.prototype.internalInsertChild = function (child) {
            this.updateView();
        };
        /** Returns control's CSS class */
        View.prototype.getCSSClass = function () {
            var c = this.name ? this.name + ' ' : '';
            if (!this._classPath) {
                var t = Object.getPrototypeOf(this), cp = '';
                while (t) {
                    cp += (cp == '' ? '' : ' ') + this.cssPrefix + component_1.Component.getFunctionName(t.constructor);
                    t = Object.getPrototypeOf(t);
                    if (!t || !t.constructor || t.constructor === component_1.Component)
                        t = null;
                }
                this._classPath = cp;
            }
            c += this._classPath;
            var a = this.additionalCSSClass;
            if (a)
                c += ' ' + a;
            c += !this.enabled ? ' disabled' : '';
            // c += this.float? ' float-' + this.float : '';
            // c += this.position? ' position-' + this.position : '';
            // c += this.scrollbars? ' scrollbars-' + this.scrollbars : '';
            // c += (this.scrollbars && this.scrollToUse) ? ' CtxScroll' : '';
            return c;
        };
        /** Returns all control element's attributes */
        View.prototype.internalGetTagAttr = function () {
            var e = this.element;
            var s = (e && e.className !== this.hiddenViewClass) ? e.style.cssText : (typeof this.style == 'string' ? this.style : '');
            var align = '';
            if (this.align) {
                s += s ? ('; ' + this.align.style) : this.align.style;
                align = utils_1.utils.formatStr(' ctx_align="{0}"', [this.align.id]);
            }
            if (typeof s === "string" && s !== '')
                this.attributes.style = s;
            else
                delete this.attributes.style;
            return 'class="' + this.getCSSClass() + '" ' + this.getTagAttr() + (this.enabled ? '' : 'disabled') + ' id="' + this.id + '"' + align;
        };
        /** Return control element's this.attrubutes */
        View.prototype.getTagAttr = function () {
            return utils_1.utils.attributesToString(this.attributes);
        };
        View.prototype.getClientAreaTagAttr = function () {
            // this renders view with client area
            // the reason for this is to be able to layout child views
            // this allows to use padding to create internal margins
            var clientAreaStyle = (this.clientAreaStyle) ? ' style="' + this.clientAreaStyle + '" ' : '';
            return 'class="' + this.clientAreaClass + '" id="' + this.id + '_client"' + clientAreaStyle;
        };
        /** Returns control's content html */
        View.prototype.renderSelf = function () {
            return this.renderIcon() + this.text;
        };
        /** Returns control's childs html
         * nonClientArea indicates if client area or not rendered at the moment
         * */
        View.prototype.renderChildren = function (nonClientArea) {
            if (nonClientArea === void 0) { nonClientArea = false; }
            var contentHtml = '';
            for (var i = 0; i < this.children.length; i++)
                if (nonClientArea == this.children[i].renderInNonClientArea)
                    contentHtml += this.children[i].internalRender();
            return contentHtml;
        };
        View.prototype.isSplitter = function () {
            return false;
        };
        /** Splitter support */
        View.prototype.initSplitter = function () {
            var c = null, prevc = null;
            for (var i = 0; i < this.children.length; i++) {
                prevc = c;
                c = this.children[i];
                if (c.isSplitter()) {
                    c.control = prevc;
                    c.setVertical(c.align.id == Align.left.id || c.align.id == Align.right.id);
                }
            }
        };
        View.prototype.initComponents = function () {
            // Implement in descendants to init internal components 
        };
        /** Global controls counter */
        View.nextViewId = 1;
        return View;
    }(component_1.Component));
    exports.View = View;
    /**
     * Control with a value
     **/
    var ValueView = (function (_super) {
        __extends(ValueView, _super);
        function ValueView() {
            var _this = this;
            _super.apply(this, arguments);
            this.data = new data_1.FieldDataLink(function (eventType, data) {
                _this.setValue((_this.data).value);
            });
        }
        Object.defineProperty(ValueView.prototype, "value", {
            /** Gets/sets controls's value */
            get: function () {
                return this.getValue();
            },
            set: function (_value) {
                this.setValue(_value);
            },
            enumerable: true,
            configurable: true
        });
        ValueView.prototype.getValue = function () {
            if (this.element && this.visible)
                this._value = this.element.value;
            return this._value;
        };
        ValueView.prototype.setValue = function (_value) {
            if (this._value !== _value) {
                this._value = _value;
                if (this.element && this.visible)
                    this.element.value = this._value;
            }
        };
        ValueView.prototype.beforeUpdateView = function () {
            _super.prototype.beforeUpdateView.call(this);
            this.getValue(); // storing control's value            
        };
        ValueView.prototype.afterUpdateView = function () {
            _super.prototype.afterUpdateView.call(this);
            if (this._element && typeof this._value !== 'undefined')
                this._element.value = this._value;
        };
        return ValueView;
    }(View));
    exports.ValueView = ValueView;
});
//# sourceMappingURL=view.js.map