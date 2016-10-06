var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './utils', './resources', './view', './transitions'], function (require, exports, utils_1, resources_1, view_1, transitions_1) {
    "use strict";
    resources_1.resources.register('context.vcl', [
        'css/std.controls.css',
        'images/expand.png'
    ]);
    /**
     * Topmost control containg other controls, used for layouting
     **/
    var ScreenView = (function (_super) {
        __extends(ScreenView, _super);
        function ScreenView(name) {
            _super.call(this, null, name);
            this._visible = false;
            this.renderClientArea = true;
            //this.isController = true; //TODO: used in serizalization, needs refactoring
        }
        return ScreenView;
    }(view_1.View));
    exports.ScreenView = ScreenView;
    /**
     * <div> wrapper
     **/
    var TextView = (function (_super) {
        __extends(TextView, _super);
        function TextView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = false;
        }
        return TextView;
    }(view_1.View));
    exports.TextView = TextView;
    /**
     * <header> wrapper
     * Additional CSS classes: fixed
     */
    var HeaderView = (function (_super) {
        __extends(HeaderView, _super);
        function HeaderView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = false;
            this.tag = 'header';
            this.additionalCSSClass = ' fixed ';
        }
        return HeaderView;
    }(view_1.View));
    exports.HeaderView = HeaderView;
    /**
     * <footer> wrapper
     * Additional CSS classes: fixed
     */
    var FooterView = (function (_super) {
        __extends(FooterView, _super);
        function FooterView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = false;
            this.tag = 'footer';
            this.additionalCSSClass = ' fixed ';
        }
        return FooterView;
    }(view_1.View));
    exports.FooterView = FooterView;
    /**
     * <div> wrapper used for layouting purposes
     **/
    var PanelView = (function (_super) {
        __extends(PanelView, _super);
        function PanelView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = true;
        }
        return PanelView;
    }(view_1.View));
    exports.PanelView = PanelView;
    /**
     * Container with header and border
     * Additional CSS classes: border
     **/
    var GroupBoxView = (function (_super) {
        __extends(GroupBoxView, _super);
        function GroupBoxView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = true;
            this.additionalCSSClass = ' border ';
        }
        Object.defineProperty(GroupBoxView.prototype, "caption", {
            /** Sets/Gets GroupBox header */
            get: function () {
                return this.text;
            },
            set: function (value) {
                this.text = value;
            },
            enumerable: true,
            configurable: true
        });
        GroupBoxView.prototype.render = function () {
            var html = this.renderChildren();
            if (this.renderClientArea) {
                html = view_1.View.getTag('div', this.getClientAreaTagAttr(), html);
                // render non-client area: text before and children after
                html = (this._text ? view_1.View.getTag('div', 'class=header', this.renderSelf()) : this.renderSelf())
                    + html + this.renderChildren(true);
            }
            return view_1.View.getTag(this.tag, this.internalGetTagAttr(), html);
        };
        return GroupBoxView;
    }(view_1.View));
    exports.GroupBoxView = GroupBoxView;
    (function (ButtonType) {
        ButtonType[ButtonType["default"] = 0] = "default";
        ButtonType[ButtonType["primary"] = 1] = "primary";
        ButtonType[ButtonType["success"] = 2] = "success";
        ButtonType[ButtonType["info"] = 3] = "info";
        ButtonType[ButtonType["warning"] = 4] = "warning";
        ButtonType[ButtonType["danger"] = 5] = "danger";
        //TODO: does these types needed?
        ButtonType[ButtonType["chevronLeft"] = 6] = "chevronLeft";
        ButtonType[ButtonType["chevronRight"] = 7] = "chevronRight";
        ButtonType[ButtonType["toggle"] = 8] = "toggle";
    })(exports.ButtonType || (exports.ButtonType = {}));
    var ButtonType = exports.ButtonType;
    /**
     * <button> wrapper
     */
    var ButtonView = (function (_super) {
        __extends(ButtonView, _super);
        function ButtonView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = true;
            this.tag = 'button';
        }
        Object.defineProperty(ButtonView.prototype, "buttonType", {
            get: function () {
                return this._buttonType;
            },
            set: function (buttonType) {
                this._buttonType = buttonType;
                if (this._element)
                    this.updateView();
            },
            enumerable: true,
            configurable: true
        });
        ButtonView.prototype.getTagAttr = function () {
            var c = _super.prototype.getTagAttr.call(this);
            if (this.buttonType)
                c += ' type="' + ButtonType[this.buttonType] + '"';
            return c;
        };
        ButtonView.prototype.renderSelf = function () {
            if (this.buttonType == ButtonType.toggle)
                return '<span class="ctx_icon-bar"></span><span class="ctx_icon-bar"></span><span class="ctx_icon-bar"></span>';
            else
                return this.renderIcon() + this.text;
        };
        return ButtonView;
    }(view_1.View));
    exports.ButtonView = ButtonView;
    /**
     * <form> wrapper
     **/
    var FormView = (function (_super) {
        __extends(FormView, _super);
        function FormView(parent, name) {
            _super.call(this, parent, name);
            this.tag = 'form';
            this.renderClientArea = false;
        }
        return FormView;
    }(view_1.View));
    exports.FormView = FormView;
    /**
     * <input> wrapper
     **/
    var InputView = (function (_super) {
        __extends(InputView, _super);
        function InputView(parent, name) {
            _super.call(this, parent, name);
            /** Indicates will keypress fire onChange or not, default true */
            this.keyPressFireOnChange = true;
            this.changingDelay = 200;
            this.tag = 'input';
            this.renderClientArea = false;
        }
        InputView.prototype.beforeUpdateView = function () {
            _super.prototype.beforeUpdateView.call(this);
            this.getValue(); // storing control's value            
        };
        InputView.prototype.afterUpdateView = function () {
            _super.prototype.afterUpdateView.call(this);
            this.handleEvent('onchange', this.handleChange);
            this.handleEvent('onkeydown', this.handleKeyDown);
        };
        InputView.prototype.handleKeyDown = function (event) {
            var _this = this;
            if (this.keyPressTimeoutInstance)
                clearTimeout(this.keyPressTimeoutInstance);
            if (this.keyPressFireOnChange)
                this.keyPressTimeoutInstance = setTimeout(function () {
                    if (_this.element && _this.visible && _this._value !== _this.element.value) {
                        _this.handleChange();
                    }
                }, this.changingDelay);
        };
        InputView.prototype.handleChange = function () {
            // retrieve value from element
            this.getValue();
            // update data link
            this.data.value = this._value;
            // invoke event if assigned
            if (typeof this.onChange === 'function')
                this.onChange();
        };
        return InputView;
    }(view_1.ValueView));
    exports.InputView = InputView;
    /**
     * <texarea> wrapper
     */
    var TextAreaView = (function (_super) {
        __extends(TextAreaView, _super);
        function TextAreaView(parent, name) {
            _super.call(this, parent, name);
            this.tag = 'textarea';
            this.renderClientArea = false;
        }
        TextAreaView.prototype.getValue = function () {
            var r = _super.prototype.getValue.call(this) || '';
            r = r.replace(/\n/g, '\r\n');
            return r;
        };
        TextAreaView.prototype.render = function () {
            var t = this.value || '';
            t = utils_1.utils.escapeHTML(t);
            t = t.replace(/\r/g, '');
            return "<textarea " + this.internalGetTagAttr() + " >" + t + "</textarea>";
        };
        return TextAreaView;
    }(InputView));
    exports.TextAreaView = TextAreaView;
    /**
     * Container that allows to display one of several views (as pages) and
     * switch between them using transitions and transformations.
     */
    var ContainerView = (function (_super) {
        __extends(ContainerView, _super);
        function ContainerView(parent, name) {
            _super.call(this, parent, name);
            this.currentView = null;
            this.animation = ContainerView.slideHorizontal;
        }
        ContainerView.cssSlideHorizontal = function (direction) {
            return (direction === 0) ? ['1', 'translate3d(0,0,0)'] : ['0', 'translate3d(' + (direction * 100) + '%,0,0)'];
        };
        ContainerView.cssSlideVertical = function (direction) {
            return (direction === 0) ? ['1', 'translate3d(0,0,0)'] : ['0', 'translate3d(0, ' + (direction * 100) + '%,0)'];
        };
        ContainerView.cssRotateX = function (direction) {
            return (direction === 0) ? ['1', 'rotateX(0deg)'] : ['0', 'rotateX(' + (direction * 180) + 'deg)'];
        };
        ContainerView.cssRotateY = function (direction) {
            return (direction === 0) ? ['1', 'rotateY(0deg)'] : ['0', 'rotateY(' + (direction * 180) + 'deg)'];
        };
        ContainerView.cssFadeInOut = function (direction) {
            return (direction === 0) ? ['1'] : ['0'];
        };
        ContainerView.prototype.updateView = function (view, direction) {
            if (!view)
                return;
            // restore opacity - MB: this should not be necessary, let's leave off for now
            /*
             if (view.element)
             view.element.opacity = 1;
             */
            if (view === this.currentView) {
                view.setElementAttribute("currentPage", "true");
                if (typeof this.afterShowView === "function")
                    this.afterShowView(view, direction);
            }
            else {
                view.setElementAttribute("currentPage", "false");
                // Hide object. It will be updated when we show it next time anyway.
                view.setVisible(false);
                if (typeof this.afterHideView === "function")
                    this.afterHideView(view, direction);
            }
        };
        ;
        ContainerView.prototype.internalInsertChild = function (child) {
            // append child div to self
            if (this._element && this.visible) {
                child._element = null;
                var childElement = document.createElement('div');
                // append child to client area
                this._element.children[0].appendChild(childElement);
                childElement.outerHTML = child.internalRender();
                child._element = childElement;
                child.afterUpdateView();
            }
            else
                this.updateView();
        };
        ;
        ContainerView.prototype.showView = function (nextView, direction) {
            if (this.currentView && nextView && this.currentView === nextView)
                return;
            // Invoke before show and before hide view events
            // Do not proceed if they return false
            if (typeof this.beforeHideView === "function" && this.currentView) {
                if (this.beforeHideView(this.currentView, direction) === false)
                    return;
            }
            if (typeof this.beforeShowView === "function" && nextView) {
                if (this.beforeShowView(nextView, direction) === false)
                    return;
            }
            var _this = this;
            var cur = this.currentView;
            this.currentView = nextView;
            direction = direction || ContainerView.directionForward;
            // update next view, make sure it's out child and is visible
            if (nextView) {
                if (nextView.parent !== _this || !nextView.visible || !nextView.element)
                    nextView.update(function () {
                        // make sure this view is our child
                        nextView.setParent(_this);
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
            var transitions = new transitions_1.CSSTransition();
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
                //nextView.element.opacity = 0; // now it's transparent
                nextView.element.style.opacity = '0';
                nextView.setElementAttribute("currentPage", "true"); // but is actually visible
                transitions.add({
                    element: nextView.element,
                    properties: (this.animation.propertiesTo) ? this.animation.propertiesTo : this.animation.properties,
                    from: (this.animation.transitionTo) ? this.animation.transitionTo(direction) : this.animation.transition(direction),
                    to: (this.animation.transitionTo) ? this.animation.transitionTo(0) : this.animation.transition(0),
                    duration: (this.animation.durationTo) ? this.animation.durationTo : this.animation.duration
                });
            }
            // perform animated transition
            var animateDurationTo = (this.animation.durationTo) ? this.animation.durationTo : this.animation.duration;
            setTimeout(function () {
                _this.updateView(cur, direction);
                _this.updateView(nextView, direction);
            }, animateDurationTo * 1000);
            transitions.apply();
        };
        ;
        ContainerView.prototype.back = function () {
            if (this.currentView)
                this.showView(this.priorView, ContainerView.directionBack);
        };
        ContainerView.directionForward = 1;
        ContainerView.directionBack = -1;
        ContainerView.slideHorizontal = {
            transition: ContainerView.cssSlideHorizontal,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
        ContainerView.slideVertical = {
            transition: ContainerView.cssSlideVertical,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
        ContainerView.fadeInOut = {
            transition: ContainerView.cssFadeInOut,
            properties: ['opacity'],
            duration: 0.5
        };
        ContainerView.rotateY = {
            transition: ContainerView.cssRotateY,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
        ContainerView.rotateX = {
            transition: ContainerView.cssRotateX,
            properties: ['opacity', '-webkit-transform'],
            duration: 0.5
        };
        return ContainerView;
    }(view_1.View));
    exports.ContainerView = ContainerView;
    /**
     * Splitter Control
     */
    var Splitter = (function (_super) {
        __extends(Splitter, _super);
        function Splitter(parent, name) {
            _super.call(this, parent, name);
            this.moving = false;
            this.renderClientArea = false;
            this.setVertical(false);
        }
        Splitter.prototype.setVisible = function (value) {
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
        };
        Splitter.prototype.isSplitter = function () {
            return true;
        };
        Splitter.prototype.setVertical = function (vertical) {
            this.vertical = vertical;
            this.attributes.vertical = vertical;
            if (this.element)
                this.element.setAttribute('vertical', vertical);
        };
        Splitter.prototype.handleMouseDown = function (event) {
            if (event.button && event.button > 1)
                return;
            this.moving = true;
            if (this.vertical)
                document.body.style.cursor = 'ew-resize';
            else
                document.body.style.cursor = 'ns-resize';
        };
        Splitter.prototype.handleMouseUp = function (event) {
            this.moving = false;
            document.body.style.cursor = 'auto';
        };
        Splitter.prototype.handleMouseMove = function (event) {
            if (!this.moving || !this.control || !this.control.element)
                return;
            var el = this.control.element;
            var prect = this.parent.element.getBoundingClientRect();
            if (this.vertical) {
                if (this.align == view_1.Align.right)
                    el.style['width'] = this.parent.element.offsetWidth + prect['left'] - event.clientX + 'px';
                else
                    el.style['width'] = event.clientX - prect['left'] + 'px';
                this.lastWidth = event.clientX;
            }
            else {
                if (this.align == view_1.Align.bottom)
                    el.style['height'] = this.parent.element.offsetHeight + prect['top'] - event.clientY + 'px';
                else
                    el.style['height'] = event.clientY - prect['top'] + 'px';
                this.lastHeight = parseInt(el.style['height']);
            }
            this.parent.realignChildren();
            if (event)
                event.preventDefault();
        };
        Splitter.prototype.afterUpdateView = function () {
            this.internalAfterUpdateView();
            if (this.element && this.visible) {
                this.handleEvent('onmousedown', this.handleMouseDown);
                this.handleEvent('ontouchstart', this.handleMouseDown);
                //TODO: make sure that "this" in the handlers is correct
                utils_1.utils.addEvent(document, 'mouseup', this.handleMouseUp);
                utils_1.utils.addEvent(document, 'touchend', this.handleMouseUp);
                utils_1.utils.addEvent(document, 'mousemove', this.handleMouseMove);
            }
            this.internalTriggerReady();
        };
        Splitter.prototype.setControlSize = function (size) {
            size += '';
            if (size.indexOf('px') < 0)
                size += 'px';
            var el = this.control.element;
            if (this.vertical)
                el.style['width'] = size;
            else
                el.style['height'] = size;
            this.parent.realignChildren();
        };
        return Splitter;
    }(view_1.View));
    exports.Splitter = Splitter;
});
//# sourceMappingURL=std.controls.js.map