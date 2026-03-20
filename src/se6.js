/**
 * $RCSfile: se6.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as ProseMirrorModel from "prosemirror-model";
import * as ProseMirrorState from "prosemirror-state";
import * as ProseMirrorView from "prosemirror-view";
import * as ProseMirrorSchemaBasic from "prosemirror-schema-basic";
import * as ProseMirrorSchemaList from "prosemirror-schema-list";
import * as ProseMirrorTransform from "prosemirror-transform";
import * as ProseMirrorTables from "prosemirror-tables";
import * as ProseMirrorKeymap from "prosemirror-keymap";
import * as ProseMirrorCommands from "prosemirror-commands";
import * as ProseMirrorHistory from "prosemirror-history";
import * as ProseMirrorInputrules from "prosemirror-inputrules";

import MenuBarPlugin from "./view/menubar.js";
import NodeBarPlugin from "./view/nodebar.js";
import TitlePlugin from "./view/title.js";
import PlaceholderPlugin from "./view/placeholder.js";
import DraggableUploadPlugin from "./view/dragupload.js";
import CursorPlugin from "./view/cursor.js";
import ContextMenuPlugin from "./view/contextmenu.js";
import BlockMenuPlugin from "./view/blockmenu.js";

import CodeBlockView from "./view/codeblock.js";
import ResizableImageView from "./view/image.js";
import AttachmentView from "./view/attachment.js";

import * as StackEditorWidget  from "./widget.js";
import * as StackEditorDialog  from "./dialog.js";
import * as StackEditorUpload  from "./upload.js";
import * as StackEditorCommand from "./command.js";
import * as StackEditorMenu    from "./menu.js";
import * as StackEditorConfig  from "./config.js";
import * as StackEditorI18N    from "./i18n.js";
import * as HtmlCleaner        from "./html.js";

// const { EditorState, TextSelection } = ProseMirrorState;
// const { EditorView } = ProseMirrorView;
// const { Schema, Fragment, DOMParser } = ProseMirrorModel;
// const { schema: basicSchema } = ProseMirrorSchemaBasic;
// const { addListNodes } = ProseMirrorSchemaList;
// const { keymap } = ProseMirrorKeymap;
// const { baseKeymap } = ProseMirrorCommands;
// const { history, undo, redo } = ProseMirrorHistory;
// const { tableNodes, addColumnBefore, addColumnAfter, addRowBefore, addRowAfter, mergeCells, splitCell } = ProseMirrorTables;

const {DOM, Events, Bytes, DataURI, FileType, FilePicker, SVG, Icon, Resource, Template, Value, Draggable, Resizable, MenuBar, Divider, MenuItem, DropdownMenu, DropdownItem, ContextMenu} = StackEditorWidget;
const {AssetsDialog, UploadDialog, PropertyDialog, ProfileDialog, WarnDialog} = StackEditorDialog;
const {Ajax, DefaultUpload, Base64Upload, MockUpload, ChunkedUpload} = StackEditorUpload;
const {StyleCommand, IndentCommand, AlignCommand, UploadCommand, EditCommand, Active, Insert, TableBuilder, Sharing} = StackEditorCommand;
const {ToolMenu, ColorMenu, LinkMenu, AnchorMenu, ImageMenu, VideoMenu, AudioMenu, EmotMenu, TableMenu} = StackEditorMenu;
const {Config} = StackEditorConfig;
const {BundleManager, LocalizationContext} = StackEditorI18N;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const I18N = BundleManager.getBundle("default");
const Toolbar = {};

Toolbar.SIMPLE = "save | quote h1 h2 h3 | strong italic underline strike forecolor backcolor clean | ulist olist left right center | link image video table code | undo redo |";
Toolbar.defaults = function() {
    const t = {};

    t.save = new MenuItem({
        "name": "save",
        "icon": "save",
        "label": I18N.get("tool.save.label"),
        "title": I18N.get("tool.save.title"),
        "shortcut": "Alt-s",
        "run": EditCommand.save
    });

    t.h1  = new MenuItem({"name": "h1", "icon": DOM.create("span", null, ["h1"]), "label": I18N.get("format.h1"), "title": "h1", "run": EditCommand.h1, "active": Active.h1});
    t.h2  = new MenuItem({"name": "h2", "icon": DOM.create("span", null, ["h2"]), "label": I18N.get("format.h2"), "title": "h2", "run": EditCommand.h2, "active": Active.h2});
    t.h3  = new MenuItem({"name": "h3", "icon": DOM.create("span", null, ["h3"]), "label": I18N.get("format.h3"), "title": "h3", "run": EditCommand.h3, "active": Active.h3});
    t.h4  = new MenuItem({"name": "h4", "icon": DOM.create("span", null, ["h4"]), "label": I18N.get("format.h4"), "title": "h4", "run": EditCommand.h4, "active": Active.h4});
    t.h5  = new MenuItem({"name": "h5", "icon": DOM.create("span", null, ["h5"]), "label": I18N.get("format.h5"), "title": "h5", "run": EditCommand.h5, "active": Active.h5});
    t.p   = new MenuItem({"name": "p",  "icon": DOM.create("span", null, ["p"]),  "label": I18N.get("format.p"),  "title": "p",  "run": EditCommand.paragraph, "active": Active.paragraph});

    // 正文 | 标题 | 段落 ...
    t.format = new DropdownMenu({
        "name": "format",
        "label": I18N.get("tool.format.label"),
        "title": I18N.get("tool.format.title"),
        "style": "margin-right: 8px; width: 100px;",
        "value": "p"
    });

    // 字体 ...
    t.fontfamily = new DropdownMenu({
        "name": "fontfamily",
        "label": "默认",
        "title": "字体",
        "label": I18N.get("tool.fontfamily.label"),
        "title": I18N.get("tool.fontfamily.title"),
        "style": "margin-right: 4px; width: 100px;",
        "value": ""
    });

    // 字体大小 ...
    t.fontsize = new DropdownMenu({
        "name": "fontsize",
        "label": I18N.get("tool.fontsize.label"),
        "title": I18N.get("tool.fontsize.title"),
        "style": "margin-right: 8px; width: 100px;",
        "value": ""
    });

    // 引用
    t.quote = new MenuItem({
        "name": "quote",
        "icon": "quote",
        "label": I18N.get("tool.quote.label"),
        "title": I18N.get("tool.quote.title"),
        "run": EditCommand.blockquote,
        "active": Active.blockquote
    });

    // 加粗
    t.strong = new MenuItem({
        "name": "strong",
        "icon": "strong",
        "label": I18N.get("tool.strong.label"),
        "title": I18N.get("tool.strong.title"),
        "shortcut": "Mod-b",
        "run": EditCommand.strong,
        "active": function(state) {
            return Active.mark(state, state.schema.marks.strong);
        }
    });

    // 斜体
    t.italic = new MenuItem({
        "name": "italic",
        "icon": "italic",
        "label": I18N.get("tool.italic.label"),
        "title": I18N.get("tool.italic.title"),
        "shortcut": "Mod-i",
        "run": EditCommand.italic,
        "active": function(state) {
            return Active.mark(state, state.schema.marks.em);
        }
    });

    // 下划线
    t.underline = new MenuItem({
        "name": "underline",
        "icon": "underline",
        "label": I18N.get("tool.underline.label"),
        "title": I18N.get("tool.underline.title"),
        "run": EditCommand.underline,
        "active": function(state) {
            return Active.mark(state, state.schema.marks.underline);
        }
    });

    // 删除线
    t.strike = new MenuItem({
        "name": "strike",
        "icon": "strike",
        "label": I18N.get("tool.strike.label"),
        "title": I18N.get("tool.strike.title"),
        "run": EditCommand.strike,
        "active": function(state) {
            return Active.mark(state, state.schema.marks.strike);
        }
    });

    // 前景色
    t.forecolor = new MenuItem({
        "name": "forecolor",
        "icon": "forecolor",
        "label": I18N.get("tool.forecolor.label"),
        "title": I18N.get("tool.forecolor.title"),
        "run": EditCommand.forecolor,
        "active": function(state) {
            return Active.mark(state, state.schema.marks.forecolor);
        }
    });

    // 背景色
    t.backcolor = new MenuItem({
        "name": "backcolor",
        "icon": "backcolor",
        "label": I18N.get("tool.backcolor.label"),
        "title": I18N.get("tool.backcolor.title"),
        "run": EditCommand.backcolor,
        "active": function(state) {
            return Active.mark(state, state.schema.marks.backcolor);
        }
    });

    // 清除文字格式
    t.clean = new MenuItem({
        "name": "clean",
        "icon": "clean",
        "label": I18N.get("tool.clean.label"),
        "title": I18N.get("tool.clean.title"),
        "run": EditCommand.clean
    });

    // 无序列表
    t.ulist = new MenuItem({
        "name": "ulist",
        "icon": "ulist",
        "label": I18N.get("tool.ulist.label"),
        "title": I18N.get("tool.ulist.title"),
        "run": EditCommand.ulist,
        "select": EditCommand.ulist
    });

    // 有序列表
    t.olist = new MenuItem({
        "name": "olist",
        "icon": "olist",
        "label": I18N.get("tool.olist.label"),
        "title": I18N.get("tool.olist.title"),
        "run": EditCommand.olist,
        "select": EditCommand.olist
    });

    // 提升块
    t.lift = new MenuItem({
        "name": "lift",
        "icon": "dedent",
        "label": "提升块",
        "title": "提升块",
        "label": I18N.get("tool.lift.label"),
        "title": I18N.get("tool.lift.title"),
        "run": EditCommand.lift,
        "select": EditCommand.lift
    });

    // 对齐
    t.align = new MenuItem({
        "name": "align",
        "icon": "align",
        "label": I18N.get("tool.align.label"),
        "title": I18N.get("tool.align.title"),
        "value": "left",
        "items": [
            new MenuItem({"name": "left", "icon": "alignleft",   "label": I18N.get("align.left"), "run": EditCommand.left}),
            new MenuItem({"name": "right", "icon": "alignright",  "label": I18N.get("align.right"), "run": EditCommand.right}),
            new MenuItem({"name": "center", "icon": "aligncenter", "label": I18N.get("align.center"), "run": EditCommand.center}),
            new MenuItem({"name": "justify", "icon": "align",       "label": I18N.get("align.justify"), "run": EditCommand.justify}),
        ],
        "select": Active.align
    });

    t.left = new MenuItem({"name": "left", "icon": "alignleft",   "label": I18N.get("align.left"), "run": EditCommand.left});
    t.right = new MenuItem({"name": "right", "icon": "alignright",  "label": I18N.get("align.right"), "run": EditCommand.right});
    t.center = new MenuItem({"name": "center", "icon": "aligncenter", "label": I18N.get("align.center"), "run": EditCommand.center});
    t.justify = new MenuItem({"name": "justify", "icon": "align",       "label": I18N.get("align.justify"), "run": EditCommand.justify});

    // 减小缩进
    t.dedent = new MenuItem({
        "name": "dedent",
        "icon": "dedent",
        "label": I18N.get("tool.dedent.label"),
        "title": I18N.get("tool.dedent.title"),
        "run": EditCommand.dedent,
        "select": Active.dedent
    });

    // 增加缩进
    t.indent = new MenuItem({
        "name": "indent",
        "icon": "indent",
        "label": I18N.get("tool.indent.label"),
        "title": I18N.get("tool.indent.title"),
        "run": EditCommand.indent,
        "select": Active.indent
    });

    // 超链接
    t.link = new MenuItem({
        "name": "link",
        "icon": "link",
        "label": I18N.get("tool.link.label"),
        "title": I18N.get("tool.link.title"),
        "run": EditCommand.link,
        "active": function(state) {
            return Active.mark(state, state.schema.marks.link);
        },
        "enable": function(state) {
            return !state.selection.empty;
        }
    });

    // 取消超链接
    t.unlink = new MenuItem({
        "name": "unlink",
        "icon": "unlink",
        "label": I18N.get("tool.unlink.label"),
        "title": I18N.get("tool.unlink.title"),
        "ignore": true,
        "run": EditCommand.unlink
    });

    // 锚点
    t.anchor = new MenuItem({
        "name": "anchor",
        "icon": "anchor",
        "label": I18N.get("tool.anchor.label"),
        "title": I18N.get("tool.anchor.title"),
        "run": EditCommand.anchor
    });

    // 插入图片
    t.image = new MenuItem({
        "name": "image",
        "icon": "image",
        "label": I18N.get("tool.image.label"),
        "title": I18N.get("tool.image.title"),
        "items": [
            new MenuItem({"icon": "image",   "label": I18N.get("image.online"), "value": "image",  "run": EditCommand.image}),
            new MenuItem({"icon": "image-u", "label": I18N.get("image.upload"), "value": "image2", "run": UploadCommand.image})
        ]
    });

    // 插入视频
    t.video = new MenuItem({
        "name": "video",
        "icon": "video",
        "label": I18N.get("tool.video.label"),
        "title": I18N.get("tool.video.title"),
        "items": [
            new MenuItem({"icon": "video",   "label": I18N.get("video.online"), "value": "video",  "run": EditCommand.video}),
            new MenuItem({"icon": "video-u", "label": I18N.get("video.upload"), "value": "video2", "run": UploadCommand.video})
        ]
    });

    // 插入音频
    t.audio = new MenuItem({
        "name": "audio",
        "icon": "audio",
        "label": I18N.get("tool.audio.label"),
        "title": I18N.get("tool.audio.title"),
        "items": [
            new MenuItem({"icon": "audio",   "label": I18N.get("audio.online"), "value": "video",  "run": EditCommand.audio}),
            new MenuItem({"icon": "audio-u", "label": I18N.get("audio.upload"), "value": "video2", "run": UploadCommand.audio})
        ]
    });

    // 上传附件
    t.attachment = new MenuItem({
        "name": "attachment",
        "icon": "attachment",
        "label": I18N.get("tool.attachment.label"),
        "title": I18N.get("tool.attachment.title"),
        "run": UploadCommand.attachment
    });

    // 插入水品线 horizontal rule
    t.hr = new MenuItem({
        "name": "hr",
        "icon": "hr",
        "label": I18N.get("tool.hr.label"),
        "title": I18N.get("tool.hr.title"),
        "run": EditCommand.hr
    });

    // 插入表情
    t.emot = new MenuItem({
        "name": "emot",
        "icon": "emot",
        "label": I18N.get("tool.emot.label"),
        "title": I18N.get("tool.emot.title"),
        "run": EditCommand.emot
    });

    // 插入表格
    t.table = new MenuItem({
        "name": "table",
        "icon": "table",
        "label": I18N.get("tool.table.label"),
        "title": I18N.get("tool.table.title"),
        "run": EditCommand.table
    });

    // 代码块
    t.code = new MenuItem({
        "name": "code",
        "icon": "code",
        "label": I18N.get("tool.code.label"),
        "title": I18N.get("tool.code.title"),
        "run": EditCommand.code,
        "active": function(state) {
            return Active.mark(state, state.schema.marks.code);
        }
    });

    // 撤销
    t.undo = new MenuItem({
        "name": "undo",
        "icon": "undo",
        "label": I18N.get("tool.undo.label"),
        "title": I18N.get("tool.undo.title"),
        "run": EditCommand.undo,
        "enable": EditCommand.undo
    });

    // 重做
    t.redo = new MenuItem({
        "name": "redo",
        "icon": "redo",
        "label": I18N.get("tool.redo.label"),
        "title": I18N.get("tool.redo.title"),
        "run": EditCommand.redo,
        "enable": EditCommand.redo
    });

    // 全屏
    t.fullscreen = new MenuItem({
        "name": "fullscreen",
        "icon": "fullscreen",
        "label": I18N.get("tool.fullscreen.label"),
        "title": I18N.get("tool.fullscreen.title"),
        "run": EditCommand.fullscreen
    });

    // 资源管理
    t.assets = new MenuItem({
        "name": "assets",
        "icon": "folder",
        "label": I18N.get("tool.assets.label"),
        "title": I18N.get("tool.assets.title"),
        "run": EditCommand.assets
    });

    // 分享
    t.share = new MenuItem({
        "name": "share",
        "icon": "share",
        "label": I18N.get("tool.share.label"),
        "title": I18N.get("tool.share.title"),
        "run": EditCommand.share
    });

    // 加锁
    t.lock = new MenuItem({
        "name": "lock",
        "icon": "lock",
        "label": I18N.get("tool.lock.label"),
        "title": I18N.get("tool.lock.title"),
        "run": EditCommand.lock
    });

    // 属性
    t.info = new MenuItem({
        "name": "info",
        "icon": "info",
        "label": I18N.get("tool.info.label"),
        "title": I18N.get("tool.info.title"),
        "run": EditCommand.info
    });

    // 资源管理
    t.setting = new MenuItem({
        "name": "setting",
        "icon": "setting",
        "label": I18N.get("tool.setting.label"),
        "title": I18N.get("tool.setting.title"),
        "run": EditCommand.setting
    });

    // 块操作
    const formatRender = function() {
        const button = DOM.create("button", {"class": "se-button flex"});
        const span1 = DOM.create("span", {"class": "checkable"});
        const span2 = DOM.create("span", {"class": this.value}, [this.label]);

        if(this.icon) {
            span1.appendChild(Icon.create(this.icon));
        }

        button.appendChild(span1);
        button.appendChild(span2);
        this.element.appendChild(button);
    };
    t.format.items = [
        new DropdownItem({"label": I18N.get("format.h1"),      "value": "h1",  "render": formatRender, "run": EditCommand.h1, "active": Active.h1}),
        new DropdownItem({"label": I18N.get("format.h2"),      "value": "h2",  "render": formatRender, "run": EditCommand.h2, "active": Active.h2}),
        new DropdownItem({"label": I18N.get("format.h3"),      "value": "h3",  "render": formatRender, "run": EditCommand.h3, "active": Active.h3}),
        new DropdownItem({"label": I18N.get("format.h4"),      "value": "h4",  "render": formatRender, "run": EditCommand.h4, "active": Active.h4}),
        new DropdownItem({"label": I18N.get("format.h5"),      "value": "h5",  "render": formatRender, "run": EditCommand.h5, "active": Active.h5}),
        new DropdownItem({"label": I18N.get("format.p"),       "value": "p",                           "run": EditCommand.paragraph,   "active": Active.paragraph}),
        new DropdownItem({"label": I18N.get("format.pre"),     "value": "pre",                         "run": EditCommand.pre, "active": Active.codeblock})
    ];

    // 字体类型
    const fontFamilyRender = function(editorView) {
        const button = DOM.create("button", {"class": "se-button"});
        const span1 = DOM.create("span", {"class": "checkable"});
        const span2 = DOM.create("span", {"class": "text", "style": "font-family: \"" + this.value + "\";"}, [this.label]);

        if(this.icon) {
            span1.appendChild(Icon.create(this.icon));
        }

        button.appendChild(span1);
        button.appendChild(span2);
        this.element.appendChild(button);
    };

    const fontFamilyRun = function(state, dispatch, view, event) {
        const handle = StyleCommand.set(state.schema.marks.fontfamily, {"family": this.value});
        handle(state, dispatch, view, event);
    };

    t.fontfamily.items = [
        new DropdownItem({"label": "默认",             "value": "",                  "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily(null)}),
        new DropdownItem({"label": "宋体",             "value": "宋体",              "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("宋体")}),
        new DropdownItem({"label": "仿宋",             "value": "仿宋",              "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("仿宋")}),
        new DropdownItem({"label": "黑体",             "value": "黑体",              "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("黑体")}),
        new DropdownItem({"label": "楷体",             "value": "楷体",              "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("楷体")}),
        new DropdownItem({"label": "标楷体",           "value": "标楷体",            "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("标楷体")}),
        new DropdownItem({"label": "华文仿宋",         "value": "华文仿宋",          "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("华文仿宋")}),
        new DropdownItem({"label": "华文楷体",         "value": "华文楷体",          "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("华文楷体")}),
        new DropdownItem({"label": "微软雅黑",         "value": "Microsoft YaHei",   "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("Microsoft YaHei")}),
        new DropdownItem({"label": "Arial",            "value": "Arial",             "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("Arial")}),
        new DropdownItem({"label": "Arial Black",      "value": "Arial Black",       "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("Arial Black")}),
        new DropdownItem({"label": "Comic Sans MS",    "value": "Comic Sans MS",     "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("Comic Sans MS")}),
        new DropdownItem({"label": "Courier New",      "value": "Courier New",       "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("Courier New")}),
        new DropdownItem({"label": "System",           "value": "System",            "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("System")}),
        new DropdownItem({"label": "Times New Roman",  "value": "Times New Roman",   "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("Times New Roman")}),
        new DropdownItem({"label": "Tahoma",           "value": "Tahoma",            "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("Tahoma")}),
        new DropdownItem({"label": "Verdana",          "value": "Verdana",           "render": fontFamilyRender, "run": fontFamilyRun, "active": Active.fontfamily("Verdana")})
    ];

    // 字体大小
    const fontSizeRun = function(state, dispatch, view, event) {
        const handle = StyleCommand.set(state.schema.marks.fontsize, {"size": this.value});
        handle(state, dispatch);
    };
    t.fontsize.items = (function() {
        let result = [];
        let values = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px", "72px"];
        result.push(new DropdownItem({"label": "默认", "value": "", "run": fontSizeRun, "active": Active.fontsize(null)}));

        for(let i = 0; i < values.length; i++) {
            let name = values[i];
            result.push(new DropdownItem({"label": name, "value": name, "run": fontSizeRun, "active": Active.fontsize(name)}));
        }
        return result;
    })();
    return t;
};

Toolbar.getItems = function(customs, enabled) {
    // save | cut copy paste |
    const all = "format, fontfamily, fontsize, quote, |, strong, italic, underline, strike, forecolor, backcolor, clean, |, ulist, olist, lift, align, dedent, indent, |, link, unlink, anchor, image, video, audio, attachment, hr, emot, table, code, undo, redo, fullscreen, |, assets, share, lock, info, setting";
    const tools = Toolbar.defaults();

    if(customs) {
        for(let i = 0; i < customs.length; i++) {
            let item = customs[i];
            let name = item.name;
            tools[name] = Toolbar.build(item);
        }
    }

    const names = [];
    const items = [];

    // save, |, cut, copy, paste, |, format, fontfamily, fontsize, quote, |, strong, italic, underline, strike, forecolor, backcolor, clean, |, ulist, olist, lift, align, dedent, indent, |, link, unlink, anchor, image, video, audio, attachment, hr, emot, table, code, undo, redo, fullscreen, |, assets, share, lock, info, setting
    if((enabled || "*") == "*") {
        Array.prototype.push.apply(names, Toolbar.split(all));

        if(customs) {
            for(let i = 0; i < customs.length; i++) {
                names.push((customs[i]).name);
            }

            for(const key in customs) {
                names.push(key);
            }
        }
    }
    else {
        // [空格 | 回车 | 逗号 | 分号]
        Array.prototype.push.apply(names, Toolbar.split(enabled));
    }

    let dpos = -2;

    for(let i = 0; i < names.length; i++) {
        let item = null;
        let name = names[i];

        if(name == "|") {
            // 去除两个连续的分隔符
            if(dpos != items.length - 1) {
                item = new Divider();
                dpos = items.length;
            }
        }
        else {
            item = tools[name];
        }

        if(item && item.spec.ignore != true) {
            items.push(item);
        }
    }
    return items;
};

Toolbar.split = function(enabled) {
    let start = 0;
    let names = [];

    for(let i = 0; i < enabled.length; i++) {
        let c = enabled.charCodeAt(i);

        // [空格 | 回车 | 逗号 | 分号]
        if(c <= 0x20 || c == 44 || c == 59) {
            if(i > start) {
                names.push(enabled.substring(start, i));
            }
            start = i + 1;
        }
    }

    if(start < enabled.length) {
        names.push(enabled.substring(start, enabled.length));
    }
    return names;
};

Toolbar.build = function(spec) {
    if(spec.name == "|") {
        return new Divider();
    }

    if(spec instanceof MenuItem || spec instanceof DropdownMenu) {
        return spec;
    }

    let item = new MenuItem(spec);

    if(spec.items) {
        item.items = [];

        for(let i = 0; i < spec.items.length; i++) {
            item.items.push(this.build(spec.items[i]));
        }
    }
    return item;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const AssetsManager = function() {
    this.id = 1;
    this.assetss = [];
};

AssetsManager.prototype.add = function(file, type) {
    if(file.store == "LOCAL") {
        return file;
    }

    const item = {};

    if(type == "image") {
        item.id = this.id++;
        item.name = file.title;
        item.title = file.title;
        item.url = file.src;
        item.size = file.size;
        item.type = "image";
        item.store = "LOCAL";
        item.width = file.width;
        item.height = file.height;
    }
    else if(type == "audio") {
        item.id = this.id++;
        item.name = file.name;
        item.title = file.name;
        item.url = file.src;
        item.size = file.size;
        item.type = "audio";
        item.store = "LOCAL";
    }
    else if(type == "video") {
        item.id = this.id++;
        item.name = file.name;
        item.title = file.name;
        item.url = file.src;
        item.size = file.size;
        item.type = "video";
        item.store = "LOCAL";
    }
    else {
        item.id = this.id++;
        item.name = file.name;
        item.title = file.name;
        item.url = file.url;
        item.size = file.size;
        item.type = "attachment";
        item.store = "LOCAL";
    }

    if(item.name == null || item.name == undefined || item.name.length < 1) {
        item.name = FileType.getName(item.url);
    }
    this.assetss.push(item);
    return item;
};

AssetsManager.prototype.put = function(file, type) {
    let item = this.add(file, type);

    if(item) {
        if(this.change) {
            this.change("ADD", [item]);
        }
    }
};

AssetsManager.prototype.all = function() {
    return this.assetss.slice(0);
};

AssetsManager.prototype.from = function(content) {
    if(content instanceof HTMLElement) {
        this.build(content);
    }
    else {
        this.build(DOM.create("div", null, content));
    }
};

AssetsManager.prototype.build = function(dom) {
    const instance = this;
    const images = dom.querySelectorAll("img");
    const audios = dom.querySelectorAll("audio");
    const videos = dom.querySelectorAll("video");
    const attachments = dom.querySelectorAll("attachment");

    images.forEach(function(e) {
        const file = {};
        file.src = e.getAttribute("src");
        file.title = e.getAttribute("title");
        file.width = e.style.width;
        file.height = e.style.height;

        if(file.src) {
            instance.add(file, "image");
        }
    });

    audios.forEach(function(e) {
        const file = {};
        file.src = e.getAttribute("src");
        file.name = e.getAttribute("data-name");
        instance.add(file, "audio");
    });

    videos.forEach(function(e) {
        const file = {};
        file.src = e.getAttribute("src");
        file.name = e.getAttribute("data-name");
        instance.add(file, "video");
    });

    attachments.forEach(function(e) {
        const file = {};
        file.name = e.getAttribute("data-name");
        file.url = e.getAttribute("data-url");
        file.size = parseInt(e.getAttribute("data-size"));
        instance.add(file, "attachment");
    });
};

AssetsManager.prototype.clear = function() {
    const old = this.assetss;

    // 清空
    this.assetss = [];

    if(this.change) {
        this.change("CLEAR", old);
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 粘贴插件
const PastePlugin = {};
PastePlugin.create = function(editorView, opts) {
    return new ProseMirrorState.Plugin({
        key: new ProseMirrorState.PluginKey("se6_paste_plugin"),
        props: {
            handlePaste: PastePlugin.handle
        }
    });
};

PastePlugin.handle = function(view, event, slice) {
    // 处理图片
    if(ImagePasteHandler.process(view, event, slice)) {
        return true;
    }

    // 处理 HTML
    if(HtmlPasteHandler.process(view, event, slice)) {
        return true;
    }
    return false;
};

const ImagePasteHandler = {};
ImagePasteHandler.process = function(view, event, slice) {
    const config = Config.getImage();
    const items = event.clipboardData.items;

    for(let i = 0; i < items.length; i++) {
        let item = items[i];

        if(item.kind == "file" && item.type.indexOf("image") > -1) {
            const file = ImagePasteHandler.getFile(item.getAsFile());

            if(config.enabled == false) {
                new WarnDialog().open(null, "禁止上传图片");
                return true;
            }

            if(config.maxSize > 0 && file.size > config.maxSize) {
                new WarnDialog().open(null, "图片过大，最大允许：" + Bytes.format(config.maxSize, 2));
                return true;
            }

            UploadCommand.upload(view, [file]);
            return true;
        }
    }
    return false;
};

ImagePasteHandler.getFile = function(file) {
    const ext = FileType.getType(file.name);
    const date = ImagePasteHandler.getDateTime(new Date());
    const name = "screenshot_" + date + "." + (ext.length > 0 ? ext : "png");

    return new File(
        [file],
        name,
        {
            "type": file.type,
            "lastModified": file.lastModified
        }
    );
};

ImagePasteHandler.getDateTime = function(date) {
    if(date == null) {
        date = new Date();
    }

    if(typeof(date) == "number") {
        let temp = new Date();
        temp.setTime(date);
        date = temp;
    }

    const y = date.getFullYear();
    const M = date.getMonth() + 1;
    const d = date.getDate();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const a = [];

    a.push(y.toString());
    a.push(M < 10 ? "0" + M : M);
    a.push(d < 10 ? "0" + d : d);
    a.push(h < 10 ? "0" + h : h);
    a.push(m < 10 ? "0" + m : m);
    a.push(s < 10 ? "0" + s : s);
    return a.join("");
};

ImagePasteHandler.paste = function(view, file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const base64 = e.target.result;
        const img = {"src": base64, "title": file.name, "alt": file.name};
        Insert.image(view, img);
    };
    reader.readAsDataURL(file);
};

const HtmlPasteHandler = {};
HtmlPasteHandler.process = function(view, event, slice) {
    const html = event.clipboardData.getData("text/html");

    if(html) {
        const cleaned = this.clean(html);
        const parser = ProseMirrorModel.DOMParser.fromSchema(view.state.schema);
        const dom = document.createElement("div");
        dom.innerHTML = cleaned;
        const newSlice = parser.parseSlice(dom);

        const { dispatch, state } = view;
        const tr = state.tr.replaceSelection(newSlice);
        dispatch(tr.scrollIntoView());
        return true;
    }
    return false;
};

HtmlPasteHandler.clean = function(html) {
    return HtmlCleaner.clean(html);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const EditorViewBuilder = {};
EditorViewBuilder.build = function(element, opts) {
    let content = null;

    if(opts.value instanceof HTMLElement) {
        content = opts.value;
    }
    else {
        content = document.createElement("div");

        if(opts.value) {
            content.innerHTML = opts.value;
        }
    }

    EditorViewBuilder.prepare(content);

    // OrderedMap.append, OrderedMap.update 不会改变原对象
    const basicSchema = ProseMirrorSchemaBasic.schema;
    const marks = basicSchema.spec.marks.append({
        "link": {
            "attrs": {
                "class": {
                    "default": null,
                    "validate": "string|null"
                },
                "href": {
                    "default": null,
                    "validate": "string|null"
                },
                "title": {
                    "default": null,
                    "validate": "string|null"
                },
                "target": {
                    "default": null,
                    "validate": "string|null"
                },
                "referer": {
                    "default": null,
                    "validate": "string|null"
                }
            },
            "inclusive": false,
            "parseDOM": [
                {
                    "tag": "a[href]"
                }
            ],
            "toDOM": function(node) {
                return ["a", {
                    "class": node.attrs["class"],
                    "href": node.attrs.href,
                    "title": node.attrs.title,
                    "target": node.attrs.target,
                    "data-referer": node.attrs.referer
                }, 0];
            }
        },
        // 字体
        "fontfamily": {
            "attrs": {family: {default: "" }},
            "parseDOM": [
                {
                    style: "font-family",
                    getAttrs: function(value) {
                        return {"family": value.trim()}
                    }
                }
            ],
            "toDOM": function(mark) {
                return ["span", {style: "font-family: " + mark.attrs.family}, 0];
            }
        },
        // 字号
        "fontsize": {
            "attrs": {size: {default: "" }},
            "toDOM": function(mark) {
                return ["span", {style: "font-size: " + mark.attrs.size}, 0];
            },
            "parseDOM": [
                {
                    style: "font-size",
                    getAttrs: function(value) {
                        return {"size": value.trim()}
                    }
                }
            ]
        },

        // 字体颜色
        "forecolor": {
            "attrs": {color: {default: "" }},
            "toDOM": function(mark) {
                return ["span", {style: "color: " + mark.attrs.color}, 0];
            },
            "parseDOM": [
                {
                    style: "color",
                    getAttrs: function(value) {
                        return {"color": value.trim()}
                    }
                }
            ]
        },

        // 背景色
        "backcolor": {
            "attrs": {color: {default: "" }},
            "toDOM": function(mark) {
                return ["span", {style: "background-color: " + mark.attrs.color}, 0];
            },
            "parseDOM": [
                {
                    style: "background-color",
                    getAttrs: function(value) {
                        return {"color": value.trim()}
                    }
                }
            ]
        },

        // 上划线 | 删除线 | 下划线
        // overline | line-through | underline
        "underline": {
            "attrs": {},
            "toDOM": function(mark) {
                return ["u", {}, 0];
            },
            "parseDOM": [
                {
                    getAttrs: function(value) {
                        return {};
                    }
                }
            ]
        },

        // 上划线 | 删除线 | 下划线
        // overline | line-through | underline
        "strike": {
            "attrs": {},
            "toDOM": function(mark) {
                return ["s", {}, 0];
            },
            "parseDOM": [
                {
                    getAttrs: function(value) {
                        return {};
                    }
                }
            ]
        }
    });

    const imageNodeSpec = {
        "inline": true,
        "attrs": {
            src: {},
            alt: { default: null },
            title: { default: null },
            width: { default: null },
            height: { default: null },
            align: { default: null }
        },
        "group": "inline",
        "draggable": true,
        "parseDOM": [{
            tag: "img[src]",
            getAttrs: function(dom) {
                let width = dom.style.width;
                let height = dom.style.height;
                let marginLeft = dom.style.marginLeft;
                let marginRight = dom.style.marginRight;
                let align = "left";

                if(!width) {
                    width = dom.getAttribute("width");

                    if(width) {
                        width = width + "px";
                    }
                }

                if(!height) {
                    height = dom.getAttribute("height");

                    if(height) {
                        height = height + "px";
                    }
                }

                // align 不使用
                if(dom.style.margin == "0 auto" || (marginLeft == "auto" && marginRight == "auto")) {
                    align = "center";
                }
                else if (marginLeft == "auto" && marginRight == "0px") {
                    align = "right";
                }
                else {
                    align = "left";
                }

                return {
                    src: dom.getAttribute("src"),
                    width: (width || null),
                    height: (height || null),
                    title: dom.getAttribute("title"),
                    alt: dom.getAttribute("alt")
                };
            }
        }],
        "toDOM"(node) {
            const style = [];
            const attrs = {"src": node.attrs.src};

            if(node.attrs.width) {
                style.push("width: " + node.attrs.width + ";");
            }

            if(node.attrs.height) {
                style.push("height: " + node.attrs.height + ";");
            }

            /*
            if(node.attrs.align == "center") {
                style.push("margin: 0px auto; max-width: 80%; display: block;");
            }
            else if (node.attrs.align == "right") {
                style.push("margin-left: auto; margin-right: 0px; max-width: 80%; display: block;");
            }
            else {
                style.push("margin: 0px 0px; display: inline-block;");
            }
            */

            if(style.length > 0) {
                attrs.style = style.join(" ");
            }

            if(node.attrs.title && node.attrs.title.length > 0) {
                attrs.title = node.attrs.title;
            }

            if(node.attrs.alt && node.attrs.alt.length > 0) {
                attrs.alt = node.attrs.alt;
            }
            return ["img", attrs];
        }
    };

    const audioNodeSpec = {
        "inline": true,
        "attrs": {
            src: {},
            controls: { default: true },
            width: { default: null },
            height: { default: null }
        },
        "group": "inline",
        "parseDOM": [{
            "tag": "audio[src]",
            "getAttrs": function(dom) {
                return {
                    src: dom.getAttribute("src"),
                    controls: dom.hasAttribute("controls"),
                    width: dom.getAttribute("width"),
                    height: dom.getAttribute("height")
                };
            }
        }],
        "toDOM": function(node) {
            return ["audio", {
                src: node.attrs.src,
                controls: node.attrs.controls ? "" : null,
                width: node.attrs.width,
                height: node.attrs.height,
                style: "max-width: 100%"
            }];
        }
    };

    const videoNodeSpec = {
        "inline": true,
        "attrs": {
            src: {},
            controls: { default: true },
            width: { default: null },
            height: { default: null }
        },
        "group": "inline",
        "parseDOM": [{
            "tag": "video[src]",
            "getAttrs": function(dom) {
                return {
                    src: dom.getAttribute("src"),
                    controls: dom.hasAttribute("controls"),
                    width: dom.getAttribute("width"),
                    height: dom.getAttribute("height")
                };
            }
        }],
        "toDOM": function(node) {
            return ["video", {
                src: node.attrs.src,
                controls: node.attrs.controls ? "" : null,
                width: node.attrs.width,
                height: node.attrs.height,
                style: "max-width: 100%"
            }];
        }
    };

    const iframeNodeSpec = {
        inline: true,
        attrs: {
            src: {},
            width: { default: null },
            height: { default: null },
            allow: {default: null}
        },
        group: "inline",
        parseDOM: [{
            tag: "iframe[src]",
            getAttrs: function(dom) {
                let src = dom.getAttribute("src");
                let width = dom.style.width;
                let height = dom.style.height;
                let allow = dom.getAttribute("allow");

                if(!width) {
                    width = dom.getAttribute("width");

                    if(width) {
                        width = width + "px";
                    }
                }

                if(!height) {
                    height = dom.getAttribute("height");

                    if(height) {
                        height = height + "px";
                    }
                }
                return {"src": src, "width": width, "height": height, "allow": allow};
            }
        }],
        toDOM: function(node) {
            let attrs = {};
            let style = [];

            if(node.attrs.width) {
                style.push("width: " + node.attrs.width + ";");
            }

            if(node.attrs.height) {
                style.push("height: " + node.attrs.height + ";");
            }

            // src
            attrs.src = node.attrs.src;

            // style
            if(style.length > 0) {
                attrs.style = style.join(" ");
            }

            // allow
            if(node.attrs.allow && node.attrs.allow.length > 0) {
                attrs.allow = node.attrs.allow.trim();
            }
            return ["iframe", attrs];
        }
    };

    const attachmentNodeSpec = {
        inline: true,
        attrs: {
            name: { default: null },
            title: { default: null },
            url: { default: null },
            size: { default: null }
        },
        group: "inline",
        draggable: true,
        parseDOM: [{
            tag: "attachment",
            getAttrs: function(dom) {
                return {name: dom.getAttribute("data-name"), title: dom.getAttribute("data-title"), url: dom.getAttribute("data-url"), size: dom.getAttribute("data-size")};
            }
        }],
        toDOM(node) {
            return ["attachment", {"data-name": node.attrs.name, "data-title": node.attrs.title, "data-url": node.attrs.url, "data-size": node.attrs.size}];
        }
    };

    const paragraphNodeSpec = {
        "content": "inline*",
        "group": "block",
        attrs: {"indent": {default: 0}, "align": {default: null}},
        parseDOM: [{
            tag: "p",
            getAttrs: function(dom) {
                const value = dom.style.textIndent || "0em";
                const indent = parseInt(value.replace(/em/, "")) || 0;
                const align = dom.style.textAlign;
                return {"indent": indent, "align": align};
            }
        }],
        toDOM: function(node) {
            let style = [];
            let attrs = {};

            if(node.attrs.indent && node.attrs.indent > 0) {
                style.push("text-indent: " + node.attrs.indent + "em;");
            }

            if(["left", "right", "center", "justify"].includes(node.attrs.align)) {
                style.push("text-align: " + node.attrs.align + ";");
            }

            if(style.length > 0) {
                attrs.style = style.join(" ");
            }
            return ["p", attrs, 0];
        }
    };

    // basicSchema.spec.nodes.get("code_block")
    const codeNodeSpec = {
        "code": true,
        "content": "text*",
        "defining": true,
        "group": "block",
        "marks": "",
        "attrs": {
            "lang": { default: "plaintext" },
        },
        "toDOM": function(node) {
            return [
                "pre",
                ["code", { "class": "language-" + node.attrs.lang }, 0],
            ];
        },
        "parseDOM": [
            {
                tag: "pre",
                getAttrs: function(dom) {
                    let code = dom.firstChild;
                    let lang = "plaintext";

                    if(code && code.className) {
                        lang = code.className.match(/language-(\w+)/)?.[1] || "plaintext";
                    }
                    return {"lang": lang};
                },
                contentElement: "code",
            }
        ]
    };

    const tableNodeSpec = ProseMirrorTables.tableNodes({
        tableGroup: "block",
        cellContent: "block+", // 单元格可包含多个块级节点（段落、标题等）
        cellAttributes: {
            // 可选：自定义单元格属性（如背景色、边框）
            background: { default: null },
            borderColor: { default: null }
        }
    });

    const brNodeSpec = {
        inline: true,
        group: "inline",
        selectable: false,
        parseDOM: [{ tag: "br" }],
        toDOM: function() {
            return ["br"];
        }
    };

    // node 定义
    // update("text", {group: "inline"})
    const nodes = basicSchema.spec.nodes
        .append(tableNodeSpec)
        .update("paragraph", paragraphNodeSpec)
        .update("code_block", codeNodeSpec)
        .update("hard_break", brNodeSpec)
        .update("image", imageNodeSpec)
        .update("audio", audioNodeSpec)
        .update("video", videoNodeSpec)
        .update("iframe", iframeNodeSpec)
        .update("attachment", attachmentNodeSpec);

    // 创建包含列表的 schema
    const schema = new ProseMirrorModel.Schema({
        nodes: ProseMirrorSchemaList.addListNodes(nodes, "paragraph block*", "block"),
        marks: marks
    });

    // 创建快捷键
    const shortcuts = {
        // 绑定快捷键（可选，和菜单功能一致）
        "Mod-b": ProseMirrorCommands.toggleMark(schema.marks.bold),
        "Mod-i": ProseMirrorCommands.toggleMark(schema.marks.italic),
        "Tab": ProseMirrorTables.goToNextCell(1),
        "Shift-Tab": ProseMirrorTables.goToNextCell(-1),
        "Mod-Enter": EditCommand.br,
        "Mod-z": ProseMirrorHistory.undo,
        "Mod-y": ProseMirrorHistory.redo,
        "Mod-Shift-z": ProseMirrorHistory.redo
    };

    if(opts.menubar == null || opts.menubar == undefined) {
        opts.menubar = {};
    }

    // 创建菜单条目
    const menuItems = Toolbar.getItems(opts.menubar.items, opts.menubar.enabled);

    // 绑定菜单快捷键
    for(let i = 0; i < menuItems.length; i++) {
        let item = menuItems[i];

        if(item.shortcut) {
            shortcuts[item.shortcut] = function(state, dispatch, view, event) {
                Events.stop(event);

                if(item.run) {
                    item.run(state, dispatch, view, event);
                }
            };
        }
    }

    const plugins = [];
    plugins.push(MenuBarPlugin.create(menuItems));

    // 标题栏位于编辑器之前, 需先加载
    if(Config.getValue(opts, "editor.title.enabled") == true) {
        plugins.push(TitlePlugin.create(opts));
    }

    // 依赖编辑区位置
    if(Config.getValue(opts, "editor.nodebar.enabled") == true) {
        // plugins.push(NodeBarPlugin.create());
    }

    plugins.push(NodeBarPlugin.create());
    plugins.push(PlaceholderPlugin.create());
    plugins.push(PastePlugin.create());
    plugins.push(DraggableUploadPlugin.create());
    plugins.push(CursorPlugin.create());
    plugins.push(ProseMirrorTables.columnResizing());
    plugins.push(ProseMirrorTables.tableEditing());
    // plugins.push(BlockMenuPlugin.create());
    plugins.push(ContextMenuPlugin.create());
    // plugins.push(SelectionSizePlugin.create());
    plugins.push(ProseMirrorKeymap.keymap(shortcuts));
    plugins.push(ProseMirrorKeymap.keymap(ProseMirrorCommands.baseKeymap));
    plugins.push(ProseMirrorHistory.history());

    // 创建 state
    const state = ProseMirrorState.EditorState.create({
        schema: schema,
        doc: ProseMirrorModel.DOMParser.fromSchema(schema).parse(content),
        plugins: plugins
    });

    const editable = (Config.getValue(opts, "editor.editable") != false);

    // 创建 EditorView
    const view = new ProseMirrorView.EditorView(element, {
        state: state,
        nodeViews: {
            "code_block": function(node, view, getPos) {
                return new CodeBlockView(node, view, getPos, opts);
            },
            "image": function(node, view, getPos) {
                return new ResizableImageView(node, view, getPos);
            },
            "attachment": function(node, view, getPos) {
                return new AttachmentView(node, view, getPos);
            }
        },
        attributes: {
            class: "ProseMirror",
            contenteditable: "true"
        },
        editable: (editable ? (function(state) {return true;}) : (function(state) {return false}))
    });
    return view;
};

