import Node from './node'
import theme from './theme'
import * as cmd from './command/cmd';

import Stack from './command/stack'
import uuid from './uuid.js'
import SVG from 'svg.js'

import WireFrame from './assist/wireFrame'
import Induce from './assist/induce'

import Callout from './assist/callout'
import RelateLink from './assist/relateLink'

import layoutMap from './layout/layoutMap'
import i18n from '../locales/index';

import parseHtml from './parseHtml'
import $ from 'jquery';



class Mind {

    constructor(data) {
        this.data = data;
        this.el = document.getElementById(this.data.el);
        this.el.mind = this;
        this.root = null;
        this.themeName = 'blue';

        this.edges = [];

        this.induces = [];
        this.wireFrames = [];
        this.relateLinks = [];
        this.freeNodes = []; //free root
        this.callouts = [];
        this.marks = []; //tags

        this.induceRoot = []; //temp store

        this.scaleNum = 1; //scale num
        this.useMarkDown = false;
        this.refreshTime = null;
        
        //300 history num
        this.stack = new Stack(300);
        this.draw = SVG(this.el).size('100%', '100%');
        this.wireFrameGroup = this.draw.group();
        this.edgeGroup = this.draw.group();
        this.shapeGroup = this.draw.group();
        this.induceGroup = this.draw.group();
        this.relateGroup = this.draw.group();
        this.calloutGroup = this.draw.group();
        this.fishTailGroup = this.draw.group();

        this.stackChange();
        this.initEvent();
    }

    dirty() {
        return this.stack.dirty();
    }

    save() {
        this.stack.save();
    }

    stackChange() {
        var me = this;

        function refresh(node) {
            var mind = node.getMind();
            if (node) {
                var layout = null;
                var anchor = node;
                while (anchor) {
                    if (anchor.layout) {
                        layout = anchor.layout;
                    }
                    if (anchor.belongInduce) {
                        anchor = anchor.belongInduce.node;
                    } else {
                        anchor = anchor.parent;
                    }
                }
                layout && layout.refresh();
            }

            mind.updateRelateLink();

            if (mind.induces.length == 0) {
                return;
            }
            mind.induces.forEach(induce => {
                induce.root.layout.createLink();
            });
        }

        this.on('refresh', (e) => {
            if (me.initialize) {
                me.refreshTime && clearTimeout(me.refreshTime);
                me.refreshTime = setTimeout(() => {
                     if(e&&e.detail){
                        refresh(e.detail.node);
                     }
                }, 100)
            } else {
                if(e&&e.detail){
                    refresh(e.detail.node);
                }
                
            }

            this.emit('needsave');
        });
    }

    addMark(data) {
        var mark = this.marks.filter(item => item.text == data.text)[0];
        if (!mark) this.marks.push(data);
    }

    removeMark(mark) {
        if (mark) {
            var k = -1;
            this.marks.forEach((m, i) => {
                if (m.id == mark.id) {
                    k = i;
                }
            });
            return this.marks.splice(k, 1);
        }
    }

    getMark() {
        return this.marks;
    }

    getNodeThemeStyle(node, level) {
        var style = {};
        var config = theme.use().config;
        if (node) {
            level = node.getLevel();
        }
        if (level == 0) {
            style['backgroundColor'] = config['main-root-fill'];
            style['color'] = config['main-root-textFill'];
            style['fontSize'] = config['main-root-fontSize'];
            style['paddingLeft'] = config['main-root-textPadding'][0];
            style['paddingRight'] = config['main-root-textPadding'][0];
            style['paddingTop'] = config['main-root-textPadding'][1];
            style['paddingBottom'] = config['main-root-textPadding'][1];
        } else if (level == 1) {
            style['backgroundColor'] = config['second-node-fill'];
            style['color'] = config['second-node-textFill'];
            style['fontSize'] = config['second-node-fontSize'];
            style['paddingLeft'] = config['second-node-textPadding'][0];
            style['paddingRight'] = config['second-node-textPadding'][0];
            style['paddingTop'] = config['second-node-textPadding'][1];
            style['paddingBottom'] = config['second-node-textPadding'][1];
        } else {
            style['backgroundColor'] = config['node-fill'];
            style['color'] = config['node-textFill'];
            style['fontSize'] = config['node-fontSize'];
            style['paddingLeft'] = config['node-textPadding'][0];
            style['paddingRight'] = config['node-textPadding'][0];
            style['paddingTop'] = config['node-textPadding'][1];
            style['paddingBottom'] = config['node-textPadding'][1];
        }

        return style;
    }

