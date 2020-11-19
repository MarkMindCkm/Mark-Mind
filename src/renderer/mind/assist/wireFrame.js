
import Node from "../node"
export default class WireFrame {
    constructor(node, fill = 'rgba(213,233,252,.1)', stroke = 'rgb(42,122,194)', data = { text: 'label', nodeType: 'wireFrame' }) {
        this.node = node;
        this.endNode = node;
        this.node._refreshBounding(); 
        this.stroke = stroke;
        this.fill = fill;
        this.lineDash = [6, 2];
        this.data = data;
        this.status = '';
        this.shapeType = 'rect';
        this.lineWidth = 1;
        this.radius = 0;
        this.node.wireFrame = this;
        this.mind = this.node.getMind();

        this.name = 'wireFrame';
        this.isHide = false;
        this.rangeNode = [];

        this.refreshNode();
        this.refreshItems();
        this.init();
    }

    init() {
        this.direct = this.node.direct;
        this.beforeCreate();
        this.create();
    }

    setEndNode(node) {
        this.endNode = node;
        this.refreshNode();
        this.refresh();
    }

    refreshNode() {
        var list = this.node.getShowNodeList();
        if (this.endNode && this.endNode != this.node) {
            list = list.concat(this.endNode.getShowNodeList())
        }
        var box = this.node.getMind().getBoundingRect(list);
        this.topNode = box.topNode;
        this.bottomNode = box.bottomNode;
        this.leftNode = box.leftNode;
        this.rightNode = box.rightNode;
        this.node.refreshCBox();

        if (this.endNode) {
            this.endNode.refreshCBox();
        }
    }

