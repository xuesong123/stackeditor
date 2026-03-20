/**
 * $RCSfile: title.js,v $
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

const {DOM} = StackEditorWidget;
const {Config} = StackEditorConfig;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const TitleView = function(editorView, opts) {
    this.view = editorView;
    this.opts = opts;
    this.render(editorView);
};

TitleView.prototype.render = function(editorView) {
    const instance = this;
    const parent = editorView.dom.parentNode;
    this.wrapper = parent.querySelector(":scope > div.se-title");

    if(this.wrapper == null || this.wrapper == undefined) {
        const input = DOM.create("input", {
            "name": "title",
            "type": "text",
            "class": "title",
            "placeholder": Config.getValue(this.opts, "editor.title.placeholder"),
            "title": Config.getValue(this.opts, "editor.title.title"),
            "value": Config.getValue(this.opts, "editor.title.value")
        });

        if(Config.getValue(this.opts, "editor.editable") == false) {
            input.readonly = true;
        }

        if(this.opts.title) {
            input.value = this.opts.title;
        }

        this.wrapper = document.createElement("div");
        this.wrapper.className = "se-title";
        this.wrapper.appendChild(input);

        if(parent.firstChild) {
            parent.insertBefore(this.wrapper, parent.firstChild);
        }
        else {
            parent.appendChild(this.wrapper);
        }
    }
};

/**
 * call stack: 
 *    TitleView.update
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
TitleView.prototype.update = function(view, lastState) {
};

TitleView.prototype.destroy = function() {
    if(this.wrapper) {
        this.wrapper.remove();
    }
    this.wrapper = null;
};

const TitlePlugin = {};
TitlePlugin.create = function(opts) {
    return new ProseMirrorState.Plugin({
        view: function(editorView) {
            return new TitleView(editorView, opts);
        }
    });
};

export default TitlePlugin;
