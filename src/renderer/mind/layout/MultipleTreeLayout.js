import Layout from './layout'
import theme from '../theme'

export default class MultipleTreeLayout extends Layout {
    constructor() {
        super()
        this.layoutName = "multipleTree";
        this.type = "multipleTree";
        this.levelDis = 20;
        this.firstLevelDis = 40;
        this.nodeDis = 18;
        this.direct = "multipleTree";
        this.root = null;
        this.rights = [];
        this.lefts = [];
        this.rootLevel = 0;
      
    }

    layout(node, direct) {

        this.rights = [];
        this.lefts = [];
        this.root = node || this.root;
        this.rootLevel = this.root.getLevel();
        this.root.layout = this;
        this.direct = direct;

    
        this.root.dom.classList.add('node-down');
   

        if (!this.group) this.group = this.root.getMind().edgeGroup.group();

        if (this.direct == 'right') {
            this.root.children.forEach((child) => {
                this.rights.push(child);
                this.setDirect(child, 'right');
            });
        } else if (this.direct == 'left') {
            this.root.children.forEach((child) => {
                this.lefts.push(child);
                this.setDirect(child, 'left');
            });
        } else {
            var len = this.root.children.length;
            this.root.children.forEach((child, index) => {
                if (index < Math.ceil(len / 2)) {
                    this.rights.push(child);
                    this.setDirect(child, 'right');
                } else {
                    this.lefts.push(child);
                    this.setDirect(child, 'left');

                }

            });
        }

        this._layoutTow();
   
        this._updateRootAssist();
    }

    setDirect(node, direct) {
        node.direct = direct;
        node.dom.classList = [];
        node.dom.classList.add('node');
        node.dom.classList.add('node-down');
        if (node.isLeaf() && !node.dom.classList.contains('node-leaf')) {
            node.dom.classList.add('node-leaf');
        } else {
            if (node.dom.classList.contains('node-leaf')) {
                node.dom.classList.remove('node-leaf')
            }
        }
        if (node.layout) {
            return;
        }
        node.children.forEach(child => {
            this.setDirect(child, direct);
        });
    }

    _layoutTow() {
        if (this.root.isExpand()) {
            this._layoutRight();
            this._layoutLeft();
        }
    }

    _layoutRight() {
        var box = this.root.getCBox();

        this.rights.forEach((node, i) => {
            if (node.callout) {
                node.callout.refresh();
            }
            this._layoutRightNode(node, i, box, true, node.getLevel() - 1);
        });
    }

    getParentPos(node) {
        var level = node.getLevel();
        var box = node.getDomBox();
        var center = {
            x: box.x + box.width / 2,
            y: box.y + box.height
        };
        
        return center;
    }

    _layoutRightNode(node, index, box, flag, level) {
        var mind = this.root.getMind();
     
        var center = {
            x: box.x + box.width / 2,
            y: box.y + box.height
        };
      

        if (index == 0) {
            var b = node.getCBox(true);
            node.setPosition(center.x + this.levelDis, center.y + this.nodeDis + b.th + box.bh);
        } else {
            var nodeRect = node.getCBox(true);
            if (flag) {
                var rightNode = this.rights[index - 1];
                if (this.isCache && rightNode.boundingRect) {
                    var nodeBox = rightNode.boundingRect;
                
                } else {
                    var nodeBox = mind.getBBox(rightNode);
                    rightNode.boundingRect = nodeBox;
                }
                var pos = rightNode.getPosition();
                if (rightNode.layout) {
                    var {
                        x
                    } = this.getParentPos(rightNode.parent);
                    node.setPosition(x + this.levelDis, nodeBox.y + nodeBox.height + this.nodeDis + nodeRect.th);
                } else {
                    node.setPosition(pos.x, nodeBox.y + nodeBox.height + this.nodeDis + nodeRect.th);
                }
            } else {
                var rightNode = node.parent.children[index - 1];
             
                var pos = rightNode.getPosition();
                if (this.isCache && rightNode.boundingRect) {
                    var nodeBox = rightNode.boundingRect;
                 
                } else {
                    var nodeBox = mind.getBBox(rightNode);
                    rightNode.boundingRect = nodeBox;
                }
                if (rightNode.layout) {
                    var {
                        x
                    } = this.getParentPos(rightNode.parent);
                    node.setPosition(x + this.levelDis, nodeBox.y + nodeBox.height + this.nodeDis + nodeRect.th);
                } else {
                    node.setPosition(pos.x, nodeBox.y + nodeBox.height + this.nodeDis + nodeRect.th);
                }
            }
        }


        if (node.layout) {
            node.layout.layout(node, node.layout.direct || '');
            var pos = node.getPosition();
           
            var box = mind.getBBox(node);
            node.boundingRect = box;
        
            var dx = Math.abs(pos.x - box.x);

            if (b) {
                var dy = Math.abs(pos.y - box.y) - b.th;
            } else {
                var dy = Math.abs(pos.y - box.y)
            }

            this.moveNode(node, dx, dy);
            node.direct = 'right';

            this._updateNodeAssist(node);

            return;
        }

        this._updateNodeAssist(node);

        if (node.isExpand()) {
            var nbox = node.getCBox(true);
            node.children.forEach((child, i) => {
                if (child.callout) {
                    child.callout.refresh();
                }
                this._layoutRightNode(child, i, nbox);
            });
        }
    }

