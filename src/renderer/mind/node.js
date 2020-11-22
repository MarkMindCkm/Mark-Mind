import Store from 'electron-store'
import Frame from './frame'
import uuid from './uuid'
import $ from 'jquery'
import getImageBase64 from './util/getImage'
import i18n from '../locales/index'

var store = new Store()
var profile = store.get('config')

if (profile.useMarkDown) {
    var converter = require('./markdown/parse').default
    var mermaid = require('mermaid')
    var flowchart = require('flowchart.js')
    var htmlToText = require('./markdown/jsHtmlToText').default
    if (!converter.makeHtml) {
        converter.makeHtml = converter.render
    }
    var echarts = require('echarts')
    mermaid.initialize({
        "theme": "forest",
        useMaxWidth: false
    })
}

function keepLastIndex(dom) {
    if ( window.getSelection ) { //ie11 10 9 ff safari
        dom.focus();  //ff
        var range = window.getSelection();
        range.selectAllChildren(dom); 
        range.collapseToEnd(); 
    }
    else if ( document.selection ) { //ie10 9 8 7 6 5
        var range = document.selection.createRange(); 
        range.moveToElementText(dom);
        range.collapse(false);
        range.select();
    }
};

class Node {
    constructor(data, mind = null) {
        let defaultData = {
            id: uuid(),
            text: '',
            backgroundColor: '#333',
            color: '#ccc',
            fontSize: 14,

            borderStyle: "solid",
            borderWidth: 0,
            borderColor: 'red',
            paddingLeft: 10,
            paddingRight: 10,
            paddingBottom: 6,
            paddingTop: 6,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            borderTopLeftRadius: 2,
            borderBottomLeftRadius: 2,
            borderTopRightRadius: 2,
            borderBottomRightRadius: 2,
            z: 10,
            priority: '',
            percent: '',
            isImageNode: false,
            imageWidth: 100,
            imageHeight: 100,
            imagePosition: 'top',
            imageRadius: 0,
            image: '',
            imageName: '',
            link: '',
            remark: '',
            todoDone: false,
            isTodo: false,
            shapeType: 'rect',
            stroke: '',         
            marks: [],
            isExpanded: true,
            textAlign: 'left',
            fontSize: 14,
            nodeWidth: 0,
            nodeHeight: 0
            //fontFamily:'Microsoft YaHei'
        }

        this.data = { ...defaultData, ...data };

        this.box = {};

        this.summaries = [];
        this.wireFrames = [];

        this.wfs = [];
        this.induces = [];

        this.parent = null;
        this.initialize = true;
        this.mind = mind;

        if ( this.mind ) {
            this.group = this.mind.shapeGroup.group();
        }

        this.induce = null;
        this.wireFrame = null;
        this.callout = null;
        this.relateLinks = [];

        this.selected = false;
        this.isExpanded = this.data.isExpanded || true;
        this.isHide = false;
        this.children = [];
        this.isEdit = false;
        this.nodeType = this.data.nodeType || 'richText';
        this.shapeType = this.data.shapeType;
        this.name = 'node';
        if (this.data.stroke) {
            this.stroke = this.data.stroke;
        }

        this.clickLink = this._clickLink.bind(this);
        this.clickRemark = this._clickRemark.bind(this);

        this.initDom();
        this.initialize = false;
        // this.refreshBox();
        // this.initEvent();
    }


    renderMdText() {
        if (this.mind.useMarkDown) {
            this.textDom.innerHTML = this.data.mdText;
        }
    }

    parseText() {
        var me = this;
        this.data.mdText = this.textDom.innerHTML;

        if (!this.mind.useMarkDown) {
            return;
        }

        this.data.text = (converter.makeHtml(htmlToText(this.textDom.innerHTML)).trim());
        this.textDom.innerHTML = this.data.text;

        if (this.initialize) {
            var len = this.textDom.querySelectorAll('.katex').length;
            if (len) {
                this.timeOut = setTimeout(() => {
                    me._refreshBounding();
                    me.refreshShape();
                    me.refreshBox();
                    me.getMind().emit('refresh', { node: me });
                    me.timeOut = null;
                }, 1600);
            }
        }


        this.textDom.querySelectorAll('img').forEach(element => {
            element.onload = () => {
                if (me.timeOut) {
                    return
                }
                me.timeOut = setTimeout(() => {
                    me._refreshBounding();
                    me.refreshShape();
                    me.refreshBox();
                    me.getMind().emit('refresh', { node: me })
                    me.timeOut = null
                }, 0)
            }

            element.onerror = () => {
                if (me.timeOut) {
                    return
                }
                me.timeOut = setTimeout(() => {
                    me._refreshBounding();
                    me.refreshShape();
                    me.refreshBox();
                    me.getMind().emit('refresh', { node: me })
                    me.timeOut = null
                }, 0)
            }
        });



        this.textDom.querySelectorAll('.md-echarts').forEach(element => {
            try {
                let options = JSON.parse(element.textContent);
                element.textContent = '';
                let chart = echarts.init(element, null, { renderer: 'svg' });
                chart.setOption(options);
            } catch (e) {
                element.outerHTML = `<pre>echarts complains: ${e}</pre>`
            }
        });

        var mermaidElement = this.textDom.querySelectorAll('.mermaid');
        mermaid.init(undefined, mermaidElement);

        mermaidElement.forEach(ele => {
            var svg = ele.querySelector('svg');
            var w = ele.clientWidth;
            svg.setAttribute('width', w);
           
        });
        // render flowchart
        this.textDom.querySelectorAll('.md-flowchart').forEach(element => {
            try {
                let code = element.textContent
                let chart = flowchart.parse(code)
                element.textContent = ''
                chart.drawSVG(element, {
                    'line-width': 1,
                    'line-color': '#666',
                    'font-color': '#666'
                });
            } catch (e) {
                element.outerHTML = `<pre>flowchart complains: ${e}</pre>`
            }
        });

        me._refreshBounding();
        me.refreshShape();
        me.refreshBox();

    }

