/**
 * $RCSfile: menu.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as StackEditorWidget from "./widget.js";
import * as StackEditorI18N from "./i18n.js";

const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Template, Value} = StackEditorWidget;
const {BundleManager, LocalizationContext} = StackEditorI18N;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const I18N = BundleManager.getBundle("default");
const ToolMenu = function() {
    this.block = false;
    this.callback = null;
};

ToolMenu.prototype.open = function(e, callback) {
    const c = this.create();

    if(e) {
        let position = this.getPosition(e);
        let top = position.y + 32;
        let left = position.x;

        if(left + c.offsetWidth > (document.documentElement.scrollLeft + document.documentElement.clientWidth)) {
            left = (document.documentElement.scrollLeft + document.documentElement.clientWidth - c.offsetWidth - 20);
        }

        c.style.top = top + "px";
        c.style.left = left + "px";
    }
    else {
        DOM.center(c);
    }

    c.focus();
    this.callback = callback;
};

ToolMenu.prototype.create = function(e, c) {
    return this.getContainer();
};

ToolMenu.prototype.getContainer = function(b) {
    let instance = this;
    let c = document.getElementById("se-menu-dialog");

    if(c == null && b == true) {
        let mask = document.createElement("div");
        mask.className = "se-mask";

        c = document.createElement("div");
        c.id = "se-menu-dialog";
        c.className = "se-dialog";
        c.tabIndex = -1;

        c.addEventListener("keydown", function(event) {
            const ele = (event.target || event.srcElement);

            if(ele.getAttribute("data-esc") == "0") {
                return;
            }

            if(event.key == "Escape") {
                instance.close();
            }
        });

        mask.addEventListener("click", function(event) {
            if(instance.block == true) {
                return;
            }

            const ele = (event.target || event.srcElement);

            if(ele.className == "se-mask") {
                instance.close();
            }
        });
        mask.appendChild(c);
        document.body.appendChild(mask);
    }
    return c;
};

ToolMenu.prototype.getPosition = function(e) {
    const rect = e.getBoundingClientRect();
    return {"x": rect.left, "y": rect.top};

    /*
    let x = e.offsetLeft;
    let y = e.offsetTop;
    let parent = e.offsetParent;

    while(true) {
        if(parent == null || parent == document.body) {
            break;
        }

        x = x + parent.offsetLeft;
        y = y + parent.offsetTop;
        parent = parent.offsetParent;
    }
    return {"x": x, "y": y};
    */
};

ToolMenu.prototype.getData = function(event) {
    return null;
};

ToolMenu.prototype.click = ToolMenu.prototype.ensure = function(event) {
    this.close(this.getData(event));
};

ToolMenu.prototype.close = function(data) {
    const c = this.getContainer();
    const callback = this.callback;

    if(c) {
        c.closest("div.se-mask").remove();
    }

    this.callback = null;

    if(callback) {
        callback(data);
    }
};

const ColorMenu = new ToolMenu();
ColorMenu.create = function() {
    const c = this.getContainer(true);
    c.innerHTML = this.getContent();

    const eles = c.querySelectorAll("div.se-color-panel");
    const btn = c.querySelector("button.se-cp-clear");

    eles.forEach(function(e) {
        e.addEventListener("mouseover", function(event) {
            ColorMenu.setColor(event);
        });

        e.addEventListener("click", function(event) {
            ColorMenu.click(event);
        });
    });

    if(btn) {
        btn.addEventListener("mouseover", function(event) {
            ColorMenu.setColor(event);
        });

        btn.addEventListener("click", function(event) {
            ColorMenu.click(event);
        });
    }
    return c;
};

