/**
 * $RCSfile: upload.js,v $
 * $Revision: 1.1 $
 *
 * Copyright (C) 2024 Skin, Inc. All rights reserved.
 * This software is the proprietary information of Skin, Inc.
 * Use is subject to license terms.
 * @author xuesong.net
 */
import * as StackEditorDialog from "./dialog.js";

const UploadDialog = StackEditorDialog.UploadDialog;

const Ajax = {};
Ajax.getXmlHttpRequest = function() {
    let xhr = null;

    if(window.ActiveXObject != null && window.ActiveXObject != undefined) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    else {
        xhr = new XMLHttpRequest();
    }
    return xhr;
};

Ajax.request = function(opts) {
    const xhr = (opts.transport ? opts.transport : this.getXmlHttpRequest());

    if(xhr == null || xhr == undefined) {
        if(opts.error) {
            opts.error("Can't create XMLHttpRequest instance.");
        }
        return;
    }

    const url = opts.url;
    const method = opts.method;
    const headers = opts.headers;

    if(opts.timeout) {
        xhr.timeout = opts.timeout;
    }

    xhr.open(method, opts.url, (opts.async == false ? false : true));
    xhr.onreadystatechange = function() {
        if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            // console.log(xhr.responseText);
        }

        if(xhr.readyState == 4) {
            if(opts.callback != null) {
                opts.callback(xhr);
            }
            else {
                if(xhr.status == 0 || xhr.status == 200) {
                    if(opts.success != null) {
                        opts.success(xhr);
                    }
                }
                else if(xhr.status == 404 || xhr.status == 500) {
                    if(opts.error != null) {
                        opts.error(xhr);
                    }
                }
                else {
                    if(opts.error != null) {
                        opts.error(xhr);
                    }
                }
            }
        }
    };

    if(opts.ontimeout) {
        xhr.upload.addEventListener("timeout", opts.ontimeout);
    }

    // 下载进度
    if(opts.onprogress) {
        xhr.addEventListener("progress", opts.onprogress);
    }

    // 上传进度
    if(opts.onuploadprogress) {
        xhr.upload.addEventListener("progress", opts.onuploadprogress);
    }

    if(headers != null) {
        for(let i = 0; i < headers.length; i++) {
            let header = headers[i];
            xhr.setRequestHeader(header.name, header.value);
        }
    }
    xhr.send(opts.data);
    return xhr;
};

Ajax.slice = function(file, start, end) {
    let blob = file;
    start = (start || 0);
    end = (end || 0);

    if(file.slice) {
        blob = file.slice(start, end);
    }

    if(file.webkitSlice) {
        blob = file.webkitSlice(start, end);
    }

    if(file.mozSlice) {
        blob = file.mozSlice(start, end);
    }

    blob.contentType = file.type;

    if(file.fileName != null && file.fileName != undefined) {
        blob.name = file.fileName;
    }
    else {
        blob.name = file.name;
    }
    return blob;
};

Ajax.getFormData = function(name, file) {
    const args = arguments;
    const formData = new FormData();

    for(let i = 2; i < args.length; i++) {
        this.append(formData, args[i]);
    }

    formData.append(name, file, file.name);
    return formData;
};

Ajax.append = function(formData, data) {
    if(formData == null || data == null) {
        return;
    }

    for(let i in data) {
        let value = data[i];
        let type = typeof(data[i]);

        if(type == "string" || type == "number" || type == "boolean") {
            formData.append(i, value);
        }
        else if(type == "object" && value.length != null) {
            for(let j = 0; j < value.length; j++) {
                if(value[j] != null) {
                    formData.append(i, value[j]);
                }
            }
        }
        else {
            formData.append(i, value);
        }
    }
};

Ajax.getResponse = function(xhr) {
    try {
        return JSON.parse(xhr.responseText);
    }
    catch(e) {
        console.log("error: ", e.name, e.message);
        console.log(xhr.responseText);
    }
    return null;
};

class DefaultUpload {
    constructor(opts) {
        this.opts = opts;
    }

