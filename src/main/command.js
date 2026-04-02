/**
 * $RCSfile: command.js,v $
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

import * as StackEditorMenu from "./menu.js";
import * as StackEditorDialog from "./dialog.js";
import * as StackEditorWidget from "./widget.js";
import * as StackEditorUpload from "./upload.js";
import * as StackEditorConfig from "./config.js";

const { EditorState, TextSelection } = ProseMirrorState;
const { EditorView } = ProseMirrorView;
const { Schema, Fragment, DOMParser } = ProseMirrorModel;
const { schema: basicSchema } = ProseMirrorSchemaBasic;
const { addListNodes } = ProseMirrorSchemaList;
const { keymap } = ProseMirrorKeymap;
const { baseKeymap } = ProseMirrorCommands;
const { history, undo, redo } = ProseMirrorHistory;
const { tableNodes, addColumnBefore, addColumnAfter, addRowBefore, addRowAfter, mergeCells, splitCell } = ProseMirrorTables;

const {ToolMenu, ColorMenu, LinkMenu, AnchorMenu, ImageMenu, VideoMenu, AudioMenu, EmotMenu, TableMenu} = StackEditorMenu;
const {AssetsDialog, UploadDialog, PropertyDialog, ProfileDialog, WarnDialog} = StackEditorDialog;
const {DOM, Events, Bytes, FileType, FilePicker, SVG, Icon, Template, Value} = StackEditorWidget;
const {Ajax, DefaultUpload, MockUpload, ChunkedUpload} = StackEditorUpload;
const {Config} = StackEditorConfig;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const StyleCommand = {};
StyleCommand.setFontFamily = function(state, dispatch, view, event, family) {
    const handle = StyleCommand.set(state.schema.marks.fontfamily, {"family": family});
    handle(state, dispatch, view, event);
};

StyleCommand.setFontSize = function(state, dispatch, view, event, size) {
    const handle = StyleCommand.set(state.schema.marks.fontsize, {"size": size});
    handle(state, dispatch, view, event);
};

StyleCommand.set = function(markType, attrs) {
    return function(state, dispatch) {
        const selection = state.selection;
        const mark = markType.create(attrs);

        // 如果选区为空（光标），则给后续输入的文本添加 Mark
        // 如果选区有内容，直接给选区添加 Mark
        let tr = state.tr;

        if(selection.empty) {
            // 存储标记，后续输入生效
            tr = tr.addStoredMark(mark);
        }
        else {
            // 给选区添加标记
            tr = tr.addMark(selection.from, selection.to, mark);
        }

        if(dispatch) {
            dispatch(tr);
        }
        return true;
    };
};

StyleCommand.remove = function(markType) {
    return function(state, dispatch) {
        const selection = state.selection;
        let tr = state.tr;

        // 移除选区的 Mark，或清空存储的 Mark（光标状态）
        if(selection.empty) {
            tr = tr.removeStoredMark(markType);
        }
        else {
            tr = tr.removeMark(selection.from, selection.to, markType);
        }

        if(dispatch) {
            dispatch(tr);
        }
        return true;
    };
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const IndentCommand = {"STEP": 2, "MAX_INDENT": 20};
IndentCommand.increase = function(state, dispatch, view, event) {
    IndentCommand.change(state, dispatch, view, event, +2);
};

IndentCommand.decrease = function(state, dispatch, view, event) {
    IndentCommand.change(state, dispatch, view, event, -2);
};

IndentCommand.reset = function(state, dispatch, view, event) {
    IndentCommand.change(state, dispatch, view, event, +0);
};

IndentCommand.change = function(state, dispatch, view, event, delta) {
    const { selection, schema } = state;
    const { $from, $to } = selection;
    let tr = state.tr;

    // 遍历选中的所有段落节点，修改 indent 属性
    tr.doc.nodesBetween($from.pos, $to.pos, function(node, pos) {
        if(node.type === schema.nodes.paragraph) {
            let indent = (parseInt(node.attrs.indent) || 0);

            // 重置缩进时直接设为0
            if(delta > 0) {
                indent = Math.min(IndentCommand.MAX_INDENT, indent + delta);
            }
            else {
                indent = 0;
            }

            let attrs = Object.assign({}, node.attrs, {"indent": indent})

            // 修改节点属性（生成新节点，替换原节点）
            tr = tr.setNodeMarkup(pos, null, attrs);
        }
    });

    if(tr.docChanged && dispatch) {
        dispatch(tr);
        return true;
    }
    return false;
};

const AlignCommand = {};
AlignCommand.align = function(state, dispatch, align) {
    const { selection, schema } = state;
    const { $from } = selection;
    const pos = (function() {
        let result = {"pos": -1, "depth": -1};

        for(let depth = $from.depth; depth >= 0; depth--) {
            const node = $from.node(depth);

            if(node.type == schema.nodes.paragraph) {
                result.pos = $from.before(depth);
                result.depth = depth;
            }
        }
        return result;
    })();

    // 不在段落内
    if(pos.pos < 0) {
        return false;
    }

    const node = $from.node(pos.depth);
    const attrs = Object.assign({}, node.attrs, {"align": align});

    // 生成事务，修改节点属性，节点不可变，需替换
    const tr = state.tr.setNodeMarkup(
        pos.pos,   // 段落节点的位置
        null,      // 节点类型不变, 仍为 paragraph
        attrs,     // 新属性
        node.marks // 保留原有标记
    );

    if(dispatch) {
        dispatch(tr);
    }
    return true;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const UploadCommand = {};
UploadCommand.image = function(state, dispatch, view, event) {
    const instance = view.INSTANCE;
    const config = Config.getImage(instance.opts);

    if(config.enabled == false) {
        new WarnDialog().open(null, "禁止上传图片");
        return;
    }

    if(instance.upload) {
        const handle = function() {
            const callback = function(file, result) {
                Insert.image(view, {"src": result.url, "title": result.name, "alt": result.desc});
            };

            FilePicker.choose(config.accept, true, function(files) {
                for(let i = 0; i < files.length; i++) {
                    let file = files[i];

                    if(config.maxSize > 0 && file.size > config.maxSize) {
                        new WarnDialog().open(null, "图片过大，最大允许：" + Bytes.format(config.maxSize, 2));
                        return;
                    }
                }
                instance.upload.upload(files, callback);
            });
        };
        UploadCommand.execute(view, handle);
    }
};

UploadCommand.audio = function(state, dispatch, view, event) {
    const instance = view.INSTANCE;
    const config = Config.getAudio(instance.opts);

    if(config.enabled == false) {
        new WarnDialog().open(null, "禁止上传音频文件");
        return;
    }

    if(instance.upload) {
        const handle = function() {
            const callback = function(file, result) {
                Insert.audio(view, {"src": result.url, "width": 800, "height": 600});
            };

            FilePicker.choose(config.accept, true, function(files) {
                for(let i = 0; i < files.length; i++) {
                    let file = files[i];

                    if(config.maxSize > 0 && file.size > config.maxSize) {
                        new WarnDialog().open(null, "音频文件过大，最大允许：" + Bytes.format(config.maxSize, 2));
                        return;
                    }
                }
                instance.upload.upload(files, callback);
            });
        };
        UploadCommand.execute(view, handle);
    }
};

UploadCommand.video = function(state, dispatch, view, event) {
    const instance = view.INSTANCE;
    const config = Config.getVideo(instance.opts);

    if(config.enabled == false) {
        new WarnDialog().open(null, "禁止上传视频文件");
        return;
    }

    if(instance.upload) {
        const handle = function() {
            const callback = function(file, result) {
                Insert.video(view, {"src": result.url, "width": 800, "height": 600});
            };

            FilePicker.choose(config.accept, true, function(files) {
                for(let i = 0; i < files.length; i++) {
                    let file = files[i];

                    if(config.maxSize > 0 && file.size > config.maxSize) {
                        new WarnDialog().open(null, "视频文件过大，最大允许：" + Bytes.format(config.maxSize, 2));
                        return;
                    }
                }
                instance.upload.upload(files, callback);
            });
        };
        UploadCommand.execute(view, handle);
    }
};

UploadCommand.attachment = function(state, dispatch, view, event) {
    const instance = view.INSTANCE;
    const config = Config.getAttachment(instance.opts);

    if(config.enabled == false) {
        new WarnDialog().open(null, "禁止上传附件");
        return;
    }

    if(instance.upload) {
        const handle = function() {
            const callback = function(file, result) {
                Insert.attach(view, {"name": result.name, "title": result.title, "url": result.url, "size": result.size});
            };

            FilePicker.choose(config.accept, true, function(files) {
                for(let i = 0; i < files.length; i++) {
                    let file = files[i];

                    if(config.maxSize > 0 && file.size > config.maxSize) {
                        new WarnDialog().open(null, "附件过大，最大允许：" + Bytes.format(config.maxSize, 2));
                        return;
                    }
                }
                instance.upload.upload(files, callback);
            });
        };
        UploadCommand.execute(view, handle);
    }
};

UploadCommand.upload = function(view, files) {
    const instance = view.INSTANCE;
    const ic = Config.getImage(instance.opts);
    const ac = Config.getAudio(instance.opts);
    const vc = Config.getVideo(instance.opts);
    const xc = Config.getAttachment(instance.opts);

    for(let i = 0; i < files.length; i++) {
        let file = files[i];
        let type = FileType.getType(file.name);

        if(ic.test(type)) {
            if(ic.enabled == false) {
                new WarnDialog().open(null, "禁止上传图片");
                return;
            }
            else if(ic.maxSize > 0 && file.size > ic.maxSize) {
                new WarnDialog().open(null, "图片过大，最大允许：" + Bytes.format(ic.maxSize, 2));
                return;
            }
        }
        else if(ac.test(type)) {
            if(ac.enabled == false) {
                new WarnDialog().open(null, "禁止上传音频文件");
                return;
            }
            else if(ac.maxSize > 0 && file.size > ac.maxSize) {
                new WarnDialog().open(null, "音频文件过大，最大允许：" + Bytes.format(ac.maxSize, 2));
                return;
            }
        }
        else if(vc.test(type)) {
            if(vc.enabled == false) {
                new WarnDialog().open(null, "禁止上传视频文件");
                return;
            }
            else if(vc.maxSize > 0 && file.size > vc.maxSize) {
                new WarnDialog().open(null, "视频文件过大，最大允许：" + Bytes.format(vc.maxSize, 2));
                return;
            }
        }
        else if(xc.test(type)) {
            if(xc.enabled == false) {
                new WarnDialog().open(null, "禁止上传附件");
                return;
            }
            else if(xc.maxSize > 0 && file.size > xc.maxSize) {
                new WarnDialog().open(null, "附件过大，最大允许：" + Bytes.format(ac.maxSize, 2));
                return;
            }
        }
        else {
            new WarnDialog().open(null, "不允许的文件类型: " + type);
            return;
        }
    }

    const handle = function() {
        const callback = function(file, result) {
            let type = FileType.getType(result.name);

            if(ic.test(type)) {
                Insert.image(view, {"src": result.url, "title": result.name, "alt": result.desc});
                return;
            }
            else if(ac.test(type)) {
                Insert.audio(view, {"src": result.url, "width": 800, "height": 600});
            }
            else if(vc.test(type)) {
                Insert.video(view, {"src": result.url, "width": 800, "height": 600});
            }
            else {
                Insert.attach(view, {"name": result.name, "title": result.title, "url": result.url, "size": result.size});
            }
        };
        instance.upload.upload(files, callback);
    }
    UploadCommand.execute(view, handle);
};

UploadCommand.execute = function(view, handle) {
    let instance = view.INSTANCE;

    if(instance.upload == null || instance.upload == undefined) {
        new WarnDialog().open(null, "<p>Editor.upload 未指定！</p>", null, null);
        return;
    }

    if(instance.upload instanceof MockUpload) {
        const message = [
            "<p>默认的上传实现不会真正的上传文件，仅用来演示效果。生产环境需自定义 Uploader 实现，并设置为 Editor 实例的 upload 属性。<p>",
            "<p>继续上传请点击【确定】，否则点击【取消】。<p>",
        ].join("");
        new WarnDialog().open("Editor.upload 未实现", message, ["ensure", "cancel"], handle);
    }
    else {
        handle();
    }
};

UploadCommand.test = function(view, tasks) {
    const _20M = 20 * 1024 * 1024;
    const _50M = 50 * 1024 * 1024;
    const files = [];
    files.push({"id": 1, "name": "学习资料.zip", "size": Math.floor(_50M + Math.random() * _20M), "status": 0});

    for(let i = 2; i <= tasks; i++) {
        files.push({"id": i, "name": "example" + i + ".jpg", "size": Math.floor(_50M + Math.random() * _20M), "status": 0});
    }

    const handler = {"abort": null};
    const dialog = new UploadDialog(files, handler);
    const uploader = {};
    uploader.upload = function(file, callback) {
        let loaded = 0;
        let length = file.size;
        let handle = function() {
            // 随机生成每次上传大小, 设定为约 20M/s
            const chunk = Math.floor((_20M + (Math.random() * 4 * 1024 * 1024)) / 20);
            loaded = Math.min(loaded + chunk, length);
            dialog.update(file.id, loaded, length);

            if(loaded < length && file.status == 1) {
                setTimeout(handle, 50);
            }
            else {
                if(callback) {
                    callback();
                }
            }
        };

        if(file.status == 0) {
            file.status = 1;
            setTimeout(handle, 50);
        }
        else {
            callback();
        }
    };

    uploader.abort = function(id) {
        files[id - 1].status = 4;
    };

    handler.abort = function(id) {
        uploader.abort(id);
    };
    dialog.open();

    const queue = files.slice(0);
    const start = function() {
        if(queue.length > 0) {
            uploader.upload(queue.shift(), start);
        }
    };

    for(let i = 0; i < 5; i++) {
        if(i >= files.length) {
            break;
        }
        start();
    }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const EditCommand = {};

/**
 * 全部命令定义
 * @param state
 * @return function(state, dispatch, view, event)
 */
