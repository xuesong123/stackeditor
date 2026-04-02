import * as Test from "./test.js";

const test = function() {
    const html = [
        "<p>1111</p>",
        "<p>2222</p>",
        "<pre><code>-- 查询我的销售情况</code></pre>",
        "<pre><code>-- 当用户打开该查询时</code></pre>",
        "<pre><code>select * from sales</code></pre>",
        "<pre><code>where user_id = ${user.userId}</code></pre>",
        "<pre><code>-- 查询我的下级部门的销售情况</code></pre>",
        "<pre><code>select * from sales</code></pre>",
        "<pre><code>where parent_dept_id = ${person.dept_id}</code></pre>",
        "<p>3333</p>"
    ].join("\r\n");

    // const expected‌ = [
    //     "<p class=\"MsoNormal\">",
    //         "<span lang=\"EN-US\">",
    //             "<img width=\"554\" height=\"360\" src=\"data:image/png;base64,xxx\">",
    //         "</span>",
    //     "</p>"
    // ].join("");

    const expected‌ = [
        "<p>1111</p><p>2222</p>",
        "<pre><code>-- 查询我的销售情况\r\n",
        "-- 当用户打开该查询时\r\n",
        "select * from sales\r\n",
        "where user_id = ${user.userId}\r\n",
        "-- 查询我的下级部门的销售情况\r\n",
        "select * from sales\r\n",
        "where parent_dept_id = ${person.dept_id}",
        "</code></pre>",
        "<p>3333</p>"
    ].join("");

    Test.test(html, expected‌);
};

export {test};
