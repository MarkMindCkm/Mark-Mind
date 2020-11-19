import Node from '../node'

export default class Induce {
    constructor(node, root, stroke = '#666', lineType) {
        //所属的节点
        this.name = 'induce';
        this.node = node;
        this.endNode = node;
        this.root = root || new Node();
        this.root.dom.classList.add('node-induce');
        this.root.dom.classList.add('node-leaf');

        this.root.box = {
            width: 48,
            height: 32
        };

        this.root.shapeType = 'bubble';
        this.lineType = lineType || 'solid';

        this.stroke = stroke;
        this.lineWidth = 2;
        this.type = 'right';
        this.lineDash = [0, 0];
        this.visible = true;

        this.id = +new Date();

        this.node.induce = this;
        this.root.belongInduce = this;
        this.root.isRoot = true;
        this.root.mind = this.node.getMind();
        this.root.nodeType = 'induce';
        this.box = {
            width: 48,
            height: 32
        };
        this.position = [];
        this.node.getMind().el.appendChild(this.root.dom);
        this.root.refreshBox();
        this.node.getMind().el.removeChild(this.root.dom);
        this.refreshItems();
    }

    getId() {
        return this.id;
    }

    init() {
        if (this.group) this.group.remove();
        this.group = this.node.getMind().induceGroup.group();
        this.createInduceLine();
        this.refreshBox();
        this.render();
    }



    createInduceLine() {
        this.pl1 = this.group.polyline().stroke({
            color: `${this.stroke}`,
            width: `${this.lineWidth}`,
            dasharray: `${this.lineDash}`,
            linecap: 'round',
            linejoin: 'round'
        }).fill('none')
        this.pl2 = this.group.polyline().stroke({
            color: `${this.stroke}`,
            width: `${this.lineWidth}`,
            dasharray: `${this.lineDash}`,
            linecap: 'round',
            linejoin: 'round'
        }).fill('none')

    }

    refreshItems() {
        var induces = this.getInduces();

        //  var wfs=this.getWireFrame();
        //获取Node以及induce所占的范围
        var items = this.listNode;

        //    if(this.node.wireFrames){
        //        // items=items.concat(this.node.wireFrames);
        //         induces.forEach(it=>{
        //             items=items.concat(it.getAllItem())
        //         });
        //        // if(this.endNode){

        //        // }
        //     }else{
        // items=this.node.getShowNodeList().concat(wfs);
        //    if(this.rangeNode.length){
        //        this.rangeNode.forEach(n=>{
        //         items=items.concat(n.getShowNodeList())
        //        });
        //    }
        induces.forEach(it => {
            if (it.isShow()) {
                items = items.concat(it.getAllItem());
            }
        });
        // items.concat(wfs);
        // }

        this.items = items;
        //  this.groups=groups.unique();
    }
    render() {
        //判断方向
        this.adjustType();
        //获取Node以及其子孙节点所有总结并排序


        // if(this.node.boundingRect){
        //     var box=this.node.boundingRect;
        // }
        //else{

        //  }

        //鱼骨图尾巴

        //if(!this.items){
        // this.refreshItems();   ///////////////////
        // }

        var box = this.getNodeBox();


        // this.box=box;
        // console.log(box);
        // console.log(11111111111,items,box);
        //设置坐标
        //  console.log(items,box);
        //this.nodeBox=box;
        this.renderInduce(box);
    }

