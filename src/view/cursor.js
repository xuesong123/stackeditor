/**
 * $RCSfile: cursor.js,v $
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
class CursorView {
    constructor(view) {
        const instance = this;
        this.view = view;
        this.dom = document.createElement("div");
        this.dom.className = "se-cursor";

        const handle = function() {
            if(instance.view.focused) {
                instance.dom.classList.remove("show");
            }
            else {
                instance.dom.classList.add("show");
            }
            instance.timer = setTimeout(handle, 1000);
        };

        this.view.dom.parentNode.appendChild(this.dom);
        this.update(view, null);
        this.timer = setTimeout(handle, 1000);
    }

    update(view, lastState) {
        let state = view.state;
        let {from, to} = state.selection;
        let start = view.coordsAtPos(from);
        let end = view.coordsAtPos(to);

        let box = this.dom.offsetParent.getBoundingClientRect();
        let left = Math.max((start.left + end.left) / 2, start.left + 3);
        this.dom.style.left = (left - box.left - 3) + "px";
        this.dom.style.bottom = (box.bottom - start.top) + "px";
        this.dom.classList.remove("show");
    }
    destroy() {
        if(this.timer) {
            clearTimeout(this.timer);
        }
        this.dom.remove();
    }
};

const CursorPlugin = {};
CursorPlugin.create = function(editorView, opts) {
    return new ProseMirrorState.Plugin({
        view(editorView) {
            return new CursorView(editorView);
        }
    });
};

export default CursorPlugin;
