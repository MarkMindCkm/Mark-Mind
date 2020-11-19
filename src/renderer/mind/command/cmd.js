import Command from './command'
import uuid from '../uuid'
import Node from '../node'

class AddNode extends Command {

    constructor(node, parent, mind) {
        super('addNode');
        this.node = node;
        this.parent = parent;
        this.mind = mind;
        this.index = -1;
    }

    execute() {
        if (this.index > -1) {
            this.mind.addNode(this.node, this.parent, this.index);   //添加到某位置，不一定是最后
        } else {
            this.mind.addNode(this.node, this.parent);
        }

        this.updateItems(this.node);
        this.node.refreshBox();
        this.refresh(this.node);

        this.mind.getSelectNode() && this.mind.getSelectNode().unSelect();
        setTimeout(()=>{
            this.mind.selectNode(this.node);
            this.node.edit();
        },0)
    }

    undo() {
        if (this.mind.getSelectNode()) {
            this.mind.getSelectNode().unSelect();
        }
        var p = this.node.parent;
        this.index = this.mind.removeNode(this.node);
        this.updateItems(p);
        this.refresh(p);
        setTimeout(()=>{
            this.mind.selectNode(p);
        },0)
    }
}

class AddParentNode extends Command {

    constructor(node, newNode, oldParent) {
        super('addParent');
        this.node = node;
        this.newNode = newNode;
        this.oldParent = oldParent
    }

    execute() {
        this.index = this.oldParent.removeChild(this.node);
        this.node.mind.addNode(this.newNode, this.oldParent, this.index);
        this.newNode.addChild(this.node);
        this.node._refreshBounding();
        this.node.refreshBox();
        this.refresh(this.node);
        this.node.mind.getSelectNode().unSelect();
        setTimeout(()=>{
            this.node.mind.selectNode(this.newNode);
            this.newNode.edit();
        },0)
    }

    undo() {
        this.newNode.removeChild(this.node);
        this.oldParent.removeChild(this.newNode);
        this.oldParent.addChild(this.node, this.index);
        this.node.mind.removeNode(this.newNode);
        this.node._refreshBounding();
        this.refresh(this.node);
        setTimeout(()=>{
            this.node.mind.selectNode(this.node);
        },0)
    }
}

class RemoveNode extends Command {

    constructor(node, mind) {
        super('removeNode');
        this.node = node;
        this.parent = this.node.parent;
        this.mind = mind;
        this.isFreeRoot = this.node.nodeType == 'freeNode';
        this.isInduce = this.node.nodeType == 'induce';
        this.isRelateLink = this.node.nodeType == 'relateLink';
    }

