/**
 * $RCSfile: block.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as ProseMirrorState from "prosemirror-state";
import * as StackEditorWidget  from "../widget.js";

const {MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem} = StackEditorWidget;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const BlockMenuView = function(editorView) {
};

BlockMenuView.prototype.update = function(view, lastState) {
    const state = view.state;

    if(lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
        return;
    }

    const parent = view.dom.parentNode;
    const element = this.getBlockElement(view);
    const nodeName = element.nodeName;

    // 删除全部菜单
    parent.querySelectorAll("div.se-hovermenu").forEach(function(e) {
        e.remove();
    });

    // if(nodeName == "PRE" && element.firstElementChild.nodeName == "CODE") {
    if(element.className == "se-codeblock") {
        CodeBlockMenu.open(parent, element);
    }
    else {
        CodeBlockMenu.close();
    }
};

BlockMenuView.prototype.getBlockElement = function(view) {
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

BlockMenuView.prototype.destroy = function() {
    if(this.contextMenu) {
        this.contextMenu.destroy();
    }
};

const CodeBlockMenu = {};
CodeBlockMenu.open = function(container, element) {
    this.wrapper = this.create(container);

    const r1 = container.getBoundingClientRect();
    const r2 = element.getBoundingClientRect();

    const x = r2.left - r1.left + container.scrollLeft;
    const y = r2.top - r1.top + container.scrollTop;

    this.wrapper.style.top = (y - 54) + "px";
    this.wrapper.style.left = x + "px";
    this.wrapper.style.display = "block";
};

CodeBlockMenu.create = function(container) {
    const items = [
        new Divider(),
        new MenuItem({"name": "code", "icon": "code", "label": "代码块", "title": "代码块"}),
        new DropdownMenu({
            "name": "lang",
            "label": "语言选项",
            "title": "语言选项",
            "style": "width: 120px;",
            "items": [
                new DropdownItem({"label": "Plain Text", "value": "plaintext"}),
                new DropdownItem({"label": "HTML", "value": "html"}),
                new DropdownItem({"label": "CSS", "value": "css"}),
                new DropdownItem({"label": "XML", "value": "xml"}),
                new DropdownItem({"label": "Javascript", "value": "javascript"}),
                new DropdownItem({"label": "Typescript", "value": "typescript"}),
                new DropdownItem({"label": "Python", "value": "python"}),
                new DropdownItem({"label": "PHP", "value": "php"}),
                new DropdownItem({"label": "Java", "value": "cpp"}),
                new DropdownItem({"label": "C#", "value": "csharp"}),
                new DropdownItem({"label": "SQL", "value": "sql"}),
                new DropdownItem({"label": "Ruby", "value": "ruby"}),
                new DropdownItem({"label": "Swift", "value": "swift"}),
                new DropdownItem({"label": "Bash", "value": "bash"}),
                new DropdownItem({"label": "Lua", "value": "lua"}),
                new DropdownItem({"label": "Groovy", "value": "groovy"}),
                new DropdownItem({"label": "Markdown", "value": "markdown"})
            ],
            "value": "javascript"
        }),
        new Divider()
    ];

    const bind = {};

    bind.click = function() {
        return function(event) {
            console.log("111111111");
        };
    };

    bind.change = function() {
        return function(event) {
            console.log("322222222");
        };
    };

    const wrapper = document.createElement("div");
    wrapper.className = "se-toolbar se-hovermenu";
    container.appendChild(wrapper);

    const menubar = new MenuBar(wrapper, items, bind);
    menubar.render();
    return wrapper;
};

CodeBlockMenu.close = function(container) {
    if(this.wrapper) {
        this.wrapper.remove();
    }
};

const BlockMenuPlugin = {};
BlockMenuPlugin.create = function() {
    return new ProseMirrorState.Plugin({
        view(editorView) {
            return new BlockMenuView(editorView);
        }
    });
};

export default BlockMenuPlugin;