    getBottomNode(node) {
        if (node.children.length) {
            var n = node.children[node.children.length - 1];
            return this.getBottomNode(n)
        } else {
            return node;
        }
    }


    _layoutLeft() {

        var box = this.root.getCBox();
        this.lefts.forEach((node, i) => {
            if (node.callout) {
                node.callout.refresh();
            }
            this._layoutLeftNode(node, i, box, true, node.getLevel() - 1);
        });

    }

    _layoutLeftNode(node, index, box, flag, level) {
        var mind = this.root.getMind();
      
        var center = {
            x: box.x + box.width / 2,
            y: box.y + box.height
        };
     
        var {
            width,
            th
        } = node.getCBox(true);

        if (index == 0) {
            var dis = 0;
            if (level == this.rootLevel) {
                dis = 20
            }
            node.setPosition(center.x - width - this.levelDis, center.y + this.nodeDis + dis + th + box.bh);
        } else {
            var nodeRect = node.getCBox(true);
            if (flag) {
                // var nodeBox=mind.getBoundingRect(this.lefts[index-1].getShowNodeList());
                //var nodeBox=mind.getBBox(this.lefts[index-1]);

                var leftNode = this.lefts[index - 1];
                if (this.isCache && leftNode.boundingRect) {
                    var nodeBox = leftNode.boundingRect;
                    // leftNode.boundingRect=null;
                } else {
                    var nodeBox = mind.getBBox(leftNode);
                    leftNode.boundingRect = nodeBox;
                }

                if (leftNode.layout) {
                    var {
                        x
                    } = this.getParentPos(leftNode.parent);
                    node.setPosition(x - this.levelDis - width, nodeBox.y + nodeBox.height + this.nodeDis + nodeRect.th);
                } else {
                    var pbox = leftNode.getCBox(true);
                    node.setPosition(pbox.x + pbox.width - width, nodeBox.y + nodeBox.height + this.nodeDis + nodeRect.th);
                }
                //  var b=this.lefts[index-1].getCBox();
            } else {
                var leftNode = node.parent.children[index - 1];
                var nodeBox = mind.getBBox(leftNode);
                if (this.isCache && leftNode.boundingRect) {
                    var nodeBox = leftNode.boundingRect;
                    //leftNode.boundingRect=null;
                } else {
                    var nodeBox = mind.getBBox(leftNode);
                    leftNode.boundingRect = nodeBox;
                }

                //var nodeBox=mind.getBBox(node.parent.children[index-1]);
                //var b=node.parent.children[index-1].getCBox();
                //var nodeBox=mind.getBoundingRect(node.parent.children[index-1].getShowNodeList());
                if (leftNode.layout) {
                    var {
                        x
                    } = this.getParentPos(leftNode.parent);
                    node.setPosition(x - this.levelDis - width, nodeBox.y + nodeBox.height + this.nodeDis + nodeRect.th);
                } else {
                    var pbox = leftNode.getCBox(true);
                    //node.setPosition(nodeBox.x+nodeBox.width-width,nodeBox.y+nodeBox.height+this.nodeDis+nodeRect.th);
                    node.setPosition(pbox.x + pbox.width - width, nodeBox.y + nodeBox.height + this.nodeDis + nodeRect.th);
                }
            }
        }



        if (node.layout) {
         
            node.layout.layout(node, node.layout.direct || '');
            var pos = node.getPosition();

            var box = mind.getBBox(node);
          
            var dx = Math.abs(pos.x + width - box.x - box.width);
            var dy = Math.abs(pos.y - box.y) - th;
            this.moveNode(node, -dx, dy);
            node.direct = 'left'
            this._updateNodeAssist(node)
            return;
        }
        this._updateNodeAssist(node)

        if (node.isExpand()) {
            var nbox = node.getCBox(true);
            node.children.forEach((child, i) => {
                if (child.callout) {
                    child.callout.refresh();
                }
                this._layoutLeftNode(child, i, nbox);
            });
        }
    }

