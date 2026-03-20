<center><h1>自定义菜单</h1></center>

<div style="page-break-after: always;"></div>

## 自定义菜单

示例：

```
const menubar = {
    // 自定义菜单项
	"items": [
		// 表示该项菜单分隔符
		{"name": "|"},
		{
			// 菜单项唯一标识
            "name": "mymenu",

            // 菜单图标，支持多种形式
            // 1. 从默认的 SVG 图标文件中加载
            //    "icon": "mymenu" 相当于 /assests/sprite.svg#mymenu

            // 2. 使用 SVG 图标的完整路径
            //    "icon": "/assests/sprite.svg#mymenu"

            // 3. 直接使用 SVG
            //    "icon": "<svg xmlns='http://www.w3.org/2000/svg'> ... </svg>"

            // 4. 直接使用图片
            //    "icon": "<img src='/images/mymenu.png'/>"

            // 5. "<任意 HTML>", 以 < 开头则认为是 HTML
            //    "icon": "<span>酒</span>"

            // 6. HTMLElement 🐘🐘
            //    "icon": DOM.create("span", null, ["酒"])
            "icon": "/assests/sprite.svg#mymenu",

            // 菜单上显示的文本
            “label”: "mymenu",

            // 当鼠标悬停时显示的 tooltip
            “title": "mymenu",

            // 自定义渲染菜单项，如果未指定则按照默认渲染
            "render": function(element) {
                element.appendChild(document.createTextNode("我的菜单"));
                ...
            },

            // 当点击菜单时触发，如果有子菜单，则不触发
            "run": function(state, dispatch, view, event) {
            	alert("Hello World.");
            },

            // 可选，返回当前菜单是否处于 select 状态
            "select": function() {
            },

            // 可选，返回当前菜单是否处于 active 状态
            "active": function() {
            },

            // 可选，返回当前菜单是否处于 enable 状态
            "enable": function() {
            },

            // 子菜单，配置项与父菜单相同
            "items": [
                { ... },
                { ... }
            ]
		},

		// 其他菜单
		{ ... },
		{ ... }
	],
	// 指定要显示的菜单项, 默认为全部, 支持的分隔符 [空格 | 换行 | 逗号 | 分号]
	// 其中 save 菜单需要在 StackEditor 实例上定义 save 方法
	"enabled": "save | bold italic underline strikethrough forecolor backcolor clean"
]);

const editor = new StackEditor({
    "menubar": menubar,
    "*|mymenu",
    "upload": new DefaultUpload({ ... })
});

editor.render(document.getElementById("editor"), "<h1>Hello World</h1>");
```



### 插件

| 插件               | 说明                                                 |
| ------------------ | ---------------------------------------------------- |
| MenuBarView        | 菜单支持                                             |
| NodeBarView        | 显式当前光标位置的 DOM 节点                          |
| CursorView         | 当编辑器失去焦点时，在当前光标位置显式一个光标指示器 |
| ResizabelImageView | 图片缩放                                             |
| AttachmentView     | 附件显示，将附件按照特定的样式显示                   |



### 默认的文件上传组件

```
文件上传触发流程:
1. 用户主动点击菜单的上传图片、视频、音频、附件等会触发调用上传组件。
2. 用户拖拽本地文件到编辑器时会自动触发调用上传组件。
3. 用户使用 CTRL + V 粘贴截图时会自动触发调用上传组件。

默认上传组件的执行流程
1. 创建上传对话框，根据传入的文件数量显示不同的界面，当仅有一个文件时，仅显示上传进度条及上传速度；当多个文件时显示文件列表，每个条目有文件名、进度条和取消按钮。
2. 创建任务队列，并启动 5 个并行任务，每个任务内调用 DefaultUpload.submit(blob, listener) 方法
3. 每个文件上传成功之后自动插入到当前文档，系统根据是否用户显式操作决定插入的类型，例如是图片或者视频。如果是拖拽上传，根据文件扩展名决定插入类型。
4. 全部任务执行完毕后关闭对话框.

const editor = new StackEditor{
    ...
    "upload": new DefaultUpload({
    	"url": "/myupload",         // 上传地址
        "chunk": 5 * 1024 * 1024,   // 分片大小, 默认 5M
        "retry": 3,                 // 每个分片的重试次数，默认 3
        "getData": function() {     // 如果需要发送自定义参数，则需要指定该方法
            return {"docId": 1};
        },
        "getResponse": function(xhr) {
            // 当后端服务返回的数据格式与编辑器要求的数据格式不一致时，可通过该方法进行适配
        	const response = JSON.stringify(xhr.responseText);

			// 必须返回如下格式的数据
            const result {
            	"status": 200,
            	"message": "success",
            	"value": {
            		"name": "abcd123.png",
            		"url": "/upload/abcd123.png",
            		"size": 123456,
            		"token": "abcd123"
            	}
            };

            if(response.code == 0) {
            	result.status = 200;
            }

            // 其他转换
            ...

            return result;
        }
   	});
};
```