    //execute cmd  save to stack    
    execute(name, data) {
        var me = this;
        switch (name) {
            case 'addChildNode':
                var d = {
                    id: uuid(),
                    text: data.text || i18n.t('node.subTopic')
                }

                d = {
                    ...d,
                    ...this.getNodeThemeStyle(null, data.parent.getLevel() + 1)
                }

                var node = new Node(d, this);

                if (data.parent.layout) {
                    var layout = data.parent.getLayout();
                    node.direct = layout.direct;
                } else {
                    node.direct = data.parent.direct;
                }

                node.stroke = data.parent.stroke;

                node.dom.classList = [];
                node.dom.classList.add('node');
                node.dom.classList.add('node-' + node.direct);
                node.dom.classList.add('node-leaf');

                if (!data.parent.isExpand()) {
                    data.parent.expand();
                }

                this.stack.execute(new cmd.AddNode(node, data.parent, this));
                break;

            case 'addSameNode':
                var node = data.parent;
                if (node.parent) {
                    var d = {
                        id: uuid(),
                        text: i18n.t('node.subTopic')
                    }
                    d = {
                        ...d,
                        ...this.getNodeThemeStyle(null, data.parent.getLevel())
                    }
                    var n = new Node(d, this);
                    n.stroke = node.parent.stroke;
                    this.stack.execute(new cmd.AddNode(n, node.parent, this));
                }

                break;

            case 'addParentNode':
                var node = data && data.parent || this.getSelectNode();

                if (node.parent) {
                    var d = {
                        id: uuid(),
                        text: i18n.t('node.subTopic')
                    }
                    d = {
                        ...d,
                        ...this.getNodeThemeStyle(null, node.getLevel())
                    }
                    var n = new Node(d, this);
                    n.stroke = node.parent.stroke;
                    this.stack.execute(new cmd.AddParentNode(node, n, node.parent));
                }

                break;

            case 'deleteNode':
                if (data.parent && data.parent.nodeType == 'callout') {
                    this.stack.execute(new cmd.RemoveCallout(data.parent.callout));
                    return;
                }

                //delete relate link
                if(data.parent){
                   this.stack.execute(new cmd.RemoveNode(data.parent,this));
                   return;
                }

                var nodes = this.getSelectNodes();
                nodes.sort(function (a, b) {
                    return b.getLevel() - a.getLevel();
                });

                if (nodes.length) {
                    var cmds = []
                    nodes.forEach(n => {
                        cmds.push(new cmd.RemoveNode(n, me))
                    });
                }
                if (cmds && cmds.length) {
                    this.stack.execute(new cmd.ManyCommand(cmds));
                }

                break;
            case 'changeNode':
                var key = data.data && data.data.key;
                var nodes = data.nodes || this.getSelectNodes();
                //change Text -------> frequent change
                if (key == 'text') {
                    var c = new cmd.ChangeNodeText(nodes[0], data.data.oldText, data.data.text);
                    this.stack.execute(c);
                    return;
                }
                //change Style  ------> occasional change
                var cmds = [];
                nodes.forEach(n => {
                    var oldData = n.getData();
                    var newData = {
                        ...oldData,
                        ...data.data || {}
                    };
                    if (data.data.size) { //change node size
                        switch (data.data.size) {
                            case 'tiny small':
                                newData = {
                                    ...oldData,
                                    ...{
                                        paddingLeft: 6,
                                        paddingRight: 6,
                                        paddingBottom: 3,
                                        paddingTop: 3,
                                    }
                                };
                                break;
                            case 'small':
                                newData = {
                                    ...oldData,
                                    ...{
                                        paddingLeft: 8,
                                        paddingRight: 8,
                                        paddingBottom: 4,
                                        paddingTop: 4,
                                    }
                                };
                                break;
                            case 'normal':
                                newData = {
                                    ...oldData,
                                    ...{
                                        paddingLeft: 10,
                                        paddingRight: 10,
                                        paddingBottom: 6,
                                        paddingTop: 6,
                                    }
                                };
                                break;
                            case 'big':
                                newData = {
                                    ...oldData,
                                    ...{
                                        paddingLeft: 14,
                                        paddingRight: 14,
                                        paddingBottom: 10,
                                        paddingTop: 10,
                                    }
                                };
                                break;
                            case 'bigger':
                                newData = {
                                    ...oldData,
                                    ...{
                                        paddingLeft: 20,
                                        paddingRight: 20,
                                        paddingBottom: 12,
                                        paddingTop: 12,
                                    }
                                };
                                break;
                        }
                    }
                    cmds.push(new cmd.ChangeNode(n, oldData, newData, false));
                });

                if (cmds.length) {
                    this.stack.execute(new cmd.ManyCommand(cmds));
                }

                break;
            case 'addNodes': //drag from browser
                var nodeData = data.nodeData;
                if (nodeData && nodeData.length) {
                    if (data.parent) {
                        var cmds = [];
                        nodeData.forEach(d => {
                            d = {
                                ...d,
                                ...this.getNodeThemeStyle(null, data.parent.getLevel() + 1)
                            };
                            var node = new Node(d, this);
                            if (data.parent.layout) {
                                var layout = data.parent.getLayout();
                                node.direct = layout.direct;
                            } else {
                                node.direct = data.parent.direct;
                            }
                            node.stroke = data.parent.stroke;
                            node.dom.classList = [];
                            node.dom.classList.add('node');
                            node.dom.classList.add('node-' + node.direct);
                            node.dom.classList.add('node-leaf');
                            cmds.push(new cmd.AddNode(node, data.parent, this))
                        });

                        if (data.parent.dom.classList.contains('node-leaf')) { //remove parent node class node-leaf
                            data.parent.dom.classList.remove('node-leaf');
                        }
                        if (!data.parent.isExpand()) { //expan parent node
                            data.parent.expand();
                        }

                        if (cmds.length) {
                            this.stack.execute(new cmd.ManyCommand(cmds));
                        }
                    }
                }

                break;
            case 'changeNodeToFreeRoot':
                if (data.node) {
                    data.node && (data.node.setPosition(data.x, data.y));
                    this.stack.execute(new cmd.ChangeNodeToFreeRoot(data.node));
                }
                break;
            case 'changeFreeRootToNode':
                if (data.node && data.node.nodeType == 'freeNode') {
                    this.stack.execute(new cmd.ChangeFreeRootToNode(data.node, data.parent));
                }
                break;
            case 'moveNode':
                if (data.node) {
                    this.stack.execute(new cmd.MoveNode(data));
                }
                break;
            case 'movePos':
                if (data.node) {
                    var oldPos = data.oldPos,
                        newPos = data.newPos;
                    this.stack.execute(new cmd.MovePos(data.node, oldPos, newPos))
                }
                break;
            case 'selectAll':
                var me = this;
                setTimeout(() => {
                    this.traverseDF((n) => {
                        if (n.isShow()) {
                            n.select();
                        }
                    });
                    me.emit('selectNodes');

                }, 0)
                break;
            case 'selectChild':
                var me = this;
                this.clearSelectNode();
                data.parent.unSelect();
                setTimeout(() => {
                    me.traverseBF((n) => {
                        if (n != data.parent) {
                            if (n.isShow()) {
                                n.select();
                            }
                        }
                    }, data.parent);
                    me.emit('selectNodes');
                }, 0)
                break;
            case 'selectSameLevelNode':
                this.clearSelectNode();
                var me = this;
                var node = data.parent;
                setTimeout(() => {
                    if (node.parent) {
                        node.parent.children.forEach(child => {
                            if (child.isShow()) {
                                child.select()
                            }
                        })
                        me.emit('selectNodes');
                    }
                }, 0)

                break;
            case 'changeTodo':
                this.stack.execute(new cmd.ChangeNodeTodo(data.parent));
                break;
            case 'addRelateLink':
                this.stack.execute(new cmd.AddRelateLink(data.link));
                break;
            case 'addWireFrame':
                var config = theme.use().config;
                var fill = config['wireFrame-fill'];
                var stroke = config['wireFrame-stroke'];
                this.stack.execute(new cmd.AddWireFrame(new WireFrame(data.parent, fill, stroke, ''), this))
                break;
            case 'changeWireFrame':
                var oldData = data.wireFrame.getData();
                var newData = {
                    ...oldData,
                    ...data.newData
                };
                this.stack.execute(new cmd.ChangeWireFrame(data.wireFrame, oldData, newData));
                break;
            case 'addInduce':
                var config = theme.use().config;
                var fill = config['induce-fill'];
                var stroke = config['induce-stroke'];
                var root = new Node({
                    backgroundColor: fill,
                    rootType: 'induce',
                    isRoot: true,
                    main: false,
                    text: 'Summary'
                }, this);

                var direct = data.parent.direct;

                if (direct == 'right' || direct == "left") {
                    root.layout = new layoutMap['minder1']();
                    root.data.layoutName = "minder";
                    root.layout.direct = direct;
                    root.layout.root = root;
                } else {
                    root.layout = new layoutMap['tree']();
                    root.data.layoutName = "tree";
                    root.layout.direct = direct;
                    root.layout.root = root;
                }
                root.layout.layout(root, direct);
                this.stack.execute(new cmd.AddInduce(data.parent, new Induce(data.parent, root, stroke)))
                break;
            case 'addCallout':
                if (data.parent && !data.parent.callout) {
                    this.stack.execute(new cmd.AddCallout(new Callout(data.parent)));
                }
                break;
            case 'changeRelateLink':
                this.stack.execute(new cmd.ChangeRelateLinkBox(data.link, data.data.oldBox, data.data.box));
                break;
            case 'changeMarker':
                this.stack.execute(new cmd.ChangeMarker(data.link, data.pos, data.type, data.oldType))
                break;

            case 'expandNode':
                this.stack.execute(new cmd.ExpandNode(data.node || data.parent))
                break;
            case 'collapseNode':
                this.stack.execute(new cmd.CollapseNode(data.node || data.parent))
                break;
                // case 'changeCallout':
                //     this.stack.execute(new cmd.ChangeCallout(data.callout,data.oldPos,data.newPos));
                //     break;
            case 'changeLayout':
                this.stack.execute(new cmd.ChangeLayout(data.node, data.layout))
                break;
            case 'addNodeMark':
                this.stack.execute(new cmd.AddNodeMark(data.node, data.mark))
                break;
            case 'removeNodeMark':
                this.stack.execute(new cmd.RemoveNodeMark(data.node, data.mark))
                break;
            case 'changeMark':
                this.stack.execute(new cmd.ChangeMark(data.node, data.mark))
                break;
            case 'changeTheme':
                this.stack.execute(new cmd.ChangeTheme(this, data.oldTheme, data.theme))
                break;
            case 'changeStroke':
                this.stack.execute(new cmd.ChangeStroke(data.nodes, data.layout, data.topLayout));
                break;
            case 'removeWireFrame':
                this.stack.execute(new cmd.RemoveWireFrame(data.wf, this))
                break;
            case 'changeRangeNode':
                this.stack.execute(new cmd.ChangeRangeNode(data.item, data.oldRangeNode, data.newRangeNode));
                break;
            case 'relateHideNode':
                this.stack.execute(new cmd.RelateHideNode(data.relateLink));
                break;
                // case 'autoNumber':
                //     this.stack.execute(new cmd.AutoNumber(data.parent))
                break;
            case 'copyNode':
                this.stack.execute(new cmd.CopyNode(data.node));
                break;
            case 'pasteNode':
                if (data.data && data.node) {
                    this.stack.execute(new cmd.PasteNode(data.node, data.data));
                }
                break;

        }
    }