EditorViewBuilder.prepare = function(element) {
    element.querySelectorAll("pre").forEach(function(pre) {
        const code = pre.querySelector("code");

        if(!code) {
            const ele = document.createElement("code");

            while(pre.firstChild) {
                ele.appendChild(pre.firstChild);
            }
            pre.appendChild(ele);
        }
    });
};

/**
 * 扫描文档中使用 BASE64 编码的图片并上传
 */
const ResourceHandler = {};
ResourceHandler.scan = function(element, upload, callback) {
    const context = [];
    const files = [];

    element.querySelectorAll("img").forEach(function(e) {
        const src = e.src;

        if(DataURI.test(src)) {
            const blob = DataURI.toBlob(src);
            const file = ImagePasteHandler.getFile(blob);

            files.push(file);
            context.push({"file": file, "element": e});
        }
    });

    if(files.length < 1) {
        callback();
        return;
    }

    let count = 0;

    upload.upload(files, function(file, result) {
        count++;

        const element = (function() {
            for(let i = 0; i < context.length; i++) {
                let item = context[i];

                if(item.file == file) {
                    return item.element;
                }
            }
            return null;
        })();

        if(element) {
            element.src = result.url;
        }

        if(count >= files.length) {
            callback();
        }
    });
};

/**
 * class StackEditor
 */
