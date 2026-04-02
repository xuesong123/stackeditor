/**
 * $RCSfile: attachment.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as StackEditorWidget  from "../widget.js";

const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Resource, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu} = StackEditorWidget;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class AttachmentView {
    constructor(node, view, getPos) {
        this.dom = document.createElement("attachment");
        const icon = document.createElement("span");
        const name = document.createElement("span");
        const size = document.createElement("span");

        icon.className = "icon";
        name.className = "name";
        size.className = "size";

        icon.appendChild(Icon.create("attachment"));
        name.appendChild(document.createTextNode(node.attrs.name));

        if(node.attrs.size) {
            size.appendChild(document.createTextNode("(" + Bytes.format(node.attrs.size, 2) + ")"));
        }

        this.dom.setAttribute("title", "附件展示内容和样式为编辑器自定义，展示端需自定义附件展示内容和样式。");
        this.dom.appendChild(icon);
        this.dom.appendChild(name);
        this.dom.appendChild(size);
        this.render(node);
    }

    /**
     * @private
     */
    render(node) {
        this.dom.setAttribute("data-name", node.attrs.name);
        this.dom.setAttribute("data-size", node.attrs.size);

        if(node.attrs.title) {
            this.dom.setAttribute("data-title", node.attrs.title);
        }
        this.dom.setAttribute("data-url", node.attrs.url);
    }

    /**
     * @Override
     */
    update(view, lastState) {
        return true;
    }

    /**
     * @Override
     */
    destroy() {
        this.dom.remove();
    }
}

export default AttachmentView;