    addFreeNode(node) {
        if (this.freeNodes.indexOf(node) == -1) {
            this.freeNodes.push(node);

            if (!this.el.contains(node.dom)) {
                this.el.appendChild(node.dom);
            }
            node.nodeType = 'freeNode';
            node.parent = null;
            if (!node.layout) {
                node.layout = new layoutMap['minder2']();
                node.layout.layout(node, node.direct);
            }
        }
    }

    clearEditNode() {
        this.traverseDF(n => {
            n.cancelEdit();
        });
    }

    getNodeDirect(node) {
        if (['right', 'left', 'down', 'up'].indexOf(node.direct) > -1) {
            return node.direct
        } else {
            var p = node.parent;
            if (p) {
                var ppos = p.getPosition();
                var pbox = p.getBox();
                var pos = node.getPosition();
                var box = node.getBox();
                if (ppos.x + pbox.width < pos.x) {
                    return 'right'
                }
                if (pos.x + box.width < ppox.x) {
                    return 'left'
                }

            }
        }
    }

    removeFreeNode(node) {
        var index = this.freeNodes.indexOf(node);
        if (index > -1) {
            this.freeNodes.splice(index, 1);
            node.nodeType = '';
        }
    }

    addWireFrame(w) {
        if (this.wireFrames.indexOf(w) == -1) {
            this.wireFrames.push(w);
            var node = w.node;
            var p = node.parent;

            // var k=p.summaries.indexOf(induce);
            if (p) {
                p.wireFrames.push(w);
                p.wireFrames.unique();
                p.wireFrames.sort(function (a, b) {
                    return a.rangeNode.length - b.rangeNode.length;
                })
            }
            node.wfs.push(w);
        }
    }

    removeWireFrame(w) {
        var i = this.wireFrames.indexOf(w);
        var node = w.node;
        var j = node.wfs.indexOf(w);
        node.wfs.splice(j, 1);
        if (i > -1) {
            this.wireFrames.splice(i, 1);
            var p = node.parent;
            if (p) {
                var k = p.wireFrames.indexOf(w);
                p.wireFrames.splice(k, 1);
            }
            // var k=p.summaries.indexOf(induce);
            w.remove();
        }

    }

    changeWireFrame(wf, data) {
        var d = data.data;
        this.execute('changeWireFrame', {
            wireFrame: wf,
            newData: d
        });
    }

    addCallout(callout) {
        if (this.callouts.indexOf(callout) == -1) {
            this.callouts.push(callout);
        }
    }

    removeCallout(callout) {
        var index = this.callouts.indexOf(callout)
        if (index > -1) {
            callout.remove();
            this.callouts.splice(index, 1);
        }
    }

    getInducesByNode(node) {
        if (!node) return [];
        var induces = [];
        if (node.induce) {
            induces.push(node.induce);
            induces = induces.concat(this.getInducesByNode(node.induce.root));
        };
        node.children.forEach(child => {
            induces = induces.concat(this.getInducesByNode(child))
        });
        return induces;
    }

    expandLevel(level) {
        this.traverseBF(n => {
            if (n.getLevel() < level) {
                n.expand();
                if (n.nodeType == 'induce') {
                    console.log(n.nodeType)
                }
            } else if (n.getLevel() == level) {
                if (!n.isLeaf()) {
                    n.collapse();
                }
            }
        })
    }

    getSecondNodeByNode(node) {
        var root = this.getRootByNode(node);
        if (root) {
            var n = null
            for (let i = 0; i < root.children.length; i++) {
                let index = root.children[i].getNodeList().indexOf(node);
                if (index > -1) {
                    n = root.children[i];
                    break
                }
            }
            return n;
        } else {
            return null;
        }
    }

    getRootByNode(node) {
        var r = null;
        var anchor = node;
        while (anchor) {
            if (anchor.layout) {
                r = anchor;
                break
            }
            anchor = anchor.parent;
        }
        return r;
    }

    addInduce(induce) {
        var i = this.induces.indexOf(induce);
        if (i == -1) {
            this.induces.push(induce);
            this.el.appendChild(induce.root.dom);
            induce.root.mind = this;
            induce.init();
            var node = induce.node;
            var p = node.parent;
            // var k=p.summaries.indexOf(induce);
            p.summaries.push(induce);
            p.summaries.unique();
            node.induces.push(induce);
            // this.induceRoot.push(induce.root);
        }
    }

    removeInduce(induce) {
        var i = this.induces.indexOf(induce);
        if (i > -1) {
            var node = induce.node
            var p = node.parent;
            var k = p.summaries.indexOf(induce);
            p.summaries.splice(k, 1);

            var j = node.induces.indexOf(induce);
            node.induces.splice(j, 1);
            this.induces.splice(i, 1);

            induce.remove();
        }
    }

    getRoot() {
        return this.root;

    }

    getEditNode() {
        var node = null;
        this.traverseDF(n => {
            if (n.isEdit) {
                node = n;
            }
        });
        return node;
    }

    traverseBF(callback, node) {
        var array = [];
        array.push(node || this.root);
        var currentNode = array.shift();
        while (currentNode) {
            for (let i = 0, len = currentNode.children.length; i < len; i++) {
                array.push(currentNode.children[i]);
            }
            callback(currentNode);
            currentNode = array.shift();
        }
    }

    traverseDF(callback, node) {
        function recurse(currentNode) {
            if (currentNode && currentNode.children) {
                for (var i = 0, length = currentNode.children.length; i < length; i++) {
                    recurse(currentNode.children[i]);
                }
                callback(currentNode);
            }
        }
        if (node) {
            recurse(node)
        } else {
            var induceNodes = [];
            this.induces.forEach(induce => {
                induceNodes.push(induce.root);
            });

            var callouts = [];
            this.callouts.forEach(c => {
                callouts.push(c.root);
            });

            var relateLinks = [];
            this.relateLinks.forEach(c => {
                if (c.textNode) {
                    relateLinks.push(c.textNode);
                }
            });
            var wfs = [];
            this.wireFrames.forEach(c => {
                if (c.t) {
                    wfs.push(c.t);
                }
            });
            [this.root].concat(this.freeNodes).concat(induceNodes).concat(callouts).concat(relateLinks).concat(wfs).forEach(n => {
                recurse(n);
            })
        }
    }

