import Store from 'electron-store'
import getImageBase64 from '../util/getImage'

import Stack from '../command/stack'
import * as cmd from './cmd'
import $ from 'jquery'

import WordHigh from '../util/wordHighlight';
import theme from '../theme'

var store = new Store();
var profile = store.get('config');

function getTop(e) {
    var offset = e.offsetTop;
    if (e.offsetParent != null) offset += getTop(e.offsetParent);
    return offset;
}

function getLeft(e) {
    var offset = e.offsetLeft;
    if (e.offsetParent != null) offset += getLeft(e.offsetParent);
    return offset;
}

function keepLastIndex(obj) {
    if (window.getSelection) { //ie11 10 9 ff safari
        var range = window.getSelection(); 
        range.selectAllChildren(obj); 
        range.collapseToEnd(); 
    } else if (document.selection) { //ie10 9 8 7 6 5
        var range = document.selection.createRange(); 
        range.moveToElementText(obj); 
        range.collapse(false); 
        range.select();
    }

    obj.focus();
}



if (profile.useMarkDown) {
    var converter = require('../markdown/parse').default
    var mermaid = require('mermaid')
    var flowchart = require('flowchart.js')
    var htmlToText = require('../markdown/jsHtmlToText').default
    if (!converter.makeHtml) {
        converter.makeHtml = converter.render;
    }
    var echarts = require('echarts')
    mermaid.initialize({
        "theme": "forest",
        useMaxWidth: false
    });
}

var wordHigh = new WordHigh();


class List {
    constructor(el, data) {
        this.el = el;
        this.data = data;
        this.routes = [];
        this.searchNode = [];
        this.stack = new Stack(60);
        this.init();
        this.initEvent();
    }

    dirty() {
        return this.stack.dirty();
    }

    save() {
        this.stack.save();
        this.emit('save');
    }
    execute(commond, data) {
        switch (commond) {
            case 'changeText':
                var node = data.node;
                var oldText = data.oldText;
                var newText = data.newText;
                this.stack.execute(new cmd.ChangeText(node, oldText, newText));
                break;
            case 'changeNode':
                var node = data.node;
                var oldData = data.oldData;
                var newData = data.newData;
                this.stack.execute(new cmd.ChangeNode(node, oldData, newData));
                break;
            case 'expandNode':
                var node = data.node;
                this.stack.execute(new cmd.ExpandNode(node));
                break;
            case 'collapseNode':
                var node = data.node;
                this.stack.execute(new cmd.CollapseNode(node));
                break;
            case 'addNode':
                var parent = data.parent;
                var style = this.getNodeThemeStyle('', parent.getLevel() + 1);
                data.node.data.backgroundColor = style.backgroundColor || 'transparent';
                data.node.data.color = style.color || '#333';
                this.stack.execute(new cmd.AddNode(data.node, data.parent, data.index));
                break;
            case 'removeNode':
                this.stack.execute(new cmd.RemoveNode(data.node, data.parent, ));
                break;
            case 'addSameNode':
                var parent = data.parent;
                var style = this.getNodeThemeStyle('', parent.getLevel() + 1);
                data.node.data.color = style.color || '#333';
                data.node.data.backgroundColor = style.backgroundColor || 'transparent';
                this.stack.execute(new cmd.AddSameNode(data.node, data.focusNode, data.parent, data.index));
                break;
            case 'tabNode':
                this.stack.execute(new cmd.TabNode(data.node, data.index, data.oldParent, data.parent));
                break;
            case 'tabNodes':
                this.stack.execute(new cmd.TabNodes(data.nodes, data.index, data.oldParent, data.parent));
                break;
            case 'shiftTabNode':
                this.stack.execute(new cmd.ShiftTabNode(data.node, data.oldParent, data.newParent));
                break;
            case 'shiftTabNodes':
                this.stack.execute(new cmd.ShiftTabNodes(data.nodes, data.oldParent, data.newParent));
                break;
            case 'shiftCtrlTabNode':
                this.stack.execute(new cmd.ShiftCtrlTabNode(data.node, data.oldParent, data.newParent));
                break;
            case 'dragNode':
                this.stack.execute(new cmd.DragNode(data.node, data.oldParent, data.newParent, data.dropNode, data.type));
                break;
            case 'replaceText':
                var nodes = data.nodes;
                if (nodes && nodes.length) {
                    var cmds = [];
                    nodes.forEach(n => {
                        var c = new cmd.ReplaceText(n, data.word, data.replaceWord);
                        cmds.push(c);
                    });
                    this.stack.execute(new cmd.ManyCommand(cmds));
                }
                break;
            case "dragNodes":
                this.stack.execute(new cmd.DragNodes(data.nodes, data.oldParent, data.newParent, data.dropNode, data.type));
                break;
        }
    }

    undo() {
        this.stack.undo();
    }

    redo() {
        this.stack.redo();
    }

