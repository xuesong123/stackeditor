import * as Test from "./test.js";

const test = function() {
    const html = [
        "<pre style='background:#F8F8F8'><code><span lang=EN-US style='font-family:Courier;",
        "color:#525252;background:#F8F8F8'>-- </span></code><code><span",
        "style='mso-ascii-font-family:Courier;mso-hansi-font-family:Courier;color:#525252;",
        "background:#F8F8F8'>查询我的销售情况</span></code><code><span lang=EN-US",
        "style='font-family:Courier;color:#525252;background:#F8F8F8'><o:p></o:p></span></code></pre><pre",
        "style='background:#F8F8F8'><code><span lang=EN-US style='font-family:Courier;",
        "color:#525252;background:#F8F8F8'>-- </span></code><code><span",
        "style='mso-ascii-font-family:Courier;mso-hansi-font-family:Courier;color:#525252;",
        "background:#F8F8F8'>当用户打开该查询时，此处的</span></code><code><span lang=EN-US",
        "style='font-family:Courier;color:#525252;background:#F8F8F8'> ${user.userId} </span></code><code><span",
        "style='mso-ascii-font-family:Courier;mso-hansi-font-family:Courier;color:#525252;",
        "background:#F8F8F8'>会被自动替换为当前登录系统的</span></code><code><span lang=EN-US",
        "style='font-family:Courier;color:#525252;background:#F8F8F8'> userId<o:p></o:p></span></code></pre><pre",
        "style='background:#F8F8F8'><code><span lang=EN-US style='font-family:Courier;",
        "color:#525252;background:#F8F8F8'>select * from sales<o:p></o:p></span></code></pre><pre",
        "style='background:#F8F8F8'><code><span lang=EN-US style='font-family:Courier;",
        "color:#525252;background:#F8F8F8'>where user_id = ${user.userId}<o:p></o:p></span></code></pre><pre",
        "style='background:#F8F8F8'><code><span lang=EN-US style='font-family:Courier;",
        "color:#525252;background:#F8F8F8'><o:p>&nbsp;</o:p></span></code></pre><pre",
        "style='background:#F8F8F8'><code><span lang=EN-US style='font-family:Courier;",
        "color:#525252;background:#F8F8F8'>-- </span></code><code><span",
        "style='mso-ascii-font-family:Courier;mso-hansi-font-family:Courier;color:#525252;",
        "background:#F8F8F8'>查询我的下级部门的销售情况</span></code><code><span lang=EN-US",
        "style='font-family:Courier;color:#525252;background:#F8F8F8'><o:p></o:p></span></code></pre><pre",
        "style='background:#F8F8F8'><code><span lang=EN-US style='font-family:Courier;",
        "color:#525252;background:#F8F8F8'>select * from sales<o:p></o:p></span></code></pre><pre",
        "style='background:#F8F8F8'><code><span lang=EN-US style='font-family:Courier;",
        "color:#525252;background:#F8F8F8'>where parent_dept_id = ${person.dept_id}<o:p></o:p></span></code></pre>"
    ].join("\r\n");

    // const expected‌ = [
    //     "<p class=\"MsoNormal\">",
    //         "<span lang=\"EN-US\">",
    //             "<img width=\"554\" height=\"360\" src=\"data:image/png;base64,xxx\">",
    //         "</span>",
    //     "</p>"
    // ].join("");

    const expected‌ = [
        "<p>",
            "<img width=\"554\" height=\"360\" src=\"data:image/png;base64,xxx\">",
        "</p>"
    ].join("");

    Test.test(html, expected‌);
};

export {test};