ColorMenu.getContent = function() {
    const m = [
            "ffffff", "000000", "eeece1", "1f497d", "4f81bd", "c0504d", "9bbb59", "8064a2", "4bacc6", "f79646",
            "f2f2f2", "7f7f7f", "ddd9c3", "c6d9f0", "dbe5f1", "f2dcdb", "ebf1dd", "e5e0ec", "dbeef3", "fdeada",
            "d8d8d8", "595959", "c4bd97", "8db3e2", "b8cce4", "e5b9b7", "d7e3bc", "ccc1d9", "b7dde8", "fbd5b5",
            "bfbfbf", "3f3f3f", "938953", "548dd4", "95b3d7", "d99694", "c3d69b", "b2a2c7", "92cddc", "fac08f",
            "a5a5a5", "262626", "494429", "17365d", "366092", "953734", "76923c", "5f497a", "31859b", "e36c09",
            "7f7f7f", "0c0c0c", "1d1b10", "0f243e", "244061", "632423", "4f6128", "3f3151", "205867", "974806",
            "c00000", "ff0000", "ffc000", "ffff00", "92d050", "00b050", "00b0f0", "0070c0", "002060", "7030a0"];

    const b = [
        "<div style=\"padding: 16px;\">",
            "<div style=\"clear: both; height: 28px;\">",
                "<input id=\"se-cp-preview\" class=\"se-cp-preview\" value=\"\"/>",
                "<button class=\"se-cp-clear none\" data-value=\"default\">默认颜色</button>",
            "</div>",
            "<div class=\"se-cp-label\">主题颜色</div>"
    ];

    for(let i = 0; i < 6; i++) {
        b.push("<div class=\"se-color-panel\">");

        for(let j = 0; j < 10; j++) {
            let k = i * 10 + j;
            b.push("<span class=\"se-cp-box\" style=\"background-color: #" + m[k] + ";\" data-value=\"" + m[k] + "\" tabindex=\"0\" title=\"#" + m[k] + "\"\"></span>");
        }
        b.push("</div>");
    }

    b.push("<div class=\"se-cp-label\">标准颜色</div>");
    b.push("<div class=\"se-color-panel\">");

    for(let j = 0; j < 10; j++) {
        let k = 6 * 10 + j;
        b.push("<span class=\"se-cp-box\" style=\"background-color: #" + m[k] + ";\" data-value=\"" + m[k] + "\" tabindex=\"0\" title=\"" + m[k] + "\"></span>");
    }
    b.push("</div></div></div>");
    return b.join("");
};

ColorMenu.setColor = function(event) {
    const c = this.getContainer();
    const src = (event.srcElement || event.target);
    const color = src.getAttribute("data-value");

    if(event.ctrlKey) {
        return;
    }

    if(color) {
        const e = c.querySelector("input.se-cp-preview");

        if(e) {
            if(color == "default") {
                e.classList.add("none");
                e.style.backgroundColor = "unset";
                e.style.color = "unset";
                e.value = "";
            }
            else {
                const fc = this.getForeColor(color);
                e.classList.remove("none");
                e.setAttribute("data-value", color);
                e.style.backgroundColor = "#" + color;
                e.style.color = "#" + fc;
                e.value = "#" + color;
            }
        }
    }
};

ColorMenu.getForeColor = function(color) {
    /*
    const r = 255 - parseInt(color.substring(0, 2), 16);
    const g = 255 - parseInt(color.substring(2, 4), 16);
    const b = 255 - parseInt(color.substring(4, 6), 16);
    const c = [];

    c.push(r.toString(16).padStart(2, "0"));
    c.push(g.toString(16).padStart(2, "0"));
    c.push(b.toString(16).padStart(2, "0"));
    return c.join("");
    */

    let c = [];
    let r = parseInt(color.substring(0, 2), 16);
    let g = parseInt(color.substring(2, 4), 16);
    let b = parseInt(color.substring(4, 6), 16);
    r = (r > (255 - r)) ? 0 : 255;
    g = (g > (255 - g)) ? 0 : 255;
    b = (b > (255 - b)) ? 0 : 255;

    c.push(r.toString(16).padStart(2, "0"));
    c.push(g.toString(16).padStart(2, "0"));
    c.push(b.toString(16).padStart(2, "0"));
    return c.join("");
};

ColorMenu.getData = function(event) {
    return "#" + (event.srcElement || event.target).getAttribute("data-value");
};