### 自定义上传

```
// 完全自定义上传
const myupload = {
    /**
     * 任何效果都由开发者自己实现
     * @param files Blob 数组对象或者浏览器文件 API 中的 FileList 对象
     * @param callback 每个文件上传完毕都必须调用一次
     * @Override
     */
	upload: function(files, callback) {
	}
}

// 或者直接继承 DefaultUpload
class MyUpload extends DefaultUpload {
    constructor(spec) {
        super(spec);
    }

    /**
     * 完全重写 upload 方法，此时上传对话框，进度条等都需要开发者自己实现
     * @param files 数组对象或者 FileList 对象
     * @param callback 每个文件上传完毕都需要调用一次
     * @Override
     */
    upload(files, callback) {
        ...
    }
}

// 或者直接继承 DefaultUpload
class MyUpload extends DefaultUpload {
    constructor(spec) {
        super(spec);
    }

    /**
     * 仅重写 submit 方法, submit 方法仅需要完成二进制数据的上传并调用事件监听器的相应方法, 不需要任何 UI 调用
     * 未被重写的 upload 方法被调用时会自动弹出上传对话框并显示上传进度
     * @param blob 文件对象或者二进制数据
     * @param listener 事件监听器
     * @Override
     */
    submit(blob, listener) {
        ...
    }
}

// callback 参考
const callback = function(blob, result) {
    // 返回给编辑器的 result 必须包含如下字段
    console.log(result.name, result.url, result.size, result.token);
};

// listener 参考
const listener = {
    // 当上传进度发生变化时调用
    "update": function(loaded, total) {
    },

    // 当上传成功时调用
    "success": function(file, result) {
		...
    },

    // 当发生错误时调用
    "error": function(message) {
    }
}
```

### 服务端接口规范

若使用默认的文件上传组件，服务端必须符合默认上传组件的接口规范

#### 服务端返回的数据格式

| 字段名  | 类型   | 必选 | 取值范围 | 示例 | 说明              |
| ------- | ------ | ---- | -------- | ---- | ----------------- |
| status  | Long   | Y    |          |      | 状态码, 200: 成功 |
| message | String | Y    |          |      | 提示信息          |
| value   | Object | Y    |          |      | 返回值            |

#### status 取值范围

| status 取值 | 说明                                                   |
| --------- | ------------------------------------------------------ |
| 200       | 成功。                                                 |
| 201    | 服务端要求重新上传当前分片。       |
| 其他      | 如果有的话一律视为上传失败。                        |

#### 请求数据格式

#### HTTP Header

##### Content-Type

```
Content-Type: multipart/form-data;
```

#### HTTP Body

| 字段名   | 类型   | 必选 | 取值范围   | 示例        | 说明                                                         |
| -------- | ------ | ---- | ---------- | ----------- | ------------------------------------------------------------ |
| offset   | Long   | Y    | 无符号整数 | 0           | 当前分片的起始位置                                           |
| length   | Long   | Y    | 无符号整数 | 123456      | 当前分片的大小                                               |
| chunk    | Long   | Y    | 无符号整数 | 123456      | 分片大小，客户端指定的固定值，例如 5M                        |
| size     | Long   | Y    | 无符号整数 | 123456789   | 文件大小                                                     |
| modified | Long   | Y    | 无符号整数 | 123456789   | 文件的最后修改时间，单位：毫秒                               |
| token    | String | Y    | 字符串     | abcd123     | 服务端返回的上传令牌，首个分片该字段为空                     |
| filename | String | Y    | 字符串     | example.jpg | 原始文件名，该字段非常规字段，而是存储在 Content-Disposition 中，需通过服务端的上传组件提供的 API 获取. |
| 其他字段 | Any    | N    | Any        |             | 其他字段根据业务需要自行传入，一般为后端需要的业务字段       |
| <<FILE>> | BIN    | Y    | 二进制     |             | 文件的二进制数据                                             |