    addNode(node, parent, index = -1) {
        if (parent) {
            parent && parent.addChild(node, index);
            if (parent.direct) {
                node.direct = parent.direct;
            }
            if (parent.isTodo()) {
                node.setTodo();
            }
        } else {
            this.root = node;
        }
        this._addNodeDom(node);
        var level = node.getLevel();
        if (level == 0) {
            node.addThemeClass('root');
        } else if (level == 1) {
            node.addThemeClass('second-level');
        }
        node._refreshBounding();
    }
    _refreshBounding(node) {
        var n = node || this.root;
        var anchor = n;
        while (anchor) {
            anchor.boundingRect = null;
            anchor = anchor.parent || (anchor.belongInduce && anchor.belongInduce.node);
        }

        var root = this.getRootByNode(node);
        if (root && root.layout && ['fish', 'time'].indexOf(root.layout.layoutName) > -1) {
            var sn = this.getSecondNodeByNode(node);
            this.traverseBF(n => {
                n.boundingRect = null;
            }, sn)
        }
    }

    addEdge(edge) {
        this.edges.push(edge);
    }

    getNodeById(id) {
        var node = null;
        this.traverseDF(n => {
            if (n.getId() == id) {
                node = n
            }
        });
        return node;
    }

    selectNode(node) {
        if (node) {
            this.clearSelectNode();
            node.select();
        }
    }
    getSelectNodes() {
        var nodes = [];
        this.traverseDF(n => {
            if (n.selected) {
                nodes.push(n)
            }
        })
        return nodes;
    }
    getSelectNode() {
        if (this._selectNode) {
            return this._selectNode;
        }
        var node = null;
        this.traverseDF(n => {
            if (n.selected) {
                node = n;
            }
        });
        return node;
    }

    clearSelectNode() {

        this.emit('hide');

        this.relateLinks.forEach(rl => {
            rl.unactive();
        });

        if (this._selectNode) {
            this._selectNode.unSelect();
            if (this._selectNode.imageMark) this._selectNode.imageMark.remove();
            this._selectNode.imageMark = null;
            this._selectNode = null;
            return;
        }

        this.traverseDF((n) => {
            n.unSelect();
            if (n.imageMark) n.imageMark.remove();
            n.imageMark = null;
        });


        if (this.status != 'addRelate') {
            this.status = '';
        }
    }

    changeStroke(node, type, data) {
        var nodes = [];
        this.traverseBF((n) => {
            var obj = {};
            obj.oldStroke = n.stroke;
            obj.node = n;
            obj.stroke = data.color;
            nodes.push(obj);
        }, node);

        var layout = node.getLayout();
        if (node.layout) {
            var topLayout = node.getTopLayout();
        }
        this.execute('changeStroke', {
            nodes,
            layout,
            topLayout
        });
    }

    changeBackground(type, data) {
        if (type == 'grain') {
            this.useImageBg = true;
            this.el.style.background = "url(" + data.image + ") repeat";
        } else {
            this.useImageBg = false;
            this.el.style.background = data.color;
        }
    }

    changeTheme(name) {
        this.themeName = name;
        this.el.classList.forEach((t, i) => {
            if (t.indexOf('theme') > -1) {
                this.el.classList.remove(t);
            }
        });
        this.el.classList.add('theme-' + name);

        var c = theme.use(name).config;
        this.changeBackground('color', {
            color: c['background']
        });

        this.traverseDF(n => {
            var root = this.getRootByNode(n);

            if (!root) return;
            if (n.getLevel() == 0 && root.data.main) {
                var fill = c['main-root-fill'];
                var stroke = c['main-root-stroke'];
                var textFill = c['main-root-textFill'];
                var fontSize = c['main-root-fontSize'];
                var borderWidth = c['main-root-borderWidth'];
                var textPadding = c['main-root-textPadding'].slice();

            } else if (n.getLevel() == 1 && root.data.main) {
                var fill = c['second-node-fill'];
                var stroke = c['second-node-stroke'];
                var textFill = c['second-node-textFill'];
                var fontSize = c['second-node-fontSize'];
                var textPadding = c['second-node-textPadding'].slice();
            } else if (n.getLevel() == 0 && !root.data.main) {
                var fill = c['free-root-fill'];
                var stroke = c['free-root-stroke'];
                var textFill = c['free-root-textFill'];
                var fontSize = c['free-root-fontSize'];
                var textPadding = c['free-root-textPadding'].slice();
            } else if (n.getLevel() == 1 && !root.data.main) {
                var fill = c['free-second-node-fill'];
                var stroke = c['free-second-node-stroke'];
                var textFill = c['free-second-node-textFill'];
                var fontSize = c['free-second-node-fontSize'];
                var textPadding = c['free-second-node-textPadding'].slice();
            } else if (n.getLevel() > 1) {
                var fill = c['node-fill'];
                var stroke = c['node-stroke'];
                var textFill = c['node-textFill'];
                var fontSize = c['node-fontSize'];
                var textPadding = c['node-textPadding'].slice();
            };


            n.setData({
                backgroundColor: fill,
                borderColor: stroke,
                color: textFill,
                fontSize: fontSize,
                borderWidth: borderWidth || 0,
                paddingLeft: textPadding[0],
                paddingRight: textPadding[0],
                paddingTop: textPadding[1],
                paddingBottom: textPadding[1],
            });



        });


        var wf = {
            stroke: c['wireFrame-stroke'],
            fill: c['wireFrame-fill']
        }

        this.wireFrames.forEach((item) => {
            var data = item.getData();
            item.setData({
                ...data,
                ...wf
            });
        })

        var induce = {
            stroke: c['induce-stroke'],
            fill: c['induce-fill'],
            textFill: c['induce-textFill']
        };

        this.induces.forEach((item) => {

            var data = item.getData();
            item.setData({
                ...data,
                ...induce
            });

        });

        this.refresh();

    }

    getBBox(node) {
        var list = [];
        (function getItem(n) {
            if (n.isShow()) {
                list.push(n);
                if (n.callout && n.callout.isShow) {
                    list.push(n.callout)
                }
                if (n.wireFrames.length) {
                    n.wireFrames.forEach(w => {
                        if (!w.isHide) {
                            list.push(w);
                        }
                    })
                }

                if (n.summaries.length) {
                    n.summaries.forEach(su => {
                        if (su.isShow()) {
                            list = list.concat(su.getAllItem())
                        }
                    });
                }
            }
            if (n.isExpand()) {
                n.children.forEach(c => {
                    getItem(c);
                });
            }
        })(node);
        list.unique();
        return this.getBoundingRect(list);

    }

    getBoundingRect(list) {

        if (list.length) {
            var box = {
                topNode: null,
                bottomNode: null,
                leftNode: null,
                rightNode: null
            };

            list.forEach((item, i) => {

                if (!item) {
                    return;
                }
                if (item.name == 'wireFrame') {
                    var b = item.getBBox();
                } else {
                    var b = item.getBox();
                }

                if (i == 0) {
                    box.x = b.x;
                    box.y = b.y;
                    box.right = b.x + b.width;
                    box.bottom = b.y + b.height;

                    if (item.name == 'node') {
                        box.topNode = item;
                        box.bottomNode = item;
                        box.leftNode = item;
                        box.rightNode = item;
                    }
                } else {
                    if (b.x < box.x) {
                        box.x = b.x
                        if (item.name == 'node') {
                            box.leftNode = item;
                        }
                    }
                    if (b.y < box.y) {
                        box.y = b.y
                        if (item.name == 'node') {
                            box.topNode = item;
                        }
                    }
                    if (b.x + b.width > box.right) {
                        box.right = b.x + b.width;

                        if (item.name == 'node') {
                            box.rightNode = item;
                        }
                    }

                    if (b.y + b.height > box.bottom) {
                        box.bottom = b.y + b.height;
                        if (item.name == 'node') {
                            box.bottomNode = item;
                        }
                    }
                }

            });
            box.width = box.right - box.x;
            box.height = box.bottom - box.y;

            return box;
        }

    }