    execute() {
        var me = this;
        if (this.isFreeRoot) {
            this.mind.removeFreeNode(this.node);
            this.mind.removeNode(this.node);
        }
        else if (this.isInduce) {
            this.relateNode = this.node.belongInduce.node;
            this.induce = this.node.belongInduce;
            this.mind.removeInduce(this.induce);
            this.relateNode.induce = null;
            this.mind.removeNode(this.node);
            this.relateNode._refreshBounding();
            this.updateItems(this.relateNode);
            this.refresh(this.relateNode);
        }
        else if (this.isRelateLink) {
            this.mind.removeRelateLink(this.node.relateLink);
            this.mind.removeNode(this.node);
        }
        else {
            this.node._refreshBounding();
            this.node.refreshBox();

            //changed wireFrame and induce 
            var wfs = this.parent.wireFrames;
            var summaries = this.parent.summaries;
            this.cacheInfo = {
                wfs: [],
                induces: []
            };
            //cache change data (wireFrames,induces,relateLink,callout)
            wfs.forEach(wf => {
                if (wf.node == wf.endNode) {
                    if (wf.node == me.node) {
                        me.mind.removeWireFrame(wf);
                        me.cacheInfo.wfs.push({
                            item: wf,
                            type: 'remove'
                        });
                    }
                }
                else {
                    if (wf.rangeNode.indexOf(me.node) > -1) {
                        if (wf.rangeNode[0] == me.node) {
                            me.node.wfs.splice(me.node.wfs.indexOf(wf), 1);
                            var oldRange = wf.rangeNode.slice();
                            wf.rangeNode.shift();
                            wf.rangeNode[0].wfs.push(wf);
                            me.cacheInfo.wfs.push({
                                item: wf,
                                type: 'changeRangeNode-start',
                                oldRange,
                                newRange: wf.rangeNode.slice()
                            });

                        }
                        else if (wf.rangeNode[wf.rangeNode.length - 1] == me.node) {
                            var oldRange = wf.rangeNode.slice();
                            wf.rangeNode.pop();
                            me.cacheInfo.wfs.push({
                                item: wf,
                                type: 'changeRangeNode-end',
                                oldRange,
                                newRange: wf.rangeNode.slice()
                            });
                        }
                        else {
                            var oldRange = wf.rangeNode.slice();
                            var k = wf.rangeNode.indexOf(me.node);
                            wf.rangeNode.splice(k, 1);
                            me.cacheInfo.wfs.push({
                                item: wf,
                                type: 'changeRangeNode',
                                oldRange,
                                newRange: wf.rangeNode.slice(),
                                num: k
                            });
                        }
                    }
                }
            });

            summaries.forEach(induce => {
                if (induce.node == induce.endNode) {
                    if (induce.node == me.node) {
                        me.mind.removeInduce(induce);
                        me.cacheInfo.induces.push({
                            item: induce,
                            type: 'remove'
                        });
                        me.mind.removeNode(induce.root);
                    }
                }
                else {
                    if (induce.rangeNode.indexOf(me.node) > -1) {
                        if (induce.rangeNode[0] == me.node) {
                            me.node.induces.splice(me.node.induces.indexOf(wf), 1);
                            var oldRange = induce.rangeNode.slice();
                            induce.rangeNode.shift();
                            induce.rangeNode[0].induces.push(wf);
                            me.cacheInfo.induces.push({
                                item: induce,
                                type: 'changeRangeNode-start',
                                oldRange,
                                newRange: wf.rangeNode.slice()
                            });
                        }
                        else if (induce.rangeNode[induce.rangeNode.length - 1] == me.node) {
                            var oldRange = induce.rangeNode.slice();
                            induce.rangeNode.pop();
                            me.cacheInfo.induces.push({
                                item: induce,
                                type: 'changeRangeNode-end',
                                oldRange,
                                newRange: induce.rangeNode.slice()
                            });
                        }
                        else {
                            var oldRange = induce.rangeNode.slice();
                            var k = induce.rangeNode.indexOf(me.node);
                            induce.rangeNode.splice(k, 1);
                            me.cacheInfo.induces.push({
                                item: induce,
                                type: 'changeRangeNode',
                                oldRange,
                                newRange: induce.rangeNode.slice(),
                                num: k
                            });
                        }
                    }
                }
            });
            this.index = this.mind.removeNode(this.node);
            this.updateItems(this.parent);
            this.refresh(this.parent);
        }

        setTimeout(()=>{
            if(this.parent) this.parent.mind.selectNode(this.parent);
        },0)

    }
    undo() {
        var me = this;

        if (this.isFreeRoot) {
            this.mind.addFreeNode(this.node);
        }
        else if (this.isInduce) {
            this.relateNode._refreshBounding();
            this.relateNode.induce = this.induce;
            this.mind.addInduce(this.induce);
            this.induce.init();
        }
        else if (this.isRelateLink) {
            this.mind.addRelateLink(this.node.relateLink);
        }
        else {
            this.mind.addNode(this.node, this.parent, this.index);
        }

        this.mind.traverseDF((n) => {
            this.mind._addNodeDom(n);

            if (n.callout) {
                this.mind.addCallout(n.callout);
                this.mind.el.appendChild(n.callout.root.dom);
                n.callout.init();
            }

            if (n._wireFrames.length) {
                n.wireFrames = n._wireFrames.slice();
                n._wireFrames = [];
                n.wireFrames.forEach(wf => {
                    this.mind.addWireFrame(wf);
                    wf.init();
                })
            }

            if (n._summaries.length) {
                n.summaries = n._summaries.slice();
                n._summaries = [];
                n.summaries.forEach(induce => {
                    this.mind.addInduce(induce);
                    induce.init();
                    this.mind.traverseDF(c => {
                        this.mind._addNodeDom(c);
                    }, induce.root);
                })
            }
        }, this.node);

        this.node._removeLink && this.node._removeLink.forEach(rl => {
            this.mind.addRelateLink(rl);
        });

        this.node._refreshBounding();
        this.node.refreshBox();

        //changed wireFrame and induce 
        this.cacheInfo && this.cacheInfo.wfs.forEach(data => {
            if (data.type == 'remove') {
                me.mind.addWireFrame(data.item);
                data.item.init();
            }

            if (data.type == 'changeRangeNode-start') {
                me.node.wfs.push(data.item);
                var s = data.item.rangeNode[0];
                s.wfs.splice(s.wfs.indexOf(data.item), 1);
                data.item.rangeNode = data.oldRange;
            }

            if (data.type == 'changeRangeNode-end' || data.type == 'changeRangeNode') {
                data.item.rangeNode = data.oldRange;
            }

        });

        this.cacheInfo && this.cacheInfo.induces.forEach(data => {

            if (data.type == 'remove') {
                me.mind.addInduce(data.item)
                data.item.init();
                this.mind.traverseDF(n => {
                    this.mind._addNodeDom(n);
                }, data.item.root);
            }

            if (data.type == 'changeRangeNode-start') {
                me.node.induces.push(data.item);
                var s = data.item.rangeNode[0];
                s.induces.splice(s.induces.indexOf(data.item), 1);
                data.item.rangeNode = data.oldRange;
            }

            if (data.type == 'changeRangeNode-end' || data.type == 'changeRangeNode') {
                data.item.rangeNode = data.oldRange;
            }
        });

        this.updateItems(this.node);

        if (this.mind.getSelectNode()) {
            this.mind.getSelectNode().unSelect();
        }
        this.refresh(this.node);
        setTimeout(()=>{
            this.mind.selectNode(this.node);
        },0)
    }
}

class ChangeNodeTodo extends Command {
    constructor(node) {
        super('changeNodeTodo');
        this.node = node;
    }
    execute() {
        this.changeTodo();
    }
    undo() {
        this.changeTodo();
    }
    changeTodo() {
        if (this.node.isTodo()) {
            this.node.mind.traverseBF(n => {
                n.removeTodo()
            }, this.node);
        } else {
            this.node.mind.traverseBF(n => {
                n.setTodo()
            }, this.node);
        }
        this.refresh(this.node);
    }
}

class ChangeNode extends Command {
    constructor(node, oldData, newData, refresh) {
        super('changeNode');
        this.isRefresh = refresh;
        this.node = node;
        this.oldData = oldData;
        this.newData = newData;
    }