    beforeCreate() {
        if (!this.group) this.group = this.mind.wireFrameGroup.group();
        if (this.data.text) {
            if (!this.t) {
                if (this._t) {
                    this.t = this._t;
                    this._t = null;
                } else {
                    var nodeData = this.data.nodeData || {
                        text: this.data.text,
                        nodeType: 'wireFrame',
                        paddingLeft: 6,
                        paddingRight: 6,
                        paddingBottom: 4,
                        paddingTop: 4
                    }

                    this.t = new Node(nodeData, this.mind);
                    this.t.wireFrame = this;
                    this.t.dom.setAttribute('draggable', false);
                }
            }

            this.t.dom.classList.add('node-wireFrame');
            this.mind.el.appendChild(this.t.dom);
            this.t.mind = this.mind;

        } else {
            if (this.t) {
                this.mind.el.removeChild(this.t.dom);
                this._t = this.t;
                this.t = null;
            }
        }
        if (!this.rect) {
            if (this.shapeType == 'rect') {
                this.rect = this.group.rect().fill(this.fill).stroke(`color:${this.stroke},width:${this.lineWidth},dasharray:${this.lineDash}`).radius(this.radius);
            }
            else {
                this.rect = this.group.polygon().stroke(`color:${this.stroke},width:${this.lineWidth || 2},dasharray:${this.lineDash}`);
            }
        }

        this.rect.off('click').on('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.node.getMind().emit('showWireFrame', { wf: this });
        });
    }

    getTextBox() {
        if (this.data.text) {
            return this.t.getDomBox();
        } else {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
    }

    move(dx, dy) {
        var dx = parseInt(dx);
        var dy = parseInt(dy);
        var pos = this.position.slice();
        this.setPosition(pos[0] + dx, pos[1] + dy);
        if (this.t) {
            var p = this.t.getPosition();
            this.t.setPosition(p.x + dx, p.y + dy);
        }
        this.refreshBox();
    }

    refreshItems() {

        var me = this;
        var groups = [];
        var items = [];
        var list = [];

        if (this.rangeNode && this.rangeNode.length) {
            this.rangeNode.forEach(c => {
                //me.rangeNode.push(c);
                list = list.concat(c.getShowNodeList())
            });
        } else {
            this.rangeNode = [];
            var p = this.node.parent;

            if (p) {
                var f = p.children.indexOf(this.node);
                var t = p.children.indexOf(this.endNode);
                p.children.forEach((c, i) => {
                    if (i >= f && i <= t) {
                        me.rangeNode.push(c);
                        list = list.concat(c.getShowNodeList())
                    }
                });
                me.rangeNode.unique();
            } else {
                me.rangeNode = [this.node];
                list = list.concat(this.node.getShowNodeList());
            }
        };


        list.forEach(n => {

            //if(me.rangeNode.indexOf(n)==-1){
            // if(n.parent.summaries.length){
            // induces=induces.concat(n.parent.summaries);
            // }
            // }

            items.push(n);

            if (n.layout && n.layout.isShow) {
                if (n.layout.group) {
                    groups.push(n.layout);
                }
            }

            if (n.callout && n.callout.isShow) {
                items.push(n.callout);
            }
            if (n.layout && n.layout.isShow) {
                if (n.layout.group) {
                    groups.push(n.layout)
                }
            }

            if (n.wireFrames.length) {
                n.wireFrames.forEach(w => {
                    if (!w.isHide) {
                        items.push(w)
                    }
                })
            }

            if (n.summaries.length) {
                n.summaries.forEach(ind => {
                    if (ind.isShow()) {
                        items = items.concat(ind.getAllItem())
                    }
                });
            }
        });

        this.items = items.unique();
        this.groups = groups.unique();
    }

    create() {

        if (!this.group) {
            return;
        }

        if (this.node.isShow() && !this.isShow) {
            this.show();
        } else {
            this.hide();
            return;
        }

        var items = this.items;
        var groups = this.groups;

        var box = this.mind.getBoundingRect(items);
        if (groups.length) {
            //fish tail
            groups.forEach(g => {
                if (g.layoutName == 'fish') {
                    if (g.direct == 'right') {
                        g.creatBone();
                    } else {
                        g.creatBone1();
                    }
                    if (g.fishTail) {
                        var b = g.fishTail.bbox();
                        if (b.x < box.x) {
                            box.x = b.x
                        }
                        if (b.y < box.y) {
                            box.y = b.y
                        }
                        if (b.x + b.width > box.right) {
                            box.right = b.x + b.width;
                        }
                        if (b.y + b.height > box.bottom) {
                            box.bottom = b.y + b.height;
                        }
                        box.width = box.right - box.x;
                        box.height = box.bottom - box.y;
                    }
                }
            })
        }

        if (!box) return;
        var w = parseInt(box.width + 12);
        var h = parseInt(box.height + 12);

        if (this.shapeType == 'rect') {
            this.rect.attr({
                width: w,
                height: h,
                fill: this.fill,
                cursor: 'pointer'
            }).stroke({ 'color': this.stroke, 'width': this.lineWidth, 'dasharray': this.lineDash }).radius(this.radius).move(0, 0);
        } else {
            var nodeBox = this.node.getBox();
            var nodePos = this.node.getPosition();

            var p1 = [0, Math.abs(nodePos.y - box.y - 6)];
            var p2 = [0, Math.abs(box.y - nodePos.y - nodeBox.height - 6)]
            var p3 = [nodeBox.width, 0];
            var p4 = [nodeBox.width, box.height + 12];
            var p5 = [box.width + 12, 0];
            var p6 = [box.width + 12, box.height + 12];

            this.rect.plot([p1, p3, p5, p6, p4, p2]).attr({
                fill: this.fill,
                stroke: this.stroke,
                dasharray: this.lineDash,
                cursor: 'pointer'
            }).move(0, 0);
        }

        this.position = [];
        var num = 0
        if (this.lineWidth % 2 == 1) {
            num = 0.5
        }

        this.setPosition(parseInt(box.x - 6) + num, parseInt(box.y - 6) + num);

        if (this.t) {
            if (this.shapeType == 'rect') {
                if (!this.t.isShow()) {
                    this.t.show();
                }
                var tbox = this.t.getDomBox();
                this.textBox = tbox;
                this.t.setPosition((box.x), (box.y - tbox.height - 5 - this.lineWidth));
                this.t.dom.style.maxWidth = `${box.width - 30}px`;
            } else {
                if (this.t.isShow()) {
                    this.t.hide();
                }
            }
        }

        this.refreshBox();
    }

    refresh() {
        this.init();
    }

    setPosition(x, y) {
        if (!this.group) {
            return;
        }
        if (x || y) {
            this.position = [x, y];
            this.group.attr({
                transform: `translate(${x},${y})`
            });
        }
    }

    getPosition() {
        return {
            x: this.position.slice()[0],
            y: this.position.slice()[1]
        }
    }

    show() {
        this.group.show();
        if (this.t) this.t.show();
        this.isHide = false;
    }

    hide() {
        this.group.hide();
        if (this.t) this.t.hide();
        this.isHide = true;
    }

    remove() {

        this.group && this.group.clear() && this.group.remove();
        this.rect && this.rect.remove();
        this.t && this.mind.el.removeChild(this.t.dom);

        this.rect = null;
        this.t = null;
        this.group = null;
    }

    off() {
        this.rect.off();
    }

    active() {
        this.status = 'active';
        this.rect.setStyle('stroke', 'orange');
    }

    unactive() {
        this.status = 'unactive';
        this.rect.setStyle('stroke', this.stroke);
    }

    isactive() {
        return this.status == 'active'
    }

    getData() {

        var p = this.node.parent, f = 0, t = 0;
        if (p) {
            f = p.children.indexOf(this.node);
            t = p.children.indexOf(this.endNode);
        }
        var d = {
            stroke: this.stroke,
            fill: this.fill,
            lineDash: this.lineDash.slice(),
            data: { ...this.data },
            radius: this.radius,
            lineWidth: this.lineWidth,
            nodeId: this.node.getId(),
            endNodeId: this.endNode.getId(),
            range: `${f},${t}`,
        };

        if (this.t) {
            var nodeData = this.t.getData();
            d.nodeData = nodeData;
            d.text = nodeData.text;
        }

        return d;
    }

    setData(data) {

        this.stroke = data.stroke;
        this.fill = data.fill;
        this.lineDash = data.lineDash;
        this.data = data.data;
        this.lineWidth = data.lineWidth;
        this.radius = data.radius;
        //   if(data.nodeData){
        //       if(this.t){
        //           this.t.setData({...{},...data.nodeData});
        //           this.t.refresh();
        //       }
        //   }
        this.refresh();
    }

    refreshBox() {
        var box = this.rect.bbox();
        // if(this.text){
        //     var tb=this.t.getBox();
        //     box.y=tb.y;
        //     box.height=box.y2-box.y;
        // }
        this.box = {
            ...box,
            x: this.position[0],
            y: this.position[1]
        }
    }

    getBox() {
        return this.box;
    }

    getBBox() {
        if (this.t) {
            var box = { ...this.getBox() };
            var textBox = this.t.getDomBox();
            var pos = this.t.getPosition();
            box.y = pos.y;
            box.height = box.height + textBox.height;
        } else {
            var box = this.getBox();
        }
        return box;
    }
}