    addRelateLink(link) {
        if (this.relateLinks.indexOf(link) == -1) {
            this.relateLinks.push(link)
        }
    }

    removeRelateLink(link) {
        var i = this.relateLinks.indexOf(link);
        if (i > -1) {
            this.relateLinks.splice(i, 1);
        }
    }

    hide() {
        this.dom.style.display = 'none';
        if (this.shapeSvg) this.shapeSvg.hide();
        this.isHide = true;
    }

    show() {
        this.dom.style.display = 'block';
        if (this.shapeSvg) this.shapeSvg.show();
        this.isHide = false;
    }

    collapse() {

        function hide(node) {
            node.hide();
            if (node.induces.length) {
                node.induces.forEach(w => {
                    hide(w.root);
                });
            }

            if (node.layout) {
                if (node.layout.group) {
                    node.layout.group.hide();
                    node.layout.isShow = false;
                }
            }

            if (node.isExpand()) {
                node.children.forEach(c => {
                    hide(c)
                });
            }
        };
       
        this.children.forEach(c => {
            hide(c);
        });

        if (this.layout) {
            if (this.layout.group) {
                this.layout.group.hide();
                this.layout.isShow = false;
            }
        }

        this.isExpanded = false;
        this.bar.classList.add('icon-jiahao');
        this.bar.classList.remove('icon-min');


         this.getMind().updateAllAssist();
    }
    expand() {
        this.isExpanded = true;
        this.bar.classList.remove('icon-jiahao');
        this.bar.classList.add('icon-min');
      
        function show(node) {
            node.show();
            node.boundingRect = null;
            if (node.induces.length) {
                node.induces.forEach(w => {
                    show(w.root);
                });
            }
            if (node.isExpand()) {
                if (node.layout) {
                    if (node.layout.group) {
                        node.layout.group.show();
                        node.layout.isShow = true;
                    }
                }
                node.children.forEach(c => {
                    show(c)
                });
            }
        };
        show(this);

        //some times node lose width and height
        function refresh(node) {
            node.refreshBox();
            if (node.isExpand()) {
                node.children.forEach(c => {
                    refresh(c);
                });
            }

            if (node.wfs.length) {
                node.wfs.forEach(w => {
                    w.show();
                 w.refreshItems();
                })
            }
            if (node.induces.length) {
                node.induces.forEach(w => {
                    w.show()
                   w.refreshItems();
                    refresh(w.root);
                });
            }
        }
        refresh(this);
    }

    addMark(mark) {
        this.data.marks.push(mark);
    }
    removeMark(mark) {
        var k = -1;
        this.data.marks.forEach((m, i) => {
            if (m.id == mark.id) {
                k = i;
            }
        });

        if (k > -1) {
            return this.data.marks.splice(k, 1);
        }
    }

    initShape() {
        if (!this.group) {
            if (this.mind) {
                this.group = this.mind.shapeGroup.group();
            } else {
                return;
            }
        }

        if (this.shapeSvg) {
            this.shapeSvg.remove();
            this.shapeSvg = null;
        }

        switch (this.data.shapeType) {
            case 'diamond':
            case 'bubble':

                this.shapeSvg = this.group.polygon();
                this.shapeSvg.fill(this.data.backgroundColor)
                    .stroke({
                        color: this.data.borderColor,
                        width: this.data.borderWidth,
                        linecap: 'round',
                        linejoin: 'round'
                    });
                break;
        }

    }

    refreshShape() {

        if (!this.shapeSvg) return;

        if (this.data.borderStyle == 'solid') {
            var dashArray = [0];
        }
        else if (this.data.borderStyle == 'dashed') {
            var dashArray = [6, 3];
        }
        else {
            var dashArray = [2, 2];
        }

        this.shapeSvg.attr('stroke-dasharray', dashArray).plot(this.getShapePoint());

        this.refreshBox();

        this.refreshDomPos();
    }

    getShapePoint() {
        var box = this.getDomBox();
        switch (this.data.shapeType) {
            case 'diamond':
                this.group.w = box.width / 2;
                this.group.h = box.height / 2;
                return [
                    [0, box.height],
                    [box.width, 0],
                    [box.width * 2, box.height],
                    [box.width, box.height * 2],
                ]
                break;
            case 'bubble':


                break;
        }

    }