    execute() {
        this.node.setData(this.newData);
        if (!this.node.parent && this.newData.x) {
            this.node.setPosition(this.newData.x, this.newData.y);
        }
        this.node._refreshBounding();
        if (this.isRefresh) {
            this.refresh(this.node);
        }
        if (this.node.data.nodeType == 'wireFrame') {
            this.node.wireFrame && this.node.wireFrame.refresh();
        }
    }

    undo() {
        this.node.setData(this.oldData);
        if (!this.node.parent && this.oldData.x) {
            this.node.setPosition(this.oldData.x, this.oldData.y);
        }
        this.node._refreshBounding();
        if (this.isRefresh) {
            this.refresh(this.node);
        }
        if (this.node.data.nodeType == 'wireFrame') {
            this.node.wireFrame && this.node.wireFrame.refresh();
        }
    }

}

class ChangeNodeText extends Command {

    constructor(node, oldText, text) {
        super('changeNodeText');
        this.node = node;
        this.oldText = oldText;
        this.text = text
    }

    execute() {
        this.node.setText(this.text);
        this.refresh(this.node);
    }

    undo() {
        this.node.setText(this.oldText);
        this.refresh(this.node);
    }
}

class AddRelateLink extends Command {

    constructor(link) {
        super('addRelate');
        this.link = link;
        this.mind = this.link.startNode.getMind();
    }

    execute() {
        this.mind.addRelateLink(this.link);
        this.mind.status = '';
        this.link.status = 'added';
    }

    undo() {
        this.mind.removeRelateLink(this.link);
    }
}

class ChangeRelateLinkBox extends Command {

    constructor(relate, oldBox, box) {
        super('relateLinkBox');
        this.relateLink = relate;
        this.oldBox = oldBox;
        this.box = box;
    }

    execute() {
        this.relateLink.setBox(this.box);
        this.relateLink.startNode.getMind().updateRelateLink();
    }

    undo() {
        this.relateLink.setBox(this.oldBox);
        this.relateLink.startNode.getMind().updateRelateLink();
    }

}

class AddWireFrame extends Command {

    constructor(wireFrame, mind) {
        super('addWireFrame');
        this.wireFrame = wireFrame;
        this.mind = mind;
        this.node = this.wireFrame.node;
        this.num = 1;
    }

    execute() {
        this.node._refreshBounding();
        this.mind.addWireFrame(this.wireFrame);
        if (this.num != 1) {
            this.node.wireFrame = this.wireFrame;
            this.wireFrame.init();
        }
        this.num++;
        this.updateItems(this.node);
        this.refresh(this.node);
    }

    undo() {
        this.mind.removeWireFrame(this.wireFrame);
        this.node.wireFrame = null;
        this.node._refreshBounding();
        this.updateItems(this.node);
        this.refresh(this.node);
    }
}

class RemoveWireFrame extends Command {

    constructor(wireFrame, mind) {
        super('remmoveWireFrame');
        this.mind = mind;
        this.node = wireFrame.node;
        this.wireFrame = wireFrame;
    }

    execute() {
        this.mind.removeWireFrame(this.wireFrame);
        this.node.wireFrame = null;
        this.node._refreshBounding();
        this.updateItems(this.node);
        this.refresh(this.node);
    }

    undo() {
        this.node.wireFrame = this.wireFrame;
        this.node._refreshBounding();
        this.mind.addWireFrame(this.wireFrame);
        this.wireFrame.init();

        this.updateItems(this.node);
        this.refresh(this.node);
    }
}

class ChangeWireFrame extends Command {

    constructor(wireFrame, oldData, newData) {
        super('changeWireFrame');
        this.wireFrame = wireFrame;
        this.oldData = oldData;
        this.newData = newData;
    }

    execute() {
        this.wireFrame.setData(this.newData);
        this.wireFrame.node._refreshBounding()
        this.refresh(this.wireFrame.node);
    }

    undo() {
        this.wireFrame.setData(this.oldData);
        this.wireFrame.node._refreshBounding()
        this.refresh(this.wireFrame.node);
    }
}


//add induce
class AddInduce extends Command {
    constructor(node, induce) {
        super('addInduce');
        this.node = node;
        this.induce = induce;
        this.mind = this.node.getMind();
        this.added = false;
    }

    execute() {
        if (!this.added) {
            this.mind.addInduce(this.induce);
            this.added = true;
        }
        this.node._refreshBounding();
        this.updateItems(this.node);
        this.refresh(this.node);
    }

    undo() {

        this.added = false;
        this.mind.el.removeChild(this.induce.root.dom);
        this.mind.removeInduce(this.induce);
        this.node._refreshBounding();
        this.updateItems(this.node);
        this.refresh(this.node);

    }
}

//remove induce
class RemoveInduceCommand extends Command {

    constructor(induce) {
        super('removeCommand');
        this.node = induce.node;
        this.induce = induce;
    }