EditCommand.save = function(state, dispatch, view, event) {
    const instance = view.INSTANCE;

    if(instance && instance.save) {
        instance.save();
    }
    view.focus();
};

EditCommand.cut = function(state, dispatch, view, event) {
    console.log("UNIMPLEMENTED Command: cut");
    view.focus();
};

EditCommand.copy = function(state, dispatch, view, event) {
    console.log("UNIMPLEMENTED Command: copy");
    view.focus();
};

EditCommand.paste = function(state, dispatch, view, event) {
    console.log("UNIMPLEMENTED Command: paste");
    view.focus();
};

EditCommand.h1 = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.setBlockType(state.schema.nodes.heading, {"level": 1});
    return handle(state, dispatch, view, event);
};

EditCommand.h2 = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.setBlockType(state.schema.nodes.heading, {"level": 2});
    return handle(state, dispatch, view, event);
};

EditCommand.h3 = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.setBlockType(state.schema.nodes.heading, {"level": 3});
    return handle(state, dispatch, view, event);
};

EditCommand.h4 = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.setBlockType(state.schema.nodes.heading, {"level": 4});
    return handle(state, dispatch, view, event);
};

EditCommand.h5 = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.setBlockType(state.schema.nodes.heading, {"level": 5});
    return handle(state, dispatch, view, event);
};