    initDom() {

        this.dom = document.createElement('div');
        this.dom.dataset.id = this.data.id || this.id;
        this.dom.className = 'node';

        this.dom.setAttribute('draggable', true);

        this.assistDom = document.createElement('div');
        this.assistDom.className = "node-assist";

        this.textDom = document.createElement('div');
        this.textDom.className = 'node-text';


        this.groupDom = document.createElement('div');
        this.groupDom.className = "node-group clearfix";

        this.markDom = document.createElement('div');
        this.markDom.className = 'node-mark';
        this.markDom.style.display = "inline-block"

        this.groupDom.appendChild(this.assistDom);
        this.groupDom.appendChild(this.textDom);
        this.groupDom.appendChild(this.markDom);

        this.dom.appendChild(this.groupDom);

        this.groupDom.style.display = "block";

        this.marksDom = document.createElement('div');
        this.marksDom.classList.add('node-markList');
        this.groupDom.appendChild(this.marksDom);

        this.bar = document.createElement('div');
        this.bar.classList.add('node-bar');
        this.bar.classList.add('iconfont');
        if (this.isExpanded) {
            this.bar.classList.add('icon-min');
        }
        else {
            this.bar.classList.add('icon-jiahao');
        }

        this.bar.style = "border-radius:50%;cursor:point;font-size:12px;color:rgb(228, 228, 228);position:absolute;width:14px;height:14px;line-height:14px;text-align:center;";
        this.dom.appendChild(this.bar);
    
        this.textDom.innerHTML = this.data.text;

        if (!this.mind.el.contains(this.dom)) {
            this.mind.el.appendChild(this.dom);
        }

        this.parseText();
        this._refresh();
        this.textDom.node = this;
        this.dom.node = this;
    }

    _refresh() {

        this.dom.style.color = this.data.color;
        this.dom.style.fontSize = this.data.fontSize + 'px';
        this.dom.style.textAlign = this.data.textAlign;
        this.dom.style.fontSize = this.data.fontSize + 'px';
        // this.dom.style.fontFamily=this.data.fontFamily;

        this.dom.style.paddingLeft = this.data.paddingLeft + this.data.borderWidth + 'px';
        this.dom.style.paddingRight = this.data.paddingRight + this.data.borderWidth + 'px';
        this.dom.style.paddingTop = this.data.paddingTop + this.data.borderWidth + 'px';
        this.dom.style.paddingBottom = this.data.paddingBottom + this.data.borderWidth + 'px';
        this.dom.style.left = this.data.x + 'px';
        this.dom.style.top = this.data.y + 'px';
        this.dom.style.zIndex = this.data.z;

        if (this.data.nodeWidth) {
            this.dom.style.width = this.data.nodeWidth + 'px'
        } else {
            this.dom.style.width = 'auto'
        }
        if (this.data.nodeHeight) {
            this.dom.style.height = this.data.nodeHeight + 'px'
        } else {
            this.dom.style.height = 'auto'
        }

        this.initAssist();
        this.initReMark();
        this.initMark();
        this.refreshImage();

        if (['rect', 'parallelogram', 'ellipse', 'roundRect'].indexOf(this.data.shapeType) > -1) {

            if (this.shapeDom) this.dom.removeChild(this.shapeDom);

            this.shapeDom = document.createElement('div');
            this.shapeDom.className = 'node-shape ' + 'node-' + this.data.shapeType;
            this.shapeDom.style.width = '100%';
            this.dom.appendChild(this.shapeDom);
            this.shapeDom.node = this;

            if (this.shapeSvg) {
                this.shapeSvg.remove();
                this.shapeSvg = null;
            }

            this.shapeDom.style.backgroundColor = this.data.backgroundColor;
            this.shapeDom.style.borderStyle = this.data.borderStyle;
            if (this.getNodeType() == 'relateLink') {
                this.shapeDom.style.borderWidth = '0px';
            } else {
                this.shapeDom.style.borderWidth = this.data.borderWidth + 'px';
            }
            this.shapeDom.style.borderColor = this.data.borderColor;
            this.shapeDom.style.borderTopLeftRadius = this.data.borderTopLeftRadius + 'px';
            this.shapeDom.style.borderTopRightRadius = this.data.borderTopRightRadius + 'px';
            this.shapeDom.style.borderBottomLeftRadius = this.data.borderBottomLeftRadius + 'px';
            this.shapeDom.style.borderBottomRightRadius = this.data.borderBottomRightRadius + 'px';
        }
        else {
            if (this.shapeDom) {
                this.dom.removeChild(this.shapeDom);
                this.shapeDom = null;
            }

            this.initShape();
            this.refreshBox();
            this.setPosition(this.data.x, this.data.y);
            this.refreshShape();
        }
        this.refreshBox();

    }