    execute() {
        var m = this.node.getMind();
        m.removeInduce(this.induce);
        if (this.induce.root.layout) {
            this.induce.root.layout.group && this.induce.root.layout.group.remove() && (this.induce.root.layout.group = null);
        }

        (function deleteNode(n) {
            m.remove(n);
            if (n.wireFrames) {
                n.wireFrames.forEach(wf => {
                    m.removeWireFrame(wf);
                });
            }
            if (n.summaries) {
                n.summaries.forEach(induce => {
                    m.removeInduce(induce);
                    if (induce.root.layout) {
                        induce.root.layout.group && induce.root.layout.group.remove() && (induce.root.layout.group = null);
                    }
                    deleteNode(induce.root);
                })
            }

            n.getChildren().forEach(child => {
                deleteNode(child);
            });

        })(this.induce.root);

        this.node.induce = null;
        this.node._refreshBounding();
        this.updateItems(this.node);
        this.refresh(this.node);
    }

    undo() {
        var m = this.node.getMind();
        m.addInduce(this.induce);
        (function addNode(n) {
            m.add(n);
            if (n.wireFrames.length) {
                n.wireFrames.forEach(wf => {
                    m.addWireFrame(wf);
                })
            }
            if (n.summaries.length) {
                n.summaries.forEach(induce => {
                    m.addInduce(induce);
                    addNode(induce.root);
                })
            }
            n.getChildren().forEach(child => {
                addNode(child);
            });
        })(this.induce.root);

        this.node.induce = this.induce;
        this.node._refreshBounding();
        this.updateItems(this.node);
        this.refresh(this.node);

    }
}

class ChangeInduceCommand extends Command {
    constructor(induce, oldData, newData) {
        super('changeInduceCommand');
        this.induce = induce;
        this.oldData = oldData;
        this.newData = newData;
    }
    execute() {
        this.induce.setData(this.newData);
        this.induce.refresh();
        this.refresh(this.induce.node);
    }

    undo() {
        this.induce.setData(this.oldData);
        this.induce.refresh();
        this.refresh(this.induce.node);
    }
}

class AddCallout extends Command {

    constructor(callout) {
        super('addCallout');
        this.callout = callout;
        this.mind = callout.node.getMind();
        this.num = 1;
    }

    execute() {
        this.mind.addCallout(this.callout);
        if (this.num != 1) {
            this.callout.init();
            this.mind.el.appendChild(this.callout.root.dom);
        }
        this.callout.node.callout = this.callout;
        this.num++;
        this.updateItems(this.callout.node);
        this.refresh(this.callout.node);
    }

    undo() {
        this.mind.removeCallout(this.callout);
        this.mind.el.removeChild(this.callout.root.dom);
        this.callout.off();
        this.callout.remove();
        this.callout.node.callout = null;
        this.callout.node._refreshBounding();
        this.updateItems(this.callout.node);
        this.refresh(this.callout.node);
    }
}

class RemoveCallout extends Command {

    constructor(callout) {
        super('RemoveCallout');
        this.callout = callout;
        this.mind = callout.node.getMind();
    }

    execute() {
        this.mind.el.removeChild(this.callout.root.dom);
        this.mind.removeCallout(this.callout);
        this.callout.node._refreshBounding();
        this.callout.off();
        this.callout.node.callout = null;
        this.updateItems(this.callout.node);
        this.refresh(this.callout.node);
    }

    undo() {
        this.mind.addCallout(this.callout);
        this.mind.el.appendChild(this.callout.root.dom)
        this.callout.init();
        this.callout.node.callout = this.callout;
        this.callout.node._refreshBounding();
        this.updateItems(this.callout.node);
        this.refresh(this.callout.node);
    }
}

class ChangeCallout extends Command {

    constructor(callout, oldpos, newpos) {
        super('changeCallout');
        this.callout = callout;
        this.oldPos = oldpos;
        this.newPos = newpos;
    }

    execute() {
        this.callout.root.setPosition(this.newPos.x, this.newPos.y);
        this.callout.refresh();
        this.refresh(this.callout.node);
    }

    undo() {
        this.callout.root.setPosition(this.oldPos.x, this.oldPos.y);
        this.callout.refresh();
        this.refresh(this.callout.node);
    }
}

//many command
class ManyCommand extends Command {

    constructor(cmd) {
        super('manyCmd');
        this.cmd = cmd;
    }

    execute() {
        this.cmd.forEach(cmd => cmd.execute())
        if (this.cmd[0].node) {
            this.refresh(this.cmd[0].node)
        }
    }

    undo() {
        this.cmd.forEach(cmd => cmd.undo());
        if (this.cmd[0].node) {
            this.refresh(this.cmd[0].node)
        }
    }

}

//node to free root
class ChangeNodeToFreeRoot extends Command {

    constructor(node) {
        super('changeNodeToFreeRoot');
        this.node = node;
        this.mind = node.getMind();
        this.pos = this.node.getPosition();
        this.parent = this.node.parent;
        this.node.data.main = false;
        if (this.node.layout) {
            this.node._isRoot = true;
        } else {
            this.node._isRoot = false;
        }
    }

