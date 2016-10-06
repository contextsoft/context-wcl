var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './utils', './view'], function (require, exports, utils_1, view_1) {
    "use strict";
    /**
     * Base class for tree-like controls
     **/
    var Nodes = (function (_super) {
        __extends(Nodes, _super);
        function Nodes() {
            _super.apply(this, arguments);
            this.nodes = [];
        }
        /**
         * Call this after assigning nodes array
         */
        Nodes.prototype.initNodes = function () {
            for (var i = 0; i < this.nodes.length; i++) {
                this.nodes[i].isLast = i == this.nodes.length - 1;
                this.internalInitNode(this.nodes[i]);
            }
        };
        Nodes.prototype.expandNode = function (node, expand, recursive) {
            if (expand === void 0) { expand = true; }
            if (recursive === void 0) { recursive = false; }
            if (node.canExpand)
                node.expanded = expand;
            else
                node.expanded = false;
            if (node.canExpand && recursive)
                for (var i = 0; i < node.nodes.length; i++)
                    this.expandNode(node.nodes[i], expand, recursive);
        };
        Nodes.prototype.collapseNode = function (node) {
            this.expandNode(node, false);
        };
        Nodes.prototype.expandAll = function (expand) {
            if (expand === void 0) { expand = true; }
            for (var i = 0; i < this.nodes.length; i++)
                this.expandNode(this.nodes[i], expand, true);
        };
        Nodes.prototype.collapseAll = function () {
            this.expandAll(false);
        };
        Nodes.prototype.getNodeById = function (id) {
            var getChildById = function (node, id) {
                if (node.id == id)
                    return node;
                else if (Array.isArray(node.nodes)) {
                    var result = null;
                    for (var i = 0; result == null && i < node.nodes.length; i++)
                        result = getChildById(node.nodes[i], id);
                    return result;
                }
                return null;
            };
            var result = null;
            for (var i = 0; result == null && i < this.nodes.length; i++)
                result = getChildById(this.nodes[i], id);
            return result;
        };
        Nodes.prototype.deleteNode = function (node) {
            var idx;
            if (node.parent) {
                idx = node.parent.nodes.indexOf(node);
                node.parent.nodes.splice(idx, 1);
            }
            else {
                idx = this.nodes.indexOf(node);
                this.nodes.splice(idx, 1);
            }
            this.initNodes();
        };
        /** Sorts nodes with compareCallback */
        Nodes.prototype.sort = function (compareCallback) {
            var sortNodes = function (nodes) {
                nodes.sort(compareCallback);
                for (var i = 0; i < nodes.length - 1; i++)
                    if (nodes[i].nodes)
                        sortNodes(nodes[i].nodes);
            };
            sortNodes(this.nodes);
        };
        Nodes.prototype.internalInitNode = function (node) {
            node.canExpand = (node.nodes !== null) && Array.isArray(node.nodes) && node.nodes.length > 0;
            if (!node.id)
                node.id = (Nodes.nodeCounter++).toString();
            if ((node.expanded == null) || !node.canExpand)
                node.expanded = false;
            if (node.canExpand)
                for (var i = 0; i < node.nodes.length; i++) {
                    node.nodes[i].parent = node;
                    node.nodes[i].isLast = i == node.nodes.length - 1;
                    this.internalInitNode(node.nodes[i]);
                }
        };
        Nodes.nodeCounter = 0;
        return Nodes;
    }(view_1.View));
    exports.Nodes = Nodes;
    /**
     * Displays tree
     **/
    var TreeView = (function (_super) {
        __extends(TreeView, _super);
        function TreeView() {
            _super.apply(this, arguments);
        }
        TreeView.prototype.render = function () {
            this.initNodes();
            return this.renderTag(this.internalRenderNodes());
        };
        /** Returns node and it's element for DOM event */
        TreeView.prototype.getEventNode = function (event) {
            // active element is the one being currently touched
            var nodeElement = event.toElement || event.target;
            if (!nodeElement)
                return null;
            nodeElement = nodeElement.parentElement;
            if (!nodeElement)
                return null;
            var id = nodeElement.getAttribute('ctx_node_id');
            return { node: this.getNodeById(id), element: nodeElement };
        };
        TreeView.prototype.getNodeHtml = function (node) {
            var nodeAttr = node.attr || '';
            var text = node.text || '';
            var innerHtml = '';
            var attr = '';
            if (typeof this.onGetNodeText === 'function')
                text = this.onGetNodeText(node);
            text = view_1.View.getTag('div', 'class="ctx_node_text"', text);
            if (node.canExpand)
                if (node.expanded)
                    innerHtml = view_1.View.getTag('span', 'class="ctx_collapse_node"', '');
                else
                    innerHtml = view_1.View.getTag('span', 'class="ctx_expand_node"', '');
            if (node.isLast)
                attr += 'class="ctx_node ctx_last_node" ';
            else
                attr += 'class="ctx_node" ';
            if (node.icon)
                innerHtml += view_1.View.getTag('img', utils_1.utils.formatStr('class="ctx_icon" src="{0}"', [node.icon]), '');
            //if(this.activeNode == node)
            //    attr += 'active ';
            return view_1.View.getTag('li', attr + nodeAttr + utils_1.utils.formatStr('ctx_node_id="{0}"', [node.id]), innerHtml + text) + '\n';
        };
        TreeView.prototype.internalRenderNode = function (html, node) {
            var style = '';
            html.html += this.getNodeHtml(node);
            if (!node.nodes)
                return;
            for (var i = 0; i < node.nodes.length; i++) {
                if (i == 0) {
                    if (node.expanded)
                        style = 'style="display: block"';
                    else
                        style = 'style="display: none"';
                    html.html += '<ul class="ctx_tree" ' + style + '>\n';
                }
                this.internalRenderNode(html, node.nodes[i]);
                if (i == node.nodes.length - 1)
                    html.html += '</ul>\n';
            }
        };
        TreeView.prototype.internalRenderNodes = function () {
            var html = { html: '', level: 0 };
            for (var i = 0; i < this.nodes.length; i++)
                this.internalRenderNode(html, this.nodes[i]);
            html.html = view_1.View.getTag('ul', 'class="ctx_tree ctx_root"', html.html);
            return html.html;
        };
        TreeView.prototype.afterUpdateView = function () {
            this.internalAfterUpdateView();
            if (this.element && this.visible) {
                this.handleEvent('onclick', this.handleClick);
                this.handleEvent('ondblclick', this.handleDblClick);
            }
            this.internalTriggerReady();
        };
        TreeView.prototype.setActiveNodeElement = function (node, element) {
            if (this.activeNodeElement)
                this.activeNodeElement.removeAttribute('active');
            this.activeNodeElement = element;
            this.activeNodeElement.setAttribute('active', '');
            this.activeNode = node;
        };
        TreeView.prototype.handleClick = function (event) {
            var n = this.getEventNode(event);
            if (!n.node)
                return;
            var cl = (event.toElement || event.target).getAttribute('class');
            if (cl == 'ctx_collapse_node' || cl == 'ctx_expand_node') {
                this.expandNode(n.node, !n.node.expanded);
                this.updateView();
                return;
            }
            ;
            this.setActiveNodeElement(n.node, n.element);
            if (this.onNodeClick)
                this.onNodeClick(n.node);
        };
        TreeView.prototype.handleDblClick = function (event) {
            if (!this.activeNode)
                return;
            if (this.activeNode.canExpand) {
                this.expandNode(this.activeNode, !this.activeNode.expanded);
                this.updateView();
            }
            if (this.onNodeDblClick)
                this.onNodeDblClick(this.activeNode);
        };
        return TreeView;
    }(Nodes));
    exports.TreeView = TreeView;
});
//# sourceMappingURL=tree.contols.js.map