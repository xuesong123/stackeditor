/**
 * $RCSfile: selection.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as ProseMirrorState from "prosemirror-state";
import * as StackEditorWidget  from "../widget.js";

const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Resource, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu} = StackEditorWidget;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class SelectionSizeTooltip {
    constructor(view) {
        this.tooltip = document.createElement("div")
        this.tooltip.className = "se-tooltip"
        view.dom.parentNode.appendChild(this.tooltip)
        this.update(view, null);
    }

    update(view, lastState) {
        let state = view.state;

        if(lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
            return;
        }

        if(state.selection.empty) {
            this.tooltip.style.display = "none";
            return;
        }

        // 否则，重新设置它的位置并且更新它的内容
        this.tooltip.style.display = ""
        let {from, to} = state.selection
        let start = view.coordsAtPos(from);
        let end = view.coordsAtPos(to);

        // 将 tooltip 所在的父级节点作为参照系
        let box = this.tooltip.offsetParent.getBoundingClientRect();
        // 寻找 tooltip 的中点，当跨行的时候，端点可能更靠近左侧
        let left = Math.max((start.left + end.left) / 2, start.left + 3);
        this.tooltip.style.left = (left - box.left) + "px";
        this.tooltip.style.bottom = (box.bottom - start.top) + "px";
        this.tooltip.textContent = to - from;
    }
    destroy() {
        this.tooltip.remove();
    }
};

const SelectionSizePlugin = {};
SelectionSizePlugin.create = function(editorView, opts) {
    return new ProseMirrorState.Plugin({
        view(editorView) {
            return new SelectionSizeTooltip(editorView);
        }
    });
};

export default SelectionSizePlugin;