const LinkMenu = new ToolMenu();
LinkMenu.create = function() {
    const c = this.getContainer(true);

    this.block = true;
    c.innerHTML = Template.merge(this.getContent(), I18N.bundle);

    c.querySelector(":scope > span.close").addEventListener("click", function() {
        LinkMenu.close();
    });

    c.querySelector("button[name='ensure']").addEventListener("click", function() {
        LinkMenu.ensure();
    });

    c.querySelector("button[name='cancel']").addEventListener("click", function() {
        LinkMenu.close();
    });
    return c;
};

LinkMenu.getContent = function() {
    let b = [
        "<span class=\"close\"></span>",
        "<div class=\"se-form\" style=\"width: 400px;\">",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${link.url}</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"url\" spellcheck=\"false\" value=\"http://\"/></div>",
            "</div>",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${link.title}</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"title\" spellcheck=\"false\" value=\"${link.title.value}\"/></div>",
            "</div>",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${link.target.type}</div>",
                "<div class=\"se-form-field\">",
                    "<select name=\"target\">",
                        "<option selected=\"true\" value=\"\">${select.default}</option>",
                        "<option value=\"_blank\">${link.target.newwindow}</option>",
                        "<option value=\"_self\">${link.target.self}</option>",
                        "<option value=\"_parent\">${link.target.parent}</option>",
                    "</select>",
                "</div>",
            "</div>",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${link.referer}</div>",
                "<div class=\"se-form-field\"><input name=\"referer\" type=\"checkbox\" style=\"margin-top: 0px; vertical-align: middle;\" value=\"1\"/></div>",
            "</div>",
            "<div class=\"se-form-ctrl center\"><button name=\"ensure\">${dialog.ensure}</button><button name=\"cancel\">${dialog.cancel}</button></div>",
        "</div>"
    ];
    return b.join("");
};

LinkMenu.getData = function() {
    const c = this.getContainer();
    const data = {};

    if(c) {
        data.href = c.querySelector("input[name='url']").value;
        data.title = c.querySelector("input[name='title']").value;
        data.target = c.querySelector("select[name='target']").value;
        data.referer = c.querySelector("input[name='referer']").checked;

        if(data.target == "") {
            data.target = null;
        }

        if(data.referer != true) {
            data.referer = null;
        }
    }
    return data;
};

const AnchorMenu = new ToolMenu();
AnchorMenu.create = function() {
    const c = this.getContainer(true);

    this.block = true;
    c.innerHTML = Template.merge(this.getContent(), I18N.bundle);

    c.querySelector("button[name='ensure']").addEventListener("click", function() {
        AnchorMenu.ensure();
    });

    c.querySelector("button[name='cancel']").addEventListener("click", function() {
        AnchorMenu.close();
    });
    return c;
};

AnchorMenu.getContent = function() {
    let b = [
        "<div class=\"se-form\" style=\"width: 400px;\">",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${anchor.name}</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"href\" spellcheck=\"false\" value=\"\"/></div>",
            "</div>",
            "<div class=\"se-form-ctrl center\"><button name=\"ensure\">${dialog.ensure}</button><button name=\"cancel\">${dialog.cancel}</button></div>",
        "</div>"
    ];
    return b.join("");
};

AnchorMenu.getData = function() {
    const c = this.getContainer();
    const data = {"class": "anchor", "href": "#unnamed", "title": "#unnamed", "text": "¶"};

    if(c) {
        const href = "#" + c.querySelector("input[name='href']").value;
        data.href = href;
        data.title = href;
    }
    return data;
};

const ImageMenu = new ToolMenu();
ImageMenu.create = function() {
    const c = this.getContainer(true);

    this.block = true;
    c.innerHTML = Template.merge(this.getContent(), I18N.bundle);

    c.querySelector(":scope > span.close").addEventListener("click", function() {
        ImageMenu.close();
    });

    c.querySelector("button[name='ensure']").addEventListener("click", function() {
        ImageMenu.ensure();
    });

    c.querySelector("button[name='cancel']").addEventListener("click", function() {
        ImageMenu.close();
    });
    return c;
};

