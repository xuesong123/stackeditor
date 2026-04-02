/**
 * $RCSfile: menubar.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as StackEditorWidget from "../widget.js";
import * as StackEditorConfig from "../config.js";

const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Resource, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu} = StackEditorWidget;
const {Config} = StackEditorConfig;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const SVG_COPY = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path fill-rule=\"evenodd\" d=\"M21 3.5V17a2 2 0 0 1-2 2h-2v-2h2V3.5H9v2h5.857c1.184 0 2.143.895 2.143 2v13c0 1.105-.96 2-2.143 2H5.143C3.959 22.5 3 21.605 3 20.5v-13c0-1.105.96-2 2.143-2H7v-2a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2m-6.143 4H5.143v13h9.714z\" clip-rule=\"evenodd\"></path></svg>";
const SVG_OLEK = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M9.218 17.41 19.83 6.796a.99.99 0 1 1 1.389 1.415c-3.545 3.425-4.251 4.105-11.419 11.074a.997.997 0 0 1-1.375.018c-1.924-1.801-3.709-3.568-5.573-5.43a.999.999 0 0 1 1.414-1.413z\"></path></svg>";
class CodeBlockView {
    /**
     * @Override
     */
    constructor(node, view, getPos, opts) {
        this.view = view;
        this.node = node;
        this.lang = node.attrs.lang;
        this.getPos = getPos;
        this.opts = opts;

        const instance = this;
        this.wrapper = document.createElement("div");
        this.wrapper.className = "se-block-wrapper";
        this.wrapper.setAttribute("data-lang", this.lang);

        this.body = document.createElement("div");
        this.body.className = "se-codeblock";

        const menu = this.createMenuBar();
        this.wrapper.appendChild(menu);

        this.editDOM = document.createElement("pre");
        this.editDOM.className = "se-editable";

        this.contentDOM = document.createElement("code");
        this.contentDOM.className = "language-" + this.lang;
        this.editDOM.appendChild(this.contentDOM);

        this.highlightDOM = document.createElement("pre");
        this.highlightDOM.className = "se-highlight line-numbers";

        this.highlightCode = document.createElement("code");
        this.highlightCode.className = "language-" + this.lang;
        this.highlightDOM.appendChild(this.highlightCode);

        // 产生行号
        const linesDOM = document.createElement("span");
        linesDOM.className = "line-numbers-rows";
        linesDOM.setAttribute("aria-hidden", "true");
        linesDOM.innerHTML = "<span></span><span></span>";

        this.body.appendChild(this.editDOM);
        this.body.appendChild(this.highlightDOM);
        this.body.appendChild(linesDOM);
        this.wrapper.appendChild(this.body);
        this.dom = this.wrapper;

        this.scrollHandler = function() {
            instance.highlightDOM.scrollLeft = instance.editDOM.scrollLeft;
            instance.highlightDOM.scrollTop = instance.editDOM.scrollTop;
        };
        this.editDOM.addEventListener("scroll", this.scrollHandler);

        this.inputHandler = this.debounce(function() {
            const value = instance.view.state.doc.textBetween(
                instance.getPos() + 1, // 跳过 pre 节点
                instance.getPos() + instance.node.nodeSize - 1
            );
            instance.render(value);
        }, 200);
        this.view.dom.addEventListener("input", this.inputHandler);
        this.render(this.node.textContent);
    }

    /* private void */ createMenuBar() {
        const instance = this;
        const menu = document.createElement("div");
        menu.className = "se-block-menu";
        menu.appendChild(DOM.from("<div class=\"se-block-menu-item\" data-name=\"copy\"><button type=\"button\" title=\"复制\">" + SVG_COPY + "</button></div>"));
        menu.appendChild(DOM.from("<div class=\"se-block-menu-item\" data-name=\"lang\"><div class=\"se-select\"></div></div>"));

        const opts = this.getSupportedLanguages();
        const select = document.createElement("select");
        select.name = "lang";
        select.className = "se-minimal";
        select.style.width = "160px";
        select.setAttribute("title", "语言选项");

        for(let i = 0; i < opts.length; i++) {
            select.appendChild(new Option(opts[i].text, opts[i].value));
        }

        select.value = this.lang;
        select.addEventListener("change", function(e) {
            const lang = this.value;
            const tr = instance.view.state.tr.setNodeAttribute(instance.getPos(), "lang", lang);
            instance.view.dispatch(tr);
        });

        menu.querySelector("div[data-name='lang'] div.se-select").appendChild(select);
        menu.querySelector("div[data-name='copy'] button").addEventListener("click", function(event) {
            const success = DOM.copy(instance.contentDOM);

            if(success) {
                DOM.tooltip(this, "复制完成");
                return;
            }

            DOM.select(instance.contentDOM);
            alert("您的浏览器不支持拷贝，请使用 CTRL + C 复制");
        });
        return menu;
    }

    /* private void */ getSupportedLanguages() {
        let languages = Config.getValue(this.opts, "editor.codeblock.languages");

        if(languages && Array.isArray(languages) && languages.length > 0) {
            return languages;
        }
        return [{"text": "Plaintext", "value": "plaintext"}];
    }

    /* private void */ debounce(fn, delay) {
        let timer = null;

        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    /* private void */ render(text) {
        if(typeof(Prism) == "undefined") {
            console.log("window.Prism is undefined.");
            this.showLineNumbers(text);
            this.highlightCode.textContent = text;
            return;
        }

        const language = (Prism.languages[this.lang] || Prism.languages.plaintext);
        const highlighted = Prism.highlight(text, language, this.lang);

        this.showLineNumbers(text);
        this.highlightCode.innerHTML = highlighted;
    };

    /* private void */ showLineNumbers(text) {
        const lines = (text.match(/\n(?!$)/g) || []).length + 2;
        const container = this.body.querySelector("span.line-numbers-rows");
        const children = container.querySelectorAll(":scope span");
        const count = lines - children.length;

        if(count < 0) {
            for(let i = count; i < 0; i++) {
                container.removeChild(container.lastElementChild);
            }
        }
        else {
            for(let i = 0; i < count; i++) {
                container.appendChild(document.createElement("span"));
            }
        }
    }

    /**
     * @Override
     */
    /* public boolean */ update(node) {
        if(node.type != this.node.type) {
            return false;
        }

        if(node.attrs.lang !== this.lang) {
            this.lang = node.attrs.lang;
            this.contentDOM.className = "language-" + this.lang;
            this.highlightCode.className = "language-" + this.lang;
        }
        this.node = node;
        this.render(node.textContent);
        return true;
    }

    /**
     * 获取编辑器内容时，同步纯文本内容
     * @Override
     */
    /* public String */ get content() {
        return this.node.type.schema.text(this.code.textContent);
    }

    // 销毁时移除监听，避免内存泄漏
    destroy() {
        this.editDOM.removeEventListener("scroll", this.scrollHandler);
        this.view.dom.removeEventListener("input", this.inputHandler);
        this.wrapper.remove();
    }
};

export default CodeBlockView;