    execute() {
        var me = this;
        this.node._refreshBounding();
        if (this.parent) {
            var wfs = this.parent.wireFrames;
            var summaries = this.parent.summaries;
        }

        this.cacheInfo = {
            wfs: [],
            induces: []
        };

        //cache data
        wfs && wfs.forEach(wf => {
            if (wf.node == wf.endNode) {
                // if(wf.node==me.node){
                //     me.mind.removeWireFrame(wf);
                //     me.cacheInfo.wfs.push({
                //         item:wf,
                //         type:'remove'
                //     });
                // }
                if (wf.node == me.node) {
                    var p = wf.node.parent;
                    var j = p.wireFrames.indexOf(wf);
                    p.wireFrames.splice(j, 1);
                    wf.node.wireFrame = wf;
                    me.cacheInfo.wfs.push({
                        item: wf,
                        type: 'toFreeRoot'
                    });
                }

            } else {
                if (wf.rangeNode.indexOf(me.node) > -1) {
                    if (wf.rangeNode[0] == me.node) {
                        me.node.wfs.splice(me.node.wfs.indexOf(wf), 1);
                        var oldRange = wf.rangeNode.slice();
                        wf.rangeNode.shift();
                        wf.rangeNode[0].wfs.push(wf);
                        me.cacheInfo.wfs.push({
                            item: wf,
                            type: 'changeRangeNode-start',
                            oldRange,
                            newRange: wf.rangeNode.slice()
                        });

                    }
                    else if (wf.rangeNode[wf.rangeNode.length - 1] == me.node) {
                        var oldRange = wf.rangeNode.slice();
                        wf.rangeNode.pop();
                        me.cacheInfo.wfs.push({
                            item: wf,
                            type: 'changeRangeNode-end',
                            oldRange,
                            newRange: wf.rangeNode.slice()
                        });
                    }
                    else {
                        var oldRange = wf.rangeNode.slice();
                        var k = wf.rangeNode.indexOf(me.node);
                        wf.rangeNode.splice(k, 1);
                        me.cacheInfo.wfs.push({
                            item: wf,
                            type: 'changeRangeNode',
                            oldRange,
                            newRange: wf.rangeNode.slice(),
                            num: k
                        });
                    }
                }
            }
        });

        summaries && summaries.forEach(induce => {
            if (induce.node == induce.endNode) {
                if (induce.node == me.node) {
                    me.mind.removeInduce(induce);
                    me.cacheInfo.induces.push({
                        item: induce,
                        type: 'remove'
                    });
                    me.mind.removeNode(induce.root);
                }
            }
            else {
                if (induce.rangeNode.indexOf(me.node) > -1) {
                    if (induce.rangeNode[0] == me.node) {
                        me.node.induces.splice(me.node.induces.indexOf(wf), 1);
                        var oldRange = induce.rangeNode.slice();
                        induce.rangeNode.shift();
                        induce.rangeNode[0].induces.push(wf);
                        me.cacheInfo.induces.push({
                            item: induce,
                            type: 'changeRangeNode-start',
                            oldRange,
                            newRange: wf.rangeNode.slice()
                        });
                    }
                    else if (induce.rangeNode[induce.rangeNode.length - 1] == me.node) {
                        var oldRange = induce.rangeNode.slice();
                        induce.rangeNode.pop();
                        me.cacheInfo.induces.push({
                            item: induce,
                            type: 'changeRangeNode-end',
                            oldRange,
                            newRange: induce.rangeNode.slice()
                        });

                    } else {
                        var oldRange = induce.rangeNode.slice();
                        var k = induce.rangeNode.indexOf(me.node);
                        induce.rangeNode.splice(k, 1);
                        me.cacheInfo.induces.push({
                            item: induce,
                            type: 'changeRangeNode',
                            oldRange,
                            newRange: induce.rangeNode.slice(),
                            num: k
                        });
                    }
                }
            }
        });

        if (this.parent) {
            this.index = this.parent.removeChild(this.node);
        }
        this.node.parent = null;
        this.mind.addFreeNode(this.node);
        this.mind.traverseDF(n => {
            n.boundingRect = null;
        }, this.node);
        this.node.nodeType = 'freeNode';
        this.node.setPosition(this.pos.x, this.pos.y);

        this.updateItems(this.parent);
        this.updateItems(this.node);
        this.parent._refreshBounding();

        this.refresh(this.parent);
        this.refresh(this.node);
    }

    undo() {

        var me = this;
        this.mind.removeFreeNode(this.node);
        this.node.layout.group.clear();
        this.node.nodeType = 'richText';
        if (this.parent) {
            this.parent.addChild(this.node, this.index);
        }
        this.node._refreshBounding();
        this.mind.traverseDF(n => {
            n.boundingRect = null;
        }, this.node);

        if (!this.node._isRoot) {
            this.node.layout.group && this.node.layout.group.remove();
            this.node.layout = null;
        }

        //changed wireFrame and induce
        this.cacheInfo && this.cacheInfo.wfs.forEach(data => {
            if (data.type == 'toFreeRoot') {
                var p = data.item.node.parent;
                if (p) {
                    p.wireFrames.push(data.item);
                    p.wireFrames.unique();
                    p.wireFrames.sort(function (a, b) {
                        return a.rangeNode.length - b.rangeNode.length;
                    })
                }
                data.item.node.wireFrame = null;
            }
            if (data.type == 'remove') {
                me.mind.addWireFrame(data.item)
                data.item.init();
            }
            if (data.type == 'changeRangeNode-start') {
                me.node.wfs.push(data.item);
                var s = data.item.rangeNode[0];
                s.wfs.splice(s.wfs.indexOf(data.item), 1);
                data.item.rangeNode = data.oldRange;
            }

            if (data.type == 'changeRangeNode-end' || data.type == 'changeRangeNode') {
                data.item.rangeNode = data.oldRange;
            }
        });

        this.cacheInfo && this.cacheInfo.induces.forEach(data => {
            if (data.type == 'remove') {
                me.mind.addInduce(data.item)
                data.item.init();
                this.mind.traverseDF(n => {
                    this.mind._addNodeDom(n);
                }, data.item.root);
            }
            if (data.type == 'changeRangeNode-start') {
                me.node.induces.push(data.item);
                var s = data.item.rangeNode[0];
                s.induces.splice(s.induces.indexOf(data.item), 1);
                data.item.rangeNode = data.oldRange;
            }

            if (data.type == 'changeRangeNode-end' || data.type == 'changeRangeNode') {
                data.item.rangeNode = data.oldRange;
            }
        });

        this.updateItems(this.node);
        this.refresh(this.node);
    }

}