const StackEditor = function(opts) {
    this.opts = (opts || {"menubar": {}});
    this.view = null;

    /**
     * upload
     */
    this.upload = new MockUpload();

    /**
     * assets
     */
    this.assetsManager = new AssetsManager();
};

StackEditor.prototype.render = function(container, value) {
    const instance = this;
    const opts = Object.assign(this.opts, {"value": value});
    const element = DOM.create("div", {"class": "se-container"});
    element.innerHTML = [
        "<div class=\"se-toolbar\"></div>",
        "<div class=\"se-nodebar\"></div>",
        "<div class=\"se-frame\">",
            "<div class=\"se-editor\"></div>",
            "<div class=\"se-loading-mask\"></div>",
        "</div>"
    ].join("");
    container.appendChild(element);

    const frame = element.querySelector(":scope > div.se-frame");
    const target = element.querySelector(":scope > div.se-frame div.se-editor");

    this.view = EditorViewBuilder.build(target, opts);
    this.view.INSTANCE = this;

    element.addEventListener("click", function(event) {
        const src = (event.target || event.srcElement);

        if(src.className != "se-editor") {
            return;
        }

        try {
            instance.view.focus();
        }
        catch(e) {
            console.log(e);
        }
    });

    if(container.closest(".word")) {
        const back = document.createElement("div");
        back.className = "se-backtop";
        back.textContent = "↑";

        back.addEventListener("click", function(event) {
            // frame.scrollTo({top: 0, behavior: "smooth"});
            DOM.scrollToTop(frame, 600);
        });

        frame.addEventListener("scroll", function(event) {
            let top = this.scrollTop;

            if(top > 20) {
                back.classList.add("show");
            }
            else {
                back.classList.remove("show");
            }
        });
        frame.appendChild(back);

        const page = document.createElement("div");
        page.className = "se-page";
        page.innerHTML = [
            "<div class=\"se-d1 se-s1\"></div>",
            "<div class=\"se-d2 se-s1\"></div>",
            "<div class=\"se-d3 se-s1\"></div>",
            "<div class=\"se-d4 se-s1\"></div>"
        ].join("");
        target.appendChild(page);
    }
};

