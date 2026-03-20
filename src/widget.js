/**
 * $RCSfile: widget.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as SVGSprite  from "./icons.js";

const {Sprite} = SVGSprite;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const DOM = {};
DOM.create = function(name, attrs, content) {
    const element = document.createElement(name);

    if(attrs) {
        const className = attrs["className"];

        if(className) {
            element.className = className;
        }

        for(let key in attrs) {
            element.setAttribute(key, attrs[key]);
        }
    }

    if(content) {
        if(Array.isArray(content)) {
            for(let i = 0; i < content.length; i++) {
                let item = content[i];

                if(typeof(item) == "string") {
                    element.appendChild(document.createTextNode(item));
                }
                else {
                    element.appendChild(DOM.create(item.tag, item.attrs, item.children));
                }
            }
        }
        else {
            element.innerHTML = content.toString();
        }
    }
    return element;
};

DOM.from = function(xml) {
    const template = document.createElement("template");
    template.innerHTML = xml;
    return template.content.firstElementChild;
};

DOM.move = function(e1, e2) {
    while(e2.firstChild) {
        e1.appendChild(e2.firstChild);
    }
};

DOM.empty = function(e) {
    while(e.firstChild) {
        e.removeChild(e.firstChild);
    }
};

DOM.setClass = function(element, name, on) {
    if(on) {
        element.classList.add(name);
    }
    else {
        element.classList.remove(name);
    }
};

DOM.getStyle = function(e, name) {
    if(e.style[name]) {
        return e.style[name];
    }
    else if(document.defaultView != null && document.defaultView.getComputedStyle != null) {
        let computedStyle = document.defaultView.getComputedStyle(e, null);

        if(computedStyle != null) {
            let property = name.replace(/([A-Z])/g, "-$1").toLowerCase();
            return computedStyle.getPropertyValue(property);
        }
    }
    else if(e.currentStyle != null) {
        return e.currentStyle[name];
    }
    return null;
};

DOM.getWidth = function(e) {
    if(e.nodeName == "BODY") {
        return document.documentElement.clientWidth;
    }

    let result = DOM.getStyle(e, "width");

    if(result != null) {
        result = parseInt(result.replace("px", ""));
    }
    return isNaN(result) ? 0 : result;
};

DOM.getHeight = function(e) {
    if(e.nodeName == "BODY") {
        return document.documentElement.clientWidth;
    }

    let result = DOM.getStyle(e, "height");

    if(result != null) {
        result = parseInt(result.replace("px", ""));
    }
    return isNaN(result) ? 0 : result;
};

DOM.getRelativeRect = function(e) {
    if(!e || e.nodeType != 1) {
        return {"top": 0, "left": 0, "width": 0, "height": 0};
    }

    const parent = e.offsetParent || document.body;
    const er = e.getBoundingClientRect();
    const pr = parent.getBoundingClientRect();
    const parentStyle = window.getComputedStyle(parent);
    const parentBorderTop = parseFloat(parentStyle.borderTopWidth) || 0;
    const parentBorderLeft = parseFloat(parentStyle.borderLeftWidth) || 0;
    const relativeTop = er.top - pr.top - parentBorderTop;
    const relativeLeft = er.left - pr.left - parentBorderLeft;
    return {"top": Math.round(relativeTop), "left": Math.round(relativeLeft), "width": e.offsetWidth, "height": e.offsetHeight};
};

DOM.getPosition = function(e) {
    const rect = e.getBoundingClientRect();
    return {"top": rect.top, "left": rect.left};
};

DOM.getZIndex = function(e) {
    const zIndex = parseInt(DOM.getStyle(e, "zIndex"));
    return isNaN(zIndex) ? 0 : zIndex;
};

DOM.center = function(src) {
    let c = src;

    if(typeof(src) == "string") {
        c = document.getElementById(src);
    }

    c.style.display = "block";

    const width = DOM.getWidth(c);
    const height = DOM.getHeight(c);
    const top = (window.pageYOffset || document.documentElement.scrollTop);
    const left = (window.pageXOffset || document.documentElement.scrollLeft)
    const y = top + parseInt((document.documentElement.clientHeight - height) / 2);
    const x = left + parseInt((document.documentElement.clientWidth - width) / 2);

    c.style.top = (y > 0 ? y : 0) + "px";
    c.style.left = (x > 0 ? x : 0) + "px";
};

DOM.scrollToTop = function(container = window, duration = 500) {
    const isWindow = container == window;
    const startTop = isWindow ? window.pageYOffset || document.documentElement.scrollTop : container.scrollTop;

    if(startTop == 0) {
        return;
    }

    let startTime = null;

    // 缓动函数：easeOutCubic 先快后慢
    const easeOutCubic = function(t, b, c, d) {
        t /= d;
        t--;
        return c * (t * t * t + 1) + b;
    };

    // 缓动函数：easeOutCubic 更快收尾
    const easeOutQuart = function(t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    };

    // 动画帧执行函数
    const animate = function(timestamp) {
        if (!startTime) {
            startTime = timestamp;
        }

        const elapsed = timestamp - startTime;
        const currentTop = easeOutCubic(
            elapsed, 
            startTop, 
            -startTop, // 目标：从 startTop 到 0
            duration
        );

        // 设置滚动位置
        if(isWindow) {
            window.scrollTo(0, currentTop);
        }
        else {
            container.scrollTop = currentTop;
        }

        // 动画结束后校准到顶部
        if(elapsed < duration) {
            requestAnimationFrame(animate);
        }
        else {
            isWindow ? window.scrollTo(0, 0) : (container.scrollTop = 0);
        }
    };
    requestAnimationFrame(animate);
};

DOM.select = function(element) {
    let nodeName = element.nodeName;

    if(nodeName == "INPUT" || nodeName == "TEXTAREA") {
        element.select();
        return;
    }

    try {
        const range = document.createRange();
        range.selectNodeContents(element);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
    catch(e) {
        console.error(e);
    }
};

DOM.copy = function(element) {
    let nodeName = element.nodeName;

    if(nodeName == "INPUT" || nodeName == "TEXTAREA") {
        return Toolkit.copy(element.value);
    }
    else {
        return Toolkit.copy(element.textContent);
    }
};

DOM.fullscreen = function(element, level) {
    if(element instanceof HTMLElement) {
        if(level == 2) {
            if(element.classList.contains("fullscreen")) {
                element.classList.remove("fullscreen");
            }
            else {
                element.classList.add("fullscreen");
            }
        }
        else {
            Fullscreen.toggle(element);
        }
    }
};

DOM.tooltip = function(element, message) {
    Toolkit.tooltip(element, message);
};

DOM.print = function(element) {
    // 辅助函数：获取所有父元素
    HTMLElement.prototype.parents = function() {
        let parents = [];
        let el = this.parentElement;

        while (el) {
            parents.push(el);
            el = el.parentElement;
        }
        return parents;
    };

    // 打印核心信息
    const rect = element.getBoundingClientRect();
    console.log("视口位置 left/top：", rect.left, rect.top);
    console.log("文档位置 left/top：", rect.left + window.scrollX, rect.top + window.scrollY);
    console.log("元素宽高：", rect.width, rect.height);
    console.log("是否有 transform：", getComputedStyle(element).transform !== 'none');
    console.log("box-sizing：", getComputedStyle(element).boxSizing);
    console.log("position：", getComputedStyle(element).position);
    console.log("display：", getComputedStyle(element).display);
    console.log("父元素是否有 transform：", Array.from(element.parents()).some(function(p) {
        getComputedStyle(p).transform != "none";
    }));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Toolkit = {};
Toolkit.copy = function(text) {
    if(Env.safe()) {
        try {
            // 忽略错误，不等待完成
            navigator.clipboard.writeText(text);
            return true;
        }
        catch(e) {
            console.error(e);
        }
    }

    if(document.execCommand) {
        let e = document.createElement("textarea");
        e.style.cssText = "position: absolute; top: 0px; left: 0px; width: 100px; height: 100px; opacity: 0.01; z-index: -10;";
        e.value = text;
        document.body.appendChild(e);

        e.focus();
        e.select();
        document.execCommand("copy", true);
        document.body.removeChild(e);
            return true;
    }
    return false;
};

Toolkit.copyHTML = function(element) {
    try {
        const container = document.createElement("div");
        container.contentEditable = true;
        container.style.position = "absolute";
        container.style.top = "-9999px";
        container.style.left = "-9999px";
        container.style.width = "1px";
        container.style.height = "1px";
        container.style.overflow = "hidden";
        container.style.userSelect = "text";
        container.innerHTML = element.innerHTML;
        document.body.appendChild(container);

        const range = document.createRange();
        range.selectNodeContents(container);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        let success = false;

        if(navigator.clipboard && window.ClipboardItem) {
            const html = new Blob([element.innerHTML], { type: "text/html" });
            const text = new Blob([element.textContent], { type: "text/plain" });

            navigator.clipboard.write([
                new ClipboardItem({"text/html": htmlContent, "text/plain": textContent})
            ]);
            success = true;
        }
        else {
            success = document.execCommand('copy');
        }

        selection.removeAllRanges();
        document.body.removeChild(container);
        return success;
    }
    catch(e) {
        console.error(e);
    }
    return false;
};

Toolkit.tooltip = function(source, message) {
    const ele = document.createElement("div");
    ele.className = "se-widget-tooltip";
    ele.appendChild(document.createTextNode(message));

    if(source) {
        const rect = source.getBoundingClientRect();
        ele.style.top = (rect.top + rect.height + 4) + "px";
        ele.style.left = rect.left + "px";
    }
    document.body.appendChild(ele);

    setTimeout(function() {
        const handle = function handler() {
            document.body.removeChild(ele);
            ele.removeEventListener("transitionend", handler);
        };

        ele.classList.add("fade-out");
        ele.addEventListener("transitionend", handle, { once: true });
    }, 1000);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Fullscreen = {};
Fullscreen.toggle = function(element) {
    if(element == document.body || element == document.documentElement) {
        const current = Fullscreen.current();

        if(current) {
            Fullscreen.exit();
        }
        else {
            Fullscreen.open(document.documentElement);
        }
        return;
    }

    const eventName = "fullscreenchange";
    const change = function() {
        const current = Fullscreen.current();

        if(current == null || current == undefined) {
            element.classList.remove("fullscreen");
            document.removeEventListener(eventName, change);
        }
    };

    if(element.classList.contains("fullscreen")) {
        element.classList.remove("fullscreen");
        Fullscreen.exit();
        document.removeEventListener(eventName, change);
    }
    else {
        element.classList.add("fullscreen");
        Fullscreen.open(document.documentElement);
        document.addEventListener(eventName, change, {once: false});
    }
};

Fullscreen.open = function(e) {
    try {
        if(e.requestFullscreen) {
            e.requestFullscreen();
        }
        else if(e.webkitRequestFullScreen) {
            if(window.navigator.userAgent.toUpperCase().indexOf("CHROME") >= 0) {
                e.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            else {
                e.webkitRequestFullScreen();
            }
        }
        else if(e.mozRequestFullScreen) {
            e.mozRequestFullScreen();
        }
        else if(e.msRequestFullscreen) {
            e.msRequestFullscreen();
        }
    }
    catch(e) {
    }
};

Fullscreen.exit = function(e) {
    try {
        const current = Fullscreen.current();

        if(current) {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if(document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    catch(e) {
    }
};

Fullscreen.current = function() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Events = {};
Events.stop = function(event) {
    if(event != null) {
        if(event.stopPropagation) {
            event.stopPropagation();
        }

        if(event.preventDefault) {
            event.preventDefault();
        }

        event.cancel = true;
        event.cancelBubble = true;
        event.returnValue = null;
    }
    return false;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Bytes = {
    KB: 1024,
    MB: 1048576,
    GB: 1073741824,
    TB: 1099511627776,
    PB: 1125899906842624,
    format: function(size, precision) {
        if(isNaN(size)) {
            return "NaN";
        }

        if(precision == null || precision == undefined) {
            precision = 0;
        }

        if(size < Bytes.KB) {
            return size + " B";
        }
        else if(size < Bytes.MB) {
            return (size / Bytes.KB).toFixed(precision) + " KB";
        }
        else if (size < Bytes.GB) {
            return (size / Bytes.MB).toFixed(precision) + " MB";
        }
        else if (size < Bytes.TB) {
            return (size / Bytes.GB).toFixed(precision) + " GB";
        }
        else if (size < Bytes.PB) {
            return (size / Bytes.TB).toFixed(precision) + " TB";
        }
        else {
            return (size / Bytes.PB).toFixed(precision) + " PB";
        }
    },
    keep: function(num, precision) {
        const pow = Math.pow(10, precision);
        return Math.round(num * pow) / pow;
    }
};

const DataURI = {};

DataURI.test = function(url) {
    return url.startsWith("data:image/");
};

DataURI.toBlob = function(url) {
    // data:image/png;base64,iVBORw0...
    const [header, base64] = url.split(",");

    if(!base64) {
        throw new Error("无效的 DataURL 格式，缺少 base64 数据");
    }

    const mime = DataURI.getMimeType(header);
    const binary = atob(base64);
    const length = binary.length;
    const buffer = new Uint8Array(length);

    for(let i = 0; i < length; i++) {
        buffer[i] = binary.charCodeAt(i);
    }

    const ext = DataURI.getExtension(mime);
    const blob = new Blob([buffer], {type: mime});
    blob.name = "base64." + ext;
    blob.lastModified = new Date().getTime();
    return blob;
};

DataURI.clean = function() {
  return data
    .replace(/\s+/g, "")             // 移除所有空格（包括换行/制表符）
    .replace(/^data:.+;base64,/, "") // 移除 DataURL 前缀
    .replace(/-/g, "+")              // 处理 URL 安全的 Base64
    .replace(/_/g, "/");             // 处理 URL 安全的 Base64
};

DataURI.getMimeType = function(header) {
    const array = header.match(/:(.*?);/);
    return (array ? array[1] : "application/octet-stream");
};

DataURI.getExtension = function(mime) {
    if(mime.startsWith("image/")) {
        return mime.substring(6);
    }
    return "bin";
};

const FileType = {};
FileType.getName = function(path) {
    if(path == null || path == undefined || path.length < 1) {
        return "";
    }

    let c = null;
    let i = path.length - 1;

    for(; i > -1; i--) {
        c = path.charAt(i);

        if(c == "/" || c == "\\" || c == ":") {
            break;
        }
    }
    return path.substring(i + 1);
};

FileType.getType = function(path) {
    if(path == null || path == undefined || path.length < 1) {
        return "";
    }

    let c = null;
    let i = path.length - 1;

    for(; i > -1; i--) {
        c = path.charAt(i);

        if(c == ".") {
            return path.substring(i + 1).toLowerCase();;
        }
        else if(c == "/" || c == "\\" || c == ":") {
            return "";
        }
        else {
        }
    }
    return "";
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const FilePicker = {};
FilePicker.choose = function(accept, multiple, callback) {
    let id = "se6_file_picker_input";
    let input = document.getElementById(id);

    if(input == null || input == undefined) {
        input = document.createElement("input");
        input.id = id;
        input.type = "file";

        let div = document.createElement("div");
        div.style.display = "none";
        div.appendChild(input);
        document.body.appendChild(div);

        input.addEventListener("change", function() {
            let files = input.files;

            if(files == null || files.length < 1) {
                return;
            }

            if(input.callback == null || input.callback == undefined) {
                return;
            }

            input.callback(files);
            input.callback = null;
        });
    }

    input.value = "";
    input.accept = (accept || "*");
    input.multiple = "multiple";
    input.callback = callback;
    input.click();
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Resource = {"HOME": ""};
Resource.guess = function() {
    Resource.HOME = Resource.find();
    Icon.FILE = Resource.HOME + "/images/icons.svg";
};

Resource.find = function() {
    let home = "";

    try {
        home = Resource.getURL("./", import.meta.url).href;
    }
    catch(e) {
        console.error(e);
    }

    if(home == "") {
        const name = "stackeditor";
        const eles = document.getElementsByTagName("script");

        for(let i = 0; i < eles.length; i++) {
            let src = eles[i].src;

            if(src && src.length > 0) {
                let result = Resource.parse(src);

                if(result.name == name) {
                    home = new URL("./", src).href;
                }
            }
        }
    }

    if(home.endsWith("/")) {
        home = home.substring(0, home.length - 1);
    }
    return home;
};

Resource.getURL = function(url, base) {
    return new URL(url, base);
};

Resource.parse = function(path) {
    const left = function(value, chars) {
        let sub = value;

        for(let i = 0; i < chars.length; i++) {
            const k = sub.lastIndexOf(chars[i]);

            if(k > -1) {
                sub = sub.substring(0, k);
            }
        }
        return sub;
    };
    const name = left(path.split("/").pop(), ["?", "#"]);
    const reg = /stackeditor-(\d+\.\d+\.\d+)\.([a-z]+)\.js$/;
    const array = name.match(reg);
    const result = {
        "name": null,
        "version": "1.0.0",
        "format": "UK"
    };

    if(array) {
        result.name = "stackeditor";
        result.version = array[1];
        result.format = array[2];
    }
    return result;
};

const SVG = {};
SVG.create = function(href) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");

    svg.setAttribute("aria-hidden", "true");
    use.setAttributeNS("http://www.w3.org/1999/xlink", "href", href);
    svg.appendChild(use);
    return svg;
};

const Icon = {"FILE": "/stackeditor-1.0.0/images/icons.svg"};
Icon.create = function(icon) {
    if(icon) {
        if(icon instanceof Node) {
            return icon;
        }

        if(icon.length > 0) {
            const c = icon.charAt(0);

            if(c == "<") {
                return DOM.from(icon);
            }
            else if(icon.indexOf("#") < 0) {
                // 使用内置图标库
                const code = Icon.get(icon);

                if(code) {
                    return DOM.from(code);
                }
                return DOM.from("<span class=\"none\"></span>");
            }
            else {
                // /assets/icons.svg#smile
                return SVG.create(icon);
            }
        }
    }
    return null;
};

Icon.get = function(name) {
    const key = name.replace(/-/g, "_").toUpperCase();
    return Sprite[key];
};

Icon.forecolor = function(color) {
    // 当光标位置的文本设置了颜色时，动态修改图标的颜色
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");

    svg.setAttribute("viewBox", "0 0 1024 1024");
    path1.setAttribute("d", "M456.021333 0L163.157333 768h139.264l60.757334-179.2h297.642666l65.536 179.2h139.264L572.757333 0h-116.736zM512 163.157333l107.178667 318.464h-219.136L512 163.157333z");
    path2.setAttribute("d", "M102.4 870.4v153.6h819.2v-153.6H102.4z m0 0");

    if(color) {
        path2.setAttribute("fill", color);
    }

    svg.appendChild(path1);
    svg.appendChild(path2);
    return svg;
};

Icon.backcolor = function(color) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");

    svg.setAttribute("viewBox", "0 0 1024 1024");
    path1.setAttribute("d", "M0 0v1024h1024V0H0z m928 898.29376c0 16.39936-13.30688 29.70624-29.70624 29.70624h-237.72416c-16.41216 0-29.70624-13.30688-29.70624-29.70624v-29.72416c0-16.41216 13.29408-29.70624 29.70624-29.70624h65.8176l-61.85984-178.29376H359.47008l-61.85728 178.29376h65.8176c16.40704 0 29.71648 13.29408 29.71648 29.70624v29.72416c0 16.39936-13.30944 29.70624-29.71648 29.70624H125.71648c-16.41472 0-29.71648-13.30688-29.71648-29.70624v-29.72416c0-16.41216 13.30176-29.70624 29.71648-29.70624H187.5968l250.7264-722.87744a29.71136 29.71136 0 0 1 28.08064-19.98336h91.18976a29.71392 29.71392 0 0 1 28.09344 19.98336l250.72128 722.87744h61.88544c16.39936 0 29.70624 13.29408 29.70624 29.70624v29.72416z");
    path2.setAttribute("d", "M390.41024 571.43296h243.1744L512 221.00224z");

    if(color) {
        path1.setAttribute("fill", color);
        path2.setAttribute("fill", color);
    }

    svg.appendChild(path1);
    svg.appendChild(path2);
    return svg;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Template = {};
Template.merge = function(text, context) {
    let c;
    let buf = [];
    let map = (context || {});

    for(let i = 0, length = text.length; i < length; i++) {
        c = text.charAt(i);

        if(c == "$" && i < length - 1 && text.charAt(i + 1) == "{") {
            let k = text.indexOf("}", i + 2);

            if(k > -1) {
                let name = text.substring(i + 2, k);
                let value = map[name];

                if(value != null) {
                    buf.push(value);
                }
                i = k;
            }
            else {
                buf.push(text.substring(i + 2));
                break;
            }
        }
        else {
            buf.push(c);
        }
    }
    return buf.join("");
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 空串 与 null, undefined 相等
const Value = {};
Value.equals = function(v1, v2) {
    return ((v1 != null && v1 != undefined) ? v1 : "") == ((v2 != null && v2 != undefined) ? v2 : "");
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Env = {};

// security
Env.http = function() {
    return (window.location.protocol == "http:");
};

Env.https = function() {
    return (window.location.protocol == "https:");
};

Env.local = function() {
    const protocol = window.location.protocol;
    return (protocol == "file:" || protocol == "localhost" || protocol == "127.0.0.1");
};

Env.safe = function() {
    const protocol = window.location.protocol;
    return (protocol == "https:" || protocol == "file:" || protocol == "localhost" || protocol == "127.0.0.1");
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 拖动组件
let Draggable = function(element, target) {
    this.x = 0;
    this.y = 0;
    this.element = element;
    this.target = target;
    this.dragging = false;
    this.mask = document.getElementById("se-draggable-mask");
    this.frame = document.getElementById("se-draggable-frame");

    const instance = this;
    this.stopHandler = function(event) {
        Events.stop(event);
        instance.stop(event);
    };
    this.moveHandler = function(event) {
        Events.stop(event);
        instance.move(event);
    };

    if(this.mask == null) {
        this.mask = document.createElement("div");
        this.mask.id = "se-draggable-mask";
        this.mask.className = "se-draggable-mask";
        document.body.appendChild(this.mask);
    }

    if(this.frame == null) {
        this.frame = document.createElement("div");
        this.frame.id = "se-draggable-frame";
        this.frame.className = "se-draggable-frame";
        this.frame.innerHTML = "<div class=\"se-draggable-body\"></div>";
        document.body.appendChild(this.frame);
    }

    if(this.target != null) {
        this.target.style.position = "absolute";
    }

    if(this.element != null) {
        this.element.addEventListener("mousedown", function(event) {
            Events.stop(event);
            instance.start(event);
        });
    }
};

Draggable.prototype.start = function(event) {
    const src = (event.srcElement || event.target);

    // 鼠标左键: keyCode == 1, button: 0
    if(event.button != 0) {
        return true;
    }

    if(src.getAttribute("draggable") == "false") {
        return true;
    }

    this.dragging = false;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.offsetY = event.clientY - this.target.offsetTop;
    this.offsetX = event.clientX - this.target.offsetLeft;
    this.frame.style.width = (this.target.offsetWidth - 2) + "px";
    this.frame.style.height = (this.target.offsetHeight - 2) + "px";
    this.frame.style.display = "none";
    this.sync = (this.element.getAttribute("data-drag-sync") == "true");

    document.addEventListener("mouseup", this.stopHandler);
    document.addEventListener("mousemove", this.moveHandler);
    return true;
};

Draggable.prototype.move = function(event) {
    const x = event.clientX - this.offsetX;
    const y = event.clientY - this.offsetY;

    if(y < 0) {
        return false;
    }

    if(this.dragging == false) {
        if(Math.abs(event.clientX - this.startX) > 2 || Math.abs(event.clientY - this.startY) > 2) {
            this.dragging = true;
        }
        else {
            return false;
        }
    }

    const zIndex = DOM.getZIndex(this.target);
    this.mask.style.zIndex = zIndex + 8;
    this.mask.style.display = "block";

    this.frame.style.top = y + "px";
    this.frame.style.left = x + "px";
    this.frame.style.zIndex = zIndex + 10;
    this.frame.style.display = "block";

    if(this.sync) {
        this.target.style.top = y + "px";
        this.target.style.left = x + "px";
    }
    return false;
};

Draggable.prototype.stop = function(event) {
    let y = this.frame.offsetTop;
    let x = this.frame.offsetLeft;

    if(y < 0) {
        y = 0;
    }

    document.removeEventListener("mouseup", this.stopHandler);
    document.removeEventListener("mousemove", this.moveHandler);
    this.frame.style.zIndex = -1;
    this.frame.style.display = "none";
    this.mask.style.display = "none";

    if(this.dragging != true) {
        return false;
    }

    this.dragging = false;
    this.target.style.marginTop = "0px";
    this.target.style.marginLeft = "0px";
    this.target.style.top = y + "px";
    this.target.style.left = x + "px";
    return false;
};

Draggable.bind = function(element, target){
    let e1 = null;
    let e2 = null;

    if(typeof(element) == "string") {
        e1 = document.getElementById(element);
    }
    else {
        e1 = element;
    }

    if(typeof(target) == "string") {
        e2 = document.getElementById(target);
    }
    else {
        e2 = target;
    }

    if(e1 != null && e2 != null) {
        new Draggable(e1, e2);
    }
};

// 缩放组件
class Resizable {
    constructor(element) {
        this.container = element.parentNode;
        this.container.classList.add("resizable-wrapper");
        this.element = element;
        this.create();
    }

    create() {
        const edges = ["n", "s", "w", "e"];
        const corners = ["nw", "ne", "sw", "se"];
        this.handles = [];

        edges.concat(corners).forEach((pos) => {
            const handle = document.createElement("span");

            handle.className = "resize-handle " + pos;
            handle.addEventListener("mousedown", (e) => this.start(e, pos));
            this.container.appendChild(handle);
            this.handles.push(handle);
        });

        this.element.addEventListener("click", (e) => {
            e.stopPropagation();
            this.select();
        });

        // 双击切换比例锁定
        this.element.addEventListener("dblclick", () => {
            this.keepRatio = !this.keepRatio;
            this.info(this.keepRatio ? "锁定比例" : "自由调整");
        });
    }

    info(text) {
        const ele = document.createElement("div");
        ele.className = "tooltip";
        ele.textContent = text;
        this.container.appendChild(ele);

        setTimeout(function() {
            ele.style.opacity = 0;
        }, 1000);

        setTimeout(function() {
            ele.remove();
        }, 2000);
    }

    start(e, position) {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const rect = this.element.getBoundingClientRect();
        const startWidth = rect.width;
        const startHeight = rect.height;
        const ratio = startWidth / startHeight;
        this.container.classList.add("resizing");

        const mousemove = (e) => {
            let newWidth = startWidth;
            let newHeight = startHeight;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            // 根据手柄位置计算新尺寸
            if(position.includes("e")) {
                newWidth = startWidth + dx;
            }

            if(position.includes("w")) {
                newWidth = startWidth - dx;
            }

            if(position.includes("s")) {
                newHeight = startHeight + dy;
            }

            if(position.includes("n")) {
                newHeight = startHeight - dy;
            }

            // 处理比例锁定
            if(this.keepRatio && (position === "n" || position === "s" || position === "e" || position === "w")) {
                if(position === "n" || position === "s") {
                    newWidth = newHeight * ratio;
                }
                else {
                    newHeight = newWidth / ratio;
                }
            }

            // 最小尺寸限制
            newWidth = Math.max(30, newWidth);
            newHeight = Math.max(30, newHeight);

            // 应用新尺寸
            this.element.style.width = Math.round(newWidth) + "px";
            this.element.style.height = Math.round(newHeight) + "px";

            this.update(newWidth, newHeight);
            this.pending = {"width": newWidth, "height": newHeight};
        };

        const mouseup = () => {
            document.removeEventListener("mousemove", mousemove);
            document.removeEventListener("mouseup", mouseup);
            this.container.classList.remove("resizing");
            this.commit(this.pending);
            this.pending = null;
        };

        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
    }

    commit(size) {
    }

    /**
     * @Override
     */
    select() {

    }

    /**
     * @Override
     */
    deselect() {
    }

    /**
     * @Override
     */
    destroy() {
    }
};