    init(data, imgData) {

        if (data) {
            this.data = data;
        }

        if (imgData) {
            var images = imgData.img || {};
        }


        var me = this;
        var waitCollapse = [];

        function initDom(ndata, parent) {
            if (ndata.isImageNode) {
                if (!ndata.image) {
                    var key = 'images/' + ndata.id + '-' + ndata.imageName;
                    ndata.image = images[key] || images['resources/' + ndata.imageName];
                    if (!ndata.imageWidth) ndata.imageWidth = 200;
                    if (!ndata.imageHeight) ndata.imageHeight = 200;

                }
            }
            var n = new Node(ndata, parent, me);
            if (ndata.main) {
                me.root = n;
                me.el.appendChild(n.liDom);
            }

            if (!ndata.isExpand) {
                waitCollapse.push(n);
            }


            n.parent = parent;

            parent && parent.children.push(n) && parent.refreshClass();

            n.list = me;

            ndata.children && ndata.children.forEach(c => {
                initDom(c, n);
            });
        }

        if (this.data) {
            initDom(this.data, null);


            if (this.data.showingNode) {
                var n = this.getNodeById(this.data.showingNode);
                if (n) {
                    this.showNode(n);
                }
            } else {
                this.showNode(this.root);
            }

            if (waitCollapse.length) {
                waitCollapse.forEach(n => {
                    n.collapse();
                });
            }

            this.emit('mounted', {
                routes: this.routes
            });
        }
    }

    showRangeNode(node) {
        if (!node) node = this.root;
        var showingNode = this.showingNode;
        if (showingNode) {
            var nl = node.getLevel();
            var sl = showingNode.getLevel();
            if (nl > sl) {
                this.traverseBF(n => {
                    if (n.getLevel() < nl) {
                        n.hideNode();
                    } else if (n.getLevel() == nl) {
                        if (n !== node) {
                            n.hide();
                        } else {
                            if (!n.isExpand) {
                                n.expand();
                            }
                        }
                    }
                });
            } else {
                this.traverseBF(n => {
                    var l = n.getLevel();
                    if (l < nl) {
                        n.hideNode();
                    } else if (l == nl) {
                        if (n != node) {
                            n.hide();
                        } else {
                            if (!n.isExpand) {
                                n.expand();
                            }
                        }
                    } else if (l > nl && l <= sl) {
                        if (!n.isShow()) {
                            n.show();
                            n.showNode()
                        }
                    }
                });
            }
        } else {
            this.showAllNode(node);
        }
    }

    showAllNode() {

        this.traverseBF(n => {
            if (!n.isExpand) {
                n.expand();
            }
            if (!n.isShow()) {
                n.show();
                n.showNode();
                n.refreshClass();
            }

            if (n.liDom.classList.contains('node-no-border')) {
                n.liDom.classList.remove('node-no-border')
            }
            if (n.liDom.classList.contains('node-showNode')) {
                n.liDom.classList.remove('node-showNode');
            }
        });
    }

    showNode(node) {

        if (this.showingNode) {
            var c = this.showingNode;
            while (c) {
                if (c.liDom.classList.contains('node-no-border')) {
                    c.liDom.classList.remove('node-no-border')
                }
                if (c.liDom.classList.contains('node-showNode')) {
                    c.liDom.classList.remove('node-showNode');
                }
                c = c.parent;
            }
        }

        this.showRangeNode(node);

        this.routes = [];

        this.showingNode = node;
        var anchor = node;

        node.showNode();

        if (!node.liDom.classList.contains('node-showNode')) {
            node.liDom.classList.add('node-showNode');
        }

        while (anchor) {
            if (anchor && anchor != node) {
                this.routes.unshift({
                    text: anchor.getTxt(),
                    node: anchor
                });
                anchor.hideNode();
                if (!anchor.liDom.classList.contains('node-no-border')) {
                    anchor.liDom.classList.add('node-no-border');
                }
            }
        
            anchor = anchor.parent;
        }

    }


    collapse() {
        this.traverseBF(n => {
            n.collapse();
        })
    }

    expand() {
        this.traverseBF(n => {
            n.expand();
        });
    }

    expandLevel(level) {
        this.traverseBF(n => {
            if (n.getLevel() < level) {
                n.expand()
            } else if (n.getLevel() == level) {
               
                if (!n.isLeaf()) {
                    n.collapse();
                }
            }
        }, this.root)
    }

    backHistory() {
        if (this.searchNode.length) {
            this.searchNode.forEach(n => {
                n.initRemark();
                n.initMark();
                if (profile.useMarkDown) {
                    n.parseMdText();
                } else {
                    n.renderMdText();
                }
            });
        }
    }