class ChangeFreeRootToNode extends Command {
    constructor(node, parent) {
        super('changeFreeRootToNode');
        this.node = node;
        this.pos = this.node.getPosition();
        this.parent = parent;
        this.mind = this.node.getMind();
        this.oldLayout = this.node.layout;
    }
    execute() {
        this.mind.removeFreeNode(this.node);
        this.node.layout.group && this.node.layout.group.clear();
        this.node.nodeType = 'richText';
        this.parent.addChild(this.node);
        this.node._refreshBounding();

        if (this.node.wfs.length) {
            var p = this.node.parent;
            if (p) {
                p.wireFrames.push(this.node.wfs[0]);
                p.wireFrames.unique();
                p.wireFrames.sort(function (a, b) {
                    return a.rangeNode.length - b.rangeNode.length;
                });
            }
            this.rootWf = this.node.wfs[0];
            this.node.wireFrame = null;
        }

        this.updateItems(this.node);
        this.refresh(this.node);
    }
    undo() {
        this.node.layout = this.oldLayout;
        this.node._refreshBounding();
        this.mind.addFreeNode(this.node);
        this.node.nodeType = 'freeNode';
        this.parent.removeChild(this.node);
        this.node.setPosition(this.pos.x, this.pos.y);

        if (this.rootWf) {
            var p = this.rootWf.node.parent;
            if (p) {
                p.wireFrames.splice(p.wireFrames.indexOf(this.rootWf), 1);
            }
            this.rootWf.node.wireFrame = this.rootWf;
            this.rootWf = null;
        }

        this.updateItems(this.parent);
        this.updateItems(this.node);
        this.refresh(this.parent);
        this.refresh(this.node);
    }
}

class MoveNode extends Command {

    constructor(data) {
        super('moveNode');
        this.data = { ...data };

        if (this.data.type.indexOf('child') > -1) {
            this.node = this.data.node;
            this.oldParent = this.data.oldParent;
            this.parent = this.data.parent;
        } else {
            this.node = this.data.node;
            this.oldParent = this.node.parent;
            this.dropNode = this.data.dropNode;
            this.newParent = this.dropNode.parent;
            this.type = this.data.direct;
        }
    }

    execute() {
        if (this.data.type.indexOf('child') > -1) {
            if (this.oldParent) {
                this.index = this.oldParent.removeChild(this.node)
            }
            this.parent.addChild(this.node);
            this.node.getMind().traverseBF(n => {
                n.boundingRect = null;
            }, this.node);

            this.node._refreshBounding();
            this.updateItems(this.parent);
            this.updateItems(this.node);

            this.refresh(this.node);

            if (this.oldParent) {
                this.updateItems(this.oldParent);
                this.refresh(this.oldParent)
            }
        } else {

            if (this.oldParent) {
                this.index = this.oldParent.removeChild(this.node);
            }
            this.node.getMind().traverseBF(n => {
                n.boundingRect = null;
            }, this.node);

            this.node._refreshBounding();
            this.updateItems(this.parent);
            this.updateItems(this.node);
            this.refresh(this.node);

            if (this.oldParent) {
                this.updateItems(this.oldParent);
                this.refresh(this.oldParent)
            }

            var dropNodeIndex = this.newParent.children.indexOf(this.dropNode);

            if (this.type == 'top' || this.type == 'left') {
                this.newParent.addChild(this.node, dropNodeIndex)
            }
            else {
                this.newParent.addChild(this.node, dropNodeIndex + 1);
            }

            this.node._refreshBounding();
            this.updateItems(this.newParent);
            this.updateItems(this.node);
            this.refresh(this.node);
        }
    }

    undo() {
        if (this.data.type.indexOf('child') > -1) {
            this.parent.removeChild(this.node);
            if (this.oldParent) {
                this.oldParent.addChild(this.node, this.index);
            }

            this.node.getMind().traverseBF(n => {
                n.boundingRect = null;
            }, this.node);

            this.parent._refreshBounding();
            this.node._refreshBounding();

            this.updateItems(this.parent);
            this.updateItems(this.node);
            this.refresh(this.parent);
            this.refresh(this.node);
        }
        else {
            this.newParent.removeChild(this.node);
            this.dropNode._refreshBounding();
            this.updateItems(this.dropNode);
            this.refresh(this.dropNode);

            this.oldParent.addChild(this.node, this.index);
            this.updateItems(this.node);
            this.node._refreshBounding();
            this.refresh(this.node);
        }
    }
}

class MovePos extends Command {

    constructor(node, oldPos, newPos) {
        super('movePos');
        this.node = node;
        this.oldPos = oldPos;
        this.newPos = newPos;
    }

    execute() {
        this.node.setPosition(this.newPos.x, this.newPos.y);
        this.refresh(this.node);
    }

    undo() {
        this.node.setPosition(this.oldPos.x, this.oldPos.y);
        this.refresh(this.node);
    }
}


class ExpandNode extends Command {

    constructor(node) {
        super('expandNode');
        this.node = node;

    }

