import Layout from './layout';
import theme from '../theme'


export default class MindLayout extends Layout {

    constructor(isCache = true) {
        super('minder');
        this.layoutName = 'minder';
        this.levelDis = 20;
        this.nodeDis = 10;
        this.firstLevelDis = 40;
        this.firstNodeDis = 20;
        this.root = null;
        this.lefts = [];
        this.rights = [];
        this.isCache = isCache;
        this.type = 'mind'
    }

    layout(node, direct) {
        this.root = node || this.root;
        if (!this.root.parent) {
            this.root.dom.classList.add('node-root');
            this.root.dom.classList.add('node-down');
        }
        if (!node.isExpand()) {
            return;
        }

        if (!this.group) this.group = this.root.getMind().edgeGroup.group();

        this.root.layout = this;
        this.direct = direct || '';

        if (this.root.data.nodeType && this.root.data.rootType == 'induce') {
            this.firstLevelDis = 20;
            this.firstNodeDis = 10;
        }

        this.lefts = [];
        this.rights = [];

        var root = this.root;


        this.setDirect();
        this._layoutSecondLevelNode(root);

    }

    _setDirect(n, direct) {
        n.direct = direct;
        n.dom.classList = [];
        n.dom.classList.add('node');
        n.dom.classList.add('node-' + direct);
        if (n.isLeaf() && !n.dom.classList.contains('node-leaf')) {
            n.dom.classList.add('node-leaf');
        } else {
            if (n.dom.classList.contains('node-leaf')) {
                n.dom.classList.remove('node-leaf')
            }
        }
        if (!n.layout && n.isExpand()) {
            n.children.forEach(c => {
                this._setDirect(c, direct)
            });
        };
    }

    setDirect() {
        var me = this;
        var len = this.root.children.length;
        var root = this.root;
        if (this.direct == 'right') {
            this.rights = root.children;

            this.rights.forEach(r => {
                this._setDirect(r, 'right')
            })

        } else if (this.direct == 'left') {
            this.lefts = root.children;

            this.lefts.forEach(r => {
                this._setDirect(r, 'left')
            });
        } else {

            root.children.forEach(function (child, i) {
                if (i < len / 2) {
                    me.rights.push(child);

                    me._setDirect(child, 'right');
                } else {
                    me.lefts.push(child);
                    me._setDirect(child, 'left');
                }
            });
        }
    }


    _layoutSecondLevelNode(root) {

        this._layoutMinder(root);

        if (this.root.data && this.root.data.nodeType != 'induce') {
            this._doRefresh();
        }

        this._updateRootAssist();
    }


    _doRefresh() {
        var root = this.root;
        var rootPos = root.getPosition();
        var rootBox = root.getBox();
        var center = rootPos.y + rootBox.height / 2;
        var children = root.getChildren();
        var rights = children.filter((item) => {
            return item.direct == 'right'
        });
        var lefts = children.filter((item) => {
            return item.direct == 'left'
        });
        if (rights.length >= 2) {
            var firstNode = rights[0];
            var lastNode = rights[rights.length - 1];

            var firstPos = firstNode.getPosition();
            var lastPos = lastNode.getPosition();
            var lastBox = lastNode.getBox();
            var dis1 = lastPos.y + lastBox.height - center;
            var dis2 = center - firstPos.y;
            if (Math.abs(dis1) != Math.abs(dis2)) {
                var dy = Math.abs(Math.abs(dis1) - Math.abs(dis2)) / 2;
                if (Math.abs(dis1) > Math.abs(dis2)) {
                    rights.forEach(c => {
                        this.moveNode(c, 0, -parseInt(dy))
                    });
                } else {
                    rights.forEach(c => {
                        this.moveNode(c, 0, parseInt(dy))
                    });
                }
            }
        }

        if (lefts.length >= 2) {
            var firstNode = lefts[0];
            var lastNode = lefts[lefts.length - 1];

            var firstPos = firstNode.getPosition();
            var lastPos = lastNode.getPosition();
            var lastBox = lastNode.getBox();
            var dis1 = lastPos.y + lastBox.height - center;
            var dis2 = center - firstPos.y;
            if (Math.abs(dis1) != Math.abs(dis2)) {
                var dy = Math.abs(Math.abs(dis1) - Math.abs(dis2)) / 2;
                if (Math.abs(dis1) > Math.abs(dis2)) {
                    lefts.forEach(c => {
                        this.moveNode(c, 0, -parseInt(dy))
                    });
                } else {
                    lefts.forEach(c => {
                        this.moveNode(c, 0, parseInt(dy))
                    });
                }
            }
        }
    }

