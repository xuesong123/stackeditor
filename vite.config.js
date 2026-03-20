import { defineConfig } from "vite";
import path from "path";
import pkg from "./package.json";
import { viteStaticCopy } from "vite-plugin-static-copy";

const PROJECT_NAME = "stackeditor";
const VERSION = pkg.version;
const RELEASE = PROJECT_NAME + "-" + VERSION;
const FILE_NAME = PROJECT_NAME + "-" + VERSION;

export default defineConfig({
    // 开发服务器配置
    server: {
        // 本地运行端口（默认 5173）
        port: 3000,

        // 启动后自动打开浏览器
        open: true
    },

    // 打包配置
    build: {
        // 打包输出目录（默认 dist）
        outDir: "dist",

        // 静态资源输出子目录（默认 assets）
        assetsDir: "static",

        // 可选：禁用 CSS 代码拆分
        cssCodeSplit: false,

        // 禁用内联
        assetsInlineLimit: 0,

        // 可选：生成 sourcemap
        sourcemap: false,

        // 库配置
        lib: {
            // 全局变量名，UMD 格式下，浏览器引入时挂载到 window 的名称
            name: "StackEditorComponent",

            entry: path.resolve(__dirname, "src/index.js"),

            // 输出文件名
            fileName: function (format) {
                return RELEASE + "/" + FILE_NAME + "." + format + ".js";
            },

            // 输出格式
            formats: ["es", "umd"]
        },

        rollupOptions: {
            // external: [
            //     "orderedmap",
            //     "w3c-keyname",
            //     "rope-sequence",
            //     "prosemirror-model",
            //     "prosemirror-transform",
            //     "prosemirror-state",
            //     "prosemirror-view",
            //     "prosemirror-schema-basic",
            //     "prosemirror-schema-list",
            //     "prosemirror-tables",
            //     "prosemirror-commands",
            //     "prosemirror-keymap",
            //     "prosemirror-history",
            //     "prosemirror-inputrules"
            // ],

            output: {
                // globals: {
                //     "orderedmap": "OrderedMap",
                //     "w3c-keyname": "w3c-keyname",
                //     "rope-sequence": "RopeSequence",
                //     "prosemirror-model": "ProseMirrorModel",
                //     "prosemirror-transform": "ProseMirrorTransform",
                //     "prosemirror-state": "ProseMirrorState",
                //     "prosemirror-view": "ProseMirrorView",
                //     "prosemirror-schema-basic": "ProseMirrorSchemaBasic",
                //     "prosemirror-schema-list": "ProseMirrorSchemaList",
                //     "prosemirror-tables": "ProseMirrorTables",
                //     "prosemirror-commands": "ProseMirrorCommands",
                //     "prosemirror-keymap": "ProseMirrorKeymap",
                //     "prosemirror-history": "ProseMirrorHistory",
                //     "prosemirror-inputrules": "ProseMirrorInputrules"
                // },

                // 禁用动态导入内联
                inlineDynamicImports: false,

                // 配置不同类型文件的输出规则
                assetFileNames: function(assetInfo) {
                    const ext = assetInfo.name.split(".").pop().toLowerCase();

                    // CSS 文件
                    if(ext == "css") {
                        return RELEASE + "/css/" + FILE_NAME + ".css";
                    }

                    if (["svg", "png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
                        return RELEASE + "/images/[name].[ext]";
                    }
                    return RELEASE + "/assets/[name].[ext]";
                }
            },

            plugins: [{
                name: "skip-umd-css",
                generateBundle(options, bundle) {
                    if(options.format == "umd") {
                        for(const key in bundle) {
                            if(bundle[key].type == "asset" && bundle[key].fileName.endsWith(".css")) {
                                delete bundle[key];
                            }
                        }
                    }
                }
            }]
        }
    },

    // 配置路径别名
    resolve: {
        alias: {
             // 用 @ 代替 src 目录路径
            "@": path.resolve(__dirname, "src")
        }
    },

    plugins: [
        // viteStaticCopy({
        //     targets: [
        //         {
        //             src: "src/assets/images/*.svg",
        //             dest: RELEASE + "/images",
        //             globOptions: {
        //                 cwd: __dirname,
        //                 ignore: []
        //             }
        //         }
        //     ]
        // })
    ],

    preview: {
        // 预览端口（默认 4173，可自定义）
        port: 4173,

        // 启动后自动打开 preview.html
        open: "/preview.html",

        // 指定预览的根目录
        dir: ["public", "dist"],

        // 禁用缓存，确保修改 HTML 后立即生效
        cache: false,

        // 避免跨域问题
        cors: true
    }
});