    search(keyword) {
        var me = this;
        this.backHistory();
        this.showAllNode();
        this.searchNode = [];
      

        if (!keyword) {
            return
        }

        wordHigh.highlight(this.el, keyword);
        $('.li-node .node-control').hide();
        $('.search_key').each((index, item) => {
            var lidom = $(item).closest('.li-node');
            if (lidom) {
                var node = lidom.get(0).node;
                if (me.searchNode.indexOf(node) == -1) {
                    me.searchNode.push(node);
                }
            }
        });

        this.searchNode.forEach(n => {
            var anchor = n;
            while (anchor) {
                anchor.showNode();
                anchor = anchor.parent;
            }
        });
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


    getRoot() {
        return this.root;
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

    getNodeById(id) {
        var node = null;
        this.traverseBF(n => {
            if (n.getId() == id) {
                node = n;
            }
        });
        return node;
    }

    getSelectNode() {
        if (this._selectNode) {
            return this._selectNode;
        }
        var node = null;
        this.traverseBF(n => {
            if (n.selected) {
                node = n;
            }
        });
        return node;
    }

    clearSelectNode() {
        this.traverseBF((n) => {
            n.unSelect();
        });
    }

    addNode(node, parent, i) {
        if (!i) {
            i = parent.children.length;
        }
        parent.addChild(node, i);
    }

    selecNode(n) {
        this.clearSelectNode();
        n.select();
        this._selectNode = n;
    }

    getData(zip, flag, deleteEvent) {
        var obj = {};
        var me = this;

        function getData(n, array) {
            var d = n.getData(flag, deleteEvent);
            d.children = [];
            if (n == me.root) {
                obj = d;
            } else {
                array.push(d);
            }

            if (zip) {
                if (n.data.isImageNode) {
                    if (d.image.startsWith('http')) {
                        n.data.isImageNode = '';
                        return;
                    }
                    var imageData = d.image.replace(/^data:image\/(\w|\+)+;base64,/, "");
                    zip.file(d.id + '-' + d.imageName, imageData, {
                        base64: true
                    });
                    d.image = '';
                }
            }
            n.children.forEach(node => {
                node.data.pid = n.getId();
                getData(node, d.children);
            });

        }

        getData(this.root);

        if (this.showingNode) {
            obj.showingNode = this.showingNode.getId();
        }

        return obj;
    }

    census() {
        var num = 0;
        this.traverseBF(n => {
            num++;
        });
        return num;
    }

    remove() {
        this.traverseBF(n => {
            n.remove();
        });
        this.el.innerHTML = '';
        this.root = null;
    }

    getEditNode() {
        return this._editNode || null;
    }


    emit(name, data) {
        var evt = new CustomEvent(name, {
            detail: data
        });
        this.el.dispatchEvent(evt);
    }

    on(name, fn) {
        this.el.addEventListener(name, fn, false);
    }

    off(name, fn) {
        if (fn) {
            this.el.removeEventListener(name, fn);
        } else {
            this.el.removeEventListener(name);
        }
    }

    dragNodes(nodes, parent) {
     
        var dom = parent.liDom;

        var length = $(dom).closest('.shiftSelect').length;

        if (!length && nodes.length) {
            var p = parent.parent;
            if (p) {
                if (parent.dropType == 'top') {
                    var type = "top";
                } else {
                    var type = "down"
                }
                parent.list.execute('dragNodes', {
                    nodes,
                    newParent: p,
                    type,
                    dropNode: parent,
                    oldParent: nodes[0].parent
                });
            }
        }
    }

    moveNode(nodeId, parent) {
        if (!parent) {
            return;
        }
        var node = this.getNodeById(nodeId);
        if (node == parent) {
            return
        }

        if (node) {
            var flag = false;
            var anchor = parent;
            while (anchor) {
                if (anchor == node) {
                    flag = true;
                }
                anchor = anchor.parent;
            }
            if (flag) {
                return;
            }

            if (node.parent) {
                var oldParent = node.parent;
               
                if (parent.dropType == 'top') { //放置在前面
                    var p = parent.parent;
                    if (p) {
                       
                        this.execute('dragNode', {
                            node: node,
                            newParent: p,
                            dropNode: parent,
                            oldParent: oldParent,
                            type: 'top'
                        });
                    }
                } else { 
                    var p = parent.parent;
                    if (p) {
                       
                        this.execute('dragNode', {
                            node: node,
                            newParent: p,
                            oldParent: oldParent,
                            dropNode: parent,
                            type: 'down'
                        });
                    }
                }

            }
        }

    }


    removeEvent() {
        $(this.el).off('mouseenter')
        $(this.el).off('mouseleave')
        $(this.el).off('dragstart')
        $(this.el).off('drag')
        $(this.el).off('dragover')
        $(this.el).off('dragend')
        $(this.el).off('dragleave')
        $(this.el).off('drop');
        $(this.el).off('dblclick');
        $(this.el).off('click');
    }


    initEvent() {
        var me = this;
      
        $(this.el).off('mouseenter')
        $(this.el).off('mouseleave')
        $(this.el).off('dragstart')
        $(this.el).off('dragover')
        $(this.el).off('dragend')
        $(this.el).off('dragleave')
        $(this.el).off('drop');
        $(this.el).off('dblclick');
        $(this.el).off('click');
        $(this.el).off('drag');

        $(this.el).on('mouseenter', '.li-node .icon-dott', (e) => {
            var node = $(e.target).closest('.li-node').get(0).node;
            node.divDom.setAttribute('draggable', true);
        });

        $(this.el).on('dblclick', '.li-node .icon-dott', (e) => {
            var node = $(e.target).closest('.li-node').get(0).node;
            node.list.emit('showNode', {
                node
            });
        });

        $(this.el).on('mouseleave', '.li-node .icon-dott', (e) => {
            var node = $(e.target).closest('.li-node').get(0).node;
            node.divDom.setAttribute('draggable', false);
        });

        $(this.el).on('dragstart', '.li-node .node-control', (e) => {
            var node = $(e.target).closest('.li-node').get(0).node;
            e.originalEvent.dataTransfer.setData('dragNodeId', node.getId());
        });

        $(this.el).on('drop', '.li-node .node-control', (e) => {
            e.preventDefault();
            var liDom = $(e.target).closest('.li-node');
            var dragNodeId = e.originalEvent.dataTransfer.getData('dragNodeId');
            var dragNode = me.getNodeById(dragNodeId)
            if (dragNode.liDom.classList.contains('shiftSelect')) {
                var nodes = me.shiftNodes;
                var node = liDom.get(0).node;
                node.list.dragNodes(nodes, node);
            } else {
                var node = liDom.get(0).node;
                var dragNodeId = e.originalEvent.dataTransfer.getData('dragNodeId');
                node.list.moveNode(dragNodeId, node);
            }

            if (node.liDom.classList.contains('node-add-top')) {
                node.liDom.classList.remove('node-add-top');
            }
            if (node.liDom.classList.contains('node-add-bottom')) {
                node.liDom.classList.remove('node-add-bottom');
            }

        });

        $(this.el).on('click', '.li-node .node-open', (e) => {
            e.preventDefault();
            e.stopPropagation();
            var node = $(e.target).closest('.li-node').get(0).node;
            if (node.isExpand) {
                me.execute('collapseNode', {
                    node
                });
            } else {
                me.execute('expandNode', {
                    node
                });
            }

        })

     

        function throttle(fn, wait) {
            fn.timer = null;
            let start = Date.now();
            return e => {
                if (Date.now() - start >= wait) {
                    clearTimeout(fn.timer)
                    fn.timer = setTimeout(fn.bind(this, e), wait);
                    start = Date.now()
                }
            };
        }
   
        function drag(e) {
            if (e.clientX < 160 || e.clientX > 1000) {
                if (e.clientY < window.innerHeight / 2) {
                    document.getElementById('cicada-list').scrollTop -= 30;
                }

                if (e.clientY > window.innerHeight / 2) {
                    document.getElementById('cicada-list').scrollTop += 30;
                }
            }
        }

        $(this.el).on('drag', throttle(drag, 10));

        $(this.el).on('dragover', '.li-node .node-control', e => {
            e.preventDefault();
            if (drag.timer) {
                clearTimeout(drag.timer);
            }

            var node = $(e.target).closest('.li-node').get(0).node;
            var h = node.editDom.clientHeight / 2;

            node.list._dropNode = node;

            if (e.offsetY < h) {
                node.dropType = 'top';
                node.liDom.classList.add('node-add-top');
                if (node.liDom.classList.contains('node-add-bottom')) {
                    node.liDom.classList.remove('node-add-bottom');
                }
            } else {

                if (node.liDom.classList.contains('node-add-top')) {
                    node.liDom.classList.remove('node-add-top');
                }
                node.dropType = 'bottom';
                node.liDom.classList.add('node-add-bottom');
            }
        });

        $(this.el).on('dragend', '.li-node .node-control', (e) => {
            e.preventDefault();
            var node = $(e.target).closest('.li-node').get(0).node;
            if (node.liDom.classList.contains('node-add-top')) {
                node.liDom.classList.remove('node-add-top');
            }
            if (node.liDom.classList.contains('node-add-bottom')) {
                node.liDom.classList.remove('node-add-bottom');
            }

            node.divDom.setAttribute('draggable', false);
        });

        $(this.el).on('dragleave', '.li-node .node-control', (e) => {
            e.preventDefault();

            var node = $(e.target).closest('.li-node').get(0).node;

            if (node.liDom.classList.contains('node-add-top')) {
                node.liDom.classList.remove('node-add-top');
            }
            if (node.liDom.classList.contains('node-add-bottom')) {
                node.liDom.classList.remove('node-add-bottom');
            }
        });

    }


}


function insertAfter(newEl, targetEl) {
    var parentEl = targetEl.parentNode;

    if (parentEl.lastChild == targetEl) {
        parentEl.appendChild(newEl);
    } else {
        parentEl.insertBefore(newEl, targetEl.nextSibling);
    }
};



class Node {
    constructor(data, parent, list) {

        this.data = data;
        if (!this.data.marks) {
            this.data.marks = [];
        }

        this.parent = parent || null;
        this.selected = false;
        this.list = list;
        this.children = [];
        this.doubleLink = [];
       
        this.isExpand = this.data.isExpand || true;
        this.shoudRender = true;
        this.init();
        this.refreshClass();
        this.parseText();
    }

    getId() {
        return this.data.id;
    }

    addChild(node, i) {
        this.children.splice(i, 0, node);
        node.parent = this;
        node.list = this.list;
    }

    removeChild(node) {
        var index = this.children.indexOf(node);
        if (index > -1) {
            this.children.splice(index, 1);
            return index;
        }
    }

    select() {
        this.selected = true;
        this.liDom.classList.add('select');
    }

    shiftSelect() {
        if (!this.liDom.classList.contains('shiftSelect')) {
            this.liDom.classList.add('shiftSelect');
        }
    }

    focus() {
        if (this.list) {
            this.list.selecNode(this);
            this.list._editNode = this;
            window.node = this;
           
            this.keepFocusEnd();
            this.list.emit('hide');
            this.list.emit('selectNode', {
                node: this
            });
        }
    }

    keepFocusEnd() {
        keepLastIndex(this.textDom);
    }

    unSelect() {
        this.selected = false;
        this.liDom.classList.remove('select');
    }

    refreshAssist() {
        if (this.data.priority) {
            this.priorityDom && this.assistDom.removeChild(this.priorityDom);
            this.priorityDom = document.createElement('div')
            this.priorityDom.dataset.priority = this.data.priority;
            this.priorityDom.className = "node-priority";
            this.priorityDom.innerText = this.data.priority;
            this.assistDom.appendChild(this.priorityDom);
            this.priorityDom.node = this;
        } else {
            this.priorityDom && this.assistDom.removeChild(this.priorityDom);
            this.priorityDom && (this.priorityDom = null);
        }

        if (this.data.isTodo) {
            this.todoDom && this.assistDom.removeChild(this.todoDom);
            this.label && this.todoDom.removeChild(this.label)
            this.todoDomcheck && this.todoDom.removeChild(this.todoDomcheck);
            this.todoDom = document.createElement('div');
            this.todoDom.className = 'todo-container';
            this.todoDomcheck = document.createElement('input');
            this.todoDomcheck.className = 'magic-checkbox';
            this.todoDomcheck.type = 'checkbox';
            this.todoDomcheck.id = 'todo-' + this.getId();
            this.label = document.createElement('label');
            this.label.setAttribute('for', 'todo-' + this.getId());
            this.todoDom.appendChild(this.todoDomcheck);
            this.todoDom.appendChild(this.label);
            this.assistDom.appendChild(this.todoDom);
            if (this.data.todoDone) {
                $(this.todoDomcheck).prop('checked', true);
            } else {
                $(this.todoDomcheck).prop('checked', false);
            }

        } else {
            this.todoDom && this.assistDom.removeChild(this.todoDom);
            this.label && this.todoDom.removeChild(this.label)
            this.todoDomcheck && this.todoDom.removeChild(this.todoDomcheck);
            this.todoDom && (this.todoDom.onclick = null);
            this.todoDom && (this.todoDom.ondblclick = null);
            this.todoDomcheck && (this.todoDomcheck.onclick = null);
            this.todoDom && (this.todoDom = null);
            this.todoDomcheck && (this.todoDomcheck = null);
            this.label && (this.label = null);
        }

        if (this.data.percent) {
            this.percentDom && this.assistDom.removeChild(this.percentDom);
            this.percentDom = document.createElement('div')
            this.percentDom.dataset.percent = this.data.percent;
            if (this.data.percent == 'not-start') {
                this.percentDom.className = "node-percent iconfont icon-weikaishi";
            } else if (this.data.percent == 100) {
                this.percentDom.className = "node-percent iconfont icon-wancheng";
            } else {
                this.percentDom.className = "node-percent pie";
            }
            this.assistDom.appendChild(this.percentDom);
            this.percentDom.node = this;
        } else {
            this.percentDom && this.assistDom.removeChild(this.percentDom);
            this.percentDom && (this.percentDom = null);
        }

        this._refreshTodo();

        this.linkDom && (this.linkDom.onclick = null);
        this.linkDom && (this.linkDom.onblur = null);
        this.linkDom && this.divDom.removeChild(this.linkDom);
        this.linkDom && (this.linkDom = null);

        if (this.data.link) {
            this.linkDom = document.createElement('a');
            this.linkDom.className = "node-link iconfont icon-infenicon15";
            this.linkDom.href = this.data.link;
            this.linkDom.innerText = this.data.link;
            this.linkDom.style = "display:block;padding:0 2px;text-decoration:none;outline:transparent";
            this.linkDom.setAttribute('target', '_blank');
            this.divDom.appendChild(this.linkDom);
            this.linkDom.setAttribute('contenteditable', true);
            this.linkDom.setAttribute('spellcheck', false);
            this.linkDom.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.list.emit('showLink', {
                    node: this
                });
            }
            this.linkDom.onblur = () => {
                var oldData = this.getPlainData();
                if (oldData.link != this.linkDom.innerText) {
                    var newData = {
                        ...oldData,
                        ...{
                            link: this.linkDom.innerText
                        }
                    }
                    this.list.execute('changeNode', {
                        node: this,
                        oldData,
                        newData
                    });
                }
            }
        }


        this.removeImageEvent();
        this.imageDom && (this.divDom.removeChild(this.imageDom));
        this.imageDom && (this.imageDom = null);
        if (this.data.image) {
            this.imageDom = document.createElement('div');
            this.imageDom.classList.add('node-image');
            this.img = document.createElement('img');
            this.img.setAttribute('src', this.data.image);
            this.img.style.width = this.data.imageWidth + 'px';
            this.img.style.height = this.data.imageHeight + 'px';
            this.imageDom.appendChild(this.img);
            this.imageResize = document.createElement('div');
            this.imageResize.classList.add('node-resize');
            this.imageResize.classList.add('iconfont');
            this.imageResize.classList.add('icon-resize');
            this.imageDom.appendChild(this.imageResize);
            this.divDom.appendChild(this.imageDom);
            this.deleteDom = document.createElement('div');
            this.deleteDom.classList.add('node-delete');
            this.deleteDom.classList.add('iconfont');
            this.deleteDom.classList.add('icon-shanchu');
            this.imageDom.appendChild(this.deleteDom);
            this.addImageEvent();
            if (this.data.image.startsWith('http')) {
                getImageBase64(this.data.image).then(res => {
                    me.imageDom.src = res;
                    me.data.image = res;
                    if (res.indexOf('data:image/png') > -1) {
                        me.data.imageName = 'mind.png'
                    } else if (res.indexOf('data:image/gif') > -1) {
                        me.data.imageName = 'mind.gif'
                    } else if (res.indexOf('data:image/jpeg') > -1) {
                        me.data.imageName = 'mind.jpg'
                    } else {
                        me.data.imageName = 'mind.png'
                    }
                }).catch((e) => {

                });
            }
        }
    }

    initMark() {
        this.marksDom.innerHTML = '';
        if (this.data.marks && this.data.marks.length) {
            this.data.marks.forEach(mark => {
                var m = document.createElement('div')
                m.classList.add('node-mark-item');
                m.innerHTML = mark.text;
                m.style.backgroundColor = mark.fill;
                this.marksDom.appendChild(m);
            });
            this.marksDom.node = this;
        }
    }

    _refreshTodo() {
        if (this.data.todoDone) {
            if (!this.liDom.classList.contains('node-todo-done')) {
                this.liDom.classList.add('node-todo-done');
            }
        } else {
            if (this.liDom.classList.contains('node-todo-done')) {
                this.liDom.classList.remove('node-todo-done');
            }
        }
    }

    toggleTodoState() {
     
        if (this.data.isTodo) {

            var oldData = this.getData();

            var newData = {
                ...{},
                ...oldData,
                ...{
                    todoDone: !oldData.todoDone
                }
            };
            this.list.execute('changeNode', {
                node: this,
                oldData,
                newData
            })

        }
    }

    initRemark() {
        if (this.data.remark) {
            this.remarkDom && (this.remarkDom.onclick = null);
            if (this.remarkDom && this.divDom.contains(this.remarkDom)) {
                this.divDom.removeChild(this.remarkDom);
            }
            this.remarkDom = document.createElement('div');
            this.remarkDom.className = "node-remark";
            this.remarkDom.style = "display:block;";
            this.remarkDom.innerHTML = this.data.remark;
            this.remarkDom.setAttribute('contenteditable', true);
            this.divDom.appendChild(this.remarkDom);
            this.remarkDom.onblur = () => {
                var oldData = this.getPlainData();
                if (oldData.remark != this.remarkDom.innerHTML) {
                    var newData = {
                        ...oldData,
                        ...{
                            remark: this.remarkDom.innerHTML
                        }
                    };
                    this.list.execute('changeNode', {
                        node: this,
                        oldData,
                        newData
                    });
                }
            }
        } else {
            this.remarkDom && (this.remarkDom.onclick = null);
            if (this.remarkDom && this.divDom.contains(this.remarkDom)) {
                this.divDom.removeChild(this.remarkDom);
            }
            this.remarkDom = null;
        }
    }
    removeImageEvent() {
        if (this.imageResize) {
            this.imageResize.onmousedown = null;
            this.imageResize.onmousemove = null;
            this.imageResize.onmouseup = null;
        }
    }

    addImageEvent() {
        var drag = false,
            dx = 0,
            dy = 0,
            sx = 0,
            sy = 0,
            iw, ih;
        var oldData = {};

        this.imageResize.onmousedown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            oldData = this.getPlainData();
            drag = true;
            sx = e.pageX;
            sy = e.pageY;
            iw = this.data.imageWidth;
            ih = this.data.imageHeight;

            document.body.onmousemove = (e) => {
                if (drag) {
                    dx = e.pageX - sx;
                    dy = e.pageY - sy;
                   
                    this.img.style.width = iw + dx + 'px';
                    this.img.style.height = ih + dy + 'px';

                    this.data.imageWidth = iw + dx;
                    this.data.imageHeight = ih + dy;
                }
            };

            document.body.onmouseup = (e) => {
                var newData = {
                    ...oldData,
                    ...{
                        imageWidth: this.data.imageWidth,
                        imageHeight: this.data.imageHeight
                    }
                };
                drag = false;
                this.list.execute('changeNode', {
                    node: this,
                    oldData,
                    newData
                });
                document.body.onmousemove = null;
                document.body.onmouseup = null;
            };

        };

        this.deleteDom.onclick = (e) => {
            var oldData = oldData = this.getPlainData();;
            var newData = {
                ...oldData,
                ...{
                    image: '',
                    isImageNode: false
                }
            };
            this.list.execute('changeNode', {
                node: this,
                oldData,
                newData
            })
        }


    }