EditCommand.h6 = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.setBlockType(state.schema.nodes.heading, {"level": 6});
    return handle(state, dispatch, view, event);
};

EditCommand.paragraph = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.setBlockType(state.schema.nodes.paragraph, null);
    return handle(state, dispatch, view, event);
};

EditCommand.pre = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.setBlockType(state.schema.nodes.code_block, null);
    return handle(state, dispatch, view, event);
};

EditCommand.blockquote = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.wrapIn(state.schema.nodes.blockquote, null);
    return handle(state, dispatch, view, event);
};

EditCommand.strong = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.toggleMark(state.schema.marks.strong);
    return handle(state, dispatch, view, event);
};

EditCommand.italic = function(state, dispatch, view, event) {
    let handle = ProseMirrorCommands.toggleMark(state.schema.marks.em);
    return handle(state, dispatch, view, event);
};

EditCommand.underline = function(state, dispatch, view, event) {
    let handle = StyleCommand.set(state.schema.marks.underline);
    return handle(state, dispatch, view, event);
};

// state.schema.marks.decoration
EditCommand.strike = function(state, dispatch, view, event) {
    let handle = StyleCommand.set(state.schema.marks.strike);
    return handle(state, dispatch, view, event);
};

EditCommand.forecolor = function(state, dispatch, view, event) {
    const schema = state.schema;

    ColorMenu.open((event.srcElement || event.target), function(color) {
        if(color) {
            if(color == "default") {
                let handle = StyleCommand.remove(schema.marks.forecolor);
                handle(state, dispatch);
            }
            else {
                let handle = StyleCommand.set(schema.marks.forecolor, {"color": color});
                handle(state, dispatch);
            }
        }
        view.focus();
    });
};