/**
 * @element HTMLElement
 */
const MenuItem = function(spec) {
    // Object
    this.spec = spec;

    // String
    this.name = spec.name;

    // String, Describes an icon to show for this item.
    this.icon = spec.icon;

    // Makes the item show up as a text label. Mostly useful for items
    // wrapped in a [drop-down](#menu.Dropdown) or similar menu. The object
    // should have a `label` property providing the text to display.
    // 使该项目显示为文本标签。主要用于包含在[下拉菜单](#menu.Dropdown)或类似菜单中的项目。该对象应具有一个 `label` 属性来提供要显示的文本。
    this.label = spec.label;

    // Defines DOM title (mouseover) text for the item.
    this.title = spec.title;

    // 快捷键
    this.shortcut = spec.shortcut;

    /// Optionally adds a CSS class to the item's DOM representation.
    this.className = spec.className;

    /// Optionally adds a string of inline CSS to the item's DOM
    /// representation.
    this.style = spec.style;

    // 是否禁用
    this.disabled = spec.disabled;

    // child MenuItem
    this.items = spec.items;
};

/**
 * @dom HTMLElement
 * A function that renders the item. You must provide either this, [`icon`](#menu.MenuItemSpec.icon), or [`label`](#MenuItem.label).
 */
MenuItem.prototype.render = function() {
    if(this.spec && this.spec.render) {
        return this.spec.render.apply(this);
    }

    let element = document.createElement("div");
    element.className = "se-menuitem";

    let button = document.createElement("button");
    button.type = "button";
    button.className = "se-button";

    if(this.disabled == true) {
        button.disabled = true;
    }

    if(this.style) {
        button.setAttribute("style", this.style);
    }

    button.setAttribute("data-name", this.name);
    button.setAttribute("data-title", (this.title || this.label));
    button.setAttribute("aria-label", (this.title || this.label));

    if(this.items != null && this.items != undefined && this.items.length > 0) {
        button.setAttribute("data-value", "#");
    }

    element.appendChild(button);

    if(this.items != null && this.items != undefined && this.items.length > 0) {
        if(this.icon) {
            button.style.width = "52px";
            button.appendChild(Icon.create(this.icon));
            button.appendChild(Icon.create("arrow"));
        }
        else {
            let span1 = document.createElement("span");
            let span2 = document.createElement("span");
            span1.className = "text ellipsis";
            span1.style.width = "80px";
            span1.appendChild(document.createTextNode(this.label));

            span2.className = "more";
            span2.appendChild(Icon.create("arrow"));

            button.appendChild(span1);
            button.appendChild(span2);
            element.appendChild(button);
        }
    }
    else {
        button.appendChild(Icon.create(this.icon));
    }
    return (this.element = element);
};