    execute() {
        this.node._refreshBounding();
        this.node.expand();
        this.updateItems(this.parent);
        this.updateItems(this.node);
        this.refresh(this.node);
    }

    undo() {
        this.node._refreshBounding();
        this.node.collapse();
        this.updateItems(this.node);
        this.refresh(this.node);
    }
}

class CollapseNode extends Command {

    constructor(node) {
        super('collapseNode');
        this.node = node;
    }

    execute() {
        this.node._refreshBounding();
        this.node.collapse();
        this.updateItems(this.node);
        this.refresh(this.node);
    }

    undo() {
        this.node._refreshBounding();
        this.node.expand();
        this.updateItems(this.node);
        this.refresh(this.node);
    }

}

class ChangeLayout extends Command {

    constructor(node, layout) {
        super();
        this.node = node;
        this.layout = layout;
        this.oldLayout = this.node.layout;
    }

    execute() {
        this.node.layout = this.layout;
        if (this.oldLayout) {
            this.oldLayout.group && this.oldLayout.group.remove();
            this.oldLayout.group = null;
        }
        this.node._refreshBounding();
        this.node.getMind().traverseBF(n => {
            n.boundingRect = null;
        }, this.node);

        if (this.node.wfs) {
            this.node.wfs.forEach(w => {
                w.refreshItems();
                w.refresh();
            });
            if (this.node.induces) {
                this.node.induces.forEach(su => {
                    su.refreshItems();
                    su.refresh();
                });
            }
        }
        this.refresh(this.node);
    }

    undo() {
        this.node.layout = this.oldLayout;
        if (this.layout) {
            this.layout.group && this.layout.group.remove();
            this.layout.group = null;
        }
        this.node.getMind().traverseBF(n => {
            n.boundingRect = null;
        }, this.node);
        this.node._refreshBounding();
        this.refresh(this.node)
    }
}

class AddNodeMark extends Command {

    constructor(node, mark) {
        super('addNodeMark');
        this.node = node;
        this.mark = mark;
    }

    execute() {
        this.node.addMark(this.mark);
        this.node.initMark();
        this.node.refreshBox();
        this.node._refreshBounding();
        this.refresh(this.node)
    }

    undo() {
        this.node.removeMark(this.mark);
        this.node.initMark();
        this.node.refreshBox();
        this.node._refreshBounding();
        this.refresh(this.node)
    }
}

class RemoveNodeMark extends Command {

    constructor(node, mark) {
        super('removeNodeMark');
        this.node = node;
        this.mark = mark;
    }

    execute() {
        this.node.removeMark(this.mark);
        this.node.initMark();
        this.node.refreshBox();
        this.node._refreshBounding();
        this.refresh(this.node);
    }

    undo() {
        this.node.addMark(this.mark);
        this.node.initMark();
        this.node.refreshBox();
        this.node._refreshBounding();
        this.refresh(this.node)
    }

}

class ChangeMark extends Command {

    constructor(node, mark) {
        super('changeMark');
        this.node = node;
        this.mark = mark;
        this.mind = this.node.getMind();
        this.oldFill = null;
    }

    execute() {
        this.changeMark(this.mark.fill);
    }

    undo() {
        this.changeMark(this.oldFill);
    }

    changeMark(fill) {
        var me = this;
        this.mind.traverseDF(n => {
            var marks = n.data.marks;
            marks.length && marks.forEach(mark => {
                if (mark.id == me.mark.id) {
                    me.oldFill = mark.fill;
                    mark.fill = fill;
                }
            });
            n.initMark();
        });
    }
}

class ChangeTheme extends Command {

    constructor(mind, oldTheme, theme) {
        super('changeTheme');
        this.mind = mind;
        this.oldTheme = oldTheme;
        this.theme = theme;
    }

    execute() {
        this.mind.changeTheme(this.theme)
    }

    undo() {
        this.mind.changeTheme(this.oldTheme);
    }

}

class ChangeStroke extends Command {

    constructor(nodes, layout, topLayout) {
        super('changeStroke');
        this.nodes = nodes;
        this.layout = layout;
        this.topLayout = topLayout;
    }

    execute() {
        this.nodes.forEach(n => {
            n.node.stroke = n.stroke;
        });

        if (this.topLayout) {
            this.topLayout.createLink();
        } else {
            this.layout && this.layout.createLink();
        }
    }

    undo() {
        this.nodes.forEach(n => {
            n.node.stroke = n.oldStroke;
        });

        if (this.topLayout) {
            this.topLayout.createLink();
        } else {
            this.layout && this.layout.createLink();
        }
    }
}

class ChangeRangeNode extends Command {

    constructor(item, oldR, newR) {
        super('changeRangeNode');
        this.item = item;
        this.old = oldR;
        this.new = newR;
    }

    pre() {
        var n = this.old[0];
        if (this.item.name == 'wireFrame') {
            n.wfs.splice(n.wfs.indexOf(this.item), 1);
        } else {
            n.induces.splice(n.induces.indexOf(this.item), 1);
        }
    }

    execute() {
        this.pre();
        this.item.rangeNode = this.new;
        this.item.node = this.new[0];
        this.item.endNode = this.new[this.new.length - 1];
        if (this.item.name == 'wireFrame') {
            this.new[0].wfs.push(this.item);
            this.new[0].wfs.unique();
        } else {
            this.new[0].induces.push(this.item);
            this.new[0].induces.unique();
        }

        this.old.forEach(n => {
            n._refreshBounding();
        });

        this.new.forEach(n => {
            n._refreshBounding();
        });

        this.updateItems(this.item.node);
        this.refresh(this.item.node);
    }