    getMindBox() {
        var list = [];
        var fish = [];
        this.traverseDF(n => {
            if (n.isShow()) {
                list.push(n);
                if (n.callout) {
                    if (n.callout.isShow) {
                        list.push(n.callout);
                    }
                }
                if (n.wireFrame) {
                    list.push(n.wireFrame)
                }
                if (n.induce) {
                    list.push(n.induce);
                }
                if (n.layout) {
                    if (n.layout.layoutName == 'fish') {
                        fish.push(n.layout)
                    }
                }
            }
        });

        var cbox = this.getBoundingRect(list);

        fish.forEach(g => {
            if (g.layoutName == 'fish') {
                if (g.fishTail) {
                    var b = g.fishTail.bbox();
                    if (b.x < cbox.x) {
                        cbox.x = b.x
                    }
                    if (b.y < cbox.y) {
                        cbox.y = b.y
                    }
                    if (b.x + b.width > cbox.right) {
                        cbox.right = b.x + b.width;
                    }
                    if (b.y + b.height > cbox.bottom) {
                        cbox.bottom = b.y + b.height;
                    }
                    cbox.width = cbox.right - cbox.x;
                    cbox.height = cbox.bottom - cbox.y;
                }
            }
        });


        return cbox;
    }

    removeNode(node) {
        if (node.parent) {
            var p = node.parent;
            var i = node.parent.removeChild(node);
            this._removeChildDom(node);
            this._refreshBounding(p);
            return i;
        } else {
            this._removeChildDom(node);
            return -1;
        }

    }

    _addNodeDom(node) {
        if (!this.el.contains(node.dom)) {
            this.el.appendChild(node.dom);
        }

        if (node.group) {
            if (node.shapeSvg) {
                if (node.shapeSvg._delete) {
                    node.shapeSvg = null;

                    node.initShape();
                    node.refreshShape();
                    node.shapeSvg._delete = false;
                }
            };
        }

        if (node.callout) {
            this.addCallout(node.callout);
            this.el.appendChild(node.callout.root.dom);
            node.callout.init();
        }

        if (node._wireFrames && node._wireFrames.length) {
            node.wireFrames = node._wireFrames.slice();
            node._wireFrames = [];
        }
        if (node.wireFrames.length) {
            node.wireFrames.forEach(wf => {
                this.addWireFrame(wf);
                wf.init();
            });
        }

        if (node._summaries && node._summaries.length) {
            node._summaries.forEach(induce => {
                this.addInduce(induce);
                induce.init();
                this.traverseDF(n => {
                    this._addNodeDom(n);
                }, induce.root)
            });
            node.summaries = node._summaries.slice();
            node._summaries = [];
        }

    }

    _removeChildDom(node) {
        var that = this;
        var rls = [];
        var layout = [];
        this.traverseBF((n) => {

            if (n.layout) {
                layout.push(n.layout);
            }

            if (n.callout) {
                that.removeCallout(n.callout);
                if (that.el.contains(n.callout.root.dom)) {
                    that.el.removeChild(n.callout.root.dom);
                }
                n.callout.remove();
                n.callout.off();
            }

            n._wireFrames = n.wireFrames.slice();
            if (n.wireFrames.length) {
                n.wireFrames.forEach(wf => {
                    that.removeWireFrame(wf);
                });
            }

            n._summaries = n.summaries.slice();
            if (n.summaries.length) {
                n.summaries.forEach(induce => {
                    that._removeChildDom(induce.root);
                    induce.remove();
                });
                n.summaries.forEach(induce => {
                    that.removeInduce(induce);
                });
            }

            for (let i = 0; i < that.relateLinks.length; i++) {
                if (that.relateLinks[i].startNode == n || that.relateLinks[i].endNode == n) {
                    rls.push(that.relateLinks[i]);
                }
            }
            rls.forEach(rl => {
                that.removeRelateLink(rl);
            });


            if (this.el.contains(n.dom)) {
                that.el.removeChild(n.dom);
            }


            if (n.shapeSvg) {
                n.shapeSvg.remove();
                n.shapeSvg._delete = true;
            }

        }, node);

        node._removeLink = rls;
        setTimeout(() => {
            layout.forEach(l => {
                if (l.group) {
                    l.group.clear()
                    l.group.remove();
                    l.group = null;

                }
            })
        }, 0);
    }

    getData(flag, zip, deleteEvent) {
        var me = this;
        this.imageNodes = [];
        var mindData = [];
        var mdata = [];
        this.traverseBF(function (n) {
            var data = n.getData(flag, deleteEvent);
            mdata.push(data);
            if (zip) {
                if (n.data.isImageNode) {
                    if (data.image.startsWith('http')) {
                        return;
                    }
                    var imageData = data.image.replace(/^data:image\/(\w|\+)+;base64,/, "");
                    zip.file(data.id + '-' + data.imageName, imageData, {
                        base64: true
                    });
                    data.image = '';
                }
            }

        }, this.root);

        mindData.push(mdata);

        this.freeNodes.forEach(node => {
            var fdata = [];
            me.traverseBF(function (n) {
                var data = n.getData(flag, deleteEvent);
                fdata.push(data);
                if (zip) {
                    if (n.data.isImageNode) {
                        if (data.image.startsWith('http')) {
                            return;
                        }
                        var imageData = data.image.replace(/^data:image\/(\w|\+)+;base64,/, "");
                        zip.file(data.id + '-' + data.imageName, imageData, {
                            base64: true
                        });
                        data.image = '';
                    }
                }
            }, node);
            mindData.push(fdata);
        });

        var induceData = [];
        var induces = this.getInducesByNode(this.root);
        induces.unique();
        induces.forEach(induce => {
            var obj = {
                induceData: induce.getData(),
            }
            var m = [];
            me.traverseBF(n => {
                var d = n.getData(flag, deleteEvent);
                m.push(d);
                if (zip) {
                    if (n.data.isImageNode) {
                        if (d.image.startsWith('http')) {
                            return;
                        }
                        var imageData = d.image.replace(/^data:image\/(\w|\+)+;base64,/, "");
                        zip.file(d.id + '-' + d.imageName, imageData, {
                            base64: true
                        });
                        d.image = '';
                    }
                }

            }, induce.root);
            obj.mindData = m;
            induceData.push(obj);
        });

        var wireFrameData = [];
        this.wireFrames.forEach(wf => {
            wireFrameData.push(wf.getData());
        });

        var relateLinkData = [];
        this.relateLinks.forEach(wf => {
            relateLinkData.push(wf.getData());
        });

        var calloutData = [];
        this.callouts.forEach(c => {
            calloutData.push(c.getData());
        });

        return {
            theme: theme.use().name,
            mindData,
            induceData,
            wireFrameData,
            relateLinkData,
            calloutData,
            marks: me.marks
        }
    }