    createLink() {
        var me = this;

        this.group && this.group.clear();

        if (!this.group) {
            return
        }

        if (this.root.getChildren().length == 0) {
            return;
        }

        var c = theme.use().config;
        var stroke = c['stroke'];
        var lineWidth = c['lineWidth'];

        function createLine(node) {
            if (!node.isExpand()) {
                return;
            }

            var dis = 6;
            var box = {
                ...{},
                ...node.getBox()
            };
            if (node != me.root) {
                box.height += lineWidth;
            }
        
            var c = [box.x + box.width / 2, box.y + box.height];
        

            node.children.forEach(child => {
                var childBox = {
                    ...{},
                    ...child.getBox()
                };
                childBox.height += lineWidth;

                if (child.direct == "right") {
                    var zs = me.linePoint([
                        [c[0], childBox.y + childBox.height - dis]
                    ], lineWidth)[0];
                    var z = me.linePoint([
                        [childBox.x + childBox.width, childBox.y + childBox.height]
                    ], lineWidth)[0];
                    var c1 = me.linePoint([
                        [zs[0] + dis, z[1]]
                    ], lineWidth)[0];
                    var path = `M${zs[0]} ${zs[1]},Q${zs[0]} ${zs[1]+dis},${c1[0]} ${c1[1]}`;
                } else {
                    var zs = me.linePoint([
                        [c[0], childBox.y + childBox.height - dis]
                    ], lineWidth)[0];
                    var z = me.linePoint([
                        [childBox.x, childBox.y + childBox.height]
                    ], lineWidth)[0];
                    var c1 = me.linePoint([
                        [zs[0] - dis, z[1]]
                    ], lineWidth)[0];
                    var path = `M${zs[0]} ${zs[1]},Q${zs[0]} ${zs[1]+dis},${c1[0]} ${c1[1]} `;
                }

                let _stroke = child.stroke || stroke || 'rgb(160,160,160)';
                var bsline = me.group.path().stroke({
                    color: _stroke,
                    width: lineWidth,
                    linecap: 'round',
                    linejoin: 'round'
                });
                bsline.plot(path)
                bsline.fill('none');

                var line1 = me.group.line(me.linePoint([c, zs], lineWidth));

                line1.fill('none');
                line1.stroke({
                    color: _stroke,
                    width: lineWidth,
                    linecap: 'round',
                    linejoin: 'round'
                });

                var line2 = me.group.line(me.linePoint([c1, z], lineWidth));

                line2.fill('none');
                line2.stroke({
                    color: _stroke,
                    width: lineWidth,
                    linecap: 'round',
                    linejoin: 'round'
                });
                if (child.layout) {
                    return;
                }
                createLine(child);


            });
        }

        createLine(this.root);
     
        this.root.children.forEach(c => {
            createLayoutLine(c)
        });


        function createLayoutLine(node) {
            if (node.isExpand()) {
                if (node.layout) {
                    node.layout.createLink();
                    return;
                }
                node.children.forEach(c => {
                    createLayoutLine(c);
                });
            }
        }



    }

    createLink1() {
        var me = this;
        this.group && this.group.clear();
        if (this.root.getChildren().length == 0) {
            return;
        }

        var c = theme.use().config;
        var stroke = c['stroke'];
        var lineWidth = c['lineWidth'];

        function createLine(node) {
            if (!node.isExpand()) {
                return;
            }
            var level = node.getLevel();
            var box = node.getBox();

            if (level == me.rootLevel) {
                var c = [box.x + box.width / 2, box.y + box.height];
            } else {
                if (node.direct == 'right') {
                    var c = [box.x + box.width / 3, box.y + box.height];
                } else {
                    var c = [box.x + box.width / 3 * 2, box.y + box.height];
                }
            }

            node.children.forEach(child => {

                var childBox = child.getBox();
                if (child.direct == "right") {
                    var zs = [c[0], childBox.y + childBox.height];
                    var z = [childBox.x, childBox.y + childBox.height];
                    var p = [
                        [z[0], z[1]],
                        [childBox.x + childBox.width + 0.5, z[1]]
                    ];
                } else {
                    var zs = [c[0], childBox.y + childBox.height];
                    var z = [childBox.x + childBox.width, childBox.y + childBox.height];
                    var p = [
                        [z[0], z[1]],
                        [childBox.x, z[1]]
                    ];
                }

                var points = me.linePoint([c, zs, z], lineWidth);
                var pathStr = `M ${points[0][0]} ${points[0][1]} Q ${points[1][0]} ${points[1][1]},${points[2][0]} ${points[2][1]} `;
                var path = me.group.path(pathStr);

                path.fill('none');
                path.stroke({
                    color: stroke,
                    width: lineWidth,
                    linecap: 'round',
                    linejoin: 'round'
                });

                var line = me.group.line(me.linePoint(p, lineWidth));
                line.stroke({
                    color: stroke,
                    width: lineWidth,
                    linecap: 'round',
                    linejoin: 'round'
                });
                if (child.layout) {
                    return;
                }
                createLine(child);

            });
        }

        createLine(this.root);

        this.root.children.forEach(c => {
            createLayoutLine(c);
        });

        var nodes = []

        function createLayoutLine(node) {
            if (node.isExpand()) {
                if (node.layout) {
                    node.layout.createLink();
                    nodes.push(node)
                    return
                }
                node.children.forEach(c => {
                    createLayoutLine(c);
                })
            }
        }


    }

    refresh() {

        this.layout(this.root, this.direct);
        this.createLink();
    }
}