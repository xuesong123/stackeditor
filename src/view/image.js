/**
 * $RCSfile: menubar.js,v $
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
class ResizableImageView {
    constructor(node, view, getPos) {
        this.node = node;
        this.view = view;
        this.getPos = getPos;
        this.keepRatio = true;
        this.dom = document.createElement("span");
        this.img = document.createElement("img");

        let self = this;
        this.img = document.createElement("img");
        this.img.addEventListener("load", function(event) {
            self.label.setAttribute("data-width", this.naturalWidth);
            self.label.setAttribute("data-height", this.naturalHeight);
        });

        // 添加尺寸显示标签
        this.label = document.createElement("span");
        this.label.className = "resize-label";
        this.label.setAttribute("data-width", this.img.clientWidth);
        this.label.setAttribute("data-height", this.img.clientHeight);
        this.label.appendChild(document.createTextNode(this.img.clientWidth + " × " + this.img.clientHeight));

        this.updateImage(node);
        this.dom.appendChild(this.img);
        this.dom.appendChild(this.label);

        // console.log(this.img.width + ", " + this.img.height);
        // console.log(this.img.offsetWidth + ", " + this.img.offsetHeight);
        // console.log(this.img.naturalWidth + ", " + this.img.naturalHeight);
        this.resizable = new Resizable(this.img);
        this.resizable.select = function() {
            self.selectNode();
        };

        this.resizable.update = function(width, height) {
            self.label.textContent = Math.round(width) + " × " + Math.round(height);
        };

        this.resizable.deselect = function() {
            self.deselectNode();
        };
        this.resizable.commit = function(size) {
            if(size) {
                self.commit(size);
            }
        };
    }

    /**
     * @private
     */
    updateImage(node) {
        const width = node.attrs.width;
        const height = node.attrs.height;
        const align = node.attrs.align;
        this.img.src = node.attrs.src;

        /*
        if(align == "center") {
            this.img.style.display = "inline-block";
            this.img.style.margin = "0px auto";
        }
        else if(align == "right") {
            this.img.style.marginLeft = "auto";
            this.img.style.marginRight = "0px";
            this.img.style.display = "block";
        }
        else {
            // left
            this.img.style.margin = "0px 0px";
            this.img.style.display = "inline-block";
        }
        */

        if(width) {
            this.img.style.width = width;
        }
        else {
            this.img.style.removeProperty("width");
        }

        if(height) {
            this.img.style.height = height;
        }
        else {
            this.img.style.removeProperty("height");
        }

        if(node.attrs.title) {
            this.img.title = node.attrs.title;
        }

        if(node.attrs.alt) {
            this.img.alt = node.attrs.alt;
        }
    }

    /**
     * @private
     */
    info(text) {
        const ele = document.createElement("div");
        ele.className = "tooltip";
        ele.textContent = text;
        this.dom.appendChild(ele);

        setTimeout(function() {
            ele.style.opacity = 0;
        }, 1000);

        setTimeout(function() {
            ele.remove();
        }, 2000);
    }

    /**
     * @private
     */
    commit(size) {
        const pos = this.getPos();

        if(pos === undefined) {
            return;
        }

        const width = size.width;
        const height = size.height;
        const tr = this.view.state.tr.setNodeMarkup(pos, null, {
            ...this.node.attrs,
            width: Math.round(width),
            height: Math.round(height)
        });
        this.view.dispatch(tr);
    }

    /**
     * 调用链: mouseup > view.dispatch > update
     * @Override
     */
    update(node, decorations, innerDecorations) {
        if(node.type.name !== "image") {
            return false;
        }

        if(node.attrs.src != this.node.attrs.src
            || node.attrs.width != this.node.attrs.width
            || node.attrs.height != this.node.attrs.height) {
            this.node = node;
            this.updateImage(node);
        }
        else {
            this.node = node;
        }
        return true;
    }

    /**
     * @Override
     */
    selectNode() {
        this.label.textContent = this.img.width + " × " + this.img.height;
        this.dom.classList.add("ProseMirror-selectednode", "active");
    }

    /**
     * @Override
     */
    deselectNode() {
        this.dom.classList.remove("ProseMirror-selectednode", "active");
    }

    /**
     * @Override
     */
    stopEvent(event) {
        return event.target != this.img;
    }

    /**
     * @Override
     */
    ignoreMutation() {
        return true;
    }

    /**
     * @Override
     */
    destroy() {
        this.dom.remove();
    }
};

export default ResizableImageView;
