var list = [];
var mind = {
    "theme": 'blue',
    "wireFrame": [],
    "relateLink": [],
    "position": { x: 200, y: 200 },
    "background": '',
    "mindData": []
};
var color = ['#fda16c', '#74bdf7', '#71FF5E', 'orange', '#D4D4AA', 'yellow'];
const importKityMind = function (data) {
    mind.data = [];
    list = [];
    transferData(data.root, null);
    var marks = [];
    var obj = {};
    list.forEach(node => {
        node.resource && node.resource.forEach(r => {
            if (!obj[r]) {
                var id = parseInt(+new Date()) + parseInt(Math.random() * 50);
                var tagObj = {
                    id,
                    text: r
                };
                marks.push(tagObj);
                node.marks.push(tagObj);
                obj[r] = true;
            } else {
                marks.forEach(item => {
                    if (item.text == r) {
                        node.marks.push(item);
                    }
                })
            }
        })
        delete node.resource;
    });
    var len = color.length;
    marks.forEach((item, i) => {
        if (i < len) {
            item.fill = color[i];
        } else {
            item.fill = color[parseInt(Math.random() * len)];
        }
        item.checked = false;
    });

    mind.data.push(list);
    mind.marks = marks;
    return mind;
};

function transferData(data, parentId) {
    if (data.data.text) {
        var text = data.data.text.replace(/(\r\n)|(\n)/g, '<br/>')
    }
    else {
        var text = '';
    }
    var node = {
        id: data.data.id,
        pid: parentId,
        text: text,
        percent: data.data.progress <= 8 ? data.data.progress * 10 : '',
        priority: data.data.priority,
        link: data.data.hyperlink,
        remark: data.data.note,
        //tag:data.data.resource
        marks: [],
        resource: data.data.resource,
        isExpand: true
    };

    if (data.data.progress == 9) {
        node.percent = '100';
        //node.icon=['wancheng']
    }

    if (!parentId) {
        node.layout = {};
        node.layout.layoutName = "minder2";
        node.layout.direct = "minder";
        node.isRoot = true;
        node.main = true;
        node.x = 4000;
        node.y = 4000;
    }

    if (data.data.image) {
        node.isImageNode = true;
        node.image = data.data.image;
        node.imageWidth = data.data.imageSize.width;
        node.imageHeight = data.data.imageSize.height;
    }

    list.push(node);

    data.children.forEach(c => {
        transferData(c, data.data.id);
    });
}

export default importKityMind;