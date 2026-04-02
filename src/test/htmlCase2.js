import * as Test from "./test.js";

const test = function() {
    const html = [
        "<div class=\"100\">",
        "    <div class=\"200\">",
        "        <div class=\"300\">",
        "            <div class=\"400\">",
        "                <div class=\"500\">",
        "                    <div class=\"600\">abc1</div>",
        "                </div>",
        "            </div>",
        "            <div class=\"401\">abc2</div>",
        "            <div class=\"402\">abc3</div>",
        "        </div>",
        "    </div>",
        "</div>"
    ].join("\r\n");

    // const expected‌ = [
    //     "<p class=\"600\">abc1</p>",
    //     "<p class=\"500\"></p>",
    //     "<p class=\"400\"></p>",
    //     "<p class=\"401\">abc2</p>",
    //     "<p class=\"402\">abc3</p>",
    //     "<p class=\"300\"></p>",
    //     "<p class=\"200\"></p>",
    //     "<p class=\"100\"></p>"
    // ].join("");

    const expected‌ = [
        "<p>abc1</p>",
        "<p></p>",
        "<p>abc2</p>",
        "<p>abc3</p>",
        "<p></p>",
    ].join("");

    Test.test(html, expected‌);
};

export {test};