EditCommand.backcolor = function(state, dispatch, view, event) {
    const schema = state.schema;

    ColorMenu.open((event.srcElement || event.target), function(color) {
        if(color) {
            if(color == "default") {
                let handle = StyleCommand.remove(schema.marks.forecolor);
                handle(state, dispatch);
            }
            else {
                let handle = StyleCommand.set(schema.marks.backcolor, {"color": color});
                handle(state, dispatch);
            }
        }
        view.focus();
    });
};

EditCommand.clean = function(state, dispatch, view) {
    let schema = view.state.schema;
    let tr = state.tr;
    const marks = [
        schema.marks.strong,
        schema.marks.em,
        schema.marks.fontfamily,
        schema.marks.fontsize,
        schema.marks.forecolor,
        schema.marks.backcolor,
        schema.marks.decoration
    ];

    marks.forEach(function(markType) {
        if(state.selection.empty) {
            tr = tr.removeStoredMark(markType);
        }
        else {
            tr = tr.removeMark(state.selection.from, state.selection.to, markType);
        }
    });

    if(dispatch) {
        dispatch(tr);
    }
    return true;
};

EditCommand.ulist = function(state, dispatch, view, event) {
    let handle = ProseMirrorSchemaList.wrapInList(state.schema.nodes.bullet_list, {});
    return handle(state, dispatch, view, event);
};
EditCommand.olist = function(state, dispatch, view, event) {
    let handle = ProseMirrorSchemaList.wrapInList(state.schema.nodes.ordered_list, {});
    return handle(state, dispatch, view, event);
};

