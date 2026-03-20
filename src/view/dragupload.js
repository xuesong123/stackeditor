/**
 * $RCSfile: dragupload.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as ProseMirrorState from "prosemirror-state";
import * as StackEditorWidget  from "../widget.js";
import * as StackEditorCommand from "../command.js";

const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Resource, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu} = StackEditorWidget;
const {StyleCommand, IndentCommand, AlignCommand, UploadCommand, EditCommand, Active, Insert, TableBuilder, Sharing} = StackEditorCommand;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const DraggableUploadView = function(editorView, opts) {
    this.editorView = editorView;
    this.wrapper = null;
    this.init(editorView);
};

DraggableUploadView.prototype.init = function(editorView) {
    const instance = this;
    const container = editorView.dom.parentElement;
    this.wrapper = document.createElement("div");
    this.wrapper.className = "se-drag-panel";
    this.wrapper.style.display = "none";
    // this.wrapper.style.pointerEvents = "none";
    this.wrapper.innerHTML = "<h2>请将文件拖拽到这里</h2>";
    container.parentElement.appendChild(this.wrapper);

    const dragover = function() {
        instance.wrapper.style.display = "block";
    };

    const dragout = function() {
        instance.wrapper.style.display = "none";
    };

    container.addEventListener("dragover", function(event) {
        Events.stop(event);

        let dataTransfer = event.dataTransfer;

        if(dataTransfer == null || dataTransfer == undefined) {
            return;
        }

        for(let i = 0; i < dataTransfer.types.length; i++) {
            let type = dataTransfer.types[i];

            if(type == "Files" || type == "application/x-moz-file") {
                dragover(event);
                break;
            }
        }
    }, false);

    this.wrapper.addEventListener("dragover", function(event) {
        Events.stop(event);
        console.log("dragover 111111111111");
    });
    this.wrapper.addEventListener("dragleave", function(event) {
        console.log("leave 22222222222222222222");
    });
    this.wrapper.addEventListener("drop", function(event) {
        console.log("drop 3333333333333333333333");
        Events.stop(event);
        dragout(event);

        let files = instance.getTransferFiles(event);

        if(files.length > 0) {
            UploadCommand.upload(editorView, files);
        }
        return false;
    });
};

DraggableUploadView.prototype.getTransferFiles = function(event) {
    let dataTransfer = event.dataTransfer;

    if(dataTransfer == null || dataTransfer == undefined) {
        return;
    }

    let files = dataTransfer.files;

    if(files != null && files.length > 0) {
        return files;
    }

    let items = dataTransfer.items;

    // chrome
    if(items != null && items.length > 0) {
        files = [];

        for(let i = items.length - 1; i > -1; i--) {
            let file = items[i].webkitGetAsEntry();

            if(item) {
                files.push(file);
            }
        }
        return files;
    }
    else {
        return null;
    }
};

DraggableUploadView.prototype.update = function() {
};

DraggableUploadView.prototype.destroy = function() {
    if(this.wrapper && this.wrapper.parentElement) {
        this.wrapper.parentElement.removeChild(this.wrapper);
    }
};

const DraggableUploadPlugin = {};
DraggableUploadPlugin.create = function(editorView) {
    return new ProseMirrorState.Plugin({
        view: function(editorView) {
            return new DraggableUploadView(editorView);
        }
    });
};

export default DraggableUploadPlugin;
