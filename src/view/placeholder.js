/**
 * $RCSfile: placeholder.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as ProseMirrorState from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

import * as StackEditorWidget  from "../widget.js";

const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Resource, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu} = StackEditorWidget;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Placeholder = function() {
};

Placeholder.prototype.decorations = function(state) {
    const doc = state.doc;
    const empty = (doc.childCount == 1 && doc.firstChild.isTextblock && doc.firstChild.content.size == 0);

    if(empty == false) {
        return DecorationSet.empty;
    }

    const create = function() {
        const element = document.createElement("div");
        element.className = "se-placeholder";
        element.textContent = "Type here";
        return element;
    };

    // 创建 placeholder 装饰器（插入到编辑器容器的第一个位置）
    const decoration = Decoration.widget(
        0, // 插入位置
        create,
        {
            // 确保 placeholder 只在编辑器空且失焦/聚焦但无内容时显示
            key: "placeholder",
            side: -1,
        }
    );
    return DecorationSet.create(doc, [decoration]);
};

// 调整编辑器容器样式，让 placeholder 定位更合理
Placeholder.prototype.handleDOMEvents = {
    focus: function(view) {
        // 聚焦时若仍为空，保持 placeholder 显示
        view.dom.style.position = "relative";
    },
    blur: function(view) {
        view.dom.style.position = "relative";
    }
};

const PlaceholderPlugin = {};

PlaceholderPlugin.create = function() {
    return new ProseMirrorState.Plugin({
        props: new Placeholder()
    });
};

export default PlaceholderPlugin;
