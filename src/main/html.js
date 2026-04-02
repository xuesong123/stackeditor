/**
 * $RCSfile: html.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
const ElementFilter = {};

ElementFilter.filter = function(doc, e) {
    const nodeName = e.nodeName;
    const attrs = e.getAttributeNames();
    const UNSAFE = ["META", "LINK", "STYLE", "SCRIPT", "HEAD", "IFRAME", "EMBED", "OBJECT", "SVG", "XML", "MATH"];

    if(nodeName.indexOf(":") > -1) {
        return true;
    }

    if(UNSAFE.includes(nodeName)) {
        return true;
    }
    return false;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const ReplaceFilter = {};

ReplaceFilter.filter = function(doc, e) {
    const nodeName = e.nodeName;

    if(nodeName == "DIV") {
        // div 替换为段落
        DOM.replace(doc.createElement("p"), e);
    }
    else if(nodeName == "B") {
        // b 替换为 strong
        DOM.replace(doc.createElement("strong"), e);
    }
    else if(nodeName == "I") {
        // b 替换为 strong
        DOM.replace(doc.createElement("em"), e);
    }
    else if(nodeName == "FONT") {
        // font 替换为 span
        const span = doc.createElement("span");

        if(e.getAttribute("face")) {
            span.style.fontFamily = e.getAttribute("face");
        }

        if(e.getAttribute("size")) {
            span.style.fontSize = ReplaceFilter.getFontSizePx(e.getAttribute("size")) + "px";
        }

        if(e.getAttribute("color")) {
            span.style.color = e.getAttribute("color");
        }
        DOM.replace(span, e);
    }
    else if(nodeName == "PRE") {
        // 处理代码块
        const codes = e.querySelectorAll("code");

        if(codes.length == 1 && e.firstElementChild.nodeName == "CODE") {
            // code 内存在其他标签, 可能是已经高亮过的, 全部重置
            // 同时保留 code 的各项属性
            const code = e.firstElementChild;
            code.replaceChildren(doc.createTextNode(code.textContent));
        }
        else {
            // 没有 code 标签或者有多个 code 标签, 或者首个标签不是 code, 全部重置
            const code = doc.createElement("code");
            code.appendChild(doc.createTextNode(e.textContent));
            e.replaceChildren(code);
        }
    }
};

ReplaceFilter.getFontSizePx = function(value) {
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const AttributeFilter = {
    "UNSAFE_ATTRS": ["id", "xmlns", "onclick", "onkeydown", "onkeyup", "onload", "onerror"],
    "KEEP_ATTRS": [
        {"nodeName": "A", "attrs": ["data-referer"]},
        {"nodeName": "IMG", "attrs": ["src", "width", "height"]},
        {"nodeName": "PRE", "attrs": ["class"]},
        {"nodeName": "CODE", "attrs": ["class"]},
        {"nodeName": "VIDEO", "attrs": ["src", "width", "height"]},
        {"nodeName": "AUDIO", "attrs": ["src", "width", "height"]},
        {"nodeName": "ATTACHMENT", "attrs": ["data-name", "data-title", "data-url", "data-size"]},
        {"nodeName": "*", "attrs": ["width", "height"]}
    ],
    "KEEP_STYLES": ["width", "height", "font-family", "font-size", "font-weight", "font-style", "color", "text-decoration", "text-align"]
};

AttributeFilter.filter = function(doc, e) {
    const nodeName = e.nodeName;
    const attrs = e.getAttributeNames();
    const UNSAFE_ATTRS = this.UNSAFE_ATTRS;
    const KEEP_ATTRS = this.KEEP_ATTRS;
    const KEEP_STYLES = this.KEEP_STYLES;

    // 移除危险属性
    attrs.forEach(function(name) {
        if(name.indexOf(":") > -1 || name.startsWith("mso-") || UNSAFE_ATTRS.includes(name)) {
            e.removeAttribute(name);
        }

        let flag = true;

        for(let i = 0; i < KEEP_ATTRS.length; i++) {
            let item = KEEP_ATTRS[i];

            if((item.nodeName == "*" || item.nodeName == nodeName) && item.attrs.includes(name)) {
                flag = false;
                break;
            }
        }

        if(flag) {
            e.removeAttribute(name);
        }
    });

    // 对齐, 实际上仅 P 标签有效
    const align = e.getAttribute("align");

    if(align) {
        e.removeAttribute("align");
        e.style.textAlign = align;
    }

    let excludes = [];

    for(let i = 0; i < e.style.length; i++) {
        const name = e.style.item(i);
        const value = e.style.getPropertyValue(name);

        if(!KEEP_STYLES.includes(name)) {
            excludes.push(name);
        }
    }

    for(let i = 0; i < excludes.length; i++) {
        e.style.removeProperty(excludes[i]);
    }

    if(e.style.length < 1) {
        e.removeAttribute("style");
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Paragraph = {};

// 多个连续的、空的 P 标签只保留一个
Paragraph.compact = function(element) {
    const children = Array.from(element.children);
    let i = 0;
    let j = -2;

    while(i < children.length) {
        const e = children[i];

        if(e.nodeName == "P" && e.children.length < 1 && e.textContent.trim() == "") {
            if(j == i - 1) {
                element.removeChild(e);
            }
            j = i;
        }
        i++;
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const CodeBlock = {};

// 合并多个连续的 PRE 标签
CodeBlock.compact = function(element) {
    const children = Array.from(element.children);
    let i = 0;
    let j = -2;

    while(i < children.length) {
        const e = children[i];

        // ProseMirror 中，代码块必须包含 CODE 子元素
        // 为了支持代码高亮，CODE 必须具有相同的 className
        if(e.nodeName == "PRE") {
            if(j == i - 1 && CodeBlock.same(children[j], e)) {
                CodeBlock.merge(children[j], e);
                element.removeChild(children[j]);
            }
            j = i;
        }
        i++;
    }
};

CodeBlock.same = function(pre1, pre2) {
    const code1 = pre1.firstElementChild;
    const code2 = pre2.firstElementChild;

    if(code1 && code2) {
        return (code1.className == code1.className);
    }
    return false;
};

CodeBlock.merge = function(pre1, pre2) {
    const code1 = pre1.firstElementChild;
    const code2 = pre2.firstElementChild;

    if(code1 && code2) {
        code2.textContent = code1.textContent + "\r\n" + code2.textContent;
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Comment = {};

Comment.remove = function(doc, node) {
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
        Comment.extract(doc, comment);
    });
};

// 提取条件注释中的内容并移除注释
Comment.extract = function(doc, comment) {
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
        }
    }
    comment.remove();
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const DOM = {};

// 提升一级
DOM.lift = function(element) {
    const parent = element.parentElement;
    parent.removeChild(element);
    parent.parentElement.insertBefore(e, parent);
};

// 提升所有子节点一级
DOM.liftChildren = function(element) {
    const parent = element.parentNode;

    while(element.firstChild) {
        parent.insertBefore(element.firstChild, element);
    }
    element.remove();
};

// 替换节点
DOM.replace = function(e1, e2) {
    const parent = e2.parentNode;

    while(e2.firstChild) {
        e1.appendChild(e2.firstChild);
    }
    parent.insertBefore(e1, e2);
    e2.remove();
};

// 简单换行输出
DOM.format = function(element) {
    const childNodes = element.childNodes;
    const length = childNodes.length;
    const b = [];

    for(let i = 0; i < length; i++) {
        let node = childNodes[i];

        if(node.nodeType == 1) {
            // 1: Node.ELEMENT_NODE
            b.push(node.outerHTML);
        }
        else if(node.nodeType == 3) {
            // 3: Node.TEXT_NODE
            const text = node.textContent;

            if(text.trim().length > 0) {
                b.push(text);
            }
            else {
                // discard
            }
        }
        else {
            // discard
        }
    }
    return b.join("\r\n");
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1. 冗余标签：<o:p>、<xml>、<v:*>、<w:*> 等 Word 专属标签；
// 2. 内联样式：style="font-family:宋体; font-size:11pt; margin:0pt;" 等硬编码样式；
// 3. 无效属性：class=MsoNormal、id=_x0000_t202 等 Word 自定义属性；
// 4. 嵌套混乱：<p> 套 <div>、多层 <span> 嵌套；
// 5. 未知的 onclick/onload 等事件属性
// 
// 目前的整个实现逻辑比较多，需要数次遍历整个文档，但是即便如此，经过测试性能也足够了
// 测试文档：80页的 WORD 文档，文字 + 两张图片，BASE64 之后，两张图片大约 4M，剪切板中的完整 HTML 共 5M
// 粗略的测试，WORD 向剪切板写入数据大约 7000ms，处理耗时 150ms，其中主要处理耗时集中在 DOMParser.parse 和 第一个遍历上
// 
// 一般场景中不会向富文本编辑器中复制大量的内容，大内容通常是从 WORD 中复制内容粘贴到富文本编辑器中
// 经过测试，当粘贴从 WORD 中复制的大内容时，页面通常会假死数秒。假死是发生在 WORD 向剪切板准备数据期间，而非处理阶段
// 当用户在 WORD 中按下 Ctrl + C 时，此时 WORD 并不会立即将数据写入到剪切板，只有当用户粘贴时，WORD 才会生成数据并写入剪切板。
// 通过如下代码可以观察到只有开始读取时 WORD 才开始向剪切板写入数据，写入完成时，任务栏中的 WORD 图标会闪烁
// window.navigator.clipboard.read() 支持异步读取剪切板，但仅在安全环境可用。
// 考虑到大部分场景下根本不会粘贴很大的数据，因此目前仍然使用同步 API 读取剪切板。
// 
// document.addEventListener("paste", function(event) {
//    console.log("开始从剪切板读取数据...");
//
//    const t1 = new Date().getTime();
//    const html = event.clipboardData.getData("text/html");
//    const t2 = new Date().getTime();
//    console.log("数据读取完成，共耗时: " + (t2 - t1) + " ms");
// });
const clean = function(html) {
    if(html == null || html == undefined || html.length < 1) {
        return "";
    }

    // 去除条件注释
    // const text = html
    //     .replace(/^(\[)?if\s+[^>]*>|\[!if\s+[^>]*>/, "") // 移除条件注释的开头标记
    //     .replace(/<!\[endif\]>$|<!endif\]>$/, "")        // 移除条件注释的结尾标记
    //     .trim();
    const t1 = new Date().getTime();
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const PRESERVES = [
            "IMG", "BR", "HR",
            "INPUT", "BUTTON", "SELECT", "TEXTAREA",
            "P", "BLOCKQUOTE", "TABLE",
            "VIDEO", "AUDIO",
            // "CANVAS", "SVG", "IFRAME", "EMBED"
            "SOURCE", "TRACK"
    ];

    // 1. 移除所有注释
    // 通常仅针对从 WORD 中拷贝出来的内容
    // 某些条件注释内的内容处理后重新作为文档的一部分, 这会改变 DOM 结构, 所以放在最前面
    Comment.remove(doc, doc.body);

    // 2. 安全检查和节点替换
    // 仅作节点删除, 节点替换, 属性修改; DOM 结构不做大的改动
    doc.body.querySelectorAll("body *").forEach(function(e) {
        // 处理不安全的节点
        if(ElementFilter.filter(doc, e)) {
            e.remove();
            return;
        }

        // 替换节点
        ReplaceFilter.filter(doc, e);

        // 属性检查
        AttributeFilter.filter(doc, e);
    });

    // 3. 块节点提升为一级节点
    // 根节点: BODY, LI, TD
    // 块节点: P, PRE, OL, UL, BLOCKQUOTE, TABLE
    // 块节点只能作为根节点的一级节点存在，不能被非块节点嵌套
    // 唯一例外：P 不能包含任何其他块节点，但是自己可以被其他块节点嵌套
    doc.querySelectorAll("p, pre, ol, ul, blockquote, table").forEach(function(e) {
        while(true) {
            const parent = e.parentElement;

            if(parent != null && parent.nodeName != "LI" && parent.nodeName != "BLOCKQUOTE" && parent.nodeName != "TD" && parent.nodeName != "BODY") {
                parent.removeChild(e);
                parent.parentElement.insertBefore(e, parent);
            }
            else {
                break;
            }
        }
    });

    // 清除无意义的 span
    // 没有 style 属性的 SPAN 标签都没有意义
    doc.querySelectorAll("body span").forEach(function(e) {
        if(e.getAttributeNames().length < 1) {
            DOM.liftChildren(e);
        }
    });

    // 清除空标签
    doc.querySelectorAll("body *").forEach(function(e) {
        const nodeName = e.nodeName;

        // 强制保留的标签
        // 某些自关闭标签，如 IMG、INPUT 等
        // P 标签做为块元素，经常用来留空行，也保留
        if(PRESERVES.includes(nodeName)) {
            return;
        }

        // a.href 不为空则保留
        // 某些没有内容的 A 标签仅仅用来做锚点
        if(e.nodeName == "A") {
            const href = e.getAttribute("href");

            if(href && href.trim().length > 0) {
                return;
            }
        }

        let current = e;
        let parent = null;
        let count = 0;

        // 清除空节点
        // querySelectorAll 返回的结果集一定是由外向内, 即先父再子, 这会导致依次处理并不能移除掉父节点
        // 所以此处需要再做个由内向外
        while(current && current.nodeName != "P" && current.nodeName != "BODY") {
            if(current.children.length < 1 && current.textContent.trim() == "") {
                parent = current.parentElement;
                current.remove();
                current = parent;
            }
            else {
                break;
            }
        }
    });

    // 多个连续的、空的 P 标签只保留一个
    // WORD 中通常会有大量的空段落，例如封面和章节最后一页，都需要保留空段落，这通常是为了排版和打印
    // 但是在富文本编辑器内并不需要这样，因为富文本编辑器一般不用来写一本书或者写产品说明书，
    // 为了保持输出简洁合并多个空行
    Paragraph.compact(doc.body);

    // 合并多个连续的 PRE
    // 从 WORD 中拷贝出来的内容，代码块可能是多个零散的 PRE 拼接的，WORD 中看起来是一体的，
    // 但是导入之后会变成多个看起来不相干的代码块
    CodeBlock.compact(doc.body);

    return doc.body.innerHTML
        // .replace(/\s+/g, " ")    // 多个空格替换为1个
        .replace(/>\s+</g, "><")    // 标签间的空格剔除;
        .trim();
};

export default {
    "clean": clean,
    "compact": Paragraph.compact,
    "format": DOM.format,
};