    updateRight() {
        var pos = this.root.getPosition();
        var box = this.root.getBox();
        var rights = this.rights;
        var rightTotalHeight = this._getNodesHeight(rights);

        var next = [parseInt(pos.x + box.width + this.firstLevelDis), parseInt(pos.y + box.height / 2 - rightTotalHeight / 2)];

        rights.forEach((child) => {
            child.setPosition(next[0], next[1]);
            var childBox = child.getBox();
            next[1] += parseInt(childBox.height + this.firstNodeDis);
        });

        rights.forEach((item) => {
            this._layoutRight(item);
        });
    }

    updateLeft() {
        var pos = this.root.getPosition();
        var box = this.root.getBox();
        var lefts = this.lefts;

        var leftTotalHeight = this._getNodesHeight(lefts);
        var next = [parseInt(pos.x - this.firstLevelDis), parseInt(pos.y + box.height / 2 - leftTotalHeight / 2)];
        lefts.forEach((child) => {
            var childBox = child.getBox();
            child.setPosition(parseInt(next[0] - childBox.width), parseInt(next[1]));
            next[1] += childBox.height + this.firstNodeDis;
        });

        lefts.forEach((item) => {
            this._layoutLeft(item)
        });
    }


    _layoutMinder() {
        this.updateRight();
        this.updateLeft();
        this._doLayout(this.root);
    }

    // _updateAssist(node) {
    //     if (node.wireFrame) {
    //         node.wireFrame.refresh();
    //     }
    //     if (!node.isExpand()) {
    //         return;
    //     }
    //     node.children.forEach((item) => {
    //         this._updateAssist(item);
    //     });
    // }

    _getNodesHeight(nodes) {
        if (nodes[0] && nodes[0].getLevel() == 1) {
            var dis = this.firstNodeDis;
        } else {
            var dis = this.nodeDis;
        }
        var h = 0;
        nodes.forEach((item, index) => {
            h += item.getBox().height;
            if (index != nodes.length - 1) {
                h += dis;
            }
        });
        return h;
    }



    _layoutRight(node) {

        if (!node.isExpand()) {
            return;
        }

        var pos = node.getPosition();
        var box = node.getBox();
        var h = this._getNodesHeight(node.children);
        if (node.callout) {
            node.callout.refresh();
        }

        var next = [pos.x + box.width + this.levelDis, box.y + box.height / 2 - h / 2];
        node.children.forEach((child) => {
            child.setPosition(next[0], next[1]);
            var childBox = child.getBox();
            next[1] += childBox.height + this.nodeDis;
        });

        if (node.layout) {
            node.layout.layout(node, node.layout.direct || '');
            var pos = node.getPosition();
            var box = node.getMind().getBBox(node);
            var dx = parseInt(Math.abs(pos.x - box.x));
            this.moveNode(node, dx, 0);
            node.boundingRect = null;
            node.direct = 'right';
            return;
        }

        node.children.forEach((item) => {
            this._layoutRight(item)
        });
    }

    _updateNodeAssist(node) {
        if (node.callout) {
            node.callout.refresh()
        }

        var p = node.parent;
        var topInfo = {};


        if (p) {
            var wfs = p.wireFrames;
            var summaries = p.summaries;
            wfs.length && wfs.forEach((wf) => {
                if (wf.node == node) {
                    wf.refreshNode();
                    wf.refresh();
                    if (wf.data && wf.data.text) {
                        if (topInfo[node.getId()]) {
                            topInfo[node.getId()].rangeNode = topInfo[node].rangeNode.concat(wf.rangeNode.slice());
                            topInfo[node.getId()].rangeNode.unique();
                        } else {
                            var topDy = wf.getTextBox().height;
                            var rn = wf.rangeNode.slice();
                            topInfo[node.getId()] = {
                                node: node,
                                wf: wf,
                                topDy: topDy + 4,
                                rangeNode: rn
                            };
                        }
                    }
                }
            });

            summaries.length && summaries.forEach(ind => {
                if (ind.node == node) {
                    ind.refreshNode();
                    ind.refresh();
                }
            });
        }

        this.topInfo = topInfo;

    }