    _refreshBounding() {
        var anchor = this;
        while (anchor) {
            anchor.boundingRect = null;
            anchor = anchor.parent || (anchor.belongInduce && anchor.belongInduce.node);
        }

        var root = this.mind.getRootByNode(this);

        if (root && root.layout && ['fish', 'time'].indexOf(root.layout.layoutName) > -1) {
            var sn = this.mind.getSecondNodeByNode(this);
            this.mind.traverseBF(n => {
                n.boundingRect = null;
            }, sn)
        }
    }

    _clickLink(e) {
        e.stopPropagation();
        e.preventDefault();
        this.getMind().emit('openExternal', { href: this.data.link });
    }

    _clickRemark(e) {
        e.stopPropagation();
        e.preventDefault();
        this.getMind().emit('showRemark', { node: this });
    }

    initReMark() {
        if (this.data.link) {
            this.linkDom && this.linkDom.removeEventListener('click', this.clickLink);
            this.linkDom && this.markDom.removeChild(this.linkDom);
            this.linkDom = document.createElement('a');
            this.linkDom.className = "node-link iconfont icon-infenicon15";
            this.linkDom.href = this.data.link;
            this.linkDom.style = "display:inline-block;verticle-align:middle;padding:0 2px;font-size:18px;text-decoration:none";
            this.linkDom.setAttribute('target', '_blank');
            this.markDom.appendChild(this.linkDom);
            this.linkDom.addEventListener('click', this.clickLink);
        } else {
            this.linkDom && this.linkDom.removeEventListener('click', this.clickLink);
            this.linkDom && this.markDom.removeChild(this.linkDom);
            this.linkDom = null;
        }

        if (this.data.remark) {
            this.remarkDom && this.remarkDom.removeEventListener('click', this.clickRemark);
            this.remarkDom && this.markDom.removeChild(this.remarkDom);
            this.remarkDom = document.createElement('div');
            this.remarkDom.className = "node-remark iconfont icon-note";
            this.remarkDom.style = "display:inline-block;verticle-align:middle;padding:0 2px";
            //this.remarkDom.innerHTML=this.data.remark;
            this.markDom.appendChild(this.remarkDom);
            this.remarkDom.addEventListener('click', this.clickRemark)
        } else {
            this.remarkDom && this.remarkDom.removeEventListener('click', this.clickRemark);
            this.remarkDom && this.markDom.removeChild(this.remarkDom);
            this.remarkDom = null;
        }
    }
    _imageClick(e) {
        e.stopPropagation();
        if (!this.imageMark) {
            this.imageMark = new Frame(this, this.imageDom);
        }
        this.getMind().emit('hide');
        this.getMind().emit('showIamgeSetup', { node: this });
    }

    refreshImage() {
        var me = this;
        if (this.imageDom) {
            this.imageDom.removeEventListener('click', this.imageClick);
            this.dom.removeChild(this.imageDom);
            this.imageDom = null;
        }

        if (this.data.isImageNode) {
            this.imageClick = this._imageClick.bind(this);
            this.imageDom = document.createElement('img');
            this.imageDom.src = this.data.image;
            this.imageDom.style.width = this.data.imageWidth + 'px';
            this.imageDom.style.height = this.data.imageHeight + 'px';
            this.imageDom.style.borderRadius = this.data.imageRadius;
            this.imageDom.addEventListener('click', this.imageClick);
            this.imageDom.style.margin = '';
            this.imageDom.setAttribute('draggable', false);
            if (this.data.image && this.data.image.startsWith('http')) {
                getImageBase64(this.data.image).then(res => {
                    me.imageDom.src = res;
                    me.data.image = res;
                    if (res.indexOf('data:image/png') > -1) {
                        me.data.imageName = 'mind.png'
                    }
                    else if (res.indexOf('data:image/gif') > -1) {
                        me.data.imageName = 'mind.gif'
                    }
                    else if (res.indexOf('data:image/jpeg') > -1) {
                        me.data.imageName = 'mind.jpg'
                    } 
                    else if (res.indexOf('data:image/svg+xml') > -1) {
                        me.data.imageName = 'mind.svg';
                    } 
                    else {
                        me.data.imageName = 'mind.png';
                    }
                });
            }

            if (this.data.imagePosition == 'left') {
                this.dom.insertBefore(this.imageDom, this.groupDom);
                this.imageDom.style.display = "inline-block";
                this.imageDom.style.verticalAlign = "middle";
                this.imageDom.style.marginRight = "4px";
                this.groupDom.style.display = 'inline-block';
            }
            else if (this.data.imagePosition == 'right') {
                this.dom.appendChild(this.imageDom);
                this.imageDom.style.display = "inline-block";
                this.imageDom.style.verticalAlign = "middle";
                this.imageDom.style.marginLeft = "4px";
                this.groupDom.style.display = 'inline-block';
            }
            else if (this.data.imagePosition == 'bottom') {
                this.dom.appendChild(this.imageDom);
                this.imageDom.style.display = "block";
                this.imageDom.style.marginTop = "6px";
                this.imageDom.style.marginLeft = "auto";
                this.imageDom.style.marginRight = "auto";
                this.groupDom.style.display = 'block';
            }
            else {
                this.dom.insertBefore(this.imageDom, this.groupDom);
                this.imageDom.style.display = "block";
                this.imageDom.style.marginBottom = "6px";
                this.imageDom.style.marginLeft = "auto";
                this.imageDom.style.marginRight = "auto";
                this.groupDom.style.display = 'block';
            }
        }

    }