    clear() {
        this.relateLinks.forEach(rl => {
            this.removeRelateLink(rl);
        });
        this.callouts.forEach(c => {
            this.removeCallout(c)
        });
        this.wireFrames.forEach(w => {
            this.removeWireFrame(w)
        });
        this.induces.forEach(ind => {
            this.removeInduce(ind);
        });

        this.traverseDF(n => {
            this.removeNode(n);
            n.removeEvent();
        });

        this.edgeGroup.clear();
        this.shapeGroup.clear();
        this.induceGroup.clear();
        this.relateGroup.clear();
        this.calloutGroup.clear();
        this.fishTailGroup.clear();
        this.root = null;
    }
    init(data, imgData) {
        this.initialize = true;
        if (imgData) {
            var images = imgData.img || {};
        }
        var me = this;
        this.themeName = data.theme || 'markdown';
        this.marks = data.marks.slice();
        theme.use(this.themeName);

        this.el.classList.forEach((t, i) => {
            if (t.indexOf('theme') > -1) {
                this.el.classList.remove(t);
            }
        });

        this.el.classList.add('theme-' + this.themeName);

        var mindData = data.mindData;
        var waitCollapseNode = [];

        var box = null;
        this.clear();

        mindData.forEach((data, i) => {
            if (i == 0) {
                data.forEach((d, k) => {
                    if (d.isImageNode) {
                        if (!d.image) {
                            var key = 'images/' + d.id + '-' + d.imageName;
                            d.image = images[key] || images['resources/' + d.imageName];
                        }
                    }

                    if (k == 0) {
                        var node = new Node(d, me);
                        me.addNode(node, null); //主根节点
                    } else {
                        var node = new Node(d, me);
                        var p = me.getNodeById(d.pid)
                        me.addNode(node, p);
                    }

                    if (!d.isExpanded) {
                        waitCollapseNode.push(node);
                    }

                    if (d.x && d.y) {
                        node.setPosition(d.x, d.y);
                    }
                    if (d.boundingRect) {
                        node.boundingRect = d.boundingRect;
                    }

                    if (d.layout) {
                        node.layout = new layoutMap[d.layout.layoutName]();
                        node.layout.direct = d.layout.direct;
                        node.layout.root = node;
                    }

                });


            } else {
                data.forEach((d, k) => {

                    if (d.isImageNode) {
                        if (!d.image) {
                            var key = 'images/' + d.id + '-' + d.imageName;
                            d.image = images[key] || images['resources/' + d.imageName];
                        }
                    }

                    if (k == 0) {
                        var node = new Node(d, me);
                        if (d.layout) {
                            node.layout = new layoutMap[d.layout.layoutName]();
                            node.layout.direct = d.layout.direct;
                            node.layout.root = node;
                        }
                        me.addFreeNode(node);

                    } else {
                        var node = new Node(d, me);
                        var p = me.getNodeById(d.pid);
                        if (d.layout) {
                            node.layout = new layoutMap[d.layout.layoutName]();
                            node.layout.direct = d.layout.direct;
                            node.layout.root = node;
                        }
                        me.addNode(node, p);
                    }

                    if (d.x && d.y) {
                        node.setPosition(d.x, d.y);
                    }

                    if (d.boundingRect) {
                        node.boundingRect = d.boundingRect;
                    }

                    if (!d.isExpanded) {
                        waitCollapseNode.push(node);
                    }

                });
            }
        });

        var induceData = data.induceData;
        induceData && induceData.forEach(data => {

            if (data.induceData.nodeId) {
                var n = me.getNodeById(data.induceData.nodeId);
                var p = n.parent;
                var r = data.induceData.range;
                var ar = r.split(',');
                var rangeNode = []
                p.children.forEach((c, i) => {
                    if (i >= ar[0] && i <= ar[1]) {
                        rangeNode.push(c);
                    }
                });
                rangeNode.unique();
                var endNode = rangeNode[rangeNode.length - 1];
            }

            if (n) {
                var mindData = data.mindData;
                mindData.forEach((d, i) => {
                    if (d.isImageNode) {
                        if (!d.image) {
                            var key = 'images/' + d.id + '-' + d.imageName;
                            d.image = images[key] || images['resources/' + d.imageName];
                        }
                    }
                    if (i == 0) {
                        var node = new Node(d, me);
                        var induce = new Induce(n, node, data.induceData.stroke, data.induceData.lineType);
                        induce.endNode = endNode;
                        induce.rangeNode = rangeNode;
                        induce.refreshItems();
                        induce.refreshNode();

                        induce.type = data.type;
                        me.addInduce(induce);
                    } else {
                        var node = new Node(d, me);
                        var p = me.getNodeById(d.pid);
                        me.addNode(node, p);
                    }

                    if (d.x && d.y) {
                        node.setPosition(d.x, d.y);
                    }

                    if (d.boundingRect) {
                        node.boundingRect = d.boundingRect;
                    }

                    if (!d.isExpanded) {
                        waitCollapseNode.push(node);
                    }

                    if (d.layout) {
                        node.layout = new layoutMap[d.layout.layoutName]();
                        node.layout.direct = d.layout.direct;
                        node.layout.root = node;
                    }
                });
            }
        });


        var wireFrameData = data.wireFrameData;

        wireFrameData && wireFrameData.forEach(data => {

            if (data.nodeId) {
                var n = me.getNodeById(data.nodeId);
                var p = n.parent;
                if (p) {

                    var r = data.range;
                    var ar = r.split(',');
                    var rangeNode = []
                    p.children.forEach((c, i) => {
                        if (i >= ar[0] && i <= ar[1]) {
                            rangeNode.push(c);
                        }
                    });
                    rangeNode.unique();
                    var endNode = rangeNode[rangeNode.length - 1];
                } else {
                    var endNode = n;
                    var rangeNode = [n];
                }
            }

            if (n) {
                var wf = new WireFrame(n, data.fill, data.stroke, data);
                wf.endNode = endNode;
                wf.rangeNode = rangeNode;
                wf.refreshItems();
                wf.refreshNode();
                wf.refresh();
                me.addWireFrame(wf);
                wf.setData(data);
                if (!p) {
                    n.wireFrame = wf;
                }
            }
        });

        var calloutData = data.calloutData;

        calloutData && calloutData.forEach(data => {
            var n = me.getNodeById(data.nodeId);
            if (n) {
                var callout = new Callout(n, data.rootData, data.color);
                me.addCallout(callout);
            }
        });

        if (waitCollapseNode.length) {
            waitCollapseNode.forEach(node => {
                node.collapse();
            });
        }

        this.induces.forEach(induce => {
            induce.refreshItems();
        });

        this.wireFrames.forEach(wf => {
            wf.refreshItems();
        });

        this.refresh();

        var relateLinkData = data.relateLinkData;
        var waitRefreshRelateLink = [];

        relateLinkData && relateLinkData.forEach(data => {
            var startNode = me.getNodeById(data.startNodeId);
            var endNode = me.getNodeById(data.endNodeId);
            if (startNode && endNode) {

                if (!data.gapsx) {
                    var startBox = startNode.getBox();
                    var endBox = endNode.getBox();
                    data.gapsx = data.box.cpx1 - startBox.x;
                    data.gapsy = data.box.cpy1 - startBox.y;
                    data.gapex = data.box.cpx2 - endBox.x;
                    data.gapey = data.box.cpy2 - endBox.y;
                }

                var rl = new RelateLink(startNode, data);
                rl.endNode = endNode;

                rl.setBox(data.box);
                me.addRelateLink(rl);
                rl.unactive();
                if (!data.box) {
                    waitRefreshRelateLink.push(rl);
                }
            }
        });

        waitRefreshRelateLink.forEach(rl => {
            var endNode = rl.endNode;
            var box = endNode.getBox();
            rl.move(box.x + box.width / 2, box.y);
            rl.refresh();
        });

        //setTimeout(() => {
        //load katex font
        this.initialize = false;
        // }, 1600);

    }



    getHtml() {
        var html = '';
        [this.root].concat(this.freeNodes).forEach(node => {
            this.traverseBF(function (n) {
                html += n.getHtml();
            }, node);

        });
        return html;
    }