StackEditor.prototype.prepare = function(element) {
    EditorViewBuilder.prepare(element);
};

StackEditor.prototype.setTitle = function(title) {
    const container = this.view.dom.parentElement;
    const input = container.querySelector(":scope > div.se-title input[name=title]");

    if(input) {
        input.value = (title || "");
    }
    this.opts.title = (title || "");
};

StackEditor.prototype.getTitle = function() {
    const container = this.view.dom.parentElement;
    const title = container.querySelector(":scope > div.se-title input[name=title]");
    return (title ? title.value : null);
};

StackEditor.prototype.getValue = function() {
    const schema = this.view.state.schema;
    const doc = this.view.state.doc;
    const fragment = ProseMirrorModel.DOMSerializer.fromSchema(schema).serializeFragment(doc.content);
    const element = document.createElement("div");
    element.appendChild(fragment);
    return element.innerHTML;
};

StackEditor.prototype.getJSON = function() {
    return this.view.state.doc.toJSON();
};

StackEditor.prototype.setValue = function(content) {
    let element = null;

    if(content instanceof window.Node) {
        element = content;
    }
    else {
        element = document.createElement("div");
        element.innerHTML = content;
    }

    this.prepare(element);

    const schema = this.view.state.schema;
    const plugins = this.view.state.plugins;
    const doc = ProseMirrorModel.DOMParser.fromSchema(schema).parse(element);
    const state = ProseMirrorState.EditorState.create({
        doc: doc,
        plugins: plugins
    });
    this.view.updateState(state);
};