    initAssist() {

        if (this.data.priority) {
            this.priorityDom && this.assistDom.removeChild(this.priorityDom);
            this.priorityDom = document.createElement('div')
            this.priorityDom.dataset.priority = this.data.priority;
            this.priorityDom.className = "node-priority";
            this.priorityDom.innerText = this.data.priority;
            this.assistDom.appendChild(this.priorityDom);
        } else {
            this.priorityDom && this.assistDom.removeChild(this.priorityDom);
            this.priorityDom = null;
        }

        if (this.data.isTodo) {
            this.todoDom && this.assistDom.removeChild(this.todoDom);
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

            // console.log(this.data.todoDone);
            if (this.data.todoDone) {
                $(this.todoDomcheck).prop('checked', true);
            } else {
                $(this.todoDomcheck).prop('checked', false);
            }

            this.todoDom.onclick = (e) => {
                e.stopPropagation();
            };

            this.todoDom.ondblclick = (e) => {
                e.stopPropagation();
            };

            this.todoDomcheck.onclick = (e) => {
                this.toggleTodoState();
            };

        }



        if (this.data.percent) {
            this.percentDom && this.assistDom.removeChild(this.percentDom);
            this.percentDom = document.createElement('div')
            this.percentDom.dataset.percent = this.data.percent;
            if (this.data.percent == 'not-start') {
                this.percentDom.className = "node-percent iconfont icon-weikaishi";
                this.data.todoDone = false;
            } else if (this.data.percent == 100) {
                this.percentDom.className = "node-percent iconfont icon-wancheng";
                this.data.todoDone = true;
            } else {
                this.percentDom.className = "node-percent pie";
                this.data.todoDone = false;
            }
            this.assistDom.appendChild(this.percentDom);
        } else {
            this.percentDom && this.assistDom.removeChild(this.percentDom);
            this.percentDom = null;
        }

        this._refreshTodo();
        this.initMark();

    }

    initMark() {
        this.marksDom.innerHTML = '';
        if (this.data.marks.length) {
            this.data.marks.forEach(mark => {
                var m = document.createElement('div')
                m.classList.add('node-mark-item');
                m.innerHTML = mark.text;
                m.style.backgroundColor = mark.fill;
                this.marksDom.appendChild(m);
            });
        }
    }

    setTodoDone() {
        if (this.data.isTodo) {
            this.data.todoDone = true;
            this._refreshTodo();
        }
    }

    _refreshTodo() {
        if (this.data.todoDone) {
            if (!this.textDom.classList.contains('node-todo-done')) {
                this.textDom.classList.add('node-todo-done');
            }
        } else {
            if (this.textDom.classList.contains('node-todo-done')) {
                this.textDom.classList.remove('node-todo-done');
            }
        }
    }

    toggleTodoState() {
        if (this.data.isTodo) {
            this.data.todoDone = !this.data.todoDone;
            this._refreshTodo();
        }
    }

    setTodo() {
        this.data.isTodo = true;
        this.initAssist();
        this.refreshBox();
    }

    removeTodo() {
        this.data.isTodo = false;
        // this.data.todoDone=false;
        this.todoDom && this.assistDom.removeChild(this.todoDom);
        //this.todoDom.removeEventListener('click');
        // this.todoDom.removeEventListener('dblclick');
        //this.todoDomcheck.removeEventListener('click');
        this.todoDom = null;
        this.refreshBox();
    }

    isTodo() {
        return this.data.isTodo;
    }

    setPriority(p) {
        if (this.data.priority != p) {
            this.data.priority = p;
            this.initAssist()
        }
    }
    removePriority() {
        this.data.priority = '';
        this.dom.removeChild(this.priorityDom);
        this.priorityDom = null;
        this.refreshBox();
    }

    setPercent(p) {
        if (this.data.percent != p) {
            this.data.percent = p;
            this.initAssist()
        }
    }

    removePercent() {
        this.data.percent = '';
        this.dom.removeChild(this.percentDom);
        this.percentDom = null;
        this.refreshBox();
    }

    setLink(link) {
        this.data.link = link;
        this.initReMark();
    }

    removeLink() {
        if (this.data.link) {
            this.markDom.removeChild(this.linkDom);
            this.linkDom = null;
            this.refreshBox();
        }
    }

    setRemark(remark) {
        this.data.remark = remark;
        this.initReMark();
    }

    removeRemark() {
        if (this.data.remark) {
            this.markDom.removeChild(this.remarkDom);
            this.remarkDom = null;
            this.refreshBox();
        }
    }


    resizeNode() {
        this.nodeMark = new Frame(this, this.dom, 'node');
    }

    cancelResize() {
        if (this.nodeMark) {
            this.nodeMark.remove();
            this.nodeMark = null;
        }
    }


    getNodeType() {
        return this.data.nodeType || this.nodeType;
    }

    setText(text) {
        this.textDom.innerHTML = text;
        this.parseText();
        this.refreshBox();
        this.refreshCBox();
    }

