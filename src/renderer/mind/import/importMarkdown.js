var parse = require('markmap/lib/parse.markdown');
var transform = require('markmap/lib/transform.headings')
import uuid from '../uuid'

let Store = require('electron-store');
var store = new Store();
var profile = store.get('config');

let canvasWidth = profile.canvasWidth;
let canvasHeight = profile.canvasHeight;

export default function importMarkdown(md) {
    var map = parse(md);
    // console.log(transform(map));
    var data = transformData(transform(map));
    var mindData = {
        "theme": 'blue',
        "mindData": [],
        "induceData": [],
        "wireFrameData": [],
        "relateLink": [],

        "background": '',
        "relateLinkData": [],
        "calloutData": [],
        'marks': [],
    };
    var list = [];
    transferData(data, null, list, true);
    console.log(list);
    mindData.mindData.push(list);
    return mindData;
}


function transformData(mapData) {
    var map = {
        id: uuid(),
        text: mapData.name,
        children: []
    };
    if (mapData.children && mapData.children.length) {
        mapData.children.forEach(data => {
            map.children.push(transformData(data));
        });
    }
    return map;
}

function transferData(data, parentId, list, mainFlag) {
    var node = {
        id: data.id,
        pid: parentId,
        text: data.text,
        //  percent:data.data.progress<=8?data.data.progress*10:'',
        // priority:data.data.priority,
        //link:data.href,
        remark: '',
        //tag:data.data.resource
        marks: [],
        // resource:data.data.resource,
        isExpand: true,
        image: '',
        imageName: ''
    };

    if (!parentId) {
        node.layout = {};
        node.layout.layoutName = "minder";
        node.layout.direct = "";
        if (mainFlag) {
            node.isRoot = true;
            node.main = true;
            node.x = canvasWidth / 2;
            node.y = canvasHeight / 2;
        }
    }

    list.push(node);

    data.children && data.children.forEach(c => {
        transferData(c, data.id, list);
    });
}