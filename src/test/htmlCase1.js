import * as Test from "./test.js";

const test = function() {
    const html = [
        "<div>",
        "    <table>",
        "        <tr>",
        "            <td>",
        "                <ol>",
        "                    <li><p>ssssss</p></li>",
        "                    <li><p>ssssss</p></li>",
        "                    <li><p>ssssss</p></li>",
        "                    <li><p>ssssss</p></li>",
        "                </ol>",
        "            </td>",
        "            <td><p>111</p></td>",
        "            <td><p>111</p></td>",
        "        </tr>",
        "        <tr>",
        "            <td><p>222</p></td>",
        "            <td><p>222</p></td>",
        "            <td><p>222</p></td>",
        "        </tr>",
        "    </table>",
        "</div>"
    ].join("\r\n");

    const expected‌ = [
        "<table>",
            "<tr>",
                "<td>",
                    "<ol>",
                        "<li><p>ssssss</p></li>",
                        "<li><p>ssssss</p></li>",
                        "<li><p>ssssss</p></li>",
                        "<li><p>ssssss</p></li>",
                    "</ol>",
                "</td>",
                "<td><p>111</p></td>",
                "<td><p>111</p></td>",
            "</tr>",
            "<tr>",
                "<td><p>222</p></td>",
                "<td><p>222</p></td>",
                "<td><p>222</p></td>",
            "</tr>",
        "</table>",
        "<p></p>"
    ].join("");

    Test.test(html, expected‌);
};

export {test};