    getText() {
        return this.data.mdText || this.data.text;
    }
    getTxt() {
        return this.textDom.textContent || this.textDom.innerText || ''
    }

    refresh() {

        this._refresh();
        this.refreshShape();


        if (this.getNodeType() == 'callout') {
            if (!this.callout) return;
            this.callout.color = this.data.backgroundColor;
            this.callout.refresh();
        }

        if (this.getNodeType() == 'relateLink') {
            if (!this.relateLink) return;
            this.relateLink.data.color = this.data.backgroundColor;
            this.relateLink.data.width = this.data.borderWidth || 1;
            if (this.data.borderStyle == 'solid') {
                this.relateLink.data.dashArray = [0];
            } else if (this.data.borderStyle == 'dashed') {
                this.relateLink.data.dashArray = [6, 4];
            } else {
                this.relateLink.data.dashArray = [2, 2];
            }
            this.relateLink.refresh();
        }

        this.refreshCBox();

    }

    addChild(node, i) {
        if (this.children.indexOf(node) == -1) {
            if (i > -1) {
                if (i > this.children.length) i = this.children.length;
                this.children.splice(i, 0, node);
            } else {
                this.children.push(node);
            }
            node.parent = this;
        }
    }

    getMind() {
        return this.mind;
    }

    getSiblings() {
        if (this.parent) {
            return this.parent.children.filter(item => item != this);
        } else {
            return [];
        }
    }

    getId() {
        return this.data.id || this.id;
    }

    isShow() {
        return !this.isHide;
    }

    addThemeClass(name) {
        if (!this.dom.classList.contains(name)) {
            this.dom.classList.add(name);
        }
        this.themeName = name
    }

    addClass(name) {
        if (!this.shapeDom.classList.contains(name)) {
            this.shapeDom.classList.add(name);
        }
    }

    removeClass(name) {
        if (this.shapeDom.classList.contains(name)) {
            this.shapeDom.classList.remove(name);
        }
    }

    removeThemeClass(name) {
        this.dom.classList.remove(name || this.themeName);
        this.themeName = '';
    }


    move(dx, dy) {
        var p = this.getPosition();
        this.setPosition(p.x + dx, p.y + dy);
    }

    getNodeList() {
        var list = [];
        (function getList(node) {
            list.push(node);
            node.children.forEach((n) => {
                getList(n);
            });
        })(this);
        return list;
    }

    getShowNodeList() {
        var list = [];
        (function getList(node) {
            if (node.isShow()) {
                list.push(node);
            }
            node.children.forEach((n) => {
                getList(n);
            });
        })(this);
        return list;
    }

    getLevel() {

        var level = 0, parent = this.parent;
        while (parent) {
            level++;
            parent = parent.parent;
        }
        return level;
    }


    getPosition() {
        return {
            x: this.box.x,
            y: this.box.y
        }
    }

    refreshDomPos() {
        var x = this.box.x;
        var y = this.box.y;
        if (this.group) {
            this.dom.style.left = x + this.group.w + 'px';
            this.dom.style.top = y + this.group.h + 'px';
        }
    }

    setPosition(x, y) {

        this.box.x = x;
        this.box.y = y;
        this.data.x = x;
        this.data.y = y;
        if (['rect', 'parallelogram', 'ellipse', 'roundRect'].indexOf(this.data.shapeType) > -1) {
            this.dom.style.left = x + 'px';
            this.dom.style.top = y + 'px';
        }
        else {
            if (this.group) {
                this.group.attr({
                    transform: `translate(${x},${y})`
                });
                this.dom.style.left = x + this.group.w + 'px';
                this.dom.style.top = y + this.group.h + 'px';
            }
        }
    }

    getDomBox() {
        var Top = parseInt(this.dom.style.top);
        var Left = parseInt(this.dom.style.left);
        var Width = Math.ceil(this.dom.offsetWidth);
        var Height = Math.ceil(this.dom.offsetHeight);

        if (this.selected) {
            Width = Width - 4;
            Height = Height - 4;
        }

        return {
            x: Left,
            y: Top,
            width: Width,
            height: Height
        }
    }

    getSvgBox() {
        if (this.shapeSvg) {
            var box = this.shapeSvg.bbox();
            this.box.width = box.width;
            this.box.height = box.height;
            return this.box
        } else {
            return this.box;
        }
    }

    refreshBox(flag) {
        if (['rect', 'parallelogram', 'ellipse', 'roundRect'].indexOf(this.data.shapeType) > -1) {
            this.box = this.getDomBox();
        }
        else {
            this.box = this.getSvgBox();
        }
        return this.box;
    }

    getBox() {
        return this.box;
    }

    refreshCBox() {
        this.cbox = this.getCBox();
    }