    init() {

        this.liDom = document.createElement('li');
      
        this.liDom.classList.add('li-node');
    
        this.divDom = document.createElement('div');
        this.divDom.classList.add('node-control');

        this.liDom.appendChild(this.divDom);

        this.openDom = document.createElement('span');
        this.dottDom = document.createElement('span');
        var spanDom = document.createElement('span');
        this.dottDom.appendChild(spanDom);
        this.dottDom.classList.add('icon-dott');

        this.editDom = document.createElement('div');
    

        this.divDom.appendChild(this.openDom);
        this.divDom.appendChild(this.dottDom);
        this.divDom.appendChild(this.editDom);
    

        this.childrenDom = document.createElement('ul');
        this.liDom.appendChild(this.childrenDom);


        this.marksDom = document.createElement('div');
        this.marksDom.classList.add('node-markList');
        this.divDom.appendChild(this.marksDom);

        this.assistDom = document.createElement('div');
        this.assistDom.classList.add('node-assist');
        this.assistDom.setAttribute('contenteditable', false);
        this.assistDom.style = "float:left";

        this.editDom.appendChild(this.assistDom);

        this.textDom = document.createElement('div');
        this.textDom.classList.add('text');
        this.editDom.appendChild(this.textDom);
        this.textDom.setAttribute('contenteditable', true);
        this.textDom.setAttribute('spellcheck', false);
        this.textDom.setAttribute('tabindex', -1);

        this.parent && this.parent.childrenDom.appendChild(this.liDom);

        this.textDom.innerHTML = this.data.text;
        this.liDom.node = this;
    
        this.refreshAssist();
        this.initRemark();
        this.initMark();
        this.addEvent();

    }