EditCommand.lift = ProseMirrorCommands.lift;
EditCommand.left = function(state, dispatch, view, event) {
    return AlignCommand.align(state, dispatch, "left");
};

EditCommand.right = function(state, dispatch, view, event) {
    return AlignCommand.align(state, dispatch, "right");
};

EditCommand.center = function(state, dispatch, view, event) {
    return AlignCommand.align(state, dispatch, "center");
};

EditCommand.justify = function(state, dispatch, view, event) {
    return AlignCommand.align(state, dispatch, "justify");
};

EditCommand.indent = IndentCommand.increase;
EditCommand.dedent = IndentCommand.decrease;

EditCommand.link = function(state, dispatch, view, event) {
    let markType = state.schema.marks.link;

    // 取消链接
    if(Active.mark(state, markType)) {
        ProseMirrorCommands.toggleMark(markType)(state, dispatch);
        view.focus();
        return true
    }

    LinkMenu.open((event.srcElement || event.target), function(link) {
        if(link != null) {
            ProseMirrorCommands.toggleMark(markType, link)(state, dispatch);
            view.focus();
        }
    });
};

EditCommand.unlink = function(state, dispatch, view, event) {
    let markType = state.schema.marks.link;

    // 取消链接
    if(Active.mark(state, markType)) {
        ProseMirrorCommands.toggleMark(markType)(state, dispatch);
        return true
    }
};

EditCommand.anchor = function(state, dispatch, view, event) {
    AnchorMenu.open((event.srcElement || event.target), function(anchor) {
        if(anchor) {
            Insert.anchor(view, anchor);
        }
        view.focus();
    });
};

EditCommand.image = function(state, dispatch, view, event) {
    ImageMenu.open(null, function(img) {
        if(img) {
            Insert.image(view, img);
        }
        view.focus();
    });
};

EditCommand.video = function(state, dispatch, view, event) {
    VideoMenu.open(null, function(video) {
        if(video) {
            Insert.video(view, video);
        }
        view.focus();
    });
};

EditCommand.audio = function(state, dispatch, view, event) {
    AudioMenu.open(null, function(audio) {
        if(audio) {
            Insert.audio(view, audio);
        }
        view.focus();
    });
};

EditCommand.br = function(state, dispatch, view, event) {
    const { $from } = state.selection;

    if($from.parent.inlineContent) {
        if(dispatch) {
            dispatch(state.tr.replaceSelectionWith(state.schema.nodes.hard_break.create()).scrollIntoView());
        }
        return true;
    }
    return false;
};

EditCommand.hr = function(state, dispatch, view, event) {
    let schema = state.schema;
    let node = schema.nodes.horizontal_rule;
    dispatch(state.tr.replaceSelectionWith(node.create()));
};

EditCommand.emot = function(state, dispatch, view, event) {
    let schema = state.schema;
    let nodeType = schema.nodes.image;
    let from = state.selection.from;
    let to = state.selection.to;
    let attrs = null;

    if(state.selection instanceof ProseMirrorState.NodeSelection && state.selection.node.type == nodeType) {
        attrs = state.selection.node.attrs;
    }

    EmotMenu.open((event.srcElement || event.target), function(img) {
        if(img) {
            if(typeof(img) == "string") {
                dispatch(view.state.tr.insertText(img));
            }
            else {
                dispatch(view.state.tr.replaceSelectionWith(nodeType.createAndFill(img)));
            }
        }
        view.focus();
    });
};

EditCommand.table = function(state, dispatch, view, event) {
    TableMenu.open(event.srcElement || event.target, function(attrs) {
        if(attrs) {
            TableBuilder.insert(state, dispatch, view, {"rows": attrs.rows, "cols": attrs.cols, "header": true});
        }
        view.focus();
    });
};

EditCommand.code = function(state, dispatch, view, event) {
    const markType = state.schema.marks.code;
    const handle = ProseMirrorCommands.toggleMark(markType);

    if(Active.mark(state, markType)) {
        handle(state, dispatch);
        return true;
    }
    else {
        return handle(state, dispatch, view, event);
    }
};

EditCommand.select = ProseMirrorCommands.selectParentNode;
EditCommand.undo = ProseMirrorHistory.undo;
EditCommand.redo = ProseMirrorHistory.redo;