    /**
     * @Override
     */
    upload(files, callback) {
        const instance = this;
        const context = {};
        const items = Array.from(files).map(function(file, index) {
            return {"id": index + 1, "name": file.name, "size": file.size};
        });
        const handler = {"abort": null};
        const dialog = new UploadDialog(items, handler);
        const queue = items.slice(0);
        const start = function() {
            if(queue.length > 0) {
                const item = queue.shift();
                const listener = {
                    "item": item,
                    "update": function(loaded, total) {
                        dialog.update(this.item.id, loaded, total);
                    },
                    "success": function(file, result) {
                        if(this.item.status != "ABORT") {
                            callback(file, result);
                        }
                        start();
                    },
                    "error": function(message) {
                        dialog.error(this.item.id, message);
                        start();
                    }
                };

                const holder = {};
                holder.item = item;
                holder.file = files[item.id - 1];
                holder.handler = instance.submit(files[item.id - 1], listener);
                context[item.id] = holder;
            }
            else {
                dialog.close();
            }
        };
        handler.abort = function(id) {
            const holder = context[id];

            if(holder) {
                holder.item.status = "ABORT";
                holder.handler.abort();
            }
        };

        // 显示对话框
        dialog.open();

        // 并发: 5
        const concurrency = Math.min(files.length, 5);

        for(let i = 0; i < concurrency; i++) {
            start();
        }
    }

    submit(blob, listener) {
        const url = this.opts.url;
        const data = this.getData();
        const chunk = (this.opts.chunk || 5 * 1024 * 1024);
        const uploader = new ChunkedUpload();
        uploader.upload({
            "url": url,
            "name": "file",
            "file": blob,
            "data": data,
            "chunk": chunk,
            "retry": (this.opts.retry || 3),
            "getResponse": this.opts.getResponse,
            "progress": function(loaded, total) {
                listener.update(loaded, total);
            },
            "cancel": function() {
                listener.error("已取消");
            },
            "success": function(file, result) {
                listener.success(file, result.value);
            },
            "error": function(xhr, file, message) {
                listener.error(message);
            }
        });
        return {
            "abort": function() {
                uploader.abort();
            }
        };
    }

    getData() {
        if(this.opts.getData) {
            return this.opts.getData();
        }
        return null;
    }
};

class Base64Upload {
    constructor(opts) {
        this.opts = opts;
    }

    upload(files, callback) {
        const instance = this;
        const items = Array.from(files);
        const queue = items.slice(0);
        const start = function() {
            if(queue.length > 0) {
                const item = queue.shift();

                instance.submit(item, {
                    "success": function(blob, result) {
                        callback(blob, result);
                        start();
                    },
                    "error": function(xhr, blob, message) {
                        console.error(blob.name, message);
                        start();
                    }
                });
            }
            else {
                // complete
            }
        };

        // 并发: 5
        const concurrency = Math.min(files.length, 5);

        for(let i = 0; i < concurrency; i++) {
            start();
        }
    }

    submit(blob, listener) {
        const instance = this;
        const url = this.opts.url;
        const handle = function(b, data) {
            const body = instance.getData(blob, data);

            Ajax.request({
                "method": "POST",
                "url": url,
                "headers": [{"name": "Content-type", "value": "application/json"}],
                "data": JSON.stringify(body),
                "success": function(xhr) {
                    let response = instance.getResponse(xhr);

                    if(response.status == 200 && response.value) {
                        listener.success(blob, response.value);
                    }
                    else {
                        listener.error("上传失败: " + blob.name);
                    }
                },
                "error": function(xhr) {
                    listener.error("上传失败: " + blob.name);
                }
            });
        };
        this.read(blob, handle);
    }

    read(blob, callback) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const result = {};
            result.name = blob.name;
            result.ext = blob.name.split(".").pop();
            result.size = blob.size;
            result.data = e.target.result;

            if(callback) {
                callback(blob, result);
            }
        };
        reader.readAsDataURL(blob);
    }

    getData(blob, data) {
        if(this.opts.getData) {
            return this.opts.getData(blob, data);
        }

        const ext = blob.name.split(".").pop();

        return {
            "docId": 1,
            "name": blob.name,
            "ext": ext,
            "data": data.data.split(";base64,").pop()
        };
    }

    getResponse(xhr) {
        if(this.opts.getResponse) {
            return this.opts.getResponse(xhr);
        }
        else {
            return Ajax.getResponse(xhr);
        }
    }
};

class MockUpload extends DefaultUpload {
    constructor() {
        super();
    }

    submit(blob, listener) {
        // 模拟 3 秒钟上传完
        let instance = this;
        let loaded = 0;
        let length = blob.size;
        let step = Math.max(Math.floor(length / (3 * 20)), 1);
        let status = 1;
        let handle = function() {
            loaded = Math.min(loaded + step, length);
            listener.update(loaded, length);

            // 1000 / 50 = 20
            if(loaded < length) {
                if(status == 1) {
                    setTimeout(handle, 50);
                }
            }
            else {
                instance.read(blob, function(blob, result) {
                    if(status == 1) {
                        listener.success(blob, result);
                    }
                });
            }
        };
        handle();

        return {"abort": function() {
            status = 3;
        }};
    }