    undo() {
        if (this.item.name == 'wireFrame') {
            this.new[0].wfs.splice(this.new[0].wfs.indexOf(this.item), 1);
            this.new[0].wfs.unique();
        } else {
            this.new[0].induces.splice(this.new[0].induces.indexOf(this.item), 1);
            this.new[0].induces.unique();
        }

        this.item.rangeNode = this.old;
        this.item.node = this.old[0];
        this.item.endNode = this.old[this.old.length - 1];

        if (this.item.name == 'wireFrame') {
            this.old[0].wfs.push(this.item);
            this.old[0].wfs.unique();
        } else {
            this.old[0].induces.push(this.item);
            this.old[0].induces.unique();
        }

        this.new.forEach(n => {
            n._refreshBounding();
        });

        this.old.forEach(n => {
            n._refreshBounding();
        });

        this.updateItems(this.item.node);
        this.refresh(this.item.node);
    }
}


class RelateHideNode extends Command {

    constructor(relate) {
        super('hideRelateNode');
        this.relateLink = relate;
    }

    execute() {
        this.relateLink.data.nodeHide = true;
        this.relateLink.startNode.getMind().updateRelateLink();
    }

    undo() {
        this.relateLink.data.nodeHide = false;
        this.relateLink.startNode.getMind().updateRelateLink();
    }
}

class CopyNode extends Command {

    constructor(node) {
        super('copyNode');
        this.node = node;
        this.mind = this.node.mind;
        this.waitCollapse = [];
        this.lastNode = null;
    }

    execute() {
        if (!this.node.data.isRoot) {
            var p = this.node.parent;
            this.copyNode(this.node, p, true);
            this.waitCollapse.forEach(n => {
                n.collapse();
            });

            if (this.lastNode) {
                this.lastNode._refreshBounding();
                this.updateItems(this.lastNode);
                this.refresh(this.lastNode);
            }
        }
    }

    undo() {
        if (!this.node.data.isRoot) {
            if (this.copy) {
                this.mind.removeNode(this.copy);
                this.updateItems(this.node);
                this.refresh(this.node);
            }
        }
    }

    copyNode(node, parent, first) {
        var d = { ...{}, ...node.getData() };
        d.id = uuid();
        var n = new Node(d, this.mind);
        if (!node.isExpanded) {
            this.waitCollapse.push(n);
        }
        if (first) {
            this.copy = n;
            var index = parent.children.indexOf(node);
            parent.addChild(n, index + 1);
        } else {
            parent.addChild(n);
        }
        this.lastNode = n;
        if (node.children && node.children.length) {
            node.children.forEach(c => {
                this.copyNode(c, n);
            });
        }
    }
}

class PasteNode extends Command {

    constructor(node, data) {
        super('copyNode');
        this.node = node;
        this.data = data;
        this.mind = this.node.mind;
        this.waitCollapse = [];
    }

    execute() {
        this.paste();
    }

    undo() {
        if (this.firstNode) {
            this.mind.removeNode(this.firstNode);
            this.node._refreshBounding();
            this.updateItems(this.node);
            this.refresh(this.node);
        }
    }

    paste() {
        this.data.forEach((d, i) => {
            var n = new Node(d, this.mind);
            n.mind = this.mind;
            if (!d.isExpanded) {
                this.waitCollapse.push(n);
            }
            if (i == 0) {
                var len = this.node.children.length;
                this.node.addChild(n, len);
                this.firstNode = n;
                n.data.pid = this.node.getId();
            }
            else {
                var parent = this.mind.getNodeById(d.pid);
                if (parent) {
                    parent.addChild(n);
                }
            }

            if (i == this.data.length - 1) {
                n._refreshBounding();
                this.updateItems(n);
                this.refresh(n);
            }
        });
    }
}

class ChangeMarker extends Command {
    constructor(link, pos, type, oldType) {
        super('changeMarker');
        this.link = link;
        this.pos = pos,
            this.type = type;
        this.oldType = oldType;
    }

    execute() {
        if (this.pos == 'start') {
            if (this.link) {
                this.link.data.startMarker = this.type;
            }
        } else {
            this.link.data.endMarker = this.type;
        }
        this.link.createMarker();
    }

    undo() {
        if (this.pos == 'start') {
            if (this.link) {
                this.link.data.startMarker = this.oldType
            }
        } else {
            this.link.data.endMarker = this.oldType
        }
        this.link.createMarker();
    }
}


export {
    AddNode,
    AddParentNode,
    RemoveNode,
    ChangeNodeTodo,
    ChangeNode,
    AddRelateLink,
    AddWireFrame,
    RemoveWireFrame,
    ChangeWireFrame,
    AddInduce,
    RemoveInduceCommand,
    AddCallout,
    ManyCommand,
    RemoveCallout,
    ChangeNodeToFreeRoot,
    MovePos,
    ChangeFreeRootToNode,
    MoveNode,
    ChangeRelateLinkBox,
    ExpandNode,
    CollapseNode,
    ChangeCallout,
    ChangeLayout,
    AddNodeMark,
    RemoveNodeMark,
    ChangeMark,
    ChangeTheme,
    ChangeStroke,
    ChangeNodeText,
    ChangeRangeNode,
    RelateHideNode,
    CopyNode,
    ChangeMarker,
    PasteNode
}