    cancelEdit() {
        var me = this;
        if (this.shoudRender) {
            this.data.mdText = this.textDom.innerHTML;
            if (this._oldMdText != this.data.mdText) {
                me.list.execute('changeText', {
                    oldText: me._oldMdText,
                    newText: me.data.mdText,
                    node: me
                });
            } else {
                this.data.mdText = this._oldMdText;
                me.parseText();
            }
         
        }
        me.list._editNode = null;
    }

    addEvent() {


        var me = this;
        // this.liDom.onclick=function(e){
        //   e.stopPropagation();
        // console.log(e);

        // me.list.selecNode(me);
        // keepLastIndex(me.editDom);
        //console.log(me);
        // window.node=me;
        // me.list.emit('hide');
        // };

        // this.dottDom.onmouseenter=()=>{
        //     this.divDom.setAttribute('draggable',true);
        // };

        // this.dottDom.onmouseleave=()=>{
        //     this.divDom.setAttribute('draggable',false);
        // };


        // this.divDom.ondragstart=(e)=>{
        //     //e.stopPropagation();
        //     e.dataTransfer.setData('dragNodeId',me.getId());
        // }


        // this.divDom.ondrop=(e)=>{
        //    e.preventDefault();
        //     var dragNodeId=e.dataTransfer.getData('dragNodeId');
        //     me.list.moveNode(dragNodeId,me);
        //    if(me.liDom.classList.contains('node-add-top')){
        //      me.liDom.classList.remove('node-add-top');
        //    }
        //    if(me.liDom.classList.contains('node-add-bottom')){
        //     me.liDom.classList.remove('node-add-bottom');
        //   }
        // };


        // this.divDom.ondragover=(e)=>{
        //      e.preventDefault();
        //      var h=me.editDom.clientHeight/2;
        //    //  var left=me.getLeft(me.editDom);
        //      var top=getTop(me.editDom);
        //      if(e.pageY<h+top){
        //          me.dropType='top';
        //         me.liDom.classList.add('node-add-top');
        //         if(me.liDom.classList.contains('node-add-bottom')){
        //             me.liDom.classList.remove('node-add-bottom');
        //         }
        //      }else{
        //          //console.log('bottom',e.offsetY,me.getData().text)
        //        if(me.liDom.classList.contains('node-add-top')){
        //            me.liDom.classList.remove('node-add-top');
        //         }
        //         me.dropType='bottom';
        //         me.liDom.classList.add('node-add-bottom');
        //      }
        // };

        // this.divDom.ondragend=(e)=>{
        //     if(me.liDom.classList.contains('node-add-top')){
        //         me.liDom.classList.remove('node-add-top');
        //      }
        //      if(me.liDom.classList.contains('node-add-bottom')){
        //         me.liDom.classList.remove('node-add-bottom');
        //     }

        //     me.divDom.setAttribute('draggable',false);
        // }


        // this.divDom.ondragleave=(e)=>{
        //     if(me.liDom.classList.contains('node-add-top')){
        //         me.liDom.classList.remove('node-add-top');
        //      }
        //      if(me.liDom.classList.contains('node-add-bottom')){
        //         me.liDom.classList.remove('node-add-bottom');
        //     }
        // };

        this.textDom.onfocus = () => {
          
            if (this.shoudRender) {
                this._oldMdText = this.data.mdText;
                this.textDom.innerHTML = this.data.mdText;
              
                me.focus();
            }

        };

        this.textDom.onblur = (e) => {
            this.cancelEdit();
        }

    }