EditCommand.clear = function(state, dispatch, view, event) {
    const doc = state.doc;
    const paragraph = state.schema.nodes.paragraph.createAndFill();

    // 替换整个文档为单个空段落
    const transaction = state.tr.replaceWith(0, doc.content.size, paragraph);

    // 提交事务
    dispatch(transaction);

    // 光标定位到空段落内
    dispatch(state.tr.setSelection(state.selection.constructor.near(paragraph.resolve(0))));
};

EditCommand.fullscreen = function(state, dispatch, view, event) {
    const container = view.dom.closest("div.se-container");
    const level = Config.get(view.INSTANCE.opts, "editor.fullscreen", 1);

    if(container) {
        DOM.fullscreen(container, level);
    }
};

EditCommand.zoom = function(state, dispatch, view, event) {
    const button = (event.target || event.srcElement);
    const container = button.closest("div.se-container");
    const parent = button.closest("div.se-menuitem");
    const left = parent.querySelector("button.se-button.left");
    const right = parent.querySelector("button.se-button.right");
    const target = container.querySelector("div.se-editor");
    const zoom = DOM.getZoom(target);
    const factors = [0.25, 0.33, 0.50, 0.67, 0.75, 0.80, 0.90, 1.00, 1.10, 1.25, 1.50, 1.75, 2.00, 2.50, 3.00, 4.00, 5.00];

    let index = -1;
    let length = factors.length;

    if(button.classList.contains("left")) {
        for(let i = length - 1; i > -1; i--) {
            if(zoom > factors[i]) {
                index = i;
                break;
            }
        }
    }
    else if(button.classList.contains("right")) {
        for(let i = 0; i < length; i++) {
            if(factors[i] > zoom) {
                index = i;
                break;
            }
        }
    }
    else {
        view.focus();
        return;
    }

    if(index > -1) {
        target.style.zoom = factors[index];
        parent.querySelector("button.se-button.text").setAttribute("data-title", (factors[index] * 100).toFixed(0) + "%");
        parent.querySelector("button.se-button.text").textContent = (factors[index] * 100).toFixed(0) + "%";
    }

    left.disabled = (index <= 0);
    right.disabled = (index >= (length - 1));
    view.focus();
};

EditCommand.assets = function(state, dispatch, view, event) {
    const handle = function(items) {
        for(let i = 0; i < items.length; i++) {
            const file = items[i];

            if(file.type == "image") {
                file.src = file.url;
                Insert.image(view, file);
            }
            else if(file.type == "audio") {
                file.src = file.url;
                Insert.audio(view, file);
            }
            else if(file.type == "video") {
                file.src = file.url;
                Insert.video(view, file);
            }
            else {
                Insert.attach(view, file);
            }
        }
    };
    new AssetsDialog(view.INSTANCE.assetsManager.all()).open(handle);
};

EditCommand.share = function(state, dispatch, view, event) {
    UploadCommand.test(view, 1);
};

EditCommand.lock = function(state, dispatch, view, event) {
    UploadCommand.test(view, 30);
};

EditCommand.info = function(state, dispatch, view, event) {
    if(view.INSTANCE && view.INSTANCE.info) {
        view.INSTANCE.info();
    }
};

EditCommand.setting = function(state, dispatch, view, event) {
    new ProfileDialog().open();

    /*
    let url = "https://pss.bdstatic.com/static/superman/img/logo/bd_logo1-66368c33f8.png";

    Sharing.get(url, {
        "success": function(response) {
            if(response.status == 200) {
                let result = response.value;
                Insert.image(view, {"name": result.name, "src": result.url, "title": result.name});
            }
            else {
                console.log("sharing.get error: " + response.status + ", " + response.message);
            }
        },
        "error": function(error) {
            console.log(error.name + ", " + error.message);
        }
    });
    */
};

const CodeBlock = {};
CodeBlock.insert = function(state, dispatch, lang = "js", code = "") {
    const { tr, schema } = state;
    const nodeType = schema.nodes.code_block;
    const block = nodeType.create({ lang }, schema.text(code));

    // 替换当前选中内容为代码块
    tr.replaceSelectionWith(block);

    // 将光标定位到代码块末尾
    const pos = tr.selection.to;
    tr.setSelection(TextSelection.create(tr.doc, pos));

    if(dispatch) {
        dispatch(tr);
    }
    return true;
};