    getCBox(flag) {
      
        var b = this.getBox();
        var th = 0, bh = 0
        if (this.callout) {
            var b1 = this.callout.getBox();
            if (b1.y < b.y) {
                th = b.y - b1.y
            }
            if ((b1.y + b1.height) > (b.y + b.height)) {
                bh = b1.y + b1.height - b.y - b.height;
            }
        }
        if (flag) {


            if (this.wfs.length) {
                var max = 0;
                this.wfs.forEach(wf => {
                    if (wf.data && wf.data.text) {
                        var h1 = wf.getTextBox().height;
                        if (max < h1) {
                            max = h1;
                        }
                    }
                })

                th += max + 3;
                bh += 3;
            }
        }

        return {
            ...{},
            ...b,
            ...{
                th,
                bh
            }
        }
    }

    getBBox() {
        var b = this.getBox();
        if (this.callout) {
            this.callout.refresh();
            var b1 = this.callout.getBox();
            b = this.merge(b, b1);
        }
        return b;
    }
    merge(b1, b2) {
        var x1 = Math.max(b1.x + b1.width, b2.x + b2.width);
        var y1 = Math.max(b1.y + b1.height, b2.y + b2.height);
        var x = Math.min(b1.x, b2.x);
        var y = Math.min(b1.y, b2.y);
        return {
            x,
            y,
            x1,
            y1,
            width: x1 - x,
            height: y1 - y
        }
    }

    getBoundingRect() {
        return this.box;
    }

    getLayout() {
        var anchor = this;
        var layout = null;
        while (anchor) {
            if (anchor.layout) {
                layout = anchor.layout;
                break;
            }
            anchor = anchor.parent;
        }
        return layout;
    }

    getTopLayout() {
        if (!this.parent) {
            return this.layout || null;
        }

        var anchor = this;
        var layout = null;
        var _layout = this.layout;
        this.layout = null;
        while (anchor) {
            if (anchor.layout) {
                layout = anchor.layout;
                break;
            }
            anchor = anchor.parent;
        }
        this.layout = _layout;
        this.topLayout = layout;
        return layout;
    }


    getParent() {
        return this.parent;
    }

    select() {
        this.selected = true;
        this.dom.style.border = "2px solid blue"
    }

    unSelect() {
        this.selected = false;
        this.dom.style.border = ""
    }
    isExpand() {
        return this.isExpanded;
    }

    isTopParent(node) {
        if (!node || (node == this)) {
            return false;
        }

        var flag = false;

        var anch = node;
        while (anch) {
            if (anch == this) {
                flag = true;
                break;
            } else {
                anch = anch.parent
            }
        }
        return flag;
    }

    getChildren() {
        return this.children;
    }

    isFirst() {
        if (this.parent) {
            var childrens = this.parent.getChildren();
            return childrens && childrens.indexOf(this) == 0
        } else {
            return true;
        }
    }

    isLast() {
        if (this.parent) {
            var childrens = this.parent.getChildren();
            return childrens.length && childrens.indexOf(this) == (childrens.length - 1);
        } else {
            return true;
        }
    }