    _doLayout(node) {
        var me = this;
        var mind = node.getMind();

        mind.traverseDF((n) => {
            if (n == me.root) return;

            if (!n.isShow()) {
                return
            }
           
            if (n.layout) {
                if ((n.layout != me) && (n.getTopLayout() != me)) {
                    return;
                }
            } else {
                if (n.getLayout() != me) return;
            }


            me._updateNodeAssist(n);
            var box = n.getCBox();

            if (me.isCache && n.boundingRect) {
                var cbox = n.boundingRect;
            } else {
                var list = n.getShowNodeList();
                var wf = [],
                    induces = [],
                    callout = [],
                    groups = [];;

                list.forEach(node => {
                    if (node.callout && node.callout.isShow) {
                        callout.push(node.callout);
                    }
                    var wfs = node.wireFrames;
                    var summaries = node.summaries;
                    summaries.forEach(su => {
                        if (su.isShow()) {
                            induces.push(su);
                        }
                    })
                    wfs.forEach(w => {
                        if (!w.isHide) {
                            wf.push(w);
                        }
                    })
                });

                induces.unique();
                wf.unique();

                list = list.concat(wf);
                induces.forEach(ind => {
                    list = list.concat(ind.getAllItem());
                    groups = groups.concat(ind.groups);

                });
                //  list=list.concat(induces);
                list = list.concat(callout);

                if (list.length) {
                    var cbox = mind.getBoundingRect(list);
                }
            }
         

            var p = n.parent;
            if (p) {
                var wfs = p.wireFrames;
                var summaries = p.summaries;
            }

            if (n.boundingRect) {
                var topDy = n.boundingRect.topDy,
                    downDy = n.boundingRect.downDy;
            } else {
                var topDy = Math.abs(cbox.y - box.y);
                var downDy = Math.abs(cbox.y + cbox.height - box.y - box.height);

                if (wfs && wfs.length) {
                    wfs.forEach(wf => {
                        var topNode = wf.topNode;
                        var tcbox = topNode.getCBox();
                        if (wf.node == n) {
                            topDy += Math.abs(6 + tcbox.th);
                            if (me.topInfo[n.getId()]) {
                                topDy += me.topInfo[n.getId()].topDy;
                            }
                        }

                        if (wf.endNode && wf.endNode == n) {

                            var bottomNode = wf.bottomNode;
                            var bcbox = bottomNode.getCBox();
                            downDy += Math.abs(6 + bcbox.bh);

                        }
                    });
                }

                cbox.topDy = topDy;
                cbox.downDy = downDy;
                n.boundingRect = cbox;
            }

            me._adjustNode(n, 0, topDy, downDy);

            if (wfs && wfs.length) {

                wfs.forEach(wf => {
                    if (wf.endNode == n) {
                        wf.refresh();
                    }
                });
            }

            if (summaries && summaries.length) {
                summaries.forEach(wf => {
                    if (wf.endNode == n) {
                        wf.refresh();
                    }
                });
            }
        }, node);
    }


    _layoutLeft(node) {
        if (!node.isExpand()) {
            return;
        }
        var pos = node.getPosition();
        var box = node.getBox();
        var h = this._getNodesHeight(node.children);
        if (node.callout) {
            node.callout.refresh();
        }

        var next = [pos.x - this.levelDis, pos.y + box.height / 2 - h / 2];
        node.children.forEach((child) => {
            var childBox = child.getBox();
            child.setPosition(next[0] - childBox.width, next[1]);
            next[1] += childBox.height + this.nodeDis;
        });

        if (node.layout) {
            node.layout.layout(node, node.layout.direct || '');
            var pos = node.getPosition();
            var b = node.getMind().getBBox(node);
            var dx = Math.abs(pos.x + box.width - b.x - b.width);

            this.moveNode(node, -dx, 0);
            // this._updateNodeAssist(node);
            node.direct = 'left';
            node.boundingRect = null;
            return;
        }

        node.children.forEach((item) => {
            this._layoutLeft(item)
        });
    }

    _adjustDoNode(node, tdy, bdy) {
        if (!node) {
            return;
        }
        var direct = node.direct;
        // var node = node.getParent();
        while (node && node != this.root) {
            var sibs = node.getSiblings();
            var pos = node.getPosition();
            sibs.forEach((sib) => {
                if (sib.direct == direct) {
                    var sibPos = sib.getPosition();
                    if (sibPos.y > pos.y) {
                        this.moveNode(sib, 0, bdy)
                    } else {
                        this.moveNode(sib, 0, -tdy)
                    }
                }
            })
            node = node.getParent();
        }
    }

    _adjustNode(node, dx, dy1, dy2) {

        if (!node) {
            return;
        }
        var direct = node.direct;
        if (node && node != this.root) {
            var sibs = node.getSiblings();
            var pos = node.getPosition();
            sibs.forEach((sib) => {
                if (sib.direct == direct) {
                    var sibPos = sib.getPosition();
                    if (sibPos.y > pos.y) {
                        this.moveNode(sib, dx, dy2);
                        // if(sib.callout){
                        //     sib.callout.root.move(dx,dy2);
                        //     sib.callout.refresh()
                        // }
                    } else {
                        this.moveNode(sib, dx, -dy1);
                        // if(sib.callout){
                        //     sib.callout.root.move(dx,-dy1)
                        //     sib.callout.refresh()
                        // }
                    }
                }
            })

        }
    }

