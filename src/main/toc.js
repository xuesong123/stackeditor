/**
 * $RCSfile: toc.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const TOC = {};
const SVG_ARROW = "<svg aria-hidden=\"true\" viewBox=\"0 0 1024 1024\"><path d=\"M498.7 655.8l-197.6-268c-8.1-10.9-0.3-26.4 13.3-26.4h395.2c13.6 0 21.4 15.4 13.3 26.4l-197.6 268c-6.6 9-20 9-26.6 0z\"></path></svg>";

/**
 * Table of Contents
 * @param {HTMLElement} element
 * @returns {Array}
 */
TOC.generate = function(element) {
    const headings = Array.from(element.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6"));
    const nodes = headings.map(function(e) {
        const level = parseInt(e.tagName.charAt(1));

        return {
            tag: e.tagName,
            level: level,
            text: e.textContent.trim(),
            id: e.id || "",
        };
    });

    // 构建层级树
    const tree = [];
    const stack = [];

    for(const node of nodes) {
        // 找到当前层级的父节点
        while(stack.length > 0 && stack[stack.length - 1].level >= node.level) {
            stack.pop();
        }

        if(stack.length == 0) {
            tree.push(node)
        }
        else {
            const parent = stack[stack.length - 1];
            parent.children = parent.children || [];
            parent.children.push(node);
        }
        stack.push(node);
    }
    return tree;
};

TOC.render = function(tree, container) {
    const root = document.createElement("ul");
    root.className = "toc-root";

    container.innerHTML = "";
    container.appendChild(root);

    tree.forEach(function(node) {
        TOC.build(node, root, 1);
    });
};

TOC.build = function(node, container, level) {
    const li = document.createElement("li");
    li.className = "toc-item";
    li.dataset.id = node.id;

    const hasChild = (node.children && node.children.length > 0);
    const toggle = hasChild ? "<span class=\"toc-toggle\">" + SVG_ARROW + "</span>" : "<span class=\"toc-icon\"></span>";

    li.innerHTML = "<div class=\"node level" + level + "\">"
        + toggle
        + "<a href=\"#" + node.id + "\" data-id=\"" + node.id + "\">" + node.text + "</a>"
        + "</div>";
    container.appendChild(li);

    if(hasChild) {
        const childrenWrap = document.createElement("ul");
        childrenWrap.className = "toc-children";
        li.appendChild(childrenWrap);

        node.children.forEach(function(child) {
            TOC.build(child, childrenWrap, level + 1);
        });

        // 折叠/展开
        li.querySelector(".toc-toggle").onclick = function(e) {
            e.preventDefault()
            this.closest("li.toc-item").classList.toggle("open");
        }
    }

    // 点击跳转, TOC 不支持多实例
    li.querySelector("div.node").addEventListener("click", function(event) {
        event.preventDefault();

        if(TOC.active) {
            TOC.active.classList.remove("active");
        }

        this.classList.add("active");
        TOC.active = this;

        const a = this.querySelector("a");

        if(a) {
            const id = a.getAttribute("data-id");
            const e = document.getElementById(id);

            if(e) {
                e.scrollIntoView({behavior: "smooth", block: "start"});
            }
        }
    });
};

TOC.support = function(b) {
    const id = "se-toc-style";
    const styles = document.getElementsByTagName("style");

    for(let i = 0; i < styles.length; i++) {
        if(id == (styles[i]).getAttribute("data-name")) {
            return;
        }
    }

    const rules = [
        "div.toc-container{position: absolute; top: 140px; left: 10px; bottom: 20px; padding: 8px 8px; width: 240px; /* min-height: 400px; max-height: 80vh; */ border: 1px solid #ff0000; border-radius: 8px; background: #ffffff; font-size: 14px; overflow-y: auto;}",
        "ul.toc-root{margin: 0px 0px; padding: 0px 0px;}",
        "ul > li.toc-item{margin: 4px 0; list-style: none;}",
        "ul > li.toc-item > div.node{width: 100%; height: 32px; box-sizing: border-box; display: flex; align-items: center; cursor: pointer;}",
        "ul > li.toc-item > div.node.active{background: #e8f4ff; color: #1677ff;}",
        "ul > li.toc-item > div.node:hover{background: #f6f6f6;}",
        "ul > li.toc-item > div.node.level1{padding-left: 8px;}",
        "ul > li.toc-item > div.node.level2{padding-left: 24px;}",
        "ul > li.toc-item > div.node.level3{padding-left: 40px;}",
        "ul > li.toc-item > div.node.level4{padding-left: 56px;}",
        "ul > li.toc-item > div.node.level5{padding-left: 64px;}",
        "ul > li.toc-item > div.node.level6{padding-left: 72px;}",
        "ul > li.toc-item > div.node a{text-decoration: none; color: #333333; cursor: pointer;}",
        "ul > li.toc-item > div.node span.toc-icon{display: inline-block; padding: 8px 4px; width: 24px; height: 32px; box-sizing: border-box; user-select: none; cursor: pointer;}",
        "ul > li.toc-item > div.node span.toc-toggle{display: inline-block; padding: 8px 4px; width: 24px; height: 32px; box-sizing: border-box; user-select: none; transform: rotate(-90deg); transition: transform 0.2s; cursor: pointer;}",
        "ul > li.toc-item.open > div.node .toc-toggle{transform: rotate(0deg);}",
        "ul > li.toc-item.open > ul.toc-children{display: block;}",
        "ul.toc-children{margin: 0px 0px; padding: 0px 0px; display: none;}"
    ];
    const style = document.createElement("style");
    style.type = "text/css";
    style.setAttribute("rel", "stylesheet");
    style.setAttribute("data-name", "se-toc-style");
    document.head.appendChild(style);

    if(b != false) {
        let sheet = (style.styleSheet || style.sheet);

        for(let i = 0; i < rules.length; i++) {
            let text = rules[i];

            if(text.length > 0) {
                sheet.insertRule(text);
            }
        }
    }
    else {
        style.textContent = rules.join("\r\n");
    }
};

// 滚动监听高亮当前标题
function bindScrollHighlight(container, element) {
    const items = container.querySelectorAll(".toc-item")
    const heads = Array.from(element.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6"));

    function update() {
        let current = null;

        heads.forEach(function(head) {
            const rect = head.getBoundingClientRect();

            if(rect.top <= 100 && rect.bottom >= 0) {
                current = head.id;
            }
        });

        items.forEach(function(item) {
            item.querySelector("div.node").classList.toggle("active", item.dataset.id == current);
        });
    }

    element.addEventListener("scroll", update);
    update();
};

// const tree = TOC.generate(document.body);
// TOC.render(tree, document.createElement("div"));
// bindScrollHighlight();
export default TOC;
