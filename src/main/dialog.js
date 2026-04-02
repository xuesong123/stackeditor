/**
 * $RCSfile: dialog.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as StackEditorWidget from "./widget.js";

const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu} = StackEditorWidget;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const AssetsDialog = function(files) {
    this.container = null;
    this.files = files;
};

AssetsDialog.prototype.open = function(callback) {
    const c = this.create();
    DOM.center(c);
    c.focus();

    this.callback = callback;
    this.load();
};

AssetsDialog.prototype.create = function() {
    const instance = this;
    const c = this.getContainer(true);
    c.innerHTML = this.getContent();

    c.addEventListener("keydown", function(event) {
        const ele = (event.target || event.srcElement);
        const key = event.key;

        if(ele.getAttribute("data-esc") == "0") {
            return;
        }

        if(key == "Enter") {
            Events.stop(event);
            instance.ensure();
            return;
        }

        if(key == "Escape") {
            Events.stop(event);
            instance.close();
        }
    });

    c.querySelector("div.header button.close").addEventListener("click", function(event) {
        instance.close();
    });

    c.querySelector("ul.se-outline-view").addEventListener("dblclick", function(event) {
        const e = (event.target || event.srcElement);
        const item = e.closest("li.item");

        if(item) {
            const id = item.getAttribute("data-id");
            instance.ensure(id);
        }
    });

    Draggable.bind(c.querySelector("div.header"), c);
    return c;
};

AssetsDialog.prototype.getContainer = function() {
    if(this.container == null || this.container == undefined) {
        let mask = document.createElement("div");
        mask.className = "se-mask";
        mask.style.display = "block";

        let c = document.createElement("div");
        c.className = "se-dialog";
        c.style.width = "800px";
        c.style.display = "block";
        c.setAttribute("role", "dialog");
        c.setAttribute("aria-modal", "true");
        c.tabIndex = -1;

        mask.appendChild(c);

        const fullscreen = (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement);

        if(fullscreen) {
            fullscreen.appendChild(mask);
        }
        else {
            document.body.appendChild(mask);
        }
        this.container = c;
    }
    return this.container;
};

AssetsDialog.prototype.getContent = function() {
    return [
        "<div class=\"header\">",
            "<span class=\"icon\">" + Icon.get("folder") + "</span>",
            "<h2>资源管理</h2>",
            "<button type=\"button\" class=\"close\" draggable=\"false\" aria-label=\"关闭对话框；快捷键: ESC\" title=\"快捷键: ESC\"></button>",
        "</div>",
        "<div>",
            "<div style=\"height: 400px; overflow: auto;\">",
                "<div class=\"se-info-view\"></div>",
                "<ul class=\"se-outline-view\"></ul>",
            "</div>",
            "<div class=\"se-status-bar\" style=\"height: 32px; box-sizing: border-box; border-top: 1px solid #dddddd; overflow: auto;\"></div>",
        "</div>"
    ].join("");
};

AssetsDialog.prototype.load = function() {
    this.show((this.files || []));
};

AssetsDialog.prototype.show = function(files) {
    const c = this.getContainer();
    const iv = c.querySelector(":scope div.se-info-view");
    const ov = c.querySelector(":scope div ul.se-outline-view");
    ov.querySelectorAll(":scope > li.item").forEach(function(e) {
        e.remove();
    });

    for(let i = 0; i < files.length; i++) {
        let file = files[i];
        let li = document.createElement("li");

        li.className = "item";
        li.draggable = true;
        li.setAttribute("data-id", file.id);
        li.innerHTML = [
            "<div class=\"box\" title=\"0.00 KB\" tabindex=\"-1\">",
                "<div class=\"icon\"></div>",
                "<div class=\"name\"></div>",
            "</div>"
        ].join("");

        if(file.title) {
            li.querySelector(":scope > div.box").setAttribute("title", file.title);
        }
        else if(file.name) {
            li.querySelector(":scope > div.box").setAttribute("title", file.name);
        }

        li.querySelector(":scope > div.box > div.name").textContent = file.name;

        if(file.type == "image") {
            let image = document.createElement("img");
            image.src = file.url;
            li.querySelector(":scope > div.box > div.icon").appendChild(image);
        }
        else if(file.type == "audio") {
            li.querySelector(":scope > div.box > div.icon").classList.add("audio");
        }
        else if(file.type == "video") {
            li.querySelector(":scope > div.box > div.icon").classList.add("video");
        }
        else {
            li.querySelector(":scope > div.box > div.icon").classList.add("attachment");
        }
        ov.appendChild(li);
    }

    if(files.length < 1) {
        const e = document.createElement("div");
        e.style.cssText = "padding-top: 100px; font-size: 20px; color: #c0c0c0; text-align: center;";
        e.appendChild(document.createTextNode("资源库为空"));

        iv.replaceChildren(e);
        iv.style.display = "block";
        ov.style.display = "none";
    }
    else {
        iv.style.display = "none";
        ov.style.display = "block";
    }
};

AssetsDialog.prototype.ensure = function(id) {
    let view = this.view;
    let file = null;
    let callback = this.callback;

    for(let i = 0; i < this.files.length; i++) {
        if(this.files[i].id == id) {
            file = Object.assign({}, this.files[i]);
            break;
        }
    }

    if(file && this.callback) {
        this.callback([file]);
    }
};

AssetsDialog.prototype.close = function() {
    const c = this.getContainer();

    if(c) {
        c.closest("div.se-mask").remove();
    }
    this.files = null;
    this.callback = null;
    this.container = null;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const UploadDialog = function(files, handler) {
    this.files = files;
    this.handler = handler;
};

UploadDialog.prototype.open = function() {
    const instance = this;
    const c = this.create();

    this.init();
    DOM.center(c);
};

UploadDialog.prototype.init = function() {
    const instance = this;
    const files = this.files;
    const c = this.getContainer();

    if(files == null || files == undefined || files.length < 1) {
        return;
    }

    if(files.length == 1) {
        c.style.width = "600px";
        c.style.height = "300px";
        c.querySelector(":scope > div.body div.progress-panel").style.display = "block";
        c.querySelector(":scope > div.body div.files-panel").style.display = "none";
        c.querySelector(":scope > div.body div.progress-panel div.se-name").textContent = files[0].name;
    }
    else {
        const p = c.querySelector(":scope > div.body div.files-panel > div.se-meta-data");
        const table = c.querySelector(":scope > div.body div.files-panel table.se-table");
        c.querySelector(":scope > div.body div.progress-panel").style.display = "none";
        c.querySelector(":scope > div.body div.files-panel").style.display = "block";

        if(p) {
            p.querySelector(":scope > div.se-meta-item span[data-name='threads']").textContent = Math.min(files.length, 5);
        }

        for(let i = 0; i < files.length; i++) {
            const file = files[i];
            const tr = table.insertRow(-1);
            const td1 = tr.insertCell(-1);
            const td2 = tr.insertCell(-1);
            const td3 = tr.insertCell(-1);
            const input = DOM.create("input", {"name": "fileName", "type": "text", "class": "text", "readonly": true, "value": file.name});
            const button = DOM.create("button", {"type": "button", "class": "btn abort"}, ["取 消"]);
            input.setAttribute("title", file.name + "\r\n" + Bytes.format(file.size, 2));

            button.addEventListener("click", function(event) {
                Events.stop(event);
                instance.cancel(this.closest("tr.item"));
            });

            tr.className = "item";
            tr.setAttribute("data-id", file.id);
            td1.style.width = "200px";
            td2.style.width = "400px";

            td1.appendChild(input);
            td2.innerHTML = [
                "<div class=\"se-progress thin\">",
                    "<div class=\"text\">等待中...</div>",
                    "<div class=\"xbar\"></div>",
                "</div>"
            ].join("");
            td3.appendChild(button);
        }
    }
};

UploadDialog.prototype.create = function() {
    const instance = this;
    const c = this.getContainer();
    c.innerHTML = this.getContent();

    Draggable.bind(c.querySelector("div.header"), c);
    c.querySelector("div.header button.close").addEventListener("click", function(event) {
        instance.close();
    });

    c.querySelector("div.progress-panel div.se-form-ctrl button.cancel").addEventListener("click", function(event) {
        if(this.getAttribute("data-status") != "4") {
            this.setAttribute("data-status", "4");
            this.textContent = "关 闭";
            instance.cancel(null);
        }
        else {
            instance.close();
        }
    });

    c.querySelector("div.files-panel div.se-form-ctrl button.cancel").addEventListener("click", function(event) {
        instance.close();
    });
    return c;
};

UploadDialog.prototype.getContainer = function() {
    if(this.container == null || this.container == undefined) {
        const mask = document.createElement("div");
        mask.className = "se-mask";
        mask.style.display = "block";

        const c = document.createElement("div");
        c.className = "se-dialog";
        c.style.width = "800px";
        c.style.height = "600px";
        c.style.display = "block";
        c.setAttribute("role", "dialog");
        c.setAttribute("aria-modal", "true");
        c.tabIndex = -1;

        mask.appendChild(c);
        document.body.appendChild(mask);
        this.container = c;
    }
    return this.container;
};

UploadDialog.prototype.getContent = function() {
    return [
        "<div class=\"header\">",
            "<span class=\"icon\">" + Icon.get("upload") + "</span>",
            "<h2>文件上传</h2>",
            "<button type=\"button\" class=\"close\" draggable=\"false\" aria-label=\"关闭对话框；快捷键: ESC\" title=\"快捷键: ESC\"></button>",
        "</div>",
        "<div class=\"body\">",
            "<div class=\"progress-panel\" style=\"padding: 20px 40px; box-sizing: border-box; border: none; display: none;\">",
                "<div style=\"height: 120px;\">",
                    "<div class=\"se-name\"></div>",
                    "<div class=\"se-progress\" style=\"margin: 20px 0px;\">",
                        "<div class=\"text\">0%</div>",
                        "<div class=\"xbar\"><div class=\"percent\" style=\"width: 0%\"></div></div>",
                    "</div>",
                    "<div class=\"se-meta-item\"><span class=\"se-data-label\">上传速度</span><span class=\"se-data-value\" data-name=\"speed\">--</span></div>",
                    "<div class=\"se-meta-item\"><span class=\"se-data-label\">已传数据</span><span class=\"se-data-value\" data-name=\"total\">--</span></div>",
                "</div>",
                "<div class=\"se-form-ctrl pad20\">",
                    "<button class=\"button cancel\">取 消</button>",
                "</div>",
            "</div>",
            "<div class=\"files-panel\" style=\"margin: 20px 20px; padding: 20px 20px; display: none;\">",
                "<div class=\"se-meta-data\" style=\"clear: both; margin-bottom: 20px; overflow: hidden;\">",
                    "<div class=\"se-meta-item tasks\"><span class=\"se-data-label\">任务数</span><span class=\"se-data-value\" data-name=\"tasks\">0</span></div>",
                    "<div class=\"se-meta-item success\"><span class=\"se-data-label\">成功数</span><span class=\"se-data-value\" data-name=\"success\">0</span></div>",
                    "<div class=\"se-meta-item failed\"><span class=\"se-data-label\">失败数</span><span class=\"se-data-value\" data-name=\"failed\">0</span></div>",
                    "<div class=\"se-meta-item loading\"><span class=\"se-data-label\">上传中</span><span class=\"se-data-value\" data-name=\"loading\">0</span></div>",
                    "<div class=\"se-meta-item threads\"><span class=\"se-data-label\">并行数</span><span class=\"se-data-value\" data-name=\"threads\">5</span></div>",
                "</div>",
                "<div style=\"clear: both; height: 360px; box-sizing: border-box; border: 1px solid #f1f1f1; overflow: auto;\">",
                    "<table class=\"se-table\"></table>",
                "</div>",
                "<div class=\"se-form-ctrl\">",
                    "<button title=\"button\" class=\"button cancel\" title=\"关闭\">关 闭</button>",
                "</div>",
            "</div>",
        "</div>"
    ].join("");
};

UploadDialog.prototype.update = function(id, loaded, total) {
    const c = this.getContainer();
    const percent = Math.min(Math.floor(loaded / total * 100), 100);
    const complete = (loaded >= total);
    const meta = this.getMeta(id);
    const time = new Date().getTime();
    const diff = time - meta.time;

    if(meta.status != 0 && meta.status != 1) {
        return;
    }

    meta.status = complete ? 2 : 1;

    if(diff > 200) {
        const bytes = (loaded - meta.loaded) / (diff / 1000);
        meta.loaded = loaded;
        meta.time = time;
        meta.speed = Bytes.format(bytes, 2);
    }

    if(this.files.length == 1) {
        const e = c.querySelector(":scope > div.body div.progress-panel");
        e.querySelector(":scope div.se-progress > div.text").textContent = percent + "%";
        e.querySelector(":scope div.se-progress > div.xbar").style.width = percent + "%";

        if(diff > 200) {
            e.querySelector(":scope div.se-meta-item span[data-name='speed']").textContent = meta.speed + "/s";
        }
        e.querySelector(":scope div.se-meta-item span[data-name='total']").textContent = Bytes.format(loaded, 2) + "/" + Bytes.format(total, 2);
    }
    else {
        const result = this.stat();
        const table = c.querySelector(":scope > div.body div.files-panel table.se-table");
        const tr = table.querySelector(":scope tr[data-id='" + id + "']");

        if(tr) {
            tr.querySelector(":scope td > div.se-progress > div.text").textContent = percent + "%";
            tr.querySelector(":scope td > div.se-progress > div.xbar").style.width = percent + "%";

            if(complete) {
                tr.querySelector(":scope td > button.abort").disabled = true;
            }
        }

        const p = c.querySelector(":scope > div.body div.files-panel > div.se-meta-data");

        if(p) {
            p.querySelector(":scope > div.se-meta-item span[data-name='tasks']").textContent = result.tasks;
            p.querySelector(":scope > div.se-meta-item span[data-name='loading']").textContent = result.loading;
            p.querySelector(":scope > div.se-meta-item span[data-name='success']").textContent = result.success;
            p.querySelector(":scope > div.se-meta-item span[data-name='failed']").textContent = result.failed;
        }
    }
};

UploadDialog.prototype.getMeta = function(id) {
    if(this.context == null || this.context == undefined) {
        this.context = {};
    }

    let stat = this.context[id];

    if(stat == null || stat == undefined) {
        this.context[id] = stat = {"id": id, "loaded": 0, "time": new Date().getTime(), "speed": "0.00 KB", "status": 0};
    }
    return stat;
};

UploadDialog.prototype.stat = function(id) {
    const result = {
        tasks: 0,
        loading: 0,
        success: 0,
        failed: 0,
        cancel: 0
    };

    if(this.context == null || this.context == undefined) {
        this.context = {};
    }

    result.tasks = this.files.length;

    for(let id in this.context) {
        let stat = this.context[id];

        if(stat.status == 1) {
            // 上传中
            result.loading++;
        }
        else if(stat.status == 2) {
            // 成功
            result.success++;
        }
        else if(stat.status == 3) {
            // 失败
            result.failed++;
        }
        else if(stat.status == 4) {
            // 取消
            result.cancel++;
        }
    }
    return result;
};

UploadDialog.prototype.cancel = function(tr) {
    if(tr) {
        const id = parseInt(tr.getAttribute("data-id"));
        const meta = this.getMeta(id);

        if(this.handler && this.handler.abort) {
            this.handler.abort(id);
        }

        meta.status = 4;
        tr.querySelector("td div.se-progress div.text").textContent = "已取消";
    }
    else if(this.files.length == 1) {
        const file = this.files[0];
        const meta = this.getMeta(file.id);

        if(meta.status == 1) {
            if(this.handler && this.handler.abort) {
                this.handler.abort(file.id);
            }
            meta.status = 4;
        }
        else {
            this.close();
        }
    }
    else {
        // 不应该存在其他情况
    }
};

UploadDialog.prototype.error = function(id, message) {
    const c = this.getContainer();
    const meta = this.getMeta(id);
    meta.status = 3;

    if(this.files.length == 1) {
        const e = c.querySelector(":scope > div.body div.progress-panel");
        e.querySelector(":scope div.se-progress > div.text").style.color = "#ff0000";
        e.querySelector(":scope div.se-progress > div.text").textContent = message;
    }
    else {
        const table = c.querySelector(":scope > div.body div.files-panel table.se-table");
        const tr = table.querySelector(":scope tr[data-id='" + id + "']");
        const input = DOM.create("input", {"name": "error", "type": "text", "class": "error", "readonly": true, "value": message});

        if(tr) {
            tr.querySelector(":scope td:nth-child(2)").replaceChildren(input);
            tr.querySelector(":scope td > button.abort").disabled = false;
        }

        const result = this.stat();
        const p = c.querySelector(":scope > div.body div.files-panel > div.se-meta-data");

        if(p) {
            p.querySelector(":scope > div.se-meta-item span[data-name='tasks']").textContent = result.tasks;
            p.querySelector(":scope > div.se-meta-item span[data-name='loading']").textContent = result.loading;
            p.querySelector(":scope > div.se-meta-item span[data-name='success']").textContent = result.success;
            p.querySelector(":scope > div.se-meta-item span[data-name='failed']").textContent = result.failed;
        }
    }
};

UploadDialog.prototype.close = function(data) {
    let c = this.getContainer();

    if(c) {
        c.closest("div.se-mask").remove();
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const PropertyDialog = function(data) {
    this.container = null;
    this.data = data;
};

PropertyDialog.prototype.open = function() {
    const c = this.create();
    c.focus();

    DOM.center(c);
    this.show(this.data);
};

PropertyDialog.prototype.create = function() {
    const instance = this;
    const c = this.getContainer(true);
    c.innerHTML = this.getContent();

    c.addEventListener("keydown", function(event) {
        const ele = (event.target || event.srcElement);
        const key = event.key;

        if(ele.getAttribute("data-esc") == "0") {
            return;
        }

        if(key == "Enter") {
            Events.stop(event);
            instance.ensure();
            return;
        }

        if(key == "Escape") {
            Events.stop(event);
            instance.close();
        }
    });

    c.querySelector("div.header button.close").addEventListener("click", function(event) {
        instance.close();
    });

    c.querySelector("div.se-form div.se-form-ctrl button.ensure").addEventListener("click", function(event) {
        instance.ensure();
    });

    c.querySelector("div.se-form div.se-form-ctrl button.cancel").addEventListener("click", function(event) {
        instance.close();
    });

    Draggable.bind(c.querySelector("div.header"), c);
    return c;
};

PropertyDialog.prototype.getContainer = function() {
    if(this.container == null || this.container == undefined) {
        let mask = document.createElement("div");
        mask.className = "se-mask";
        mask.style.display = "block";

        let c = document.createElement("div");
        c.className = "se-dialog";
        c.style.width = "800px";
        c.style.display = "block";
        c.setAttribute("role", "dialog");
        c.setAttribute("aria-modal", "true");
        c.tabIndex = -1;

        mask.appendChild(c);
        document.body.appendChild(mask);
        this.container = c;
    }
    return this.container;
};

PropertyDialog.prototype.getContent = function() {
    return [
        "<div class=\"header\">",
            "<span class=\"icon\">" + Icon.get("info") + "</span>",
            "<h2>文档属性</h2>",
            "<button type=\"button\" class=\"close\" draggable=\"false\" aria-label=\"关闭对话框；快捷键: ESC\" title=\"快捷键: ESC\"></button>",
        "</div>",
        "<div class=\"se-form\" style=\"padding: 20px 80px;\">",
            "<div class=\"se-g1\" style=\"margin-bottom: 20px;\">",
                "<input name=\"id\" type=\"hidden\" value=\"193\">",
                "<input name=\"title\" type=\"text\" class=\"title\" title=\"文档标题\" value=\"\">",
            "</div>",
            "<div class=\"se-g2\">",
                "<div class=\"se-c1\">文档类型:</div>",
                "<div class=\"se-c2\">",
                    "<select name=\"mimeType\" style=\"width: 160px;\" title=\"文档类型\">",
                        "<option value=\"text/html\">text/html</option>",
                        "<option value=\"text/mark\">text/mark</option>",
                        "<option value=\"text/plain\">text/plain</option>",
                        "<option value=\"text/javascript\">text/javascript</option>",
                    "</select>",
                "</div>",
            "</div>",
            "<div class=\"se-g2\">",
                "<div class=\"se-c1\">文档主题:</div>",
                "<div class=\"se-c2\">",
                    "<select name=\"theme\" style=\"width: 160px;\" title=\"文档主题\">",
                        "<option value=\"wiki\">wiki</option>",
                        "<option value=\"word\">word</option>",
                        "<option value=\"xxqx\">小清新</option>",
                        "<option value=\"code\">技术型</option>",
                    "</select>",
                    "<div class=\"form-comment\" style=\"clear: both; padding: 20px 0px;\">文档主题用来指定文档的显示样式。文档主题分为全局主题和分类主题，全局主题针对所有分类和文档有效；分类主题针对该分类和该分类下的子分类、文档有效。全局主题请在设置项里面进行指定。分类主题请在分类属性中指定。</div>",
                "</div>",
            "</div>",
            "<div class=\"se-g2\">",
                "<div class=\"se-c1\">文档连接:</div>",
                "<div class=\"se-c2\" data-name=\"url\"></div>",
            "</div>",
            "<div class=\"se-g2\">",
                "<div class=\"se-c1\">创建时间:</div>",
                "<div class=\"se-c2\"><input name=\"createTime\" type=\"text\" class=\"label\" style=\"width: 200px;\" title=\"创建时间\" value=\"--\"/></div>",
            "</div>",
            "<div class=\"se-g2\">",
                "<div class=\"se-c1\">更新时间:</div>",
                "<div class=\"se-c2\"><input name=\"updateTime\" type=\"text\" class=\"label\" style=\"width: 200px;\" title=\"更新时间\" value=\"--\"/></div>",
            "</div>",
            "<div class=\"se-form-ctrl center\">",
                "<button type=\"button\" class=\"button ensure\" title=\"确定 快捷键: ENTER\">确 定</button>",
                "<button type=\"button\" class=\"button cancel\" title=\"取消 快捷键: ESC\">取 消</button>",
            "</div>",
        "</div>"
    ].join("");
};

PropertyDialog.prototype.show = function(data) {
    const c = this.getContainer();
    const form = c.querySelector("div.se-form");
    form.querySelector("input[name='id']").value = (data.id || "");
    form.querySelector("input[name='title']").value = (data.title || "");
    form.querySelector("select[name='mimeType']").value = (data.mimeType || "text/html");
    form.querySelector("select[name='theme']").value = (data.theme || "wiki");

    if(data.url) {
        form.querySelector("div[data-name='url']").replaceChildren(DOM.create("a", {"href": data.url, "title": "文档链接", "target": "_blank"}, [data.url]));
    }

    if(data.createTime) {
        form.querySelector("input[name='createTime']").value = data.createTime;
    }

    if(data.updateTime) {
        form.querySelector("input[name='updateTime']").value = data.updateTime;
    }
};

PropertyDialog.prototype.getData = function() {
    const c = this.getContainer();
    const form = c.querySelector("div.se-form");
    const data = {};
    data.id = form.querySelector("input[name='id']").value;
    data.title = form.querySelector("input[name='title']").value;
    data.mimeType = form.querySelector("select[name='mimeType']").value;
    data.theme = form.querySelector("select[name='theme']").value;
    return data;
};

PropertyDialog.prototype.ensure = function() {
    const data = this.getData();
    this.close();
};

PropertyDialog.prototype.close = function() {
    const c = this.getContainer();

    if(c) {
        c.closest("div.se-mask").remove();
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const ProfileDialog = function(data) {
    this.container = null;
    this.data = data;
};

ProfileDialog.prototype.open = function() {
    const c = this.create();
    c.focus();

    DOM.center(c);
};

ProfileDialog.prototype.create = function() {
    const instance = this;
    const c = this.getContainer(true);
    c.innerHTML = this.getContent();

    c.addEventListener("keydown", function(event) {
        const ele = (event.target || event.srcElement);
        const key = event.key;

        if(ele.getAttribute("data-esc") == "0") {
            return;
        }

        if(key == "Enter") {
            Events.stop(event);
            instance.ensure();
            return;
        }

        if(key == "Escape") {
            Events.stop(event);
            instance.close();
        }
    });

    c.querySelector("div.header button.close").addEventListener("click", function(event) {
        instance.close();
    });

    c.querySelector("div.se-form div.se-form-ctrl button.ensure").addEventListener("click", function(event) {
        instance.ensure();
    });

    c.querySelector("div.se-form div.se-form-ctrl button.cancel").addEventListener("click", function(event) {
        instance.close();
    });

    Draggable.bind(c.querySelector("div.header"), c);
    return c;
};

ProfileDialog.prototype.getContainer = function() {
    if(this.container == null || this.container == undefined) {
        const mask = document.createElement("div");
        mask.className = "se-mask";
        mask.style.display = "block";

        const c = document.createElement("div");
        c.className = "se-dialog";
        c.style.width = "800px";
        c.style.display = "block";
        c.setAttribute("role", "dialog");
        c.setAttribute("aria-modal", "true");
        c.tabIndex = -1;

        mask.appendChild(c);
        document.body.appendChild(mask);
        this.container = c;
    }
    return this.container;
};

ProfileDialog.prototype.getContent = function() {
    return [
        "<div class=\"header\">",
            "<span class=\"icon\">" + Icon.get("setting") + "</span>",
            "<h2>设置</h2>",
            "<button type=\"button\" class=\"close\" draggable=\"false\" aria-label=\"关闭对话框；快捷键: ESC\" title=\"快捷键: ESC\"></button>",
        "</div>",
        "<div class=\"se-form\" style=\"padding: 20px 80px;\">",
            "<div><p style=\"font-size: 16px;\">暂时不需要任何设置</p></div>",
            "<div class=\"se-form-ctrl center\">",
                "<button type=\"button\" class=\"button ensure\" title=\"确定 快捷键: ENTER\">确 定</button>",
                "<button type=\"button\" class=\"button cancel\" title=\"取消 快捷键: ESC\">取 消</button>",
            "</div>",
        "</div>"
    ].join("");
};

ProfileDialog.prototype.show = function(data) {
    const c = this.getContainer();
    const form = c.querySelector("div.se-form");
    // form.querySelector("input[name='id']").value = (data.id || "");
    // form.querySelector("input[name='title']").value = (data.title || "");
    // form.querySelector("select[name='mimeType']").value = (data.mimeType || "text/html");
    // form.querySelector("select[name='theme']").value = (data.theme || "wiki");
};

ProfileDialog.prototype.getData = function() {
    const c = this.getContainer();
    const form = c.querySelector("div.se-form");
    const data = {};
    data.id = form.querySelector("input[name='id']").value;
    data.title = form.querySelector("input[name='title']").value;
    data.mimeType = form.querySelector("select[name='mimeType']").value;
    data.theme = form.querySelector("select[name='theme']").value;
    return data;
};

ProfileDialog.prototype.ensure = function() {
    // const data = this.getData();
    // console.log(data);
    this.close();
};

ProfileDialog.prototype.close = function() {
    const c = this.getContainer();

    if(c) {
        c.closest("div.se-mask").remove();
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const WarnDialog = function() {
    this.container = null;
};

WarnDialog.prototype.open = function(title, message, buttons, callback) {
    const c = this.create();
    this.callback = callback;

    if(title) {
        c.querySelector("div.title").innerHTML = title;
        c.querySelector("div.title").style.display = "block";
    }
    else {
        c.querySelector("div.title").style.display = "none";
    }

    if(message) {
        c.querySelector("div.message").innerHTML = message;
        c.querySelector("div.message").style.display = "block";
    }
    else {
        c.querySelector("div.message").style.display = "none";
    }

    if(buttons) {
        if(!buttons.includes("ensure")) {
            c.querySelector("div.se-form-ctrl button.ensure").remove();
        }

        if(!buttons.includes("cancel")) {
            c.querySelector("div.se-form-ctrl button.cancel").remove();
        }
    }
    else {
        c.querySelector("div.se-form-ctrl button.cancel").remove();
    }
    DOM.center(c);
    c.focus();
};

WarnDialog.prototype.create = function() {
    const instance = this;
    const c = this.getContainer();
    c.innerHTML = this.getContent();

    c.addEventListener("keydown", function(event) {
        const ele = (event.target || event.srcElement);
        const key = event.key;

        if(ele.getAttribute("data-esc") == "0") {
            return;
        }

        if(key == "Enter") {
            Events.stop(event);
            instance.ensure();
            return;
        }

        if(key == "Escape") {
            Events.stop(event);
            instance.close();
        }
    });

    c.querySelector("div.header button.close").addEventListener("click", function(event) {
        instance.close();
    });

    c.querySelector("div.se-form div.se-form-ctrl button.ensure").addEventListener("click", function(event) {
        instance.ensure();
    });

    c.querySelector("div.se-form div.se-form-ctrl button.cancel").addEventListener("click", function(event) {
        instance.close();
    });
    Draggable.bind(c.querySelector("div.header"), c);
    return c;
};

WarnDialog.prototype.getContainer = function() {
    if(this.container == null || this.container == undefined) {
        const mask = document.createElement("div");
        mask.className = "se-mask";
        mask.style.display = "block";

        const c = document.createElement("div");
        c.className = "se-dialog";
        c.style.width = "600px";
        c.style.display = "block";
        c.setAttribute("role", "dialog");
        c.setAttribute("aria-modal", "true");
        c.tabIndex = -1;

        mask.appendChild(c);
        document.body.appendChild(mask);
        this.container = c;
    }
    return this.container;
};

WarnDialog.prototype.getContent = function() {
    return [
        "<div class=\"header\">",
            "<span class=\"icon\">" + Icon.get("warn") + "</span>",
            "<h2>提示</h2>",
            "<button type=\"button\" class=\"close\" draggable=\"false\" aria-label=\"关闭对话框；快捷键: ESC\" title=\"快捷键: ESC\"></button>",
        "</div>",
        "<div class=\"se-form\" style=\"padding: 40px 40px 0px 40px;;\">",
            "<div class=\"title\" style=\"font-size: 16px; line-height: 32px; font-weight: bold; color: #ff0000;\"></div>",
            "<div class=\"message\" style=\"font-size: 16px; line-height: 32px;\"></div>",
            "<div class=\"se-form-ctrl pad40\">",
                "<button class=\"button ensure\" title=\"快捷键: ENTER\">确 定</button>",
                "<button class=\"button cancel\" title=\"快捷键: ESC\">取 消</button>",
            "</div>",
        "</div>"
    ].join("");
};

WarnDialog.prototype.ensure = function() {
    const callback = this.callback;
    this.close();

    if(callback) {
        callback();
    }
};

WarnDialog.prototype.close = function() {
    const c = this.getContainer();

    if(c) {
        c.closest("div.se-mask").remove();
    }
    this.callback = null;
};
export {AssetsDialog, UploadDialog, PropertyDialog, ProfileDialog, WarnDialog};