StackEditor.prototype.setContent = function(value) {
    let element = null;

    if(content instanceof window.Node) {
        element = content;
    }
    else {
        element = document.createElement("div");
        element.innerHTML = content;
    }

    this.prepare(element);

    // const state = this.view.state;
    // const schema = state.schema;
    // const doc = ProseMirrorModel.DOMParser.fromSchema(schema).parse(element);
    // const tr = state.tr.replaceWith(0, state.doc.content.size, doc.content);
    // state.apply(tr);

    const state = this.view.state;
    const schema = state.schema;
    const doc = ProseMirrorModel.DOMParser.fromSchema(schema).parse(element);
    const tr = state.tr.replaceWith(0, state.doc.content.size, doc.content);
    this.view.dispatch(tr);
};

StackEditor.prototype.enable = function() {
    const container = this.view.dom.parentElement;
    const title = container.querySelector(":scope > div.se-title input[name=title]");

    if(title) {
        title.readOnly = false;
    }

    this.view.dispatch(this.view.state.tr.setMeta("readonly", false));
    this.view.dom.setAttribute("contenteditable", "true");
};

StackEditor.prototype.disable = function() {
    const container = this.view.dom.parentElement;
    const title = container.querySelector(":scope > div.se-title input[name=title]");

    if(title) {
        title.readOnly = true;
    }

    this.view.dispatch(this.view.state.tr.setMeta("readonly", true));
    this.view.dom.setAttribute("contenteditable", "false");
};