    parseMdText() {
        if (!profile.useMarkDown) {
            return;
        }
      
        this.textDom.innerHTML = converter.makeHtml(htmlToText(this.data.mdText)).trim();
       
        this.textDom.querySelectorAll('.md-echarts').forEach(element => {
            try {
                let options = JSON.parse(element.textContent);
                let chart = echarts.init(element);
                chart.setOption(options);
                element.isRender = true;

            } catch (e) {
                element.outerHTML = `<pre>echarts complains: ${e}</pre>`
            }
        });

        mermaid.init(undefined, this.textDom.querySelectorAll('.mermaid'));
      
        this.textDom.querySelectorAll('.md-flowchart').forEach(element => {
            try {
                let code = element.textContent
                let chart = flowchart.parse(code)
                element.textContent = ''
                chart.drawSVG(element, {
                    'line-width': 1,
                    'line-color': '#666',
                    'font-color': '#666',
                });
            } catch (e) {
                element.outerHTML = `<pre>flowchart complains: ${e}</pre>`
            }
        });
    }


    parseText() {
        this.data.mdText = this.textDom.innerHTML;
        this.parseMdText();
    }

    renderMdText() {
        this._oldMdText = this.data.mdText || this.data.text;
        this.textDom.innerHTML = this.data.mdText || this.data.text;
    }

