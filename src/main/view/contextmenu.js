/**
 * $RCSfile: contextmenu.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as ProseMirrorState from "prosemirror-state";
import * as ProseMirrorTables from "prosemirror-tables";
import * as StackEditorWidget  from "../widget.js";

const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Resource, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu} = StackEditorWidget;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const ContextMenuView = function(editorView) {
    this.view = editorView;
    this.contextMenu = this.getContextMenu(editorView);
    this.init(editorView);
};

ContextMenuView.prototype.init = function(editorView) {
    const instance = this;

    this.eventHandler = function(event) {
        if(instance.contextMenu) {
            if(ProseMirrorTables.isInTable(editorView.state)) {
                Events.stop(event);
                instance.contextMenu.show(event);
            }
            else {
                instance.contextMenu.close();
            }
        }
    };

    // 注册右键菜单
    editorView.dom.addEventListener("contextmenu", this.eventHandler);
};

ContextMenuView.prototype.getContextMenu = function(editorView) {
    const bind = {
        click: function(item) {
            return function(event) {
                if(item.spec.run) {
                    item.spec.run.apply(item, [editorView.state, editorView.dispatch, editorView, event]);
                }
            };
        }
    };

    const items = ([
        {"name": "cut", "label": "剪 切", "disabled": true},
        {"name": "copy", "label": "复 制", "disabled": true},
        {"name": "paste", "label": "粘 贴", "disabled": true},
        {"name": "delete", "label": "删 除", "disabled": true},
        {"name": "|"},
        {"name": "addRowBefore", "label": "上方插入行", "title": "上方插入行，按住 CTRL 键，可一次插入 5 行", "run": function(state, dispatch, view, event) {
            if(event.ctrlKey || e.metaKey) {
                TableBuilder.batch(view, ProseMirrorTables.addRowBefore, 5);
            }
            else {
                ProseMirrorTables.addRowBefore(state, dispatch);
            }
        }},
        {"name": "addRowAfter", "label": "下方插入行", "title": "下方插入行，按住 CTRL 键，可一次插入 5 行", "run": function(state, dispatch, view, event) {
            if(event.ctrlKey || e.metaKey) {
                TableBuilder.batch(view, ProseMirrorTables.addRowAfter, 5);
            }
            else {
                ProseMirrorTables.addRowAfter(state, dispatch);
            }
        }},
        {"name": "|"},
        {"name": "addColumnBefore", "label": "左侧插入列", "title": "左侧插入列，按住 CTRL 键，可一次插入 5 列", "run": function(state, dispatch, view, event) {
            if(event.ctrlKey || e.metaKey) {
                TableBuilder.batch(view, ProseMirrorTables.addColumnBefore, 5);
            }
            else {
                ProseMirrorTables.addColumnBefore(state, dispatch);
            }
        }},
        {"name": "addColumnAfter", "label": "右侧插入列", "title": "右侧插入列，按住 CTRL 键，可一次插入 5 列", "run": function(state, dispatch, view, event) {
            if(event.ctrlKey || e.metaKey) {
                TableBuilder.batch(view, ProseMirrorTables.addColumnAfter, 5);
            }
            else {
                ProseMirrorTables.addColumnAfter(state, dispatch);
            }
        }},
        {"name": "|"},
        {"name": "deleteRow", "label": "删除行", "title": "删除行", "run": function(state, dispatch, view, event) {
            ProseMirrorTables.deleteRow(state, dispatch);
        }},
        {"name": "deleteColumn", "label": "删除列", "title": "删除列", "run": function(state, dispatch, view, event) {
            ProseMirrorTables.deleteColumn(state, dispatch);
        }},
    ]).map(function(spec) {
        return new MenuItem(spec);
    });
    return new ContextMenu(null, items, bind);
};

ContextMenuView.prototype.update = function(view, state) {
};

ContextMenuView.prototype.destroy = function() {
    this.view.dom.removeEventListener("contextmenu", this.eventHandler);

    if(this.contextMenu) {
        this.contextMenu.destroy();
        this.contextMenu = null;
    }
};

const ContextMenuPlugin = {};
ContextMenuPlugin.create = function() {
    return new ProseMirrorState.Plugin({
        view(editorView) {
            return new ContextMenuView(editorView);
        }
    });
};

export default ContextMenuPlugin;
