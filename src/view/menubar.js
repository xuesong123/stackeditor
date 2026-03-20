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

const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Resource, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu} = StackEditorWidget;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const MenuBarView = function(editorView, items) {
    this.editorView = editorView;
    this.items = (items || []);
    this.render(editorView);
};

MenuBarView.prototype.render = function(editorView) {
    let parent = editorView.dom.closest("div.se-container");
    let wrapper = parent.querySelector("div.se-toolbar");

    if(wrapper == null || wrapper == undefined) {
        wrapper = document.createElement("div");
        wrapper.className = "se-toolbar";

        if(parent.firstChild) {
            parent.insertBefore(wrapper, parent.firstChild);
        }
        else {
            parent.appendChild(wrapper);
        }
    }

    if(wrapper.childNodes.length < 1) {
        const bind = {};

        // 普通菜单的 click 事件
        bind.click = function(item) {
            return function(event) {
                Events.stop(event);

                if(item.run) {
                    item.run(editorView.state, editorView.dispatch, editorView, event);
                }
            };
        };

        // 下拉菜单的 change 事件
        bind.change = function(item) {
            return function(event) {
                for(let i = 0; i < item.items.length; i++) {
                    const opt = item.items[i];

                    if(opt.value == item.value) {
                        if(opt.spec.run) {
                            opt.spec.run.apply(opt, [editorView.state, editorView.dispatch, editorView, event]);
                        }
                        break;
                    }
                }
            };
        };

        // 状态事件
        const update = function(view, state) {
            if(this instanceof MenuItem) {
                const button = this.element.querySelector("button.se-button");

                if(this.spec.select) {
                    let selected = this.spec.select(view.state);
                    button.disabled = (selected ? false : true);

                    if(!selected) {
                        return false;
                    }
                }

                let enabled = true;

                if(this.spec.enable) {
                    enabled = this.spec.enable(view.state) || false;
                    button.disabled = !enabled;
                }

                if(this.spec.active) {
                    let active = (enabled && this.spec.active(view.state) || false);
                    DOM.setClass(button, "active", active);
                    button.setAttribute("aria-pressed", active.toString());
                }
            }
            else if(this instanceof DropdownMenu) {
                const debug = (this.name == "format");

                for(let i = 0; i < this.items.length; i++) {
                    let item = this.items[i];

                    if(item.spec.active && item.spec.active(view.state)) {
                        this.setValue(item.value);
                        break;
                    }
                }
            }
            else {
                // do nothing
            }
            return true;
        };

        for(let i = 0; i < this.items.length; i++) {
            let item = this.items[i];

            if(item.name != "|") {
                item.update = update;
            }
        }

        this.menubar = new MenuBar(wrapper, this.items, bind);
        this.menubar.render();
    }
};

MenuBarView.prototype.update = function(view, state) {
    this.menubar.update(view, state);
};

MenuBarView.prototype.destroy = function() {
    if(this.menubar) {
        this.menubar.destroy();
    }
};

const MenuBarPlugin = {};
MenuBarPlugin.create = function(items) {
    return new ProseMirrorState.Plugin({
        view: function(editorView) {
            return new MenuBarView(editorView, items);
        }
    });
};

export default MenuBarPlugin;