    refreshMdText() {
        this.data.mdText = this.textDom.innerHTML;
    }

    removeEvent() {
        this.dottDom.onmouseenter = null;
        this.dottDom.onmouseleave = null;
        this.divDom.ondragstart = null;
        this.divDom.ondrop = null;
        this.divDom.ondragover = null;
        this.divDom.ondragend = null;
        this.divDom.ondragleave = null;
        this.textDom.onfocus = null;
        this.textDom.onblur = null;
        this.openDom.onclick = null;
        this.linkDom && (this.linkDom.onblur = null);
        this.linkDom && (this.linkDom.onclick = null);
        this.removeImageEvent();
    }

    collapse() {
        var me = this;
        this.isExpand = false;
      
        me.childrenDom.style.display = 'none'
        me.refreshClass();
    }

    expand() {
        this.isExpand = true;
        this.childrenDom.style.display = '';
        this.refreshClass();
    }

    getSiblings() {
        if (this.parent) {
            return this.parent.children.filter(n => n != this);
        }
    }

    show() {
        this.liDom.style.display = '';
    }

    hide() {
        this.liDom.style.display = 'none';
    }

    showNode() {
        this.divDom.style.display = 'block';
    }

    hideNode() {
        this.divDom.style.display = 'none';
    }

    isShow() {
        return this.divDom.style.display != 'none' && this.liDom.style.display != 'none';
    }