    moveNode(node, dx, dy) {

        node && node.move(dx, dy);

        if (node.callout) {
            node.callout.refresh();
        }

        if (node.wfs) {
            node.wfs.forEach(wf => {
                wf.move(dx, dy);
            });
        }

        if (node.induces) {
            node.induces.forEach((induce) => {
                induce.move(dx, dy);
                this.moveNode(induce.root, dx, dy);
            })
        }

        node && node.children.forEach((child) => {
            this.moveNode(child, dx, dy);
        });
    }

    refresh(direct) {
        this.layout(this.root, direct || this.direct);
        //setTimeout(()=>{
        this.createLink();
        // },100)
    }


    createLink() {
        var me = this;
        var minder = this.root.getMind();
        this.group && this.group.clear();
        if (this.root.getChildren().length == 0) {
            return;
        }

        if (!this.group) {
            return
        }

        var lineWidth = theme.use().config['lineWidth'];
        var stroke = theme.use().config['stroke'];

        minder.traverseBF((node) => {
            if (!node.isExpand() || node.ignore) {
                return;
            }
            var children = node.getChildren();
            var box = node.getBox();
            var position = node.getPosition();
            var level = node.getLevel();
            var len = children.length;
            var a = 2,
                b = 1,
                c = 2,
                d = 1;
            if (len == 1) {
                a = 4;
                b = 1;
                c = 4;
                d = 3;
            }
            children.forEach((child) => {
                var direct = child.direct;
                var childBox = child.getBox();
                var childPos = child.getPosition();
                if (direct == 'right') {
                    //四个转折点
                    if (level == 0 || level == 1) { //根节点 开始点位于结点右侧中心
                        var startPoint = [(box.width + position.x), (box.height / 2 + position.y)];
                        if (level == 0) {
                            var endPoint = [(childPos.x), (childBox.height / 2 + childPos.y)];
                        } else {
                            var endPoint = [(childBox.width + childPos.x), (childBox.height + childPos.y)];
                        }
                    } else {
                        var startPoint = [(box.width + position.x), (box.height + position.y)];
                        var endPoint = [(childBox.width + childPos.x), (childBox.height + childPos.y)];
                    }
                    if (level == 0) {
                        var transPoint1 = [(startPoint[0] + this.firstLevelDis / a * b), startPoint[1]];
                        var transPoint2 = [transPoint1[0], endPoint[1]];
                    } else {
                        var transPoint1 = [(startPoint[0] + this.levelDis / a * b), startPoint[1]];
                        var transPoint2 = [(startPoint[0] + this.levelDis / c * d), endPoint[1]];
                    }

                } else {
                    if (level == 0 || level == 1) { //根节点 开始点位于结点右侧中心
                        var startPoint = [(position.x), (box.height / 2 + position.y)];
                        if (level == 0) {
                            var endPoint = [(childPos.x + childBox.width), (childBox.height / 2 + childPos.y)];
                        } else {
                            var endPoint = [(childPos.x), (childBox.height + childPos.y)];
                        }
                    } else {
                        var startPoint = [(position.x), (box.height + position.y)];
                        var endPoint = [(childPos.x), (childBox.height + childPos.y)];
                    }
                    if (level == 0) {
                        var transPoint1 = [(startPoint[0] - this.firstLevelDis / a * b), startPoint[1]];
                        var transPoint2 = [transPoint1[0], endPoint[1]];
                    } else {
                        var transPoint1 = [(startPoint[0] - this.levelDis / a * b), startPoint[1]];
                        var transPoint2 = [(startPoint[0] - this.levelDis / c * d), endPoint[1]];
                    }
                }

                if (len == 1) {
                    if (level == 1) {

                        var points = [startPoint, transPoint1, transPoint2, endPoint];
                    } else {
                        if (Math.abs(startPoint[1] - endPoint[1]) > 2) {
                            var points = [startPoint, transPoint2, endPoint];
                        } else {
                            var points = [startPoint, endPoint];
                        }
                    }

                } else {
                    if (node.getLevel() == 0) {
                        var r = [];
                        var l = [];
                        var childrens = node.getChildren();
                        childrens.forEach((item) => {
                            if (item.direct == 'right') {
                                r.push(item);
                            } else {
                                l.push(item);
                            }
                        });

                        if (((r.length >= 2) && r.indexOf(child) == 0) || ((r.length >= 2) && r.indexOf(child) == r.length - 1)) {

                            if (direct == 'right') {
                                if (endPoint[1] > startPoint[1]) {
                                    var t3 = [(transPoint1[0]), (endPoint[1]) - 2];
                                    var t4 = [(transPoint1[0] + 2), (endPoint[1])]
                                } else {
                                    var t3 = [(transPoint1[0]), (endPoint[1] + 2)];
                                    var t4 = [(transPoint1[0] + 2), (endPoint[1])]
                                }
                                var points = [startPoint, transPoint1, t3, t4, endPoint];
                            } else {
                                if (endPoint[1] > startPoint[1]) {
                                    var t3 = [transPoint1[0], endPoint[1] - 2];
                                    var t4 = [transPoint1[0] - 2, endPoint[1]]
                                } else {
                                    var t3 = [transPoint1[0], endPoint[1] + 2];
                                    var t4 = [transPoint1[0] - 2, endPoint[1]]
                                }
                                var points = [startPoint, transPoint1, t3, t4, endPoint];
                            }

                        } else if (((l.length >= 2) && l.indexOf(child) == 0) || ((l.length >= 2) && l.indexOf(child) == l.length - 1)) {
                            if (direct == 'right') {
                                if (endPoint[1] > startPoint[1]) {
                                    var t3 = [(transPoint1[0]), (endPoint[1]) - 2];
                                    var t4 = [(transPoint1[0] + 2), (endPoint[1])]
                                } else {
                                    var t3 = [(transPoint1[0]), (endPoint[1] + 2)];
                                    var t4 = [(transPoint1[0] + 2), (endPoint[1])]
                                }
                                var points = [startPoint, transPoint1, t3, t4, endPoint];
                            } else {
                                if (endPoint[1] > startPoint[1]) {
                                    var t3 = [transPoint1[0], endPoint[1] - 2];
                                    var t4 = [transPoint1[0] - 2, endPoint[1]]
                                } else {
                                    var t3 = [transPoint1[0], endPoint[1] + 2];
                                    var t4 = [transPoint1[0] - 2, endPoint[1]]
                                }
                                var points = [startPoint, transPoint1, t3, t4, endPoint];
                            }


                        } else if (((r.length >= 2) && r.indexOf(child) != 0) || ((r.length >= 2) && r.indexOf(child) != r.length - 1) || ((l.length >= 2) && l.indexOf(child) != 0) || ((l.length >= 2) && l.indexOf(child) != l.length - 1)) {
                            var points = [transPoint2, endPoint];

                        }

                        if (r.length == 1 && l.length == 1) {
                            var points = [startPoint, endPoint];
                        }

                        if (r.length > 1 && l.length == 1) {
                            if (direct == 'right') {
                                var points = [startPoint, transPoint2, endPoint];
                            } else {
                                var points = [startPoint, endPoint];
                            }
                        }


                    } else {
                        if (direct == 'right') {
                            if (child.isFirst() || child.isLast()) {
                                if (endPoint[1] > startPoint[1]) {
                                    var t3 = [transPoint1[0], endPoint[1] - 2];
                                    var t4 = [transPoint1[0] + 2, endPoint[1]]
                                } else {
                                    var t3 = [transPoint1[0], endPoint[1] + 2];
                                    var t4 = [transPoint1[0] + 2, endPoint[1]]
                                }
                                var points = [startPoint, transPoint1, t3, t4, endPoint];

                            } else {
                                var points = [transPoint2, endPoint];
                            }
                        } else {
                            if (child.isFirst() || child.isLast()) {
                                if (endPoint[1] > startPoint[1]) {
                                    var t3 = [transPoint1[0], endPoint[1] - 2];
                                    var t4 = [transPoint1[0] - 2, endPoint[1]]
                                } else {
                                    var t3 = [transPoint1[0], endPoint[1] + 2];
                                    var t4 = [transPoint1[0] - 2, endPoint[1]]
                                }
                                var points = [startPoint, transPoint1, t3, t4, endPoint];
                            } else {
                                var points = [transPoint2, endPoint];
                            }
                        }

                    }
                }

                var line = me.group.polyline(me.linePoint(points, lineWidth));
                line.fill('none');
                line.stroke({
                    color: stroke,
                    width: lineWidth,
                    linecap: 'round',
                    linejoin: 'round'
                });

                line.source = node;
                line.target = child;
            });

        }, this.root);

    }

}