    removeChild(child) {
        var index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
        }
        return index;
    }

    moveNode(nodeId, dropNode, type) {

        if (dropNode.getId() == nodeId) { 
            return;
        }

        var dragNode = this.mind.getNodeById(nodeId);

        if (!dragNode) {
            return;
        }

        var flag = false;
        var p = dropNode.parent;
        while (p) {
            if (p == dragNode) {
                flag = true;
                break;
            }
            p = p.parent;
        }
        if (flag) {  //parent not can change to child
            return;
        }

        this.mind._refreshBounding(dragNode);
        this.mind._refreshBounding(this);

        if (!this.isExpanded) {
            this.expand();
        }

        if (dragNode && dragNode.nodeType == 'freeNode') {

            this.mind.execute('changeFreeRootToNode', { node: dragNode, parent: this });

        } else {

            if (dragNode.data.main) {
                return;
            }
            if (type == 'top' || type == 'left') {   
                this.mind.execute('moveNode', { type: 'siblings', node: dragNode, oldParent: dragNode.parent, dropNode, direct: type })
            } else if (type == 'down' || type == 'right') {  
                this.mind.execute('moveNode', { type: 'siblings', node: dragNode, oldParent: dragNode.parent, dropNode, direct: type })
            } else if (type.indexOf('child') > -1) {
                var typeArr = type.split('-');
                if (typeArr[1]) {
                    this.mind.execute('moveNode', { type: 'child', node: dragNode, oldParent: dragNode.parent, parent: this, direct: typeArr[1] })
                }
                else {
                    this.mind.execute('moveNode', { type: 'child', node: dragNode, oldParent: dragNode.parent, parent: this });
                }
            }
        }

    }

    cancelEdit() {

        if (this.isEdit) {
            this.textDom.style.display = "inline-block";
            var parsed = false;
            if (this.oldText != this.textDom.innerHTML) {

                this.mind.execute('changeNode', {
                    nodes: [this],
                    data: {
                        key: 'text',
                        oldText: this.oldText,
                        text: this.textDom.innerHTML
                    }
                });
                parsed = true;
            }
            else {

                if (!parsed) this.parseText();
            }
    
            this.isEdit = false;
            this.dom.style.zIndex = this.data.z || 10;
            this.getMind().status = '';

            if (!this.dom.classList.contains('node-callout')) {
                this.dom.setAttribute('draggable', true);
            }
            this.textDom.setAttribute('contenteditable', false);

            if (this.nodeType == 'relateLink') {
                if (!this.data.text) {
                    this.mind.execute('relateHideNode', { relateLink: this.relateLink });
                }
            }

        }
    }



    getTextBox() {
        return {
            width: this.groupDom.offsetWidth,
            height: this.groupDom.offsetHeight
        }
    }


    edit() {
        this.mind.clearEditNode();
        this.textDom.setAttribute('contenteditable', true);
        this.isEdit = true;
        this.dom.style.zIndex = 60;
        this.getMind().status = 'editNode';
        this.renderMdText();
        this.oldText = this.data.mdText;
        keepLastIndex(this.textDom);
        if (this.data.main) {
            if (this.getTxt() == i18n.t('node.topic')) {
                this.selectText();
            }
        } else {
            if (this.getTxt() == i18n.t('node.subTopic') || this.nodeType == 'relateLink' || this.nodeType == 'wireFrame') {
                this.selectText();
            }
        }

        this.getMind().emit('hide');
    }
    _clickFn() {
        this.mind && this.mind.clearSelectNode();
        this.mind._selectNode = this;
        this.select();
        this.mind.emit('selectNode', { node: this });
        if (this.nodeType == 'induce' || this.belongInduce) {
            this.mind.emit('showInduce', {
                induce: this.belongInduce
            });
        }
        if (!this.isEdit) {
            this.mind.emit('showNodeNav', { node: this });
        }

        if (this.mind.status == 'editNode') {
            if (this.mind.editNode != this) {
                this.mind.status = '';
                this.mind.editNode = null;
            }
        }
    }

    getData(flag, deleteEvent) {
        var data = { ...this.data, ...{ pid: this.parent && this.parent.getId() || '', nodeType: this.nodeType, isExpand: this.isExpanded } };
        if (this.layout) {
            var layoutName = this.layout.layoutName;
            var layoutDirect = this.layout.direct;
            data.layout = {
                layoutName,
                direct: layoutDirect
            }
        } else {
            data.layout = null;
        }

        if (this.wireFrame) {
            data.wireFrame = true;
        }
        if (this.induce) {
            data.induce = true;
        }
        if (this.data.main) {
            data.isRoot = true;
        }
        if (flag) {
            data.text = this.textDom.textContent || this.textDom.innerText;
        } else {
            if (this.data.mdText) {
                data.text = this.data.mdText.trim();
            }
        }

        if (this.belongInduce) {
            data.belongInduce = this.belongInduce.getId();
        }

        delete data.innerText;
        delete data.mdText;

        if (this.stroke) {
            data.stroke = this.stroke;
        }

        if (deleteEvent) {
            this.removeEvent();
        }

        return data
    }

    setImagePosition(pos) {
        this.data.imagePostion = pos || 'top';
        this._refreshBounding();
        this.refresh();
    }

    getImagePosition() {
        return this.data.imagePostion;
    }

    getHtml() {
     
        var html = this.textDom.innerHTML;

        if (this.data.link) {
            var linkHtml = `<a href="${this.data.link}">${this.data.link}</a>`;
            html += linkHtml;
        }

        if (this.data.isImageNode) {
            var imgHtml = `<p><img src="${this.data.image}" style="width:600px;text:-align:center"/></p>`;
            html += imgHtml;
        }

        if (this.data.remark) {
            html += this.data.remark;
        }

        return html;
    }

    isLeaf() {
        return !this.children.length
    }

    setData(data) {
        this.data = { ...this.data, ...data };
        this.refresh();
    }

    getStyle() {
        var obj = {};
        [
            'backgroundColor',
            'borderStyle',
            'borderWidth',
            'borderColor',
            'paddingLeft',
            'paddingRight',
            'paddingBottom',
            'paddingTop',
            'borderTopLeftRadius',
            'borderBottomLeftRadius',
            'borderTopRightRadius',
            'borderBottomRightRadius',
            'textAlign',
            'color',
            'fontSize',
            'fontFamily'
        ].forEach(k => {
            obj[k] = this.data[k]
        });
        obj.text = this.textDom.innerHTML;
        return obj;
    }

    setStyle(data) {
        this.setData(data);
    }

    selectText() {
        var text = this.textDom;
        if (document.body.createTextRange) {
            var range = document.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) {
            var selection = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }


    initEvent() {


    }

    removeEvent() {

        this.textDom.onblur = null;
        this.bar.onclick = null;
        this.bar.ondblclick = null;
        this.dom.ondrop = null;

        if (this.data.link) {
            this.linkDom && this.linkDom.removeEventListener('click', this.clickLink);
        }

        if (this.data.remark) {
            if (this.remarkDom) {
                this.remarkDom.removeEventListener('click', this.clickRemark);
            }
        }

        if (this.imageDom) {
            this.imageDom.removeEventListener('click', this.imageClick);
        }

        if (this.todoDom) {
            this.todoDom.onclick = null;
            this.todoDom.ondblclick = null;
        }

        if (this.todoDomcheck) {
            this.todoDomcheck.onclick = null;
        }
    }
}

export default Node;