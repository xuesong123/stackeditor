/**
 * $RCSfile: menubar.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as ProseMirrorState from "prosemirror-state";
import * as StackEditorWidget  from "../widget.js";
import * as StackEditorConfig  from "../config.js";

const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Resource, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu} = StackEditorWidget;
const {Config} = StackEditorConfig;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const NodeBarView = function(editorView, opts) {
    this.hlsb = true;
    this.render(editorView);
};

NodeBarView.prototype.render = function(editorView) {
    const instance = this;
    const parent = editorView.dom.closest("div.se-container");
    this.wrapper = parent.querySelector(":scope > div.se-nodebar");
    this.enabled = Config.getValue(this.opts, "editor.nodebar.enabled");

    if(this.wrapper == null || this.wrapper == undefined) {
        this.wrapper = document.createElement("div");
        this.wrapper.className = "se-nodebar";

        if(parent.querySelector("div.se-frame")) {
            parent.insertBefore(this.wrapper, parent.querySelector("div.se-frame"));
        }
        else {
            parent.appendChild(this.wrapper);
        }
    }

    if(this.enabled == false) {
        this.wrapper.style.display = "none";
    }

    if(this.wrapper.childNodes.length < 1) {
        this.wrapper.innerHTML = [
            "<span class=\"checkbox checked\" role=\"checkbox\" aria-checked=\"true\" tabindex=\"0\" title=\"是否高亮显示当前块。\"></span>",
            "<span class=\"se-root\">html</span>",
            "<span class=\"se-body\">body</span>"
        ].join("");

        this.wrapper.querySelector("span.checkbox").addEventListener("click", function() {
            this.classList.toggle("checked");

            const on = this.classList.contains("checked");
            this.setAttribute("aria-checked", on);

            instance.hlsb = on;
            instance.backbar.style.display = (on ? "block" : "none");
        });

        this.backbar = document.createElement("div");
        this.backbar.className = "se-backbar";
        this.backbar.style.display = "none";
        editorView.dom.parentNode.appendChild(this.backbar);
        instance.hls(editorView);
    }
};

/**
 * call stack: 
 *    NodeBarView.update
 *    updatePluginViews
 *    updateStateInner
 *    updateState
 *    EditorView.dispatch
 *    readDOMChange
 *    (anonymous)
 *    flush
 *    onSelectionChange
 * @Override
 */
NodeBarView.prototype.update = function(view, lastState) {
    const state = view.state;

    if(lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
        return;
    }

    // 高亮
    this.hls(view);

    // 重置
    this.wrapper.querySelectorAll(":scope span.se-node").forEach(function(e) {
        e.remove();
    });

    const dom = this.getActiveElement(view);

    if(dom) {
        let nodes = [];
        let current = dom;

        while(current) {
            if(current.classList.contains("ProseMirror") || current.nodeName == "BODY") {
                break;
            }

            nodes.push(current);
            current = current.parentNode;
        }

        for(let i = nodes.length - 1; i > -1; i--) {
            const node = nodes[i];
            const span = document.createElement("span");
            span.className = "se-node";
            span.appendChild(document.createTextNode(node.nodeName.toLowerCase()));
            this.wrapper.appendChild(span);
        }
    }
};

NodeBarView.prototype.hls = function(view) {
    const element = this.getBlockElement(view);

    if(element == null || element == undefined || element.parentNode == null) {
        this.backbar.style.display = "none";
        return;
    }

    const c = this.backbar.parentNode;
    const r1 = c.getBoundingClientRect();
    const r2 = element.getBoundingClientRect();

    const x = r2.left - r1.left + c.scrollLeft;
    const y = r2.top - r1.top + c.scrollTop - 1;
    const w = r2.width + 0;
    const h = r2.height + 1;

    if(element.classList.contains("tableWrapper")) {
        this.backbar.classList.add("table");
    }
    else {
        this.backbar.classList.remove("table");
    }

    this.backbar.style.top = y + "px";
    this.backbar.style.left = x + "px";
    this.backbar.style.width = w + "px";
    this.backbar.style.height = h + "px";
    this.backbar.style.display = (this.hlsb ? "block" : "none");
};

NodeBarView.prototype.getActiveElement = function(view) {
    const { selection } = view.state;
    const $from = selection.$from;

    for(let depth = $from.depth; depth >= 0; depth--) {
        const pos = $from.start(depth);
        const dom = view.domAtPos(pos).node;

        if(dom) {
            return dom;
        }
    }
    return null;
};

NodeBarView.prototype.getBlockElement = function(view) {
    const { selection } = view.state;
    const { $from } = selection;
    let blockDepth = -1;

    for(let depth = $from.depth; depth >= 0; depth--) {
        if($from.node(depth).isBlock) {
            blockDepth = depth;
            break;
        }
    }

    if(blockDepth < 0) {
        return null;
    }

    // 块节点的起始位置
    const pos = selection.$from.start(blockDepth);
    const dom = view.domAtPos(pos).node;

    if(dom) {
        let current = dom;

        while(current != null) {
            if(current.parentNode == null || current.nodeName == "BODY") {
                return null;
            }

            if(current.parentNode.classList.contains("ProseMirror")) {
                return current;
            }
            current = current.parentNode;
        }
    }
    return null;
};

NodeBarView.prototype.destroy = function() {
    if(this.wrapper) {
        this.wrapper.remove();
    }

    if(this.backbar) {
        this.backbar.remove();
    }

    this.wrapper = null;
    this.backbar = null;
};

const NodeBarPlugin = {};
NodeBarPlugin.create = function(editorView, opts) {
    return new ProseMirrorState.Plugin({
        view: function(editorView) {
            return new NodeBarView(editorView, opts);
        }
    });
};

export default NodeBarPlugin;
