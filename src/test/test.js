import HTML from "../main/html.js";

// 8203, 8204, 8205
const ZWNJ = String.fromCharCode(8204);
const test = function(html, expected‌) {
    // input
    console.log(html);

    const result = HTML.clean(html).replace(/<tbody>/g, "").replace(/<\/tbody>/g, "");
    const pos = diff(expected‌, result);
    console.log("%c ========================================================================================================================", "color: red;");
    console.log("%c [ EXPECTED‌ ]: %c " + expected‌, "font-size: 16px; font-weight: bold; color: red;", "font-size: 16px; color: black;");
    console.log("%c [   RESULT ]: %c " + result, "font-size: 16px; font-weight: bold; color: red;", "font-size: 16px; color: black;");

    if(result == expected‌) {
        console.log("%c SUCCESS", "font-size: 16px; color: red;");
    }
    else {
        console.log("%c FAILED", "font-size: 16px; color: red;");
    }
    console.log("%c ========================================================================================================================", "color: red;");

    // expected‌
    // expected
    // print("expected‌");
    // print("expected");
    // console.log(String.fromCharCode(8204));
};

const diff = function(s1, s2) {
    const length = Math.min(s1.length, s2.length);

    for(let i = 0; i < length; i++) {
        if(s1.charAt(i) != s2.charAt(i)) {
            return i;
        }
    }

    if(s1.length != s2.length) {
        return length;
    }
    return -1;
};

const format1 = function(s, p) {
    const length = s.length;

    if(length <= p) {
        if(length > 30) {
            return "<<...>>" + s.substring(length - 30, length);
        }
        else {
            return s;
        }
    }
    else {
        if(p > 30) {
            return "<<...>>" + s.substring(p - 30, Math.min(p + 10, length));
        }
        else {
            return "<<...>>" + s.substring(0, Math.min(p + 10, length));
        }
    }
};

const print = function(s) {
    const b = [];

    for(let i = 0; i < s.length; i++) {
        b.push(s.charCodeAt(i));
    }
    console.log("[" + b.join(", ") + "]");
}

export {test};