/**
 * @state EditorState
 * @dispatch Transaction
 * @view EditorView
 * @event HTMLEvent
 * The function to execute when the menu item is activated.
 */
MenuItem.prototype.run = function(/* ... args */) {
    if(this.spec && this.spec.run) {
        this.spec.run.apply(this, arguments);
    }
    else {
        console.log("MenuItem.spec.run() is undefined: " + this.name);
    }
};

/**
 * Optional function that is used to determine whether the item is appropriate at the moment. Deselected items will be hidden.
 * 判断在当前选区位置，该命令是否可以被执行。如果不可以被执行，则禁用按钮
 * @state EditorState
 * @return boolean
 */
MenuItem.prototype.select = function(/* ... args */) {
    if(this.spec && this.spec.select) {
        return this.spec.select.apply(this, arguments);
    }
    return true;
};

/**
 * Function that is used to determine if the item is enabled. If given and returning false, the item will be given a disabled styling.
 * 用于确定项目是否启用的函数。如果提供且返回 false，该项目将被赋予禁用样式。
 * @state EditorState
 * @return boolean
 */
MenuItem.prototype.enable = function(/* ... args */) {
    if(this.spec && this.spec.enable) {
        return this.spec.enable.apply(this, arguments);
    }
    return true;
};

/**
 * A predicate function to determine whether the item is 'active' (for example, the item for toggling the strong mark might be active then the cursor is in strong text).
 * 一个断言函数，用于判断某项是否处于「激活状态」（例如：切换粗体标记（strong mark）的功能项，可能会在光标位于粗体文本范围内时处于激活状态）。
 * @return boolean
 */