分片上传涉及到服务端对多个分片如何映射到同一个服务端文件的问题，有两种方案：第一种，每次上传前请求服务端获取一个上传的token，每个分片上传时都带上这个 token，服务端根据 token 将分片按照 offset 写入到同一个文件。第二种，服务端在上传时检查传入的 token, 如果有则使用传入的 token，如果没有则生成一个新的并写入到返回值中，客户端拿到 token 后在下个分片上传时传入。

StackEditor 采用的是第二种方案。无论那种方案，服务端都需要对 token 做好安全检查。如果服务端使用 token 作为存储的文件名，则必须校验 token 是否合法，例如：检查 token 中是否包含 /../ 等目录重定向的字符。建议的做法：采用 UUID 生成 token，并检查 token 中仅包含数字和英文字符。



某些情况下，后端服务可能会需要分片编号字段，虽然不知何种原因会需要这样的字段，但是如果确实有需要，可通过如下方式计算：

```
// 计算出来的 chunkNo 从 0 开始, 加 1 则从 1 开始
int chunkNo = offset / chunk;

// 总的分片数量
int chunkTotal = (size + chunk - 1) / chunk;

假设一个文件 53M，分片大小为 5M，则总的分片数量为 11，offset 值依次为：
size = 53 * 1024 * 1024;
chunk = 5 * 1024 * 1024;

offset                   length              chunk
0                        5242880             5242880
5242880                  5242880             5242880
10485760                 5242880             5242880
15728640                 5242880             5242880
20971520                 5242880             5242880
26214400                 5242880             5242880
31457280                 5242880             5242880
36700160                 5242880             5242880
41943040                 5242880             5242880
47185920                 5242880             5242880
52428800                 3145728             5242880

```



#### 服务端返回数据格式

```
{
	“status”: 200,
	"message": "success",
	"value": {
		"name": "abcd123.jpg",
		"url": "/upload/abcd123.jpg",
		"size": 123456,
		"token": "abcd123"
	}
}

// 当上传成功回调时，编辑器会向文档插入如下 HTML
// <img src="/upload/abcd123.jpg"/>
```

服务端返回的数据格式并非强制要求，如果返回的数据格式不符合该规范，客户端可以指定数据转换函数：

```
{
	// 上传时指定传入的业务字段
    "data": {
        "docId": 1
    },
    "getResponse": function(xhr) {
        // 转换逻辑
        ...

        // 必须返回给编辑器的字段
        return {“name”: name, "url": url, "size": size, "token": token};
    }
}
```



### 资源管理器

1. 当编辑器打开时，自动扫描文档内的图片、音频、视频、附件等并放入到资源管理器中。
2. 任何文档的插入操作都会把插入的图片、音频、视频、附件等放入到资源管理器中。
3. 开发者自己决定如何加载资源。

用户可通过菜单上的资源管理器菜单打开资源管理器。在资源管理器中双击任意资源可插入到文档中。

```
    ...

	// 编辑器创建时会自动创建资源管理器
	// 开发者可通过任意自定义的方式加载资源库，例如从本地存储中加载或者远程服务器中获取
    const assestManager = editor.assestManager;

    // 资源库监听器, 当资源库发生变化时触发
    assestManager.change = function(type, assests) {
    	// type: 字符串，取值: [ ADD | DELETE | CLEAR ]，添加、删除、清空
    	// assests: 发生变化的资源，数组

    	// 例如获取资源库中全部的资源存储到本地
    	localStorage.setItem("myassests", JSON.stringify(this.getAssests()));
    };

	// 加载资源，支持多种方式
	// 1. 从指定的 DOM 元素中加载
	assestManager.from(document.querySelector("#content"));

    // 2. 从 HTML 中加载
	assestManager.from("<div><img src=\"/resource/images/e1.png\"></div>");

    // 手动加载, add 方法不会触发 change 事件
	assestManager.add({"name": "e1.png", "src": "/images/e1.png", "size": 12345}, "image");
	assestManager.add({"name": "11.mp4", "src": "/video/1.mp4", "size": 12345}, "video");
	assestManager.add({"name": "22.mp3", "src": "/video/1.mp4", "size": 12345}, "audio");
	assestManager.add({"name": "33.mp4", "url": "/video/1.mp4", "size": 12345}, "attachment");

    // 编辑文档时，可随时通过资源库将资源插入到文档中
    // 向文档中插入的图片，音视频，附件等也会自动加入到资源库中
    editor.render(element, document.querySelector("#content"));

    // 清空资源库
	assestManager.clear();
```








