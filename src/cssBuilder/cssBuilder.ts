import {CSSLink, matchSign} from "./cssLink";
import SuperchargedLinks from "../../main";
import {displayText} from "./cssBuilderModal";


const colorSet = [[
    '#0089BA',
    '#2C73D2',
    '#008E9B',
    '#0081CF',
    '#008F7A',
    '#008E9B',
], [
    '#D65DB1',
    '#0082C1',
    '#9270D3',
    '#007F93',
    '#007ED9',
    '#007660',
], [
    '#FF9671',
    '#A36AAA',
    '#F27D88',
    '#6967A9',
    '#D26F9D',
    '#1b6299',
], [
    '#FFC75F',
    '#4C9A52',
    '#C3BB4E',
    '#00855B',
    '#88AC4B',
    '#006F61',
], [
    '#FF6F91',
    '#6F7F22',
    '#E07250',
    '#257A3E',
    '#AC7C26',
    '#006F5F',
], [
    '#d9d867',
    '#2FAB63',
    '#B8E067',
    '#008E63',
    '#78C664',
    '#007160',
]];
const colors: string[] = [];
for (const i of Array(6).keys()) {
    for (const j of Array(6).keys()) {
        colors.push(colorSet[j][i]);
    }
}

function hash(uid: string) {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        const char = uid.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    hash = Math.abs(hash);
    return hash
}

export async function buildCSS(selectors: CSSLink[], plugin: SuperchargedLinks) {
    const instructions: string[] = [
        "/* WARNING: This file will be overwritten by the plugin.",
        "Do not edit this file directly! First copy this file and rename it if you want to edit things. */",
        "",
        ":root {"
    ];


    selectors.forEach((selector, i) => {
        if (selector.selectText) {
            instructions.push(`    --${selector.uid}-color: ${colors[hash(selector.uid) % 36]};`);
            instructions.push(`    --${selector.uid}-weight: initial;`);
        }
        if (selector.selectPrepend) {
            instructions.push(`    --${selector.uid}-before: '';`);
        }
        if (selector.selectAppend) {
            instructions.push(`    --${selector.uid}-after: '';`);
        }
        if (selector.selectBackground) {
            instructions.push(`    --${selector.uid}-background-color: #ffffff;`);
            instructions.push(`    --${selector.uid}-decoration: initial;`);
        }
    });
    instructions.push("}");

    selectors.forEach(selector => {
        let cssSelector: string;
        if (selector.type === 'attribute') {
            cssSelector = `[data-link-${selector.name}${matchSign[selector.match]}="${selector.value}" ${selector.matchCaseSensitive ?"" : " i"}]`;
        }
        else if (selector.type === 'tag') {
            cssSelector = `[data-link-tags*="${selector.value}" i]`;
        }
        else {
            cssSelector = `[data-link-path${matchSign[selector.match]}="${selector.value}" ${selector.matchCaseSensitive ?"" : "i"}]`;
        }

        if (selector.selectText) {
            instructions.push(...[
                "",
                `div[data-id="${selector.uid}"] div.setting-item-description,`,
                cssSelector + " {",
                `    color: var(--${selector.uid}-color) !important;`,
                `    font-weight: var(--${selector.uid}-weight);`,
                "}"]);
        }
        if (selector.selectBackground) {
            instructions.push(...["",
                `.c-${selector.uid}-use-background div[data-id="${selector.uid}"] div.setting-item-description,`,
                `.c-${selector.uid}-use-background .data-link-text${cssSelector} {`,
                `    background-color: var(--${selector.uid}-background-color) !important;`,
                `    border-radius: 5px;`,
                `    padding-left: 2px;`,
                `    padding-right: 2px;`,
                `    text-decoration: var(--${selector.uid}-decoration) !important;`,
                "}"]);
        }
        if (selector.selectPrepend) {
            instructions.push(...["",
                `div[data-id="${selector.uid}"] div.setting-item-description::before,`,
                `.data-link-icon${cssSelector}::before {`,
                `    content: var(--${selector.uid}-before);`,
                "}"]);
        }
        if (selector.selectAppend) {
            instructions.push(...["",
                `div[data-id="${selector.uid}"] div.setting-item-description::after,`,
                `.data-link-icon-after${cssSelector}::after {`,
                `    content: var(--${selector.uid}-after);`,
                "}"]);
        }
    });

    instructions.push(...[
        "/* @settings",
        "name: Supercharged Links",
        "id: supercharged-links",
        "settings:",
    ]);

    selectors.forEach((selector, i) => {
        let name = selector.name;
        let value = selector.value;
        if (selector.type === 'tag') {
            name = 'tag';
            // value = "\#" + value;
        }
        else if (selector.type === 'path'){
            name = 'path';
        }
        instructions.push(...[
            "    - ",
            `        id: ${selector.uid}`,
            `        title: ${name} is ${value}`,
            `        description: Example note`,
            "        type: heading",
            "        collapsed: true",
            "        level: 3"]);
        if (selector.selectText) {
            instructions.push(...[
                "    - ",
                `        id: ${selector.uid}-color`,
                `        title: Link color`,
                "        type: variable-color",
                "        format: hex",
                `        default: '${colors[hash(selector.uid) % 36]}'`,
                "    - ",
                `        id: ${selector.uid}-weight`,
                `        title: Font weight`,
                "        type: variable-select",
                `        default: initial`,
                `        options:`,
                `            - initial`,
                `            - lighter`,
                `            - normal`,
                `            - bold`,
                `            - bolder`,
                "    - ",
                `        id: ${selector.uid}-decoration`,
                `        title: Font decoration`,
                "        type: variable-select",
                `        default: initial`,
                `        options:`,
                `            - initial`,
                `            - underline`,
                `            - overline`,
                `            - line-through`])
        }
        if (selector.selectPrepend) {
            instructions.push(...["    - ",
            `        id: ${selector.uid}-before`,
            `        title: Prepend text`,
            `        description: Add some text, such as an emoji, before the links.`,
            "        type: variable-text",
            `        default: ''`,
            `        quotes: true`])
        }
        if (selector.selectAppend) {
            instructions.push(...["    - ",
                `        id: ${selector.uid}-after`,
                `        title: Append text`,
                `        description: Add some text, such as an emoji, after the links.`,
                "        type: variable-text",
                `        default: ''`,
                `        quotes: true`])
        }
        if(selector.selectBackground) {
            instructions.push(...["    - ",
                `        id: c-${selector.uid}-use-background`,
                `        title: Use background color`,
                `        description: Adds a background color to the link. This can look buggy in live preview.`,
                "        type: class-toggle",
                "    - ",
                `        id: ${selector.uid}-background-color`,
                `        title: Background color`,
                "        type: variable-color",
                "        format: hex",
                `        default: '#ffffff'`])
        }
    });
    instructions.push("*/");

    const vault = plugin.app.vault;
    const path = ".obsidian/snippets/supercharged-links-gen.css";
    if (vault.adapter.exists(path)) {
        await vault.adapter.remove(path);
    }
    await plugin.app.vault.create(path, instructions.join('\n'));

    plugin.app.workspace.trigger("parse-style-settings");

    // return instructions.join('\n')
}