MenuItem.prototype.active = function(/* ... args */) {
    if(this.spec && this.spec.active) {
        return this.spec.enable.active(this, arguments);
    }
    return false;
};

/**
 */
MenuItem.prototype.update = function() {
};

/**
 * 
 */
const Divider = function() {
    this.spec = {};
    this.name = "|";
};

Divider.prototype.render = function() {
    this.element = document.createElement("div");
    this.element.className = "divider";
    this.element.role = "separator";
    return this.element;
};

Divider.prototype.update = function() {
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 下拉菜单，对应 HTML 标签中的 <select>, 不允许存在二级菜单
 */
const DropdownMenu = function(spec) {
    // Object
    this.spec = spec;

    // String
    this.name = spec.name;

    // String, Describes an icon to show for this item.
    this.icon = spec.icon;

    // Makes the item show up as a text label. Mostly useful for items
    // wrapped in a [drop-down](#menu.Dropdown) or similar menu. The object
    // should have a `label` property providing the text to display.
    // 使该项目显示为文本标签。主要用于包含在[下拉菜单](#menu.Dropdown)或类似菜单中的项目。该对象应具有一个 `label` 属性来提供要显示的文本。
    this.label = spec.label;

    // Defines DOM title (mouseover) text for the item.
    this.title = spec.title;

    // 快捷键
    this.shortcut = spec.shortcut;

    /// Optionally adds a CSS class to the item's DOM representation.
    this.className = spec.className;

    /// Optionally adds a string of inline CSS to the item's DOM
    /// representation.
    this.style = spec.style;

    // current value
    this.value = spec.value;

    // child MenuItem
    this.items = spec.items;
};

DropdownMenu.prototype.render = function() {
    if(this.spec && this.spec.render) {
        return this.spec.render.apply(this);
    }

    const element = document.createElement("div");
    element.className = "se-menuitem se-dropdown";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "se-button";
    button.disabled = (this.disabled == true);

    if(this.style) {
        button.setAttribute("style", this.style);
    }

    button.setAttribute("aria-haspopup", "menu");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("data-name", this.name);
    button.setAttribute("data-title", this.title);

    if(this.icon) {
        button.style.width = "52px";
        button.appendChild(Icon.create(this.icon));
        button.appendChild(Icon.create("arrow"));
    }
    else {
        let span1 = document.createElement("span");
        span1.className = "text ellipsis";
        span1.style.width = "80px";
        span1.appendChild(document.createTextNode(this.label));

        let span2 = document.createElement("span");
        span2.className = "more";
        span2.appendChild(Icon.create("arrow"));

        button.appendChild(span1);
        button.appendChild(span2);
    }

    button.addEventListener("click", this.open.bind(this));
    element.appendChild(button);
    this.element = element;
    return element;
};

DropdownMenu.prototype.open = function(event) {
    if(this.element.querySelector("div.se-dropdown-menu")) {
        return;
    }

    const instance = this;
    const children = this.items;
    const div1 = document.createElement("div");
    div1.className = "se-dropdown-menu";
    div1.tabIndex = -1;

    for(let i = 0; i < children.length; i++) {
        const item = children[i];
        const element = item.render();
        const button = element.querySelector("button.se-button");

        if(button) {
            if(this.value == item.value) {
                button.classList.add("active");
            }
            button.addEventListener("click", this.select.bind(this, item.value));
        }
        else {
            if(this.value == item.value) {
                element.classList.add("active");
            }

            element.setAttribute("role", "button");
            element.addEventListener("click", this.select.bind(this, item.value));
        }
        div1.appendChild(element);
    }

    const source = this.element.querySelector("button.se-button");

    if(source) {
        source.setAttribute("aria-expanded", "true");
        source.classList.add("active");
    }
    this.element.appendChild(div1);
    div1.focus();

    const handle = function(event) {
        const e = (event.target || event.srcElement);
        const b = e.closest("button.se-button");

        if(div1.contains(e) || b == instance.element.querySelector("button.se-button")) {
            return;
        }
        else {
            if(source) {
                source.setAttribute("aria-expanded", "false");
            }
            document.removeEventListener("click", handle);
            instance.close();
        }
    };

    setTimeout(function() {
        document.addEventListener("click", handle);
    }, 200);
};

DropdownMenu.prototype.select = function(value, event) {
    Events.stop(event);

    this.close();
    this.setValue(value);
    this.change(event);
};

DropdownMenu.prototype.update = function() {
    for(let i = 0; i < this.items.length; i++) {
        let item = this.items[i];

        if(item.spec.active && item.spec.active(state)) {
            this.setValue(item.label);
            break;
        }
    }
};

DropdownMenu.prototype.setValue = function(value) {
    let label = "";
    const button = this.element.querySelector("button.se-button");

    if(button) {
        const span = button.querySelector("span.text");

        if(span) {
            for(let i = 0; i < this.items.length; i++) {
                if(this.items[i].value == value) {
                    label = this.items[i].label;
                    break;
                }
            }
            span.textContent = label;
        }
    }
    this.label = label;
    this.value = value;
};

DropdownMenu.prototype.getValue = function(value) {
    return this.value;
};

DropdownMenu.prototype.change = function() {
};

DropdownMenu.prototype.close = function() {
    const button = this.element.querySelector("button.se-button");
    const div = this.element.querySelector("div.se-dropdown-menu");

    if(button) {
        button.classList.remove("active");
    }

    if(div) {
        div.remove();
    }
};

const DropdownItem = function(spec) {
    this.spec = spec;
    this.icon = spec.icon;
    this.label = spec.label;
    this.value = spec.value;
};

DropdownItem.prototype.render = function() {
    this.element = document.createElement("div");
    this.element.className = "se-dropdown-item";

    if(this.spec.render) {
        this.spec.render.apply(this);
    }
    else {
        const button = DOM.create("button", {"class": "se-button"});
        const span1 = DOM.create("span", {"class": "icon"});
        const span2 = DOM.create("span", {"class": "text"}, [this.label]);

        if(this.icon) {
            span1.appendChild(Icon.create(this.icon));
        }
        else {
            span1.className = "checkable";
        }

        button.appendChild(span1);
        button.appendChild(span2);
        this.element.appendChild(button);
    }
    return this.element;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Bind = {
    /**
     * @return function
     */
    click: function() {
        return function(event) {
        };
    },

    /**
     * @return function
     */
    hover: function() {
        return function(event) {
        };
    },

    /**
     * @return function
     */
    leave: function() {
        return function(event) {
        };
    },

    /**
     * @return function
     */
    update: function() {
        return function(/* ... args */) {
        };
    }
};

const MenuBar = function(container, items, bind) {
    this.container = container;
    this.items = items;
    this.bind = bind;
};

MenuBar.prototype.render = function() {
    let fragment = document.createDocumentFragment();

    for(let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        const element = item.render();
        const button = element.querySelector("button.se-button");

        if(item instanceof DropdownMenu) {
            if(button) {
                button.role = "menuitem";
            }
            // 下拉菜单
            item.change = this.bind.change(item);
        }
        else if(item instanceof Divider) {
            // do nothing
        }
        else {
            if(item.items && item.items.length > 0) {
                let c = document.createElement("div");
                item.element.appendChild(c);
                item.submenu = new ContextMenu(c, item.items, this.bind);

                // 普通菜单
                const handle = function(event) {
                    this.submenu.open({"top": "36px", "left": "0px"});
                }.bind(item);

                // 单击时打开子菜单
                if(button) {
                    button.role = "menuitem";
                    button.setAttribute("aria-haspopup", "menu");
                    button.setAttribute("aria-expanded", "false");
                    button.addEventListener("click", handle);
                }
                else {
                    element.setAttribute("role", "menuitem");
                    element.setAttribute("aria-haspopup", "menu");
                    element.setAttribute("aria-expanded", "false");
                    element.addEventListener("click", handle);
                }
            }
            else {
                // 普通按钮
                if(button) {
                    button.role = "menuitem";
                    button.addEventListener("click", this.bind.click(item));
                }
                else {
                    element.setAttribute("role", "menuitem");
                    element.addEventListener("click", this.bind.click(item));
                }
            }
        }
        fragment.appendChild(element);
    }

    this.container.appendChild(fragment);
    this.resize();
};

MenuBar.prototype.update = function(/* ... args */) {
    for(let i = 0; i < this.items.length; i++) {
        let item = this.items[i];

        if(item.update) {
            item.update.apply(item, arguments);
        }
    }
};

MenuBar.prototype.resize = function() {
    let eles = this.container.querySelectorAll("div.divider");

    for(let i = 0; i < eles.length; i++) {
        let e = eles[i];
        let n = e.nextElementSibling;

        if(n) {
            e.classList.toggle("hide", n.offsetTop > e.offsetTop);
        }
    }
};

MenuBar.prototype.destroy = function() {
    if(this.container) {
        this.container.remove();
        this.container = null;
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * 普通菜单，允许出现多级
 */
const ContextMenu = function(container, items, bind) {
    this.container = container;
    this.items = items;
    this.bind = bind;
    this.closeHandler = this.close.bind(this);
};

ContextMenu.prototype.getContainer = function(b) {
    if(this.container == null || this.container == undefined) {
        this.container = this.create();
    }
    else {
        if(this.container.querySelectorAll("div.item").length < 1) {
            this.container = this.create();
        }
    }
    return this.container;
};

ContextMenu.prototype.create = function() {
    let instance = this;
    let container = this.container;

    if(container == null || container == undefined) {
        container = document.createElement("div");
        container.className = "se-contextmenu";
        container.role = "menu";
        container.draggable = false;
        container.tabIndex = -1;
        document.body.appendChild(container);
    }
    else {
        container.classList.add("se-contextmenu", "fixed");
        container.role = "menu";
        container.innerHTML = "";
    }

    for(let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        const element = this.build(item);
        const button = element.querySelector("se-button");

        if(button) {
            button.addEventListener("click", this.bind.click(item));
            button.addEventListener("click", this.closeHandler);
        }
        else {
            element.addEventListener("click", this.bind.click(item));
            element.addEventListener("click", this.closeHandler);
        }
        container.appendChild(element);
    }
    return container;
};

ContextMenu.prototype.build = function(item) {
    if(item.spec && item.spec.render) {
        return item.spec.render.apply(item);
    }

    const element = document.createElement("div");
    element.role = "menuitem";
    element.className = "item";

    if(item.name == "|") {
        element.className = "divider";
        element.role = "separator";
        return element;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "se-button";
    button.role = "menuitem";
    button.disabled = (item.disabled == true);
    button.setAttribute("title", (item.title || item.label));

    const span1 = document.createElement("span");
    span1.className = "icon";

    if(item.icon) {
        span1.appendChild(Icon.create(item.icon));
    }

    const span2 = document.createElement("span");
    span2.className = "text";
    span2.appendChild(document.createTextNode(item.label));

    const span3 = document.createElement("span");
    span3.className = "shortcut";

    if(item.shortcut) {
        span3.appendChild(document.createTextNode(item.shortcut));
    }

    button.appendChild(span1);
    button.appendChild(span2);
    button.appendChild(span3);
    element.appendChild(button);
    return element;
};

ContextMenu.prototype.open = function(pos, callback) {
    const instance = this;
    const c = this.getContainer(true);
    c.style.top = pos.top;
    c.style.left = pos.left;
    c.style.display = "block";

    this.callback = callback;
    setTimeout(function() {
        document.body.addEventListener("click", instance.closeHandler);
        document.body.addEventListener("contextmenu", instance.closeHandler);
    }, 200);
};

ContextMenu.prototype.show = function(event) {
    let instance = this;
    let container = this.getContainer(true);
    let scrollTop = document.documentElement.scrollTop;
    let scrollLeft = document.documentElement.scrollLeft;
    let top = scrollTop + event.clientY;
    let left = scrollLeft + event.clientX;
    container.style.display = "block";

    if(top + container.offsetHeight > (scrollTop + document.documentElement.clientHeight)) {
        top = (top - container.offsetHeight);
    }

    if(top < scrollTop) {
        top = scrollTop;
    }

    if(left + container.offsetWidth > (scrollLeft + document.documentElement.clientWidth)) {
        left = (left - container.offsetWidth);
    }

    if(left < scrollLeft) {
        left = scrollLeft;
    }

    container.style.top = top + "px";
    container.style.left = left + "px";
    container.style.display = "block";
    container.focus();

    setTimeout(function() {
        document.body.addEventListener("click", instance.closeHandler);
        document.body.addEventListener("contextmenu", instance.closeHandler);
    }, 200);
    return this;
};

ContextMenu.prototype.close = function() {
    const c = this.getContainer(false);

    if(c) {
        if(c.classList.contains("fixed")) {
            c.style.display = "none";
            c.innerHTML = "";
        }
        else {
            c.remove(true);
            this.container = null;
        }
    }

    document.body.removeEventListener("click", this.closeHandler);
    document.body.removeEventListener("contextmenu", this.closeHandler);
};

ContextMenu.prototype.destroy = function() {
    const c = this.getContainer(false);

    if(c) {
        c.remove(true);
        this.container = null;
    }

    document.body.removeEventListener("click", this.closeHandler);
    document.body.removeEventListener("contextmenu", this.closeHandler);

    this.container = null;
    this.items = null;
    this.bind = null;
    this.closeHandler = null;
};

export {DOM, Events, Bytes, DataURI, FileType, FilePicker, SVG, Icon, Resource, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu};