ImageMenu.getContent = function() {
    const b = [
        "<span class=\"close\"></span>",
        "<div class=\"se-form\" style=\"width: 400px;\">",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">图片地址</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"src\" spellcheck=\"false\" value=\"http://\"></div>",
            "</div>",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">图片描述</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"title\" spellcheck=\"false\" value=\"\"></div>",
            "</div>",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">图片链接</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"url\" spellcheck=\"false\" style=\"\" value=\"\"></div>",
            "</div>",
            "<div class=\"se-form-ctrl center\"><button name=\"ensure\">${dialog.ensure}</button><button name=\"cancel\">${dialog.cancel}</button></div>",
        "</div>"
    ];
    return b.join("");
};

ImageMenu.getData = function(event) {
    const c = this.getContainer();
    const data = {};

    if(c) {
        data.src = c.querySelector("input[name='src']").value;
        data.title = c.querySelector("input[name='title']").value;
        data.url = c.querySelector("input[name='url']").value;
    }
    return data;
};

const VideoMenu = new ToolMenu();
VideoMenu.create = function() {
    const c = this.getContainer(true);

    this.block = true;
    c.innerHTML = Template.merge(this.getContent(), I18N.bundle);

    c.querySelector(":scope > span.close").addEventListener("click", function() {
        VideoMenu.close();
    });

    c.querySelector("button[name='ensure']").addEventListener("click", function() {
        VideoMenu.ensure();
    });

    c.querySelector("button[name='cancel']").addEventListener("click", function() {
        VideoMenu.close();
    });
    return c;
};

VideoMenu.getContent = function() {
    const b = [
        "<span class=\"close\"></span>",
        "<div class=\"se-form\" style=\"width: 400px;\">",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${video.url}</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"url\" spellcheck=\"false\" placeholder=\"音频频 URL 或第三方 &lt;iframe&gt;\" value=\"\"></div>",
            "</div>",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${video.width}</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"width\" spellcheck=\"false\" style=\"width: 200px;\" value=\"600\"></div>",
            "</div>",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${video.height}</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"height\" spellcheck=\"false\" style=\"width: 200px;\" value=\"480\"></div>",
            "</div>",
            "<div class=\"se-form-ctrl center\"><button name=\"ensure\">${dialog.ensure}</button><button name=\"cancel\">${dialog.cancel}</button></div>",
        "</div>"
    ];
    return b.join("");
};

VideoMenu.getData = function(event) {
    const c = this.getContainer();
    const data = {};

    if(c) {
        data.src = c.querySelector("input[name='url']").value;
        data.width = c.querySelector("input[name='width']").value;
        data.height = c.querySelector("input[name='height']").value;
    }
    return data;
};

const AudioMenu = new ToolMenu();
AudioMenu.create = function() {
    const c = this.getContainer(true);

    this.block = true;
    c.innerHTML = Template.merge(this.getContent(), I18N.bundle);

    c.querySelector(":scope > span.close").addEventListener("click", function() {
        AudioMenu.close();
    });

    c.querySelector("button[name='ensure']").addEventListener("click", function() {
        AudioMenu.ensure();
    });

    c.querySelector("button[name='cancel']").addEventListener("click", function() {
        AudioMenu.close();
    });
    return c;
};

AudioMenu.getContent = function() {
    const b = [
        "<span class=\"close\"></span>",
        "<div class=\"se-form\" style=\"width: 400px;\">",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${audio.url}</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"url\" spellcheck=\"false\" placeholder=\"音频 URL\" value=\"\"></div>",
            "</div>",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${audio.width}</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"width\" spellcheck=\"false\" style=\"width: 200px;\" value=\"600\"></div>",
            "</div>",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">${audio.height}</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"height\" spellcheck=\"false\" style=\"width: 200px;\" value=\"480\"></div>",
            "</div>",
            "<div class=\"se-form-ctrl center\"><button name=\"ensure\">${dialog.ensure}</button><button name=\"cancel\">${dialog.cancel}</button></div>",
        "</div>"
    ];
    return b.join("");
};

AudioMenu.getData = function(event) {
    const c = this.getContainer();
    const data = {};

    if(c) {
        data.src = c.querySelector("input[name='url']").value;
        data.width = c.querySelector("input[name='width']").value;
        data.height = c.querySelector("input[name='height']").value;
    }
    return data;
};