    adjustType() {
        //获取布局方式
        var that = this;
        var m = this.node.getMind();
        var root = m.getRootByNode(this.node);
        // var layoutName=root.data.layoutName;
        // var direct =root.data.directName;
        //var rootPos = root.getPosition();
        // var nodePos = this.node.getPosition();
        // if(['minder','minder1','minder2','minder3','time','fish'].indexOf(layoutName)>-1){
        //     if (rootPos.x > nodePos.x) {
        //         this.type = 'left';
        //     }
        //     else {
        //         this.type = 'right';
        //     }
        //      //如果是induce
        //      if(root.data.rootType&&root.data.rootType=='induce'){
        //         if(root.layout){
        //             this.type=root.layout.direct;
        //         }
        //     }

        // }else if(['tree'].indexOf(layoutName)>-1){
        //      if(rootPos.y>nodePos.y){
        //         this.type='top'
        //      }else{
        //         this.type='bottom'
        //      }
        // }else if(['free'].indexOf(layoutName)>-1){
        //     if(this.node.getChildren().length){
        //         var direct=this.node.getChildren()[0].direct||'right';
        //         this.type=this.judgeNodePos(this.node,this.node.getParent());
        //     }else{
        //         this.type=this.node.direct||'right';
        //     }
        // }else{
        //     this.type='right';
        // }
        // this.root.removeClass('node-induce-'+this.type);
        var class1 = 'node-' + this.type;
        if (this.root.dom.classList.contains(class1)) {
            this.root.dom.classList.remove(class1)
        }
        this.type = this.node.direct;
        this.direct = this.node.direct;
        var class2 = 'node-' + this.type;
        if (!this.root.dom.classList.contains(class2)) {
            this.root.dom.classList.add(class2)
        }
        //  if(!this.root.children.length){
        //      this.root.addClass('node-leaf');
        //  }else{
        //      if(this.root.dom.classList.contains('node-leaf')){
        //          this.root.dom.classList.remove('node-leaf')
        //      }
        //  }

        // this.root.addClass('node-induce-'+this.type);
        //console.log(this.type);

        //  if(this.root.layout){
        //     if(this.type=='right'||this.type=="left"){
        //         var d=this.type;
        //     }else{
        //         var d=this.type=='top'?'top':'down';
        //     }
        //     if(this.root.layout.direct==d){
        //         return;
        //     }
        //  }

        //  if(this.root.layout&&this.root.layout.gLine){
        //       //  console.log(m,this.root.layout.gLine,11);
        //         setTimeout(()=>{
        //             m.remove(this.root.layout.gLine);
        //         },10);

        //  }

        // if(this.root.layout){
        //     this.root.layout.group&&this.root.layout.group.remove();
        // }

        //  if(this.type=='right'||this.type=="left"){
        //      this.root.layout=new layoutMap['minder1']();
        //      this.root.data.layoutName="minder";
        //      this.root.layout.direct=this.type;
        //  }else{
        //     this.root.layout=new layoutMap['tree']();
        //     this.root.data.layoutName="tree";
        //     this.root.layout.direct=this.type=='top'?'top':'down';
        //  }
        //  this.root.layout.root=this.root;
        //  this.root.data.isRoot=true;
        //  this.root.data.main=false;
        //  this.root.data.directName=this.root.layout.direct;
        //  this.root.data.rootType='induce';
    }
    getInduces() {
        var me = this;
        var list = [];
        var induces = [],
            wfs = [],
            groups = [];
        if (this.rangeNode && this.rangeNode.length) {
            this.rangeNode.forEach(c => {
                //me.rangeNode.push(c);
                list = list.concat(c.getShowNodeList())
            });
        } else {
            this.rangeNode = [];
            var p = this.node.parent;

            var f = p.children.indexOf(this.node);
            var t = p.children.indexOf(this.endNode);

            p.children.forEach((c, i) => {
                if (i >= f && i <= t) {
                    me.rangeNode.push(c);
                    list = list.concat(c.getShowNodeList())
                }
            })
            me.rangeNode.unique();
        };

        list.forEach(n => {
            //    console.log(n);
            // if(me.rangeNode.indexOf(n)==-1){
            if (n.summaries.length) {
                n.summaries.forEach(w => {
                    if (w.isShow()) {
                        induces.push(w)
                    }
                })
                //  induces=induces.concat(n.summaries);
            }
            // }
            if (n.callout && n.callout.isShow) {
                list.push(n.callout);
            }

            if (n.wireFrames.length) {
                n.wireFrames.forEach(w => {
                    if (!w.isHide) {
                        wfs.push(w);
                    }
                })
            }

            if (n.layout) {
                if (n.layout.isShow) {
                    groups.push(n.layout)
                }
            }

        });
        induces.unique();
        wfs.unique()
        this.listNode = list.concat(wfs);

        this.groups = groups.unique();
        return induces;
    }