StackEditor.prototype.focus = function() {
    this.view.focus();
};

StackEditor.prototype.blur = function() {
    document.body.focus();
};

StackEditor.prototype.exec = function(name) {
    const handle = EditCommand[name];

    if(handle) {
        handle(this.view.state, this.view.dispatch, this.view, null);
    }
};

StackEditor.prototype.undo = function() {
    this.exec("undo");
};

StackEditor.prototype.redo = function() {
    this.exec("redo");
};

StackEditor.prototype.fullscreen = function(level) {
    const container = this.view.dom.closest("div.se-container");

    if(container) {
        DOM.fullscreen(container, (level || 1));
    }
};

StackEditor.prototype.clear = function() {
    EditCommand.clear(this.view.state, this.view.dispatch, this.view, null);
};

StackEditor.prototype.loading = function(b) {
    const frame = this.view.dom.closest("div.se-frame");
    const mask = frame.querySelector("div.se-mask");

    if(mask) {
        if(b != false) {
            mask.innerHTML = "<div class=\"se-loading\"><div class=\"se-striped\"></div></div>";
            mask.style.display = "block";
        }
        else {
            mask.innerHTML = "";
            mask.style.display = "none";
        }
    }
};

StackEditor.prototype.info = function() {
    const doc = {
        "id": 1,
        "title": "StackEditor 使用指南",
        "mimeType": "text/html",
        "category": {"id": 1, "name": "docker"},
        "theme": "wiki",
        "url": "/blog/article/display.html?id=1",
        "createTime": "2025-06-08 01:11",
        "updateTime": "2025-06-08 10:11"
    };
    new PropertyDialog(doc).open();
};

StackEditor.prototype.destroy = function() {
    if(this.view) {
        this.view.destroy();
        this.view = null;
    }
};

(function() {
    Resource.guess();
})();

export {StackEditor, EditCommand, DefaultUpload, Base64Upload, MockUpload, ResourceHandler, HtmlCleaner, DOM, Ajax, Sharing, BundleManager};