    read(blob, callback) {
        const length = blob.size;

        if(length < 1024) {
            const reader = new FileReader();

            reader.onload = function(e) {
                const result = {};
                result.url = e.target.result;
                result.ext = blob.name.split(".").pop();
                result.name = blob.name;
                result.size = blob.size;

                if(callback) {
                    callback(blob, result);
                }
            };
            reader.readAsDataURL(blob);
        }
        else {
            // URL 对象永不删除, 仅用作演示
            const result = {};
            result.url = URL.createObjectURL(blob);
            result.name = blob.name;
            result.ext = blob.name.split(".").pop();
            result.size = blob.size;

            if(callback) {
                callback(blob, result);
            }
        }
    }
}

const ChunkedUpload = function() {
    this.status = "done";
    this.transport = null;
};

ChunkedUpload.prototype.upload = function(opts) {
    if(this.status == "load") {
        throw {"name": "UploadException", "message": "501"};
    }
    this.submit(opts, 0, 1, (opts.retry || 3));
};

ChunkedUpload.prototype.submit = function(opts, offset, count, retry) {
    const instance = this;
    const name = opts.name;
    const file = opts.file;
    const size = file.size;
    const data = opts.data;
    const end = Math.min(offset + opts.chunk, size);
    const range = "bytes " + offset + "-" + end + "/" + size;
    const blob = Ajax.slice(file, offset, end);
    const formData = Ajax.getFormData(name, blob, data, {
        "offset": offset,
        "length": (end - offset),
        "chunk": opts.chunk,
        "size": size,
        "modified": file.lastModified
    });

    const request = {};
    request.url = opts.url;
    request.method = "POST";
    request.headers = [{"name": "Content-Range", "value": range}];
    request.data = formData;
    request.onuploadprogress = function(e) {
        if(e.lengthComputable) {
            const loaded = offset + (e.loaded || e.position);
            // const total = (e.total || e.totalSize);
            opts.progress(loaded, Math.max(loaded, size));
        }
    };

    request.success = function(xhr) {
        /**
         * 404 或者主动调用 xhr.abort 时
         */
        if(xhr.status == 0) {
            instance.status = "done";
            opts.error(xhr, file, "AbortException");
            return;
        }

        /**
         * xhr.status == 200
         * 此时xhr.status一定是200
         */
        let response = (opts.getResponse ? opts.getResponse(xhr) : Ajax.getResponse(xhr));

        /**
         * 服务器要求重新传当前段的数据
         */
        if(response.status == 201) {
            instance.submit(opts, offset, count + 1, retry);
            return;
        }
        else if(response.status == 500) {
            if(count <= retry) {
                instance.submit(opts, offset, count + 1, retry);
            }
            else {
                instance.status = "done";
                opts.error(xhr, file, response.status + ": " + response.message);
            }
            return;
        }

        /**
         * 服务器返回被拒绝或者错误的请求, 此时都不应该再次上传
         */
        if(response.status != 200) {
            instance.status = "done";
            opts.error(xhr, file, response.status + ": " + response.message);
            return;
        }

        if(end >= size) {
            instance.status = "done";
            opts.success(file, response);
        }
        else {
            const result = response.value;

            if(result.token == null || result.token == undefined) {
                opts.error(xhr, file, "服务端未返回有效的 Token");
                return;
            }

            if(opts.data) {
                opts.data.token = result.token;
            }
            else {
                opts.data = {"token": result.token};
            }
            instance.submit(opts, end, 1, retry);
        }
    };

    request.error = function(xhr) {
        /**
         * ready & abort
         */
        if(xhr.readyState == 0) {
            instance.status = "done";
            opts.error(xhr, file, "AbortException");
            return;
        }

        if(count <= retry) {
            instance.submit(opts, offset, count + 1, retry);
        }
        else {
            instance.status = "done";
            opts.error(xhr, file, "Upload Failed");
        }
    };

    if(count > 1) {
        console.log("upload.error: retry " + (count - 1));
    }

    this.status = "load";
    this.transport = Ajax.request(request);
};

ChunkedUpload.prototype.abort = function() {
    if(this.transport) {
        try {
            this.transport.abort();
        }
        catch(e) {
            console.log("XMLHttpRequest.abort error: " + e.name + ", " + e.message);
        }
    }
};
export {Ajax, DefaultUpload, Base64Upload, MockUpload, ChunkedUpload};
