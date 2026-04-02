import * as Test from "./test.js";

const test = function() {
    const html = [
        "<p class=MsoNormal>",
        "    <span lang=EN-US style='mso-no-proof:yes'>",
        "        <!--[if gte vml 1]>",
        "            <v:shapetype id=\"_x0000_t75\" coordsize=\"21600,21600\" o:spt=\"75\" o:preferrelative=\"t\" path=\"m@4@5l@4@11@9@11@9@5xe\" filled=\"f\" stroked=\"f\">",
        "                <v:stroke joinstyle=\"miter\"/>",
        "                <v:formulas>",
        "                    <v:f eqn=\"if lineDrawn pixelLineWidth 0\"/>",
        "                </v:formulas>",
        "                <v:path o:extrusionok=\"f\"/>",
        "                <o:lock v:ext=\"edit\"/>",
        "            </v:shapetype>",
        "            <v:shape id=\"_x0000_i1026\" type=\"#_x0000_t75\">",
        "                <v:imagedata src=\"file:///C:/clip_image001.png\"/>",
        "            </v:shape>",
        "        <![endif]-->",
        "        <![if !vml]>",
        "            <img width=554 height=360 src=\"data:image/png;base64,xxx\"",
        "                v:shapes=\"_x0000_i1026\">",
        "        <![endif]>",
        "    </span>",
        "    <span lang=EN-US><o:p></o:p></span>",
        "</p>"
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
