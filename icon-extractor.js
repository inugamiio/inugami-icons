const FS = require('node:fs');
const JSDOM = require('jsdom');

const FILES = [
    {
        path: 'projects/inugami-icons/src/inugami_default_icons.svg',
        svgPrefix: '<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">',
        iconSetName : 'INUGAMI_DEFAULT_ICONS',
        targetFolder: 'projects/inugami-icons/src/lib',
        targetFile: 'inugami-icons.default.ts',
    },
];

const INKSCAPE_ATTRIBUTES = [
    'id',
    'inkscape:groupmode',
    'inkscape:insensitive',
    'inkscape:label',
    'inkscape:nodetypes',
    'inkscape:connector-curvature',
    'style',
    'sodipodi:nodetypes'
];

const INKSCAPE_ATTRIBUTES_CHILDREN = [
    'id',
    'inkscape:groupmode',
    'inkscape:insensitive',
    'inkscape:label',
    'inkscape:nodetypes',
    'inkscape:connector-curvature',
    'sodipodi:nodetypes'
];

// ============================================================================
// FUNCTIONS
// ============================================================================
function process(fileInfo) {
    FS.readFile(fileInfo.path, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }

        const icons = parseSvg(new JSDOM.JSDOM(data));

        if (icons) {
            const buffer = {};
            for(icon of icons){
                buffer[icon.idCamelCase]= icon;
            }
            
            let keys =  Object.keys(buffer);
            keys.sort();

            const iconData = {};
            for(let key of keys){
                iconData[key]= buffer[key];
            }

            const fileContent = writeIconSet(iconData, fileInfo);
            writeFile(
`
import { IconDefinition } from "./inugami-icons.model";

${fileContent}
`, fileInfo);
        }
    });
}

function parseSvg(dom) {
    const result = [];
    const svgNode = dom.window.document.getElementsByTagName('svg')[0];

    for (child of svgNode.children) {
        const id = child.getAttribute('inkscape:label');
        const inkscapeId = child.getAttribute('id');
        const type = child.tagName;
        
        if (!id || id.startsWith('_') || !inkscapeId.startsWith('layer')) {
            continue;
        }
        
        suppressInkscapeAttributes(child, true);
        child.setAttribute('class', id);
        const svgContent = renderSvg(child);
        console.log(id);
        result.push({
            id: id,
            idCamelCase: convertToCamelCase(id),
            icon: svgContent,
        });
    }
    return result;
}

function suppressInkscapeAttributes(node, parent) {
    if (node) {
        for (attr of (parent?INKSCAPE_ATTRIBUTES:INKSCAPE_ATTRIBUTES_CHILDREN)) {
            node.removeAttribute(attr);

            if (node.children) {
                for (childNode of node.children) {
                    suppressInkscapeAttributes(childNode, false);
                }
            }
        }
    }
}

function convertToCamelCase(id) {
    if (!id) {
        return '';
    }
    const result = [];
    const values = id.split('-');

    for (let i = 0; i < values.length; i++) {
        if (i == 0) {
            result.push(values[i].trim());
        } else {
            const data = values[i].trim();
            result.push(data.substring(0, 1).toUpperCase());
            result.push(data.substring(1));
        }
    }
    return result.join('');
}

function renderSvg(node) {
    const content = node ? node.outerHTML : null;
    if (!content) {
        return null;
    }

    const result = [];
    const lines = content.split('\n');

    for (line of lines) {
        result.push(line.trim());
    }

    return result.join('');
}

function writeIconSet(icons, fileInfo) {

    const result = [];
    result.push(writeSvgIcon(icons, fileInfo));
    return result.join('\n\n');
}


function writeSvgIcon(icons, fileInfo) {
    const result = [];

    result.push(`export const ${fileInfo.iconSetName} :IconDefinition[] = [`);
    
    const keys = Object.keys(icons);
    for(let i=0; i<keys.length; i++){
        if(i!=0){
            result.push(',');
        }
        const key = keys[i];
        const separator = i<keys.length-1 ? ',' : '';
        
        result.push(
`
        {
            'name':'${key}',
            'content' : '${fileInfo.svgPrefix}${icons[key].icon}</svg>'
        }
`
        );        
    }
    result.push(']')
    return result.join('\n');
}


function writeFile(fileContent, fileInfo){
    if (!FS.existsSync(fileInfo.targetFolder)){
        FS.mkdirSync(fileInfo.targetFolder);
    }

    const file = `${fileInfo.targetFolder}/${fileInfo.targetFile}`;
    console.log(`write file : ${file}`);
    FS.writeFile(file, fileContent, err => {
        if (err) {
          console.error(err);
        }
    });
}
// ============================================================================
// MAIN
// ============================================================================
for (file of FILES) {
    process(file);
}