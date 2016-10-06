var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './resources', "./view", './list.controls', './std.controls'], function (require, exports, resources_1, view_1, list_controls_1, std_controls_1) {
    "use strict";
    resources_1.resources.register('context.vcl', [
        'css/ext.controls.css'
    ]);
    /**
     * Tabs switch control
     */
    var TabsView = (function (_super) {
        __extends(TabsView, _super);
        function TabsView(parent, name) {
            _super.call(this, parent, name);
            this.droppedDown = '';
            var _this = this;
            this.droppedDown = '';
            this.dropDownButton = new std_controls_1.ButtonView(this, 'dropDownButton');
            this.dropDownButton.buttonType = std_controls_1.ButtonType.toggle;
            this.dropDownButton.events.onclick = function () {
                _this.droppedDown = _this.droppedDown ? '' : 'droppedDown';
                _this.updateView();
            };
        }
        TabsView.prototype.render = function () {
            var html = view_1.View.getTag('div', 'class="tabs ' + this.droppedDown + '"', this.internalRenderItems());
            var selItm = this.getSelectedItem();
            if (selItm && selItm.text)
                html += view_1.View.getTag('div', 'class="caption" ', this.getSelectedItem().text);
            html = this.renderTag(html + this.dropDownButton.render());
            return html;
        };
        TabsView.prototype.updateSelectedIndex = function (newIndex) {
            // unselect current element
            if (this.selectedElement)
                this.setElementSelected(this.selectedElement, false);
            this.selectedElement = null;
            this._selectedIndex = newIndex;
            // select new element
            if (this.element && this.visible && this.selectedIndex >= 0) {
                this.selectedElement = this.element.firstChild.children[this.selectedIndex];
                if (this.selectedElement)
                    this.setElementSelected(this.selectedElement, true);
                else
                    this.selectedIndex = -1;
            }
            return true;
        };
        TabsView.prototype.afterUpdateView = function () {
            _super.prototype.afterUpdateView.call(this);
            if (this.element && this.visible) {
                var children = this.element.firstChild.children;
                this.renderedRowCount = children.length;
                for (var i = 0; i < children.length; i++)
                    children[i].setAttribute('index', i.toString());
                this.updateSelectedIndex(this.selectedIndex);
                this.handleEvent('onclick', this.handleClick);
            }
            this.internalTriggerReady();
        };
        TabsView.prototype.handleClick = function (event) {
            var listElement = this.getActiveElement(event);
            if (!listElement)
                return;
            var idx = listElement.getAttribute('index');
            this.setSelectedIndex(idx);
        };
        return TabsView;
    }(list_controls_1.ListView));
    exports.TabsView = TabsView;
    /**
     * Tabs switch with pages inside
     */
    var PageView = (function (_super) {
        __extends(PageView, _super);
        function PageView(parent, name) {
            _super.call(this, parent, name);
            this.renderClientArea = true;
            // Tabs switcher
            this.pagesSwitcher = new TabsView(this, 'pagesSwitcher');
            this.pagesSwitcher.onGetItems = this.onGetItems;
            // Container for pages
            this.pagesContainer = new std_controls_1.ContainerView(this, 'pagesContainer');
            this.pagesContainer.animation = std_controls_1.ContainerView.fadeInOut;
            var _this = this;
            this.pagesSwitcher.onSelectionChange = function (index) {
                _this.pagesContainer.showView(_this.pagesSwitcher.getValue(), std_controls_1.ContainerView.directionForward);
            };
        }
        Object.defineProperty(PageView.prototype, "items", {
            /** Pages list
             * e.g.
             * pagesList.items = [{text: 'Page 1', value: myView1}, {text: 'Page 2', value: myView2}]
            */
            get: function () {
                return this.pagesSwitcher.items;
            },
            set: function (items) {
                this.pagesSwitcher.items = items;
            },
            enumerable: true,
            configurable: true
        });
        PageView.prototype.setPageIndex = function (index) {
            this.pagesSwitcher.setSelectedIndex(index);
            this.pagesSwitcher.updateView();
        };
        PageView.prototype.showPage = function (view) {
            for (var i = 0; i < this.pagesSwitcher.items.length; i++)
                if (this.pagesSwitcher.items[i].value = view) {
                    this.setPageIndex(i);
                    return;
                }
        };
        PageView.prototype.updateItems = function (forceUpdate) {
            this.pagesSwitcher.updateItems(forceUpdate);
            this.updateView();
        };
        return PageView;
    }(view_1.View));
    exports.PageView = PageView;
    /**
     * View displayed at top of all controls
     **/
    var ModalView = (function (_super) {
        __extends(ModalView, _super);
        function ModalView(parent, name) {
            _super.call(this, parent, name);
            this._visible = false;
            this.renderClientArea = false;
            this.modalContainer = new std_controls_1.PanelView(this, 'cxtModalContainer');
        }
        return ModalView;
    }(view_1.View));
    exports.ModalView = ModalView;
    /**
     * Dialog control
     */
    var Dialog = (function (_super) {
        __extends(Dialog, _super);
        function Dialog(parent, name) {
            _super.call(this, parent, name);
            this._buttons = [];
            this.captionView = new std_controls_1.TextView(this.modalContainer, 'ctxCaption');
            this.buttonsContainer = new std_controls_1.PanelView(this.modalContainer, 'ctxButtonsContainer');
            this.buttons = [Dialog.buttonType.ok];
        }
        Object.defineProperty(Dialog.prototype, "buttons", {
            /** Set/gets dialog's buttons set */
            get: function () {
                return this._buttons;
            },
            set: function (buttons) {
                if (buttons)
                    this._buttons = buttons;
                this.buttonsContainer.children = [];
                for (var i = 0; i < this._buttons.length; i++) {
                    var btn = new std_controls_1.ButtonView(this.buttonsContainer, this.buttons[i].id);
                    btn.text = this.buttons[i].buttonType.text;
                    btn.buttonType = this.buttons[i].buttonType;
                    btn.parentDialog = this;
                    btn.events.onclick = function (event) {
                        if (this.onClick)
                            this.onClick();
                        else
                            this.parentDialog.hide();
                    };
                }
            },
            enumerable: true,
            configurable: true
        });
        //TODO: make static variant
        Dialog.prototype.showMessage = function (caption, onOkClick, onCancelClick) {
            var btn, buttons = [];
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
        };
        //TODO: refactor this
        Dialog.buttonType = {
            ok: {
                id: 'ctxOkButton',
                text: 'OK',
                buttonType: std_controls_1.ButtonType.primary,
                onClick: null
            },
            cancel: {
                id: 'ctxCancelButton',
                text: 'Cancel',
                buttonType: std_controls_1.ButtonType.default,
                onClick: null
            }
        };
        return Dialog;
    }(ModalView));
    exports.Dialog = Dialog;
});
//# sourceMappingURL=ext.controls.js.map