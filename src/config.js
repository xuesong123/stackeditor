/**
 * $RCSfile: config.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
const Config = {};
Config.defaults = function() {
    return {
        // 菜单项配置
        "menubar": {
            // 自定义菜单项，数组
            "items": null,

            // 需要显示的菜单项，分隔符: [逗号 | 分号 | 空格 | 换行 | 回车]
            // 示例: save | bold italic underline strike forecolor backcolor clean | quote
            "enabled": "*"
        },
        "editor": {
            // 节点条配置
            "nodebar": {
                "enabled": true
            },

            // 页面标题配置, 开启之后在编辑区顶部显式可输入的标题框
            "title": {
                "placeholder": "Page Title...",
                "title": "Page Title",
                "value": "",
                "enabled": false
            },
            "codeblock": {
                // 代码块高亮允许使用的语言
                "languages": [
                    {"text": "Plain Text", "value": "plaintext"},
                    {"text": "HTML",       "value": "html"},
                    {"text": "CSS",        "value": "css"},
                    {"text": "XML",        "value": "xml"},
                    {"text": "Javascript", "value": "javascript"},
                    {"text": "Typescript", "value": "typescript"},
                    {"text": "Python",     "value": "python"},
                    {"text": "PHP",        "value": "php"},
                    {"text": "Java",       "value": "cpp"},
                    {"text": "C#",         "value": "csharp"},
                    {"text": "SQL",        "value": "sql"},
                    {"text": "Ruby",       "value": "ruby"},
                    {"text": "Swift",      "value": "swift"},
                    {"text": "Bash",       "value": "bash"},
                    {"text": "Lua",        "value": "lua"},
                    {"text": "Groovy",     "value": "groovy"},
                    {"text": "Markdown",   "value": "markdown"}
                ]
            },

            // 编辑器打开时是否可编辑
            "editable": true,

            // 全屏方式，取值范围: [1 | 2]
            // 1: 系统级全屏，没有浏览器的地址栏、菜单等
            // 2: 页面级全屏，编辑器占满整个网页
            "fullscreen": 1
        },

        // 上传配置
        "upload": {
            "image": {
                // 允许上传的图片类型
                "accept": ".jpg, .png, .bmp, .gif, .webp",

                // 允许的图片最大大小
                "maxSize": 2 * 1024 * 1024,

                // 是否允许上传图片
                "enabled": true
            },
            "audio": {
                "accept": ".mp3",
                "maxSize": 5 * 1024 * 1024,
                "enabled": true
            },
            "video": {
                "accept": ".mp4",
                "maxSize": 100 * 1024 * 1024,
                "enabled": true
            },
            "attachment": {
                // 附件的默认类型为 *，当用户拖拽上传时，如果图片、视频、音频等都未能匹配到类型，将会匹配到附件的 *，这会导致任意类型都可以作为附件上传
                // 所以通常需要根据需要重新设置
                "accept": "*",
                "maxSize": 100 * 1024 * 1024,
                "enabled": true,
            }
        },

        // 创建编辑器时的初始值，数据类型: [HTMLElement | String]
        "value": null
    };
};

Config.getValue = function(object, selector) {
    const value = Config.get(object, selector, null);

    if(value != null) {
        return value;
    }
    return Config.get(Config.DEFAULTS, selector, null);
};

Config.get = function(object, selector, defval) {
    let scope = object;
    let parts = selector.split(".").map(function(item) {
        return item.trim();
    });

    const FORBIDDEN_KEYS = new Set([
        "__proto__", "constructor", "prototype",
        "eval", "Function", "Symbol", "Object"
    ]);

    for(let i = 0; i < parts.length; i++) {
        let name = parts[i];

        if(scope == null || scope == undefined) {
            break;
        }

        if(name.length < 1) {
            continue;
        }

        let j = name.indexOf("[");
        let k = name.lastIndexOf("]");

        if(j > -1 && k > j && name.endsWith("]")) {
            let key = name.substring(0, j);
            let index = parseInt(name.substring(j + 1, k).trim(), 10);
            let value = scope[key];

            if(FORBIDDEN_KEYS.has(key)) {
                scope = null;
                break;
            }

            if(Array.isArray(value) && isNaN(index) == false && index >= 0 && index < value.length) {
                scope = value[index];
            }
            else {
                scope = null;
                break;
            }
        }
        else {
            if(FORBIDDEN_KEYS.has(name)) {
                scope = null;
                break;
            }
            scope = Object.prototype.hasOwnProperty.call(scope, name) ? scope[name] : null;
        }
    }
    return (scope != null && scope != undefined) ? scope : defval;
};

Config.freeze = function(object) {
    Object.freeze(object);

    Object.keys(object).forEach(function(key) {
        const value = object[key];

        if(typeof(value) == "object" && value != null) {
            Config.freeze(value);
        }
    });
    return object;
};

Config.getUploadConfig = function(opts, key) {
    let defaults = Config.get(Config.DEFAULTS, key, null);
    let result = Object.assign({}, defaults);
    let config = Config.get(opts, key, null);

    if(config) {
        for(const key in config) {
            const value = config[key];

            if(value != null && value != undefined) {
                result[key] = config[key];
            }
        }
    }

    result.test = function(type) {
        if(this.accept == "*") {
            return true;
        }

        const items = this.accept.split(",").map(function(item) {
            return item.replace(/\./, "").trim();
        });
        return items.includes(type.toLowerCase());
    };
    return result;
};

Config.getImage = function(opts) {
    return Config.getUploadConfig(opts, "upload.image");
};

Config.getAudio = function(opts) {
    return Config.getUploadConfig(opts, "upload.audio");
};

Config.getVideo = function(opts) {
    return Config.getUploadConfig(opts, "upload.video");
};

Config.getAttachment = function(opts) {
    return Config.getUploadConfig(opts, "upload.attachment");
};
Config.DEFAULTS = Config.freeze(Config.defaults());

export {Config};