const EmotMenu = new ToolMenu();
EmotMenu.create = function() {
    const c = this.getContainer(true);
    c.innerHTML = this.getContent();

    const eles = c.querySelectorAll("div.se-emot-panel ul li");
    const pages = c.querySelectorAll("div.pagebar span.page");

    eles.forEach(function(e) {
        e.addEventListener("click", function(event) {
            EmotMenu.click(event);
        });
    });

    pages.forEach(function(e) {
        e.addEventListener("click", function(event) {
            EmotMenu.scroll(event);
        });
    });
    return c;
};

EmotMenu.getContent = function() {
    const b = [
        "<div class=\"se-emot-panel\" style=\"padding: 16px 16px;\">",
            "<ul>",
                "<li>😀</li>", "<li>😃</li>", "<li>😄</li>", "<li>😁</li>", "<li>😆</li>", "<li>😅</li>", "<li>😂</li>", "<li>🤣</li>",
                "<li>😊</li>", "<li>😇</li>", "<li>🙂</li>", "<li>🙃</li>", "<li>😉</li>", "<li>😌</li>", "<li>😍</li>", "<li>😘</li>",
                "<li>😗</li>", "<li>😙</li>", "<li>😚</li>", "<li>😋</li>", "<li>😛</li>", "<li>😝</li>", "<li>😜</li>", "<li>🤓</li>",
                "<li>😎</li>", "<li>😏</li>", "<li>😒</li>", "<li>😞</li>", "<li>😔</li>", "<li>😟</li>", "<li>😕</li>", "<li>🙁</li>",
                "<li>😣</li>", "<li>😖</li>", "<li>😫</li>", "<li>😩</li>", "<li>😢</li>", "<li>😭</li>", "<li>😤</li>", "<li>😠</li>",
                "<li>😡</li>", "<li>😳</li>", "<li>😱</li>", "<li>😨</li>", "<li>🤗</li>", "<li>🤔</li>", "<li>😶</li>", "<li>😑</li>",
                "<li>😬</li>", "<li>🙄</li>", "<li>😯</li>", "<li>😴</li>", "<li>😷</li>", "<li>🤑</li>", "<li>😈</li>", "<li>🤡</li>",
                "<li>💩</li>", "<li>👻</li>", "<li>💀</li>", "<li>👀</li>", "<li>👣</li>", "<li>👐</li>", "<li>🙌</li>", "<li>👏</li>",
                "<li>🤝</li>", "<li>👍</li>", "<li>👎</li>", "<li>👊</li>", "<li>✊</li>", "<li>🤛</li>", "<li>🤜</li>", "<li>🤞</li>",
                "<li>✌️</li>", "<li>🤘</li>", "<li>👌</li>", "<li>👈</li>", "<li>👉</li>", "<li>👆</li>", "<li>👇</li>", "<li>☝️</li>",
                "<li>✋</li>", "<li>🤚</li>", "<li>🖐</li>", "<li>🖖</li>", "<li>👋</li>", "<li>🤙</li>", "<li>💪</li>", "<li>🖕</li>",
                "<li>✍️</li>", "<li>🙏</li>",
            "<ul >",
        "</div>"
    ];
    return b.join("");
};

EmotMenu.scroll = function(event) {
    let c = this.getContainer();
    let src = (event.srcElement || event.target);
    let page = src.getAttribute("data-page");

    if(page) {
        c.querySelectorAll("div[data-page]").forEach(function(e) {
            e.style.display = "none";
        });
        c.querySelector("div[data-page='" + page + "']").style.display = "block"; //.add("active");

        c.querySelectorAll("div.pagebar span[data-page]").forEach(function(e) {
            e.classList.remove("active");
        });
        c.querySelector("div.pagebar span[data-page='" + page + "']").classList.add("active");
    }
};

EmotMenu.getImage = function(event) {
    let ele = (event.srcElement || event.target);
    let src = ele.getAttribute("data-value");
    return {"src": src + ".gif", "title": null, "alt": null};
};

EmotMenu.getData = function(event) {
    let ele = (event.srcElement || event.target);
    return ele.textContent;
};