    isLeaf() {
        return !this.children.length;
    }

    getLevel() {
        var level = 0;
        var anchor = this.parent;
        while (anchor) {
            level++;
            anchor = anchor.parent;
        }
        return level;
    }

    remove() {
        var me = this;
        if (this.parent) {
            this.parent.childrenDom.removeChild(this.liDom);
        } else {
            me.list.el.removeChild(this.liDom);
        }
        this.removeEvent();
    }

    refreshClass() {
        if (this.isExpand) {
            this.openDom.classList = [];
            this.liDom.classList.add('node-expand');
            this.openDom.classList.add('node-open');
            this.openDom.classList.add('iconfont');
            this.openDom.classList.add('icon-min');

        } else {
            this.openDom.classList = [];
            this.openDom.classList.add('node-open');
            this.openDom.classList.add('iconfont');
            this.openDom.classList.add('icon-iconjia');
            this.liDom.classList.remove('node-expand');
        }

        if (this.isLeaf()) {
            this.liDom.classList.add('node-leaf')
        } else {
            if (this.liDom.classList.contains('node-leaf')) {
                this.liDom.classList.remove('node-leaf');
            }
        }
    }

    getPlainData() {
        var data = {
            color: this.data.color,
            fontSize: this.data.fontSize,
            todoDone: this.data.todoDone,
            isTodo: this.data.isTodo,
            priority: this.data.priority,
            percent: this.data.percent,
            isImageNode: this.data.isImageNode,
            imageWidth: this.data.imageWidth,
            imageHeight: this.data.imageHeight,
            image: this.data.image,
            link: this.data.link,
            remark: this.data.remark,
            marks: this.data.marks.slice()
        };
        return data;
    }

    setPlainData(data) {
        this.data.color = data.color;
        this.data.fontSize = data.fontSize;
        this.data.todoDone = data.todoDone;
        this.data.isTodo = data.isTodo;
        this.data.priority = data.priority;
        this.data.percent = data.percent;
        this.data.isImageNode = data.isImageNode;
        this.data.imageWidth = data.imageWidth;
        this.data.imageHeight = data.imageHeight;
        this.data.image = data.image;
        this.data.link = data.link;
        this.data.remark = data.remark;
        this.data.marks = data.marks;
        this.initRemark();
        this.refresh();
    }

    getText() {
        return this.data.mdText;
    }

    setMdText(text) {
        this.data.mdText = text;
        this.textDom.innerHTML = text;
        this.parseText();
    }

    focusLink() {
        if (this.linkDom) {
            this.linkDom.focus();
            keepLastIndex(this.linkDom);
        }
    }

    focusNote() {
        if (this.remarkDom) {
            this.remarkDom.focus();
            keepLastIndex(this.remarkDom);
        }
    }

    refresh() {
        this.refreshClass();
        this.refreshAssist();

    }

    offsetTop(dom) {
        return getTop(dom || this.liDom);
    }

    offsetLeft(dom) {
        return getLeft(dom || this.liDom);
    }


    getData(flag, deleteEvent) {
        if (flag) {
            var text = this.data.text;
        } else {
            var text = this.data.mdText;
        }
       
        var data = {
            ...{},
            ...this.data,
            ...{
                text: text.trim(),
                isExpand: this.isExpand,
                children: [],
                isExpanded: this.isExpand
            }
        }
        delete data.mdText;
        delete data.children;

        if (deleteEvent) {
            this.removeEvent();
        }
        return data;
    }

    getTxt() {
        var txt=this.textDom.textContent;
        return this.textDom.textContent.trim();
    }

    getNodeText() {
        return this.liDom.textContent.trim();
    }


    setText(text) {
        this.textDom.innerHTML = text;
    }
}

export {
    List as default,
    Node
}