    refreshLayout(node) {

        if (node) {
            var anchor = node;
            var layout = null
            while (anchor) {
                if (anchor.layout) {
                    layout = anchor.layout;

                }
                if (anchor.belongInduce) {
                    anchor = anchor.belongInduce.node;
                } else {
                    anchor = anchor.parent;
                }
            }

            layout.refresh();

        } else {
            this.refresh();
        }
    }

    refresh() {

        this.root && this.root.layout && this.root.layout.refresh();

        this.freeNodes.forEach(n => {
            if (n.layout) {
                n.layout.refresh();
            }
        });

        this.induces.forEach(induce => {
            if (induce.root.layout) {
                induce.root.layout.createLink();
            }
        });

        this.updateRelateLink();


    }

    updateRelateLink() {
        this.relateLinks.forEach(rl => {
            rl.refresh(true);
        });
    }

    updateAssist() {
        this.callouts.forEach(item => {
            if (item.isShow) {
                item.refresh()
            }
        })
        this.wireFrames.forEach(item => {
            if (!item.isHide){
                item.refreshItems();
                item.refresh()
            }
                
        })
        this.induces.forEach(item => {
            if (item.isShow()) {
                item.refreshItems();
                item.refresh();
                item.root.layout.createLink();
            }
        });

    }

    updateAllAssist() {
        this.updateAssist();
        this.updateRelateLink();
    }

    emit(name, data) {
        var evt = new CustomEvent(name, {
            detail: data
        });
        this.el.dispatchEvent(evt);
    }

    undo() {
        this.stack.undo();
    }

    redo() {
        this.stack.redo();
    }

    on(name, fn) {
        this.el.addEventListener(name, fn, false);
    }

    off(name, fn) {
        if (name && fn) {
            this.el.removeEventListener(name, fn);
        }
    }

    addRelateLink(link) {
        if (this.relateLinks.indexOf(link) == -1) {
            this.relateLinks.push(link);
            if (!link.isAdd) {
                this.draw.add(link.group);
                link.isAdd = true;
                this.el.appendChild(link.corl1);
                this.el.appendChild(link.corl2);
                this.el.appendChild(link.textNode.dom);
                link.addEvent();
            }
        }
    }

    removeRelateLink(link, flag) {
        var index = this.relateLinks.indexOf(link);
        if (index > -1) {
            this.relateLinks.splice(index, 1);
            link.remove();
            link.offEvent();
            link.isAdd = false;
        }
        if (!flag) {
            return index;
        }
    }

    cancelEditNode() {
        if (this._editNode) {
            this._editNode.cancelEdit();
            this._editNode = null;
        }
    }

