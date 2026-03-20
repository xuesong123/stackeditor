/**
 * $RCSfile: html.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
// 1. 冗余标签：<o:p>、<xml>、<v:*>、<w:*> 等 Word 专属标签；
// 2. 内联样式：style="font-family:宋体; font-size:11pt; margin:0pt;" 等硬编码样式；
// 3. 无效属性：class=MsoNormal、id=_x0000_t202 等 Word 自定义属性；
// 4. 嵌套混乱：<p> 套 <div>、多层 <span> 嵌套；
// 5. 未知的 onclick/onload 等事件属性
const clean = function(html) {
    if(html == null || html == undefined || html.length < 1) {
        return "";
    }

    // 去除条件注释
    // const text = html
    //     .replace(/^(\[)?if\s+[^>]*>|\[!if\s+[^>]*>/, "") // 移除条件注释的开头标记
    //     .replace(/<!\[endif\]>$|<!endif\]>$/, "")        // 移除条件注释的结尾标记
    //     .trim();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const tags = ["meta", "link", "style", "script", "head", "iframe", "embed", "object", "svg", "xml", "math"];
    const names = ["id", "class", "lang", "xmlns"];
    const preserves = [
            "IMG", "BR", "HR",
            "INPUT", "BUTTON", "SELECT", "TEXTAREA", 
            "VIDEO", "AUDIO",
            // "CANVAS", "SVG", "IFRAME",
            "SOURCE", "TRACK", "EMBED"
    ];

    doc.body.querySelectorAll("*").forEach(function(e) {
        const tagName = e.tagName;
        const attrs = e.getAttributeNames();

        if(tagName.indexOf(":") > -1) {
            e.remove();
            return;
        }

        if(tags.includes(tagName.toLowerCase())) {
            e.remove();
            return;
        }

        // 移除危险属性
        attrs.forEach(function(name) {
            if(name.indexOf(":") > -1) {
                e.removeAttribute(name);
            }
            else if(names.includes(name) || name.startsWith("on") || name.startsWith("mso-")) {
                e.removeAttribute(name);
            }
        });

        let excludes = [];

        for(let i = 0; i < e.style.length; i++) {
            const name = e.style.item(i);
            const value = e.style.getPropertyValue(name);

            if(["font-family", "font-size", "font-weight", "font-style", "color", "text-decoration"].includes(name)) {
            }
            else {
                excludes.push(name);
            }
        }

        for(let i = 0; i < excludes.length; i++) {
            e.style.removeProperty(excludes[i]);
        }

        if(e.style.length < 1) {
            e.removeAttribute("style");
        }
    });

    // 移除所有注释
    removeComments(doc, doc.body);

    // 遍历所有 div，若父级是 p 则所有子节点提升一级
    doc.querySelectorAll("p > div").forEach(function(div) {
        lift(div);
    });

    // 遍历所有 div 并替换为段落
    doc.querySelectorAll("div").forEach(function(div) {
        replace(document.createElement("p"), div);
    });

    // b 替换为 strong
    doc.querySelectorAll("b").forEach(function(b) {
        replace(doc.createElement("strong"), b);
    });

    // i 替换为 em
    doc.querySelectorAll("i").forEach(function(it) {
        replace(doc.createElement("em"), it);
    });

    // font 替换为 span
    doc.querySelectorAll("font").forEach(function(font) {
        const span = doc.createElement("span");

        if(font.getAttribute("face")) {
            span.style.fontFamily = font.getAttribute("face");
        }

        if(font.getAttribute("size")) {
            span.style.fontSize = getFontSizePx(font.getAttribute("size")) + "px";
        }

        if(font.getAttribute("color")) {
            span.style.color = font.getAttribute("color");
        }
        replace(span, font);
    });

    // 处理段落对齐
    doc.querySelectorAll("p").forEach(function(p) {
        const align = p.getAttribute("align");

        if(align) {
            p.removeAttribute("align");
            p.style.textAlign = align;
        }
    });

    // 无意义的 span
    doc.querySelectorAll("span").forEach(function(span) {
        if(span.getAttributeNames().length < 1) {
            lift(span);
        }
    });

    // 移除空标签
    doc.querySelectorAll("*").forEach(function(e) {
        if(preserves.includes(e.tagName)) {
            return;
        }

        if(e.textContent.trim() == "" && e.children.length < 1) {
            e.remove();
            return;
        }
    });

    return doc.body.innerHTML
        // .replace(/\s+/g, " ")    // 多个空格替换为1个
        .replace(/>\s+</g, "><")    // 标签间的空格剔除;
        .trim();
};

const lift = function(element) {
    const parent = element.parentNode;

    while(element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }
    element.remove();
};

const replace = function(e1, e2) {
    const parent = e2.parentNode;

    while(e2.firstChild) {
        e1.appendChild(e2.firstChild);
    }
    parent.insertBefore(e1, e2);
    e2.remove();
};

const removeComments = function(doc, node) {
    const walker = doc.createTreeWalker(
        node,
        NodeFilter.SHOW_COMMENT, // 只显示注释节点
        null,
        false
    );

    let comments = [];
    let current = null;

    while(current = walker.nextNode()) {
        comments.push(current);
    }

    comments.forEach(function(comment) {
        extract(doc, comment);
        comment.remove();
    });
};

// 提取条件注释中的内容并移除注释
const extract = function(doc, comment) {
    const text = comment.textContent.trim();

    if((text.includes("if !vml") || text.includes("[if"))
        && (text.includes("<img") || text.includes("<div") || text.includes("<p"))
    ) {
        let html = text
            .replace(/^(\[)?if\s+[^>]*>|\[!if\s+[^>]*>/, "") // 移除条件注释的开头标记
            .replace(/<!\[endif\]>$|<!endif\]>$/, "")        // 移除条件注释的结尾标记
            .trim();

        if(html.length > 0) {
            const parent = comment.parentNode;
            const div = doc.createElement("div");
            div.innerHTML = html;

            while(div.firstChild) {
                parent.insertBefore(div.firstChild, comment);
            }
            // 不清空 comment, 下一步直接移除 comment
            // comment.remove();
        }
    }
};

const getFontSizePx = function(value) {
    const base = 3;
    const map = {1: 9, 2: 12, 3: 16, 4: 18, 5: 24, 6: 32, 7: 48};
    let size = value;

    if(typeof(value) == "string") {
        if(value.startsWith("+") || value.startsWith("-")) {
            size = base + parseInt(value);
        }
        else {
            size = parseInt(value);
        }
    }

    size = Math.max(1, Math.min(7, size));
    return fontSizeMap[size];
};

export {clean};