const TableMenu = new ToolMenu();
TableMenu.create = function() {
    const instance = this;
    const c = this.getContainer(true);

    this.block = false;
    c.innerHTML = Template.merge(this.getContent(), I18N.bundle);

    const info = c.querySelector("div.se-pick-info span.text");
    const area = c.querySelector("div.se-pick-area");
    const mask = c.querySelector("div.se-pick-mask");

    c.querySelector("div.se-form.f1 div.se-pick-info span.btn").addEventListener("click", function(event) {
        c.querySelector("div.se-form.f1").style.display = "none";
        c.querySelector("div.se-form.f2").style.display = "block";
        instance.block = true;
    });

    c.querySelector("div.se-form.f2 button[name='back']").addEventListener("click", function(event) {
        c.querySelector("div.se-form.f1").style.display = "block";
        c.querySelector("div.se-form.f2").style.display = "none";
        instance.block = false;
    });

    c.querySelector("div.se-form.f2 button[name='ensure']").addEventListener("click", function(event) {
        instance.click(event);
    });

    // 设置为固定大小, 否则靠近屏幕边界时自动增加宽度无法看到
    area.style.minWidth = "300px";
    area.style.minHeight = "300px";
    area.addEventListener("mousemove", function(event) {
        const ele = (event.srcElement || event.target);

        if(ele.className.indexOf("se-pick-") < 0) {
            return;
        }

        const position = DOM.getPosition(ele);
        const y = event.clientY - position.top;
        const x = event.clientX - position.left;

        const rows = Math.max(Math.floor((y + 19) / 20), 1);
        const cols = Math.max(Math.floor((x + 19) / 20), 1);
        const width = cols * 20;
        const height = rows * 20;

        if(width >= 100 && width < 300) {
            area.style.width = (width + 20) + "px";
        }

        if(height >= 100 && height < 300) {
            area.style.height = (height + 20) + "px";
        }

        mask.style.width = width + "px";
        mask.style.height = height + "px";
        info.innerHTML = (rows + " x " + cols);
    });

    mask.addEventListener("click", function(event) {
        instance.click(event);
    });
    return c;
};

TableMenu.getContent = function() {
    const b = [
        "<div class=\"se-form f1\" style=\"display: block;\">",
            "<div class=\"se-pick-info\"><span class=\"text\">3 x 3</span><span class=\"btn\">手动设置</span></div>",
            "<div class=\"se-pick-area\">",
                "<div class=\"se-pick-mask\"></div>",
            "</div>",
        "</div>",
        "<div class=\"se-form f2\" style=\"width: 300px; display: none;\">",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">行数</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"rows\" style=\"width: 80px;\" spellcheck=\"false\" value=\"3\"/></div>",
            "</div>",
            "<div class=\"se-form-row\">",
                "<div class=\"se-form-label\">列数</div>",
                "<div class=\"se-form-field\"><input type=\"text\" name=\"cols\" style=\"width: 80px;\" spellcheck=\"false\" value=\"3\"/></div>",
            "</div>",
            "<div class=\"se-form-ctrl center\"><button name=\"back\">${dialog.back}</button><button name=\"ensure\">${dialog.ensure}</button></div>",
        "</div>"
    ];
    return b.join("");
};

TableMenu.getData = function(event) {
    const src = (event.srcElement || event.target);

    if(src.nodeName == "BUTTON") {
        const c = this.getContainer(true);
        const form = c.querySelector("div.se-form.f2");
        const rows = parseInt(form.querySelector("input[name='rows']").value);
        const cols = parseInt(form.querySelector("input[name='cols']").value);
        return {"rows": (rows || 3), "cols": (rows || 3)};
    }
    else {
        const pos = DOM.getPosition(src);
        const y = event.clientY - pos.top;
        const x = event.clientX - pos.left;
        const rows = Math.floor((y + 19) / 20);
        const cols = Math.floor((x + 19) / 20);
        return {"rows": rows, "cols": cols};
    }
};
export {ToolMenu, ColorMenu, LinkMenu, AnchorMenu, ImageMenu, VideoMenu, AudioMenu, EmotMenu, TableMenu};

