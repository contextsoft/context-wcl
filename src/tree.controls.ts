/**
 * Controls displaying tree
 */
import { utils } from "./utils";
import { resources } from "./resources";
import { View } from "./view";

resources.register("context-wcl",
    [
        "css/tree.controls.css"
    ]
);

export interface INode {
    text: string;
    icon?: string;
    attr?: string;
    nodes?: INode[];
    // properties mantained internally 
    id?: string;
    expanded?: boolean;
    canExpand?: boolean;
    isLast?: boolean;
    parent?: INode;
}

/**
 * Base class for tree-like controls
 */
export abstract class Nodes extends View {
    protected static nodeCounter = 0;
    public nodes: INode[] = [];

    /**
     * Call this after assigning nodes array
     */
    public initNodes() {
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].isLast = i === this.nodes.length - 1;
            this.internalInitNode(this.nodes[i]);
        }
    }

    public expandNode(node: INode, expand = true, recursive = false) {
        if (node.canExpand)
            node.expanded = expand;
        else
            node.expanded = false;
        if (node.canExpand && recursive)
            for (let i = 0; i < node.nodes.length; i++)
                this.expandNode(node.nodes[i], expand, recursive);
    }

    public collapseNode(node: INode) {
        this.expandNode(node, false);
    }


    public expandAll(expand = true) {
        for (let i = 0; i < this.nodes.length; i++)
            this.expandNode(this.nodes[i], expand, true);
    }

    public collapseAll() {
        this.expandAll(false);
    }

    public getNodeById(id): INode {
        let getChildById = (node: INode, id: string) => {
            if (node.id === id)
                return node;
            else if (Array.isArray(node.nodes)) {
                let result = null;
                for (let i = 0; result == null && i < node.nodes.length; i++)
                    result = getChildById(node.nodes[i], id);
                return result;
            }
            return null;
        };

        let result = null;

        for (let i = 0; result == null && i < this.nodes.length; i++)
            result = getChildById(this.nodes[i], id);

        return result;
    }

    public deleteNode(node: INode) {
        let idx;
        if (node.parent) {
            idx = node.parent.nodes.indexOf(node);
            node.parent.nodes.splice(idx, 1);
        }
        else {
            idx = this.nodes.indexOf(node);
            this.nodes.splice(idx, 1);
        }
        this.initNodes();
    }

    /** Sorts nodes with compareCallback */
    public sort(compareCallback) {
        let sortNodes = (nodes) => {
            nodes.sort(compareCallback);
            for (let i = 0; i < nodes.length - 1; i++)
                if (nodes[i].nodes)
                    sortNodes(nodes[i].nodes);
        };
        sortNodes(this.nodes);
    }

    protected internalInitNode(node: INode) {
        node.canExpand = (node.nodes !== null) && Array.isArray(node.nodes) && node.nodes.length > 0;
        if (!node.id)
            node.id = (Nodes.nodeCounter++).toString();
        if ((node.expanded == null) || !node.canExpand)
            node.expanded = false;
        if (node.canExpand)
            for (let i = 0; i < node.nodes.length; i++) {
                node.nodes[i].parent = node;
                node.nodes[i].isLast = i === node.nodes.length - 1;
                this.internalInitNode(node.nodes[i]);
            }
    }
}

/**
 * Displays tree
 */
export class TreeView extends Nodes {
    /** Fires when node text rendered */
    public onGetNodeText: (node: INode) => string;
    /** Fires on node click */
    public onNodeClick: (node: INode) => void;
    /** Fires on node double click */
    public onNodeDblClick: (node: INode) => void;

    protected activeNodeElement: HTMLElement;
    protected activeNode: INode;

    public render() {
        this.initNodes();
        return this.renderTag(this.internalRenderNodes());
    }

    /** Returns node and it's element for DOM event */
    public getEventNode(event): { node: INode, element: HTMLElement } {
        // active element is the one being currently touched
        let nodeElement = event.toElement || event.target;
        if (!nodeElement)
            return null;
        nodeElement = nodeElement.parentElement;
        if (!nodeElement)
            return null;
        let id = nodeElement.getAttribute("ctx_node_id");
        return { node: this.getNodeById(id), element: nodeElement };
    }

    protected getNodeHtml(node: INode) {
        let nodeAttr = node.attr || "";
        let text = node.text || "";
        let innerHtml = "";
        let attr = "";

        if (typeof this.onGetNodeText === "function")
            text = this.onGetNodeText(node);
        text = View.getTag("div", 'class="ctx_node_text"', text);

        if (node.canExpand)
            if (node.expanded)
                innerHtml = View.getTag("span", 'class="ctx_collapse_node"', "");
            else
                innerHtml = View.getTag("span", 'class="ctx_expand_node"', "");

        if (node.isLast)
            attr += 'class="ctx_node ctx_last_node" ';
        else
            attr += 'class="ctx_node" ';

        if (node.icon)
            innerHtml += View.getTag("img", utils.formatStr('class="ctx_icon" src="{0}"', [node.icon]), "");

        // if(this.activeNode == node)
        //    attr += 'active ';

        return View.getTag("li", attr + nodeAttr + utils.formatStr('ctx_node_id="{0}"', [node.id]), innerHtml + text) + "\n";
    }

    protected internalRenderNode(html: { html }, node: INode) {
        let style = "";
        html.html += this.getNodeHtml(node);
        if (!node.nodes)
            return;
        for (let i = 0; i < node.nodes.length; i++) {
            if (i === 0) {
                if (node.expanded)
                    style = 'style="display: block"';
                else
                    style = 'style="display: none"';
                html.html += '<ul class="ctx_tree" ' + style + ">\n";
            }
            this.internalRenderNode(html, node.nodes[i]);
            if (i === node.nodes.length - 1)
                html.html += "</ul>\n";
        }
    }

    protected internalRenderNodes() {
        let html = { html: "", level: 0 };
        for (let i = 0; i < this.nodes.length; i++)
            this.internalRenderNode(html, this.nodes[i]);
        html.html = View.getTag("ul", 'class="ctx_tree ctx_root"', html.html);
        return html.html;
    }

    protected afterUpdateView() {
        super.afterUpdateView();
        if (this.element && this.visible) {
            this.handleEvent("onclick", this.handleClick);
            this.handleEvent("ondblclick", this.handleDblClick);
            // this.handleEvent('onkeydown', this.handleKeyDown);
        }
    }

    protected setActiveNodeElement(node: INode, element: HTMLElement) {
        if (this.activeNodeElement)
            this.activeNodeElement.removeAttribute("active");
        this.activeNodeElement = element;
        this.activeNodeElement.setAttribute("active", "");
        this.activeNode = node;
    }

    protected handleClick(event) {
        let n = this.getEventNode(event);
        if (!n.node)
            return;

        let cl = (event.toElement || event.target).getAttribute("class");
        if (cl === "ctx_collapse_node" || cl === "ctx_expand_node") {
            this.expandNode(n.node, !n.node.expanded);
            this.updateView();
            return;
        };

        this.setActiveNodeElement(n.node, n.element);

        if (this.onNodeClick)
            this.onNodeClick(n.node);
    }

    protected handleDblClick(event) {
        if (!this.activeNode)
            return;
        if (this.activeNode.canExpand) {
            this.expandNode(this.activeNode, !this.activeNode.expanded);
            this.updateView();
        }

        if (this.onNodeDblClick)
            this.onNodeDblClick(this.activeNode);
    }
}