    initEvent() {
        var that = this;
        var drag = false,
            sx = 0,
            sy = 0,
            dx = 0,
            dy = 0;
        $(document).off('click').on('click', (e) => {
            this.clearSelectNode();
            shiftNode = null;
            if (this._resizeNode) {
                this._resizeNode.cancelResize();
            }
        });


        //file,image,node position,drag text from browser,drag node to root etc
        $(document).off('drop').on('drop', (e) => {
            e.preventDefault();
            var dragNodeId = e.originalEvent.dataTransfer.getData('dragNodeId');

            if (!dragNode) {
                //drop to node,drop to blank
                var nodeDom = $(e.target).closest('.node');
                var file = e.originalEvent.dataTransfer.files[0];
                if (nodeDom.length) {
                    var node = $(e.target).closest('.node').get(0).node;
                } else {
                    if (file) {
                        that.emit('openFile', {
                            file: file
                        });
                    }
                }
                if (!node) {
                    return;
                }

                if (file) {
                    that.emit('addLocalFile', {
                        node,
                        file
                    })
                    return;
                }

                //drag content from browser
                var str = e.originalEvent.dataTransfer.getData('text/html');
                var t = e.originalEvent.dataTransfer.getData('text/plain');
                var nodeData = parseHtml(str, t);
                if (nodeData.length == 1 && nodeData[0].isImageNode) {
                    if (node) {
                        node.getMind().execute('changeNode', {
                            nodes: [node],
                            data: {
                                isImageNode: true,
                                image: nodeData[0].src
                            }
                        })
                        return
                    }
                }


                if (nodeData.length == 1 && nodeData[0].link) {
                    if (node) {
                        node.getMind().execute('changeNode', {
                            nodes: [node],
                            data: {
                                link: nodeData[0].link,
                                text: nodeData[0].text
                            }
                        })
                        return
                    }
                }
                if (nodeData.length == 1) {
                    if (node) {
                        node.getMind().execute('addChildNode', {
                            parent: node,
                            text: nodeData[0].text
                        })
                        return
                    }
                }

                if (nodeData.length > 1) {
                    if (node) {
                        node.getMind().execute('addNodes', {
                            parent: node,
                            nodeData
                        });
                    }
                }
                return
            }

            if ($(e.target).closest('.node').length) {
                var node = $(e.target).closest('.node').get(0).node;
                dragNode = '';
                if (node && node.nodeType == 'richText' || node.nodeType == 'freeNode' || node.nodeType == 'induce') {
                    var dragNodeId = e.originalEvent.dataTransfer.getData('dragNodeId');
                    node.moveNode(dragNodeId, node, dragType);
                    dragTypeDom.style.display = 'none';
                    return;
                }
            }


            var node = that.getNodeById(dragNodeId);
            dragNode = '';
            if ((!node.data.main) && (node && node.nodeType && node.nodeType == 'richText')) {

                if (node == this.root) return;
                node._refreshBounding();
                let oldPos = node.getPosition();
                that.execute('changeNodeToFreeRoot', {
                    node,
                    x: oldPos.x + dx,
                    y: oldPos.y + dy
                });
                node.nodeType = 'freeNode';
            } else {
                if (node) {
                    let oldPos = node.getPosition();
                    that.execute('movePos', {
                        node,
                        oldPos,
                        newPos: {
                            x: oldPos.x + dx,
                            y: oldPos.y + dy
                        }
                    });
                }
            }

        });


        // this.dom.addEventListener('drag',(e)=>{
        //     e.preventDefault();
        //      e.dataTransfer.setData('dragNodeId',this.getId());
        // });

        this.el.addEventListener('dragover', (e) => {
            e.preventDefault();
        });


        var shiftNode = null;
        $('body').off('click').on('click', '.node', function (e) {

            //ctrl Multiple select Node
            if (that.ctrlKey && !that.shiftKey) {
                e.stopPropagation();
                e.preventDefault();
                var node = $(this).get(0).node;
                if (node.selected) {
                    node.unSelect();
                } else {
                    node.select();
                }
                that.emit('selectNodes');
                return;
            }

            //shift  Multiple select Node
            if (!that.ctrlKey && that.shiftKey) {
                e.stopPropagation();
                e.preventDefault();
                var node = $(this).get(0).node;
                node.select();
                if (shiftNode) {
                    if (node != shiftNode) {
                        var level = node.getLevel();
                        var level1 = shiftNode.getLevel();
                        if (level == level1) {
                            if (node.parent == shiftNode.parent) {
                                var d1 = node.parent.children.indexOf(shiftNode);
                                var d2 = node.parent.children.indexOf(node);
                                var max = Math.max.apply(null, [d1, d2])
                                var min = Math.min.apply(null, [d1, d2])

                                node.parent.children.forEach((n, i) => {
                                    if (i >= min && i <= max) {
                                        n.select();
                                    }
                                });
                            }
                        }

                        if (level > level1) {
                            if (shiftNode.isTopParent(node)) {
                                var anch = node.parent;
                                while (anch) {
                                    anch.select();
                                    if (anch != shiftNode) {
                                        anch = anch.parent;
                                    } else {
                                        anch = null;
                                        break;
                                    }
                                }
                            }
                        }
                        if (level < level1) {
                            if (node.isTopParent(shiftNode)) {
                                var anch = shiftNode.parent;
                                while (anch) {
                                    anch.select();
                                    if (anch != node) {
                                        anch = anch.parent;
                                    } else {
                                        anch = null;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    shiftNode = node;
                }
                that.emit('selectNodes');
                return;
            }

            if ($(e.target).closest('a').length) {
                var href = $(e.target).closest('a').attr('href');
                if (href.startsWith('mailto')) {
                    return;
                }
                e.stopPropagation();
                e.preventDefault();
                that.emit('openExternal', {
                    href: href
                });
                return
            }

            e.preventDefault();
            e.stopPropagation();

            window.node = $(this).get(0).node;
            var node = $(this).get(0).node;
            if (node == node.mind.getSelectNode()) {
                return;
            }
            that.cancelEditNode();
            node._clickFn();

            if (that.status == 'addRelate') {
                if (that.waitRelate) {
                    var snode = that.waitRelate.startNode;
                    if (snode != $(this).get(0).node) {
                        that.waitRelate.setEndNode($(this).get(0).node);
                        that.execute('addRelateLink', {
                            link: that.waitRelate
                        })
                        that.status = '';
                        that.waitRelate.off();
                        that.waitRelate = null;
                    }
                }
            }

        });

        $('body').off('dblclick').on('dblclick', '.node', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if ($(e.target).closest('a').length) {
                return;
            }

            var node = $(this).get(0).node;
            if (that._editNode == node) {
                return;
            }
            if (that._editNode) {
                that._editNode.cancelEdit();
            }

            that.emit('hide');

            that.status = "editNode";
            that._editNode = node;

            that._editNode.dom.style.zIndex = 20;
            that._editNode.dom.setAttribute('draggable', false);
            if (!that._editNode.isEdit) {
                that._editNode.edit();
            }
            that._editNode && (that._editNode.isEdit = true);
            that._refreshBounding(that._editNode);
        });


        $('body').off('contextmenu').on('contextmenu', '.node', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var node = $(this).get(0).node;
            node.mind.clearSelectNode();
            node.select();
            that.emit('context', {
                node: node,
                pageX: e.pageX,
                pageY: e.pageY
            });
        });

        var dragNode = null,
            dragType = '',
            dragTypeDom = null;
        $('body').off('dragstart').on('dragstart', '.node', function (evt) {
            evt.stopPropagation();
            sx = evt.pageX;
            sy = evt.pageY;
            dragNode = $(this).get(0).node.getId()
            evt.originalEvent.dataTransfer.setData('dragNodeId', dragNode);
            that.emit('hide');
        });

        $('body').off('drag').on('drag', '.node', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            dx = evt.pageX - sx;
            dy = evt.pageY - sy;
        });

        function calcDragType(node, x, y) {
            if (!node) return;
            if (node.data.isRoot || node.nodeType == 'freeNode' || node.nodeType == 'induce') {
                return 'child';
            }
            var ele = document.getElementById('mind-container');
            var box = node.dom.getBoundingClientRect();

            box.x = box.x + ele.scrollLeft;
            box.y = box.y + ele.scrollTop;

            var direct = node.direct;

            switch (direct) {
                case 'right':
                    if (y < box.y + box.height / 2 && x < box.x + box.width / 4 * 3) {
                        return 'top'
                    }
                    if (y > box.y + box.height / 2 && x < box.x + box.width / 4 * 3) {
                        return 'down'
                    }

                    return 'child-right'
                case 'left':
                    if (y < box.y + box.height / 2 && x > box.x + box.width / 4) {
                        return 'top'
                    }
                    if (y > box.y + box.height / 2 && x > box.x + box.width / 4) {
                        return 'down'
                    }

                    return 'child-left'

                case 'top':
                case 'up':

                    if (x < box.x + box.width / 4) {
                        return 'left'
                    }
                    if (x > box.x + box.width / 4 * 3) {
                        return 'right'
                    }

                    return 'child-top'
                case 'down':
                case 'bottom':
                    if (x < box.x + box.width / 4) {
                        return 'left'
                    }
                    if (x > box.x + box.width / 4 * 3) {
                        return 'right'
                    }
                    return 'child-down'
                default:
                    return 'child';

            }
        }

        $('body').off('dragover').on('dragover', '.node', function (evt) {

            evt.preventDefault();
            evt.stopPropagation();

            if (!dragNode) return;

            var ele = document.getElementById('mind-container');
            var x = evt.pageX + ele.scrollLeft;
            var y = evt.pageY + ele.scrollTop;

            var node = $(this).get(0).node;
            dragType = calcDragType(node, x, y);

            var box = node.getBox();

            dragTypeDom = document.getElementById('dragType');
            dragTypeDom.style.display = 'block';


            dragTypeDom.style.left = box.x + box.width / 2 - dragTypeDom.clientWidth / 2 + 'px';
            dragTypeDom.style.top = box.y - dragTypeDom.clientHeight - 40 + 'px';
            if (dragType == 'top') {
                dragTypeDom.classList = [];
                dragTypeDom.classList.add('drag-type');
                dragTypeDom.classList.add('arrow-top');
            } else if (dragType == 'down') {
                dragTypeDom.classList = [];
                dragTypeDom.classList.add('drag-type');
                dragTypeDom.classList.add('arrow-down');
            } else if (dragType == 'left') {
                dragTypeDom.classList = [];
                dragTypeDom.classList.add('drag-type');
                dragTypeDom.classList.add('arrow-left');
            } else if (dragType == 'right') {
                dragTypeDom.classList = [];
                dragTypeDom.classList.add('drag-type');
                dragTypeDom.classList.add('arrow-right');
            } else {
                dragTypeDom.classList = [];
                dragTypeDom.classList.add('drag-type');
                var arr = dragType.split('-');
                if (arr[1]) {
                    dragTypeDom.classList.add('arrow-' + arr[1]);
                } else {
                    dragTypeDom.classList.add('arrow-right');
                }
            }
        });

        $('body').off('dragenter').on('dragenter', '.node', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
        });

        $('body').off('dragleave').on('dragleave', '.node', function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            if (dragTypeDom)
                dragTypeDom.style.display = 'none';
        });

        $('body').off('blur').on('blur', '.node .node-text', (e) => {
            e.preventDefault();
            e.stopPropagation();
            var node = $(e.target).closest('.node').get(0).node;
            node.cancelEdit();
        });

        $(this.el).off('click').on('click', '.node .node-bar', (e) => {
            e.preventDefault()
            e.stopPropagation();
            var node = $(e.target).closest('.node').get(0).node;
            if (!node.isExpand()) {
                node.getMind().execute('expandNode', {
                    node
                })
            } else {
                node.getMind().execute('collapseNode', {
                    node
                })
            }
        });

        $(this.el).off('dblclick').on('dblclick', '.node .node-bar', (e) => {
            e.preventDefault()
            e.stopPropagation();
        });

    }

    removeEvent() {
        $(this.el).off('drop')
        $(this.el).off('dragover')
        $(document).off('drop')
        $(document).off('dblclick');
        $(this.el).off('dblclick')
        $(this.el).off('click')
        $(this.el).off('click')
        $('body').off('dblclick')
        $('body').off('click')
        $('body').off('dragstart')
        $('body').off('dragenter')
        $('body').off('dragover')
        $('body').off('dragleave')
        $('body').off('contextmenu')
        $('body').off('blur');
    }
}

export default Mind;