// 简化版：仅切换为代码块（基于当前选中）
export function toggleCodeBlock(lang = "js") {
  return setBlockType(mySchema.nodes.code_block, { lang });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Active = {};
Active.mark = function(state, type) {
    let {from, $from, to, empty} = state.selection;

    if(empty) {
        return !!type.isInSet(state.storedMarks || $from.marks());
    }
    else {
        return state.doc.rangeHasMark(from, to, type);
    }
};

Active.match = function(state, nodeType, attrs) {
    const {$from, to, node} = state.selection;

    for(let depth = $from.depth; depth > -1; depth--) {
        const node = $from.node(depth);

        if(node.type === nodeType) {
            if(!attrs) {
                return true;
            }

            for(const key in attrs) {
                if(node.attrs[key] != attrs[key]) {
                    return false;
                }
            }
            return true;
        }
    }
    return false;
};

Active.h1 = function(state) {
    return Active.match(state, state.schema.nodes.heading, {"level": 1});
};

Active.h2 = function(state) {
    return Active.match(state, state.schema.nodes.heading, {"level": 2});
};

Active.h3 = function(state) {
    return Active.match(state, state.schema.nodes.heading, {"level": 3});
};

Active.h4 = function(state) {
    return Active.match(state, state.schema.nodes.heading, {"level": 4});
};

Active.h5 = function(state) {
    return Active.match(state, state.schema.nodes.heading, {"level": 5});
};

Active.h6 = function(state) {
    return Active.match(state, state.schema.nodes.heading, {"level": 6});
};

Active.paragraph = function(state) {
    return Active.match(state, state.schema.nodes.paragraph);
};

Active.codeblock = function(state) {
    return Active.match(state, state.schema.nodes.code_block);
};

Active.fontfamily = function(family) {
    return function(state) {
        const mark = state.selection.$from.marks().find(function(mark) {
            return (mark.type == state.schema.marks.fontfamily);
        });

        if(mark) {
            return Value.equals(family, mark.attrs.family);
        }
        else {
            return Value.equals(family, null);
        }
    };
};

Active.fontsize = function(size) {
    return function(state) {
        const mark = state.selection.$from.marks().find(function(mark) {
            return (mark.type == state.schema.marks.fontsize);
        });

        if(mark) {
            return Value.equals(size, mark.attrs.size);
        }
        else {
            return Value.equals(size, null);
        }
    };
};

Active.blockquote = function(state) {
    return Active.match(state, state.schema.nodes.blockquote);
};

Active.align = function(state) {
    return Active.match(state, state.schema.nodes.paragraph);
};

Active.indent = function(state) {
    return Active.match(state, state.schema.nodes.paragraph);
};

Active.dedent = function(state) {
    return Active.match(state, state.schema.nodes.paragraph);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const TableBuilder = {};
TableBuilder.create = function(schema, opts) {
    let rows = opts.rows;
    let cols = opts.cols;
    const tableType = schema.nodes.table;
    const rowType = schema.nodes.table_row;
    const cellType = schema.nodes.table_cell;
    const headerType = schema.nodes.table_header;
    const fragment = [];

    if(opts.header && rows > 0) {
        const cells = [];

        for(let i = 0; i < cols; i++) {
            cells.push(headerType.createAndFill({}, schema.nodes.paragraph.createAndFill()));
        }
        fragment.push(rowType.createAndFill({}, Fragment.from(cells)));
        rows--;
    }

    for(let i = 0; i < rows; i++) {
        const cells = [];

        for(let c = 0; c < cols; c++) {
            cells.push(cellType.createAndFill({}, schema.nodes.paragraph.createAndFill()));
        }
        fragment.push(rowType.createAndFill({}, Fragment.from(cells)));
    }
    return tableType.createAndFill({}, Fragment.from(fragment));
};

TableBuilder.findTextPosition = function(doc, pos) {
    const cell = doc.nodeAt(pos);

    if(!cell || (cell.type.name != "table_header" && cell.type.name != "table_cell")) {
        return pos;
    }

    // 找到单元格内第一个块级节点
    let block = cell.content.firstChild;

    if(!block) {
        // 创建空段落
        const paragraph = doc.type.schema.nodes.paragraph.createAndFill();
        cell.content = cell.content.append(Fragment.from(paragraph));
        block = paragraph;
    }
    return pos + 2;
};

TableBuilder.insert = function(state, dispatch, view, attrs) {
    const { schema, selection } = state;
    const { $from } = selection;
    const table = TableBuilder.create(schema, attrs);

    if(!table) {
        return false;
    }

    let pos = $from.pos;

    /*
    if($from.parent.isBlock) {
        pos = $from.after($from.depth);
    }
    */

    // 创建事务，插入表格节点
    let tr = state.tr.insert(pos, table);
    let cellPos = pos + 3;
    let textPos = TableBuilder.findTextPosition(tr.doc, cellPos);
    const node = tr.doc.nodeAt(textPos);

    // 光标定位到第一个单元格（优化体验）
    // 表格节点内第一个单元格的位置 = 插入位置 + 1（table） + 1（tr） + 1（td/th）
    tr = tr.setSelection(TextSelection.create(tr.doc, textPos));

    if(dispatch) {
        dispatch(tr);
    }
    return true;
};

TableBuilder.batch = function(view, action, count) {
    let currentState = view.state;
    const steps = [];

    for(let i = 0; i < count; i++) {
        let tr = null;

        const success = action(currentState, function(t) {
            tr = t;
        });

        if(!success || !tr) {
            break;
        }

        steps.push(...tr.steps);
        currentState = currentState.apply(tr);
    }

    if(steps.length == 0) {
        return;
    }

    // 基于原始的 view.state 创建新的事务
    const ftr = view.state.tr;

    steps.forEach(function(step) {
        ftr.step(step);
    });
    view.dispatch(ftr);
};

TableBuilder.addRowBefore = function(view, count) {
    let currentState = view.state;
    const steps = [];

    for(let i = 0; i < count; i++) {
        let tr = null;

        const success = ProseMirrorTables.addRowBefore(currentState, function(t) {
            tr = t;
        });

        if(!success || !tr) {
            break;
        }

        steps.push(...tr.steps);
        currentState = currentState.apply(tr);
    }

    if(steps.length == 0) {
        return;
    }

    // 基于原始的 view.state 创建新的事务
    const ftr = view.state.tr;

    steps.forEach(function(step) {
        ftr.step(step);
    });
    view.dispatch(ftr);
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Insert = {};
Insert.link = function(view, attrs) {
    const state = view.state;
    const mark = state.schema.marks.link.create(attrs);
    const textNode = state.schema.text(attrs.text, [mark]);
    const tr = state.tr.replaceSelectionWith(textNode, false);
    view.dispatch(tr);
    view.focus();
};

Insert.anchor = function(view, attrs) {
    const state = view.state;
    const mark = state.schema.marks.link.create(attrs);
    const textNode = state.schema.text(attrs.text, [mark]);
    const tr = state.tr.replaceSelectionWith(textNode, false);
    view.dispatch(tr);

    // 将选区移到链接后
    // view.dispatch(tr.setSelection(ProseMirrorState.TextSelection.create(tr.doc, tr.selection.to)));
    view.focus();
};

Insert.image = function(view, attrs) {
    const state = view.state;
    const node = state.schema.nodes.image.create(attrs);
    view.dispatch(state.tr.replaceSelectionWith(node));
    view.focus();

    const instance = view.INSTANCE;

    if(instance && instance.assetsManager) {
        instance.assetsManager.add(attrs, "image");
    }
};

Insert.audio = function(view, attrs) {
    const src = attrs.src;
    const state = view.state;
    const node = state.schema.nodes.audio.create(attrs);
    view.dispatch(state.tr.replaceSelectionWith(node));
    view.focus();

    const instance = view.INSTANCE;

    if(instance && instance.assetsManager) {
        instance.assetsManager.add(attrs, "audio");
    }
};

Insert.video = function(view, attrs) {
    const src = attrs.src;

    if(src.startsWith("<iframe ")) {
        Insert.html(view, src);
    }
    else {
        const state = view.state;
        const node = state.schema.nodes.video.create(attrs);
        view.dispatch(state.tr.replaceSelectionWith(node));
        view.focus();

        const instance = view.INSTANCE;

        if(instance && instance.assetsManager) {
            instance.assetsManager.add(attrs, "video");
        }
    }
};

Insert.attach = function(view, attrs) {
    const state = view.state;
    const node = state.schema.nodes.attachment.create(attrs);
    view.dispatch(state.tr.replaceSelectionWith(node));
    view.focus();

    const instance = view.INSTANCE;

    if(instance && instance.assetsManager) {
        instance.assetsManager.add(attrs, "attachment");
    }
};

Insert.html = function(view, html) {
    const state = view.state;
    const parser = DOMParser.fromSchema(state.schema);

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    const slice = parser.parseSlice(wrapper);
    view.dispatch(state.tr.replaceSelection(slice));
    view.focus();
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const Sharing = {"URL": "/sharing/get.html"};
Sharing.get = function(url, handler) {
    Ajax.request({
        "method": "POST",
        "url": this.URL,
        "headers": [{"name": "Content-type", "value": "application/x-www-form-urlencoded"}],
        "data": "url=" + encodeURIComponent(url),
        "success": function(xhr) {
            handler.success(Ajax.getResponse(xhr));
        },
        "error": function(xhr) {
            handler.error({"name": xhr.status, "message": "UnknownError"});
        }
    });
};
export {StyleCommand, IndentCommand, AlignCommand, UploadCommand, EditCommand, Active, Insert, TableBuilder, Sharing};