    getNodeBox() {
        var items = this.items;
        var groups = this.groups;
        var box = this.node.getMind().getBoundingRect(items);

        if (groups.length) {
            //tail of fish
            groups.forEach(g => {
                if (g.layoutName == 'fish') {
                    if (g.direct == 'right') {
                        g.creatBone()
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

        return box;
    }

    getBoxRect() {
        var m = this.node.getMind();
        return m.getBoundingRect(this.getAllItem());
    }

    refreshBox() {
        var m = this.node.getMind();
        this.box = m.getBoundingRect(this.getAllItem());
    }

    getBox() {
        var gbox = this.group.gbox();
        if (this.box) {
            var b = this.box;
        } else {
            var b = this.root.getBox();
            this.box = b;
        }

        if (gbox.x < b.x) {
            this.box.x = gbox.x;
        }
        if (gbox.y < b.y) {
            this.box.y = gbox.y
        }

        if (b.right < gbox.x2) {
            this.right = gbox.x2
        }

        if (b.bottom < gbox.y2) {
            this.box.bottom = gbox.y2;
        }

        this.box.width = this.box.right - this.box.x;
        this.box.height = this.box.bottom - this.box.y;
        return this.box
    }

    refreshAllItems() {
        var item = [];

        function getMindAllItem(node) {
            if (node.isShow()) {
                item.push(node);
            }

            if (node.callout && node.callout.isShow) {
                item.push(node.callout);
            }

            if (node.wireFrames.length) {
                // item.concat(node.wireFrames)
                // node.wireFrame.refresh();
                node.wireFrames.forEach(w => {
                    if (!w.isHide) {
                        item.push(w)
                    }
                })
            }
            if (node.summaries.length) {
                //   node.induce.refresh();
                //   item.push(node.induce);
                node.summaries.forEach((induce => {
                    if (induce.isShow()) {
                        item = item.concat(induce.getAllItem());
                    }
                }))
            }

            if (node.isExpand()) {
                node.children.forEach(child => {
                    getMindAllItem(child);
                });
            }
        }
        this.root && getMindAllItem(this.root);
        this.allItems = item.unique();
    }

    getAllItem() {
        this.refreshAllItems();
        return this.allItems;
    }

    hide() {
        this.isHide = true;
        if (this.group) this.group.hide();
    }

    isShow() {
        return !this.isHide;
    }

    show() {
        this.isHide = false;
        if (this.group) this.group.show();
    }

    doLayout() {

        if (this.root.getChildren().length == 0) {
            return;
        }

        var direct = this.root.layout.direct;
        this.root.layout.layout(this.root, direct);

    }

    getWireFrame() {
        var me = this;
        var wfs = [];
        var list = [];
        if (this.rangeNode && this.rangeNode.length) {
            this.rangeNode.forEach(c => {

                list = list.concat(c.getShowNodeList())
            });
        }

        list.forEach(n => {

            if (n.wireFrames.length) {
                n.wireFrames.forEach(w => {
                    if (!w.isHide) {
                        wfs = wfs.concat(n.wireFrames);
                    }
                });
            }

        });

        return wfs.unique();
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
    }

    renderInduce(box) {
        if (!box) return;
        if (!this.pl1) {
            return
        }
        if (this.lineType == 'solid') {
            this.lineDash = [0]
        } else {
            this.lineDash = [4, 2];
        }

        if (this.type == 'right') {
            box.x1 = box.x + box.width;
            this.setPosition(parseInt(box.x1) + 5, box.y);

            // this.pl1.plot([[4,0],[10,0],[12,2],[12,parseInt(box.height/2)],[20,parseInt(box.height/2)]]);
            this.pl1.plot([
                [4, 0],
                [12, 0],
                [12, parseInt(box.height / 2)],
                [22, parseInt(box.height / 2)]
            ]);
            //this.pl2.plot([[20,parseInt(box.height/2)],[12,parseInt(box.height/2)],[12,parseInt(box.height)-2],[10,parseInt(box.height)],[4,parseInt(box.height)]]);
            this.pl2.plot([
                [22, parseInt(box.height / 2)],
                [12, parseInt(box.height / 2)],
                [12, parseInt(box.height)],
                [4, parseInt(box.height)]
            ]);
            var textBox = this.root.getBox();


            this.root.setPosition(box.x1 + 30, box.y + box.height / 2 - textBox.height / 2);
        } else if (this.type == 'left') {
            var textBox = this.root.getBox();
            this.setPosition(parseInt(box.x - textBox.width - 26), parseInt(box.y));



            this.pl2.plot([
                [parseInt(textBox.width + 2), parseInt(box.height / 2)],
                [parseInt(textBox.width + 12), parseInt(box.height / 2)],
                [parseInt(textBox.width + 12), parseInt(box.height)],
                [parseInt(textBox.width + 18), parseInt(box.height)]
            ]);
            this.pl1.plot([
                [parseInt(textBox.width + 2), parseInt(box.height / 2)],
                [parseInt(textBox.width + 12), parseInt(box.height / 2)],
                [parseInt(textBox.width + 12), 0],
                [parseInt(textBox.width + 18), 0]
            ]);
            // this.pl1.plot([[parseInt(textBox.width+2),parseInt(box.height/2)],[parseInt(textBox.width+10),parseInt(box.height/2)],[parseInt(textBox.width+10),2],[parseInt(textBox.width+12),0],[parseInt(textBox.width+18),0]]);
            this.root.setPosition(box.x - textBox.width - 28, parseInt(box.y + (box.height - textBox.height) / 2));
        } else if (this.type == 'top') {
            var textBox = this.root.getBox();
            this.setPosition(parseInt(box.x), parseInt(box.y - textBox.height - 30));

            this.pl1.plot([
                [0, parseInt(textBox.height + 20)],
                [0, parseInt(textBox.height + 12)],
                [parseInt(box.width / 2), parseInt(textBox.height + 12)],
                [parseInt(box.width / 2), parseInt(textBox.height + 4)]
            ]);
            this.pl2.plot([
                [parseInt(box.width / 2), parseInt(textBox.height + 4)],
                [parseInt(box.width / 2), parseInt(textBox.height + 12)],
                [parseInt(box.width), parseInt(textBox.height + 12)],
                [parseInt(box.width), parseInt(textBox.height + 20)]
            ]);
            this.root.setPosition(parseInt(box.x + (box.width - textBox.width) / 2), box.y - textBox.height - 25);
        } else {
            this.setPosition(parseInt(box.x), parseInt(box.y + box.height + 5));

            this.pl1.plot([
                [0, 4],
                [0, 12],
                [parseInt(box.width / 2), 12],
                [parseInt(box.width / 2), 20]
            ]);
            this.pl2.plot([
                [parseInt(box.width / 2), 20],
                [parseInt(box.width / 2), 12],
                [parseInt(box.width), 12],
                [parseInt(box.width), 4]
            ]);
            var textBox = this.root.getBox();


            this.root.setPosition(box.x + (box.width - textBox.width) / 2, box.y + box.height + 26);
        }


        this.doLayout();
    }
    getPosition() {
        return {
            x: this.position[0],
            y: this.position[1]
        };
    }

    setPosition(x, y) {
        this.group.attr({
            transform: `translate(${x},${y})`
        });
        this.position = [x, y];

    }

    setText(text) {

    }
    getText() {
        return this.induceText;
    }
    getTextBox() {
        return this.text.getBox();
    }

    refresh() {
        if (this.node.isShow()) {
            if (this.isHide) {
                this.show();
                (function show(n) {
                    n.show();
                    if (n.isExpand()) {
                        n.children.forEach(item => {
                            show(item);
                        });
                    }
                })(this.root);
            }
            this.render();
            this.refreshBox();
        } else {
            if (this.isHide) {
                return
            }
            this.hide();

            (function hide(n) {
                n.hide();
                if (n.isExpand()) {
                    n.children.forEach(item => {
                        hide(item);
                    });
                }
            })(this.root);

            if (this.root.layout) {
                if (this.root.layout.group) {
                    this.root.layout.group.clear();
                    this.root.layout.group.remove();
                    this.root.layout.group = null;
                }
            }
        }
    }
    active() {
        this.status = 'active'
        this.root.setStyle('stroke', 'rgb(247,186,134)');
    }

    move(dx, dy) {
        var p = this.getPosition();
        this.setPosition(p.x + dx, p.y + dy);
        if (this.box) {
            this.box.x += dx;
            this.box.y += dy;
        }
    }
    unactive() {
        this.status = 'unactive'
        this.root.setStyle('stroke', this.color);
    }
    isactive() {
        return this.status == 'active'
    }
    remove() {
        this.root.layout && this.root.layout.group && this.root.layout.group.remove();
        this.root.layout.group = null;
        this.pl1 && this.pl1.remove();
        this.pl2 && this.pl2.remove();
        this.pl1 = null;
        this.pl2 = null;
    }
    initEvent() {

        this.pl1.on('click', (e) => {
            e.induce = this;
            this.__zr.trigger('touchInduce', e);
            this.__zr.trigger('selectInduce', e);
        })
        this.pl2.on('click', (e) => {
            e.induce = this;
            this.__zr.trigger('touchInduce', e);
            this.__zr.trigger('selectInduce', e);
        })
    }
    getData() {

        var p = this.node.parent,
            f = 0,
            t = 0;
        if (p) {
            f = p.children.indexOf(this.node);
            t = p.children.indexOf(this.endNode);
        }

        return {
            nodeId: this.node.getId(),
            endNodeId: this.endNode.getId(),
            stroke: this.stroke,
            root: this.root.getId(),
            lineType: this.lineType,
            id: this.id,
            range: `${f},${t}`,
            type: this.type
        };
    }
    setData(data) {

        this.stroke = data['stroke'];
        this.lineType = data['lineType']
        this.refresh();

        this.pl1.attr({
            stroke: this.stroke,
            fill: 'none'
        })
        this.pl2.attr({
            stroke: this.stroke,
            fill: 'none'
        })
    }
    judgeNodePos(node, parent) {
        var direct = '';
        if (!parent) {
            return 'right';
        }
        var npos = node.getPosition();
        var nbos = node.getBox();
        var ppos = parent.getPosition();
        var pbox = parent.getBox();

        if (node.direct == 'right') {
            if (npos.x > ppos.x + pbox.width) {
                direct = 'right'
            } else {
                direct = 'left';
            }
        } else {
            if (ppos.x > npos.x + nbos.width) {
                direct = 'left'
            } else {
                direct = 'right';
            }
        }
        return direct;
    }

    getChildren() {
        return this.childrens;
    }

    addChild(node, index) {

        node._parent = this;
        if (typeof (index) == 'number') {
            this.childrens.splice(index, 0, node);
        } else {
            this.childrens.push(node);
        }
    }

    removeChild(node) {
        var index = this.childrens.indexOf(node);
        index > -1 && this.childrens.splice(index, 1);
        return index;
    }
}