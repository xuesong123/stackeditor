<center><h1>StackEditor</h1></center>

<div style="page-break-after: always;"></div>

## 为什么要开发富文本编辑器

因为我是后端，我需要在传统项目中使用富文本编辑器。之前也开发过传统富文本编辑器，但是传统富文本编辑器依赖的核心 API 已经被标记为废弃，也调研了很多现在开源的其他富文本编辑器，像 draft.js，slate.js，ProseMirror, TipTap，WangEditor 等，draft.js 已经停止维护，slate.js 据说 BUG 比较多。ProseMirror 是大名鼎鼎的 CodeMirror 的作者开发的，而 TipTap 恰好是基于 ProseMirror 开发的，最中意这个，不过它依赖于 VUE，我需要在传统项目中使用，不想引入任何其他框架，没办法只好自己开发了。

