<template>
  <div style="width: 100%; height: 100%" class="">
    <div class="control" v-show="!isPlayptt" @dblclick.stop="">
      <span
        class="iconfont icon-tianjiatongjijiedian addNode"
        :title="$t('node.topic')"
        @click.stop="execute('addNode')"
      ></span>
      <span
        class="iconfont icon-tianjiazijiedian addChild"
        :title="$t('node.subTopic')"
        @click.stop="execute('addChild')"
      ></span>
      <span
        class="iconfont icon-gaiyao induce"
        :title="$t('node.summary')"
        @click.stop="execute('induce')"
      ></span>
      <span
        class="iconfont icon-xuxiankuang wireFrame"
        :title="$t('node.boundary')"
        @click.stop="execute('wireFrame')"
      ></span>
      <!-- <span class="iconfont icon-beizhu remark" title="Add Note" @click="execute('remark')"></span> -->
      <span
        class="iconfont icon-dagang list"
        :title="$t('node.gotoList')"
        @click.stop="enterList"
      ></span>
      <span
        @click.stop="skin"
        :title="$t('node.skin')"
        class="iconfont icon-pifu"
        style="float: right; margin-top: 6px; margin-right: 4px"
      ></span>
      <span
        @click.stop="setting"
        :title="$t('node.style')"
        class="iconfont icon-yangshi"
        style="float: right; margin-top: 6px; margin-right: 4px"
      ></span>
      <span
        @click.stop="downloadPng"
        class="iconfont icon-PNG"
        style="float: right; margin-top: 6px; margin-right: 4px"
        :title="$t('node.downloadPng')"
      ></span>
    </div>

    <!-- <div class="setting">
            <div @click.stop="setting" class="iconfont icon-shezhi"></div>
            
      </div> -->

    <themeSetup @changetheme="changeTheme" v-if="showSkin" />

    <setup
      v-if="showSetup"
      @changestroke="changeStroke"
      @changebackground="changeBackground"
      @changelayout="setLayout"
      :layoutName="layoutName"
      :layoutDirect="layoutDirect"
      :nodeDirect="nodeDirect"
      :isRoot="isRoot"
    />

    <div id="mind-container" ref="container" class="mind-editor dragscroll">
      <div id="mind" ref="mind" class="markdown-body">
        <nodeMenu
          v-if="menuShow"
          @command="command"
          :left="menuLeft"
          :top="menuTop"
          :nodeType="nodeType"
        />
        <nodeNav
          v-if="nodeNavShow"
          @setStatus="setStatus"
          @command="cmd"
          @changeMark="changeMark"
          @addMindMark="addMindMark"
          :nodeMarkList="nodeMarkList"
          :mindMarkList="mindMarkList"
          @removeMindMark="removeMindMark"
          @addNodeMark="addNodeMark"
          @removeNodeMark="removeNodeMark"
          :link="link"
          :image="image"
          :nodeType="nodeType"
          :remark="remark"
          :left="nodeNavLeft"
          :top="nodeNavTop"
        />

        <ImageSetup
          v-if="imageShow"
          :left="imageLeft"
          :top="imageTop"
          @command="changeNodeImage"
        />

        <win
          v-if="showAssist"
          style="padding: 0"
          class="ql-container"
          @mousedown.stop="remarkMousDown"
          @click.stop="assistClick"
          :left="winLeft"
          :top="winTop"
        >
          <div v-if="showLink" style="max-width: 800px">{{ link }}</div>

          <div
            v-if="showRemark"
            v-html="remark"
            class="ql-editor"
            style="max-width: 800px"
          ></div>
        </win>

        <wfSetup
          v-if="showWireFrame"
          :left="wfleft"
          :top="wftop"
          :wftext="wfText"
          @removewireframe="removeWireFrame"
          @changeWireFrame="changeWireFrame"
        />

        <!-- drag -->
        <div
          ref="drag"
          :class="'drag ' + changeAssist.dragModel"
          v-if="showWireFrame || showInduce"
          v-bind:style="
            'left:' +
            changeAssist.x +
            'px;top:' +
            changeAssist.y +
            'px;width:' +
            changeAssist.width +
            'px;height:' +
            changeAssist.height +
            'px'
          "
        >
          <div
            class="drag-top"
            @mousedown="
              dragDown(
                changeAssist.dragModel == 'model-top' ? 'up' : 'left',
                $event
              )
            "
            @mouseup="dragup"
          >
            <div class="d3"></div>
          </div>
          <div
            class="drag-bottom iconfont"
            @mousedown="
              dragDown(
                changeAssist.dragModel == 'model-top' ? 'down' : 'right',
                $event
              )
            "
            @mouseup="dragup"
          >
            <div class="d4"></div>
          </div>
        </div>

        <div
          class="ppt-frame-container"
          v-if="addppt"
          @mousedown.stop="mousedown($event)"
          @mousemove.stop="mousemove"
          @mouseup.stop="mouseup"
        >
          <div
            v-for="(item, i) in ppt"
            v-bind:key="i"
            :data-index="i"
            :style="
              'left:' +
              item.left +
              'px;top:' +
              item.top +
              'px;width:' +
              item.width +
              'px;height:' +
              item.height +
              'px'
            "
            class="ppt-frame"
          >
            <span
              @click.stop="deleteppt(item)"
              class="ppt-delete iconfont icon-shanchu"
            ></span>
            <span class="ppt-num">{{ i + 1 }}</span>
            <span
              class="drag-frame iconfont icon-resize"
              :data-index="i"
            ></span>
          </div>
        </div>

        <div id="dragType" class="drag-type arrow-right"></div>

        <div class="relate-ship" v-if="showRelateShip">
          <div class="relate-jump">
            <span @click.stop="showRelateNode('start')">{{
              $t("node.startNode")
            }}</span
            ><span @click.stop="showRelateNode('end')">{{
              $t("node.endNode")
            }}</span>
          </div>
          <div class="relate-start">
            <h3>{{ $t("node.startPoint") }}</h3>
            <span :class="item=='line'?'sline':item" @click.stop="changeMaker('start', item)" v-for="(item,i) in marker" :key='i'>
                  <span class="shape"></span>
                 <span class="line"></span>
            </span>

            <span class="none" @click.stop="changeMaker('start', '')">
              <span class="shape"></span>
              <span class="line"></span>
            </span> 
          </div>
          <div class="relate-end">
            <h3>{{ $t("node.endPoint") }}</h3>
            <span :class="item=='line'?'sline':item" @click.stop="changeMaker('end', item)" v-for="(item,i) in marker" :key='i'>
              <span class="shape"></span>
              <span class="line"></span>
            </span>

            <span class="none" @click.stop="changeMaker('end', '')">
              <span class="shape"></span>
              <span class="line"></span>
            </span> 
          </div>
          <button class="btn" @click="deleteRelate">
            {{ $t("node.deleteRelate") }}
          </button>
        </div>
      </div>
    </div>

 

    <div class="ppt-info" v-if="model == 'showppt'" style="user-select: none">
      <span class="ppt-control iconfont icon-prev" @click="prevPpt()"></span>
      <span
        @click="playptt"
        class="ppt-control iconfont icon-play"
        v-show="!isPlayptt"
      ></span>
      <span class="ppt-control iconfont icon-next" @click="nextPpt()"></span>
      <span>{{ pptIndex }}/{{ pptLength }}</span>
      <span
        class="iconfont icon-power"
        @click="backNormal()"
        v-show="isPlayptt"
      ></span>
      <span
        @click="clearppt"
        class="ppt-control iconfont icon-qingchu"
        v-show="!isPlayptt"
      ></span>
    </div>

    <div class="ppt-mark-con" ref="pptMarkCon">
      <canvas
        ref="pptMark"
        id="ppt-mark"
        class="ppt-mark"
        width="1000px"
        height="600px"
      ></canvas>
    </div>

    <div class="win-reduce">
      <span class="iconfont icon-fangda" @click.stop="setScale('up')"></span>
      <span>{{ mindScale }}%</span>
      <span class="iconfont icon-suoxiao" @click.stop="setScale('down')"></span>
      <span>|</span>
      <span class="iconfont icon-juzhong" @click.stop="mindCenter"></span>
    </div>
  </div>
</template>

<script>

import fs from "fs";
import { shell, clipboard, remote } from "electron";

import path from "path";
import Store from "electron-store";

import i18n from "../locales/index";
import $ from "jquery";
import JSZip from "jszip";
import Mind from "../mind/mind";
import Node from "../mind/node";

import nodeMenu from "./nodeMenu";
import RelateLink from "../mind/assist/relateLink";
import WireFrame from "../mind/assist/wireFrame";
import layoutMap from "../mind/layout/layoutMap";
import dragscroll from "../mind/dragscroll";
import theme from "../mind/theme";
import PptFrame from "../mind/pptFrame";
import html2canvas from "html2canvas";

import collide from "../mind/util/collide";

import { fullScreen, exitfullscreen } from "../mind/util/fullScreen";
import uuid from "../mind/uuid";

var store = new Store();
var profile = store.get("config");
var canvasWidth = profile.canvasWidth;
var canvasHeight = profile.canvasHeight;
var dialog = remote.dialog;

export default {
  name: "editor",
  props: {},
  components: {
    setup: () => import("./setup"),
    nodeMenu: () => import("./nodeMenu"),
    nodeNav: () => import("./nodeNav"),
    win: () => import("./win"),
    themeSetup: () => import("./theme"),
    ImageSetup: () => import("./image"),
    wfSetup: () => import("./wireFrame"),
    treeList: () => import("./treeList"),
  },
  data() {
    return {
      showList: false,
      showSetup: false,
      showRelateShip: true,
      layoutName: "",
      layoutDirect: "",
      isRoot: true,
      nodeDirect: "",

      menuLeft: 0,
      menuTop: 0,
      menuShow: false,

      nodeNavShow: false,
      showRichText: false,
      richText: "",
      nodeNavLeft: 0,
      nodeNavTop: 0,

      imageShow: false,
      imageLeft: 0,
      imageTop: 0,
      image: "",

      winLeft: 0,
      winTop: 0,

      showAssist: false,

      showLink: false,
      link: "",

      showRemark: false,
      remark: "",
      nodeType: "",

      drag: false,
      sx: 0,
      sy: 0,
      dragFrame: false,

      addppt: false,
      isPlayptt: false,
      model: "normal",
      ppt: [],
      pptIndex: 0,
      nowppt: null,

      mindMarkList: [],
      nodeMarkList: [],

      showWireFrame: false,
      wfleft: 0,
      wftop: 0,
      wfText: "",

      mindScale: 100,
      navStatus: "node",

      showSkin: false,
      showInduce: false,
      ctrl:null,

      changeAssist: {
        item: null,
        dragModel: "model-top",
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },

      marker:[
        'circle','rect','line','arrow','arrow1'
      ]

      
    };
  },
  computed: {
    pptLength() {
      return this.ppt.length;
    },
  },

  beforeRouteLeave(to, from, next) {
    this.mind.off("context", this.contextEvent);
    this.mind.off("showWireFrame", this.showWireFrameEvent);
    this.mind.off("showInduce", this.showInduceEvent);
    this.mind.off("showNodeNav", this.showNodeNavEvent);
    this.mind.off("hide", this.hideEvent);
    this.mind.off("showIamgeSetup", this.showIamgeSetupEvent);
    this.mind.off("selectNode", this.selectNodeEvent);
    this.mind.off("selectNodes", this.selectNodesEvent);
    this.mind.off("showLink", this.showLinkEvent);
    this.mind.off("showRemark", this.showRemarkEvent);
    this.mind.off("refreshMind", this.refreshMindEvent);
    this.mind.off("openExternal", this.openExternalEvent);
    this.mind.off("openFile", this.openFileEvent);
    this.mind.off("addLocalFile", this.addLocalFileEvent);
    this.mind.off("showNode", this.showNodeEvent);
    this.mind.off("showRelateShip", this.showRelateShipEvent);
    this.mind.clear();
    this.mind.removeEvent();

    $("#mind").off("mousemove");

    this.mind = null;
    document.onkeyup = null;
    document.onkeydown = null;
    document.onmousewheel = null;

    next();
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
       var w =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

      var h =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      var me = this;

      if (document.body.classList.contains("mark-list")) {
        document.body.classList.remove("mark-list");
      }
      if (!document.body.classList.contains("mark-mind")) {
        document.body.classList.add("mark-mind");
      }

      document.getElementById("mind").style.width = profile.canvasWidth + "px";
      document.getElementById("mind").style.height =
        profile.canvasHeight + "px";

      this.mind = new Mind({ el: "mind" });
      this.mind.useMarkDown = profile.useMarkDown;

      this.initEvent();
      this.initMindEvent();

      dragscroll();

      var data = JSON.parse(JSON.stringify(this.$store.state.MindData));
      var images = data.images;
      data.themeName = "dark";

      if (
        data.mindData &&
        data.mindData.mindData &&
        data.mindData.mindData.length
      ) {
        this.mind.init(data.mindData, images);
        this.mindMarkList = data.mindData.marks.slice();
        this.$refs.container.scrollLeft =
          data.mindData.scrollLeft || canvasWidth / 2 - w / 2;
        this.$refs.container.scrollTop =
          data.mindData.scrollTop || canvasHeight / 2 - h / 2;
        this.mind.el.style.backgroundColor = theme.use().config.background;
      } else {
        this.createNewFile();
      }
    },
    createNewFile() {
      var w =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

      var h =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;

      if (profile.theme == "theme-light") {
        theme.use("markdown");
      } else {
        theme.use("dark");
      }

      var bg = theme.use().config["main-root-fill"];
      var color = theme.use().config["main-root-textFill"];
      var fontSize = theme.use().config["main-root-fontSize"];
      var paddingLeft = theme.use().config["main-root-textPadding"][0];
      var paddingRight = theme.use().config["main-root-textPadding"][0];
      var paddingTop = theme.use().config["main-root-textPadding"][1];
      var paddingBottom = theme.use().config["main-root-textPadding"][1];
      this.mind.el.style.backgroundColor = theme.use().config.background;
      var root = new Node(
        {
          id: 1,
          text: i18n.t("node.topic"),
          backgroundColor: bg,
          color,
          fontSize,
          paddingLeft,
          paddingRight,
          paddingTop,
          paddingBottom,
          main: true,
          isRoot: true,
        },
        this.mind
      );

      this.mind.addNode(root, null);
      root.setPosition(canvasWidth / 2 - 43, canvasHeight / 2 - 16);

      this.$refs.container.scrollLeft = canvasWidth / 2 - w / 2;
      this.$refs.container.scrollTop = canvasHeight / 2 - h / 2;
      var layout = new layoutMap["minder2"](true);
      layout.layout(this.mind.getRoot(), "mind");

      layout.root = root;
      root.layout = layout;
      this.mind.refresh();
    },

    initMindEvent() {
      var me = this;
      var w =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

      var h =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;

      this.contextEvent = (e) => {
        var node = e.detail.node;
        var pagex = e.detail.pageX;
        var pagey = e.detail.pageY;

        var box = e.detail.node.getDomBox();
        var rect = node.dom.getBoundingClientRect();
        var x = pagex - rect.x;
        var y = pagey - rect.y;
        this.menuLeft = box.x + x + 10;
        this.menuTop = box.y + y;
        this.menuShow = true;
        this.nodeNavShow = false;
        this.contextNode = e.detail.node;
        this.nodeType = e.detail.node.nodeType || "";
      };

      this.mind.on("context", this.contextEvent);

      this.showWireFrameEvent = (e) => {
        this.showWireFrame = true;
        var wf = e.detail.wf;
        this.selecWireFrame = wf;
        this.wfText = this.selecWireFrame.text;
        var pos = wf.getPosition();
        var box = wf.getBox();
        this.wfleft = pos.x + box.width + 30;
        this.wftop = pos.y;

        this.changeAssist.item = wf;
        this.changeAssist.x = box.x - 1;
        this.changeAssist.y = box.y - 1;
        this.changeAssist.width = box.width + 1;
        this.changeAssist.height = box.height + 1;
        if (wf.direct == "right" || wf.direct == "left") {
          this.changeAssist.dragModel = "model-top";
        } else {
          this.changeAssist.dragModel = "model-right";
        }
      };

      this.mind.on("showWireFrame", this.showWireFrameEvent);

      this.showInduceEvent = (e) => {
        this.showInduce = true;
        var induce = e.detail.induce;
        var box = induce.getNodeBox();

        this.changeAssist.item = induce;
        this.changeAssist.x = box.x - 1;
        this.changeAssist.y = box.y - 1;
        this.changeAssist.width = box.width + 1;
        this.changeAssist.height = box.height + 1;

        if (induce.direct == "right" || induce.direct == "left") {
          this.changeAssist.dragModel = "model-top";
        } else {
          this.changeAssist.dragModel = "model-right";
        }
      };

      this.mind.on("showInduce", this.showInduceEvent);

      this.showNodeNavEvent = (e) => {
        this.navStatus = "node";
        var box = e.detail.node.getDomBox();
        this.nodeNavLeft = box.x + box.width + 6;
        this.nodeNavTop = box.y;
        this.nodeNavShow = true;
        this.contextNode = e.detail.node;
        var data = { ...e.detail.node.getData() };

        this.link = "";
        this.image = "";
        this.remark = "";
        this.fx = "";
        this.nodeType = e.detail.node.nodeType || "";
        data.link && (this.link = data.link);
        data.image && (this.image = data.image);
        data.remark && (this.remark = data.remark);
        data.fx && (this.fx = data.fx);

        this.mind.relateLinks.forEach((rl) => {
          if (rl.startNode == e.detail.node || rl.endNode == e.detail.node) {
            rl.active();
          }
        });
      };
      this.mind.on("showNodeNav", this.showNodeNavEvent);

      this.hideEvent = () => {
        this.menuShow = false;
        this.nodeNavShow = false;
        this.imageShow = false;
        this.showAssist = false;
        this.showWireFrame = false;
        this.showSetup = false;
        this.showInduce = false;
        this.showRelateShip = false;
        this.navStatus = "node";
        me.mind.editNode = null;
      };
      this.mind.on("hide", this.hideEvent);

      this.showIamgeSetupEvent = (e) => {
        var box = e.detail.node.getDomBox();
        this.imageLeft = box.x + box.width + 6;
        this.imageTop = box.y;
        this.imageShow = true;
        this.contextNode = e.detail.node;
        var data = { ...e.detail.node.getData() };
      };
      this.mind.on("showIamgeSetup", this.showIamgeSetupEvent);

      this.selectNodeEvent = (e) => {
        var node = e.detail.node;
        if (node) {
          var layout = node.getLayout();
          if (layout) {
            var layoutName = layout.layoutName;
            var direct = layout.direct;
            this.layoutName = layoutName;
            this.layoutDirect = direct;
          }
          this.isRoot = node.layout ? true : false;
          this.nodeDirect = node.direct;
          this.nodeMarkList = node.data.marks;
        }

        if (this.resizeNode) {
          this.resizeNode.cancelResize();
          this.resizeNode = null;
        }
      };

      this.mind.on("selectNode", this.selectNodeEvent);

      this.selectNodesEvent = () => {
        var nodes = this.mind.getSelectNodes();
        if (nodes.length) {
          var box = this.mind.getBoundingRect(nodes);
          this.nodeNavLeft = box.x + box.width + 6;
          this.nodeNavTop = box.y;
          this.nodeNavShow = true;
        }
      };

      this.mind.on("selectNodes", this.selectNodesEvent);

      this.showLinkEvent = (e) => {
        var box = e.detail.node.getDomBox();
        this.winLeft = box.x;
        this.winTop = box.y + box.height + 6;
        this.contextNode = e.detail.node;
        var data = { ...e.detail.node.getData() };
        this.link = "";
        this.image = "";
        this.remark = "";
        this.fx = "";
        this.nodeType = e.detail.node.nodeType || "";
        data.link && (this.link = data.link);
        data.image && (this.image = data.image);
        data.remark && (this.remark = data.remark);
        if (e.detail.node.nodeType == "relateLink") {
          e.detail.node.relateLink.active();
        }
        // this.showLink = true;
        this.showRemark = false;
        this.showAssist = true;
      };

      //show node link
      this.mind.on("showLink", this.showLinkEvent);

      this.showRemarkEvent = (e) => {
        var box = e.detail.node.getDomBox();
        this.winLeft = box.x;
        this.winTop = box.y + box.height + 6;

        this.contextNode = e.detail.node;
        var data = { ...e.detail.node.getData() };
        this.link = "";
        this.image = "";
        this.remark = "";
        this.fx = "";
        this.nodeType = e.detail.node.nodeType || "";
        data.link && (this.link = data.link);
        data.image && (this.image = data.image);
        data.remark && (this.remark = data.remark);
        if (e.detail.node.nodeType == "relateLink") {
          e.detail.node.relateLink.active();
        }
        this.showLink = false;
        this.showRemark = true;
        this.showAssist = true;
      };

      //note or remark
      this.mind.on("showRemark", this.showRemarkEvent);

      // this.refreshMindEvent = () => {
      //   this.storeData().then(() => {
      //     // console.log('have store memory');
      //   });
      // };
      // this.mind.on("refreshMind", this.refreshMindEvent);

      this.openExternalEvent = (e) => {
        var detail = e.detail;
        var href = decodeURIComponent(detail.href);
        try {
          if (href.startsWith("http")) {
            shell.openExternal(href);
          } else {
            if (
              href.startsWith("file:") ||
              href.startsWith("data:image") ||
              path.isAbsolute(href)
            ) {
              shell.openItem(href);
            } else {
              try {
                var value = path.resolve(baseUrl, href);
                shell.openItem(value);
              } catch (e) {
                shell.openItem(href);
              }
            }
          }
        } catch (e) {
          alert(e);
        }
      };

      //open link (htpp,https,file,base64,relative path,etc)
      this.mind.on("openExternal", this.openExternalEvent);

      this.openFileEvent = (e) => {
        var file = e.detail.file;
        if (file.path && file.path.endsWith(".mind")) {
          //markdown base path
          window.baseUrl = path.dirname(file.path);
          this.$store.dispatch("setTag", "local");
          this.$parent.openFile(file.path);
        }
      };

      //open mind file,
      this.mind.on("openFile", this.openFileEvent);

      this.addLocalFileEvent = (e) => {
        // if (!this.$store.state.MindData.vip.vip) {
        //   dialog
        //     .showMessageBox({
        //       type: "info",
        //       title: i18n.t("profile.tooltip"),
        //       defaultId: 0,
        //       message: i18n.t("profile.needVip"),
        //       buttons: i18n.t("profile.profileBtns"),
        //     })
        //     .then(({ response }) => {
        //       if (response === 0) {
        //         if (i18n.locale == "en") {
        //           var url = "http://www.ckminder.cn/index/en";
        //         } else {
        //           var url = "http://www.ckminder.cn/";
        //         }
        //         shell.openExternal(url);
        //       } else {
        //       }
        //     });
        //   return;
        // }
        var node = e.detail.node;
        var file = e.detail.file;

        //image
        if (["image/png", "image/jpeg", "image/gif"].indexOf(file.type) > -1) {
          var imgFile = new FileReader();
          imgFile.readAsDataURL(file);
          imgFile.onload = function () {
            var imgData = this.result;
            node.mind.execute("changeNode", {
              nodes: [node],
              data: {
                isImageNode: true,
                image: imgData,
              },
            });
          };
        } else {
          //file (pdf,word,ppt etc)
          node.mind.execute("changeNode", {
            nodes: [node],
            data: { key: "link", link: file.path },
          });
        }
      };

      this.mind.on("addLocalFile", this.addLocalFileEvent);

      this.showNodeEvent = (e) => {
        var node = e.detail.node;
        this.mind.clearSelectNode();
        this.mind.selectNode(node);

        var b = node.getDomBox();
        var nowppt = {
          left: b.x - 10,
          top: b.y - 10,
          width: b.width + 20,
          height: b.height + 20,
        };

        var bodyHeight = document.body.clientHeight;
        var bodyWidth = document.body.clientWidth;

        //var bs=(bodyWidth-80)/(bodyHeight-80);
        var cl = nowppt.left + nowppt.width / 2;
        var ct = nowppt.top + nowppt.height / 2;
        //  var scale=this.mindScale/100;
        var oldScale = this.mindScale;
        this.scale(100);
        var scale = 1;

        this.$refs.mind.style.transform = "";

        var scrollLeft = Math.abs(bodyWidth / 2 - cl * scale);
        var scrollTop = Math.abs(bodyHeight / 2 - ct * scale);
        var con = document.getElementById("mind-container");
        con.scrollLeft = scrollLeft;
        con.scrollTop = scrollTop;

        this.scaleCenter = [b.x + b.width / 2, b.y + b.height / 2]; //transform origin
        this.scale(oldScale);
      };

      this.mind.on("showNode", this.showNodeEvent);

      this.showRelateShipEvent = (e) => {
        var x = e.detail.x;
        var y = e.detail.y;
        this.selectRelateShip = e.detail.relateLink;
        this.showRelateShip = true;
        setTimeout(() => {
          $(".relate-ship").css({
            left: x + 10 + "px",
            top: y + "px",
          });
        }, 10);
      };
      this.mind.on("showRelateShip", this.showRelateShipEvent);
      this.scaleCenter = [];

      $("#mind").on("mousemove", (e) => {
        this.scaleCenter[0] = e.offsetX;
        this.scaleCenter[1] = e.offsetY;
        var nodeDom = $(e.target).closest(".node");
        if (nodeDom.length) {
          var box = nodeDom.get(0).node.getBBox();
          this.scaleCenter[0] = box.x + box.width / 2;
          this.scaleCenter[1] = box.y + box.height / 2;
        }
      });
    },

    initEvent() {
      function selectNode(node, direct) {
        if (!node) {
          return;
        }

        var minDis;
        var waitNode = null;
        var pos = node.getPosition();
        var mind = node.getMind();

        mind.traverseDF((n) => {
          var p = n.getPosition();
          var dx = Math.abs(p.x - pos.x);
          var dy = Math.abs(p.y - pos.y);
          var dis = Math.sqrt(dx * dx + dy * dy);
          switch (direct) {
            case "right":
              if (p.x > pos.x) {
                if (minDis) {
                  if (minDis > dis) {
                    minDis = dis;
                    waitNode = n;
                  }
                } else {
                  minDis = dis;
                  waitNode = n;
                }
              }
              break;
            case "left":
              if (p.x < pos.x) {
                if (minDis) {
                  if (minDis > dis) {
                    minDis = dis;
                    waitNode = n;
                  }
                } else {
                  minDis = dis;
                  waitNode = n;
                }
              }
              break;
            case "up":
              if (p.y < pos.y) {
                if (minDis) {
                  if (minDis > dis) {
                    minDis = dis;
                    waitNode = n;
                  }
                } else {
                  minDis = dis;
                  waitNode = n;
                }
              }
              break;
            case "down":
              if (p.y > pos.y) {
                if (minDis) {
                  if (minDis > dis) {
                    minDis = dis;
                    waitNode = n;
                  }
                } else {
                  minDis = dis;
                  waitNode = n;
                }
              }
              break;
          }
        });
        mind.selectNode(waitNode);
      }

      document.onkeyup = (e) => {
        var keyCode = e.keyCode || e.which || e.charCode;
        var ctrlKey = e.ctrlKey || e.metaKey;
        var shiftKey = e.shiftKey;
        this.ctrl = null;
        this.mind.ctrlKey = null;
        this.mind.shiftKey = null;

        //edit note
        if (this.navStatus == "remark") {
          return;
        }

        if (!ctrlKey && !shiftKey && (keyCode == 9 || keyCode == 45)) {
          e.preventDefault();
          //tab
          var editNode = this.mind.getEditNode();
          if (editNode) {
            //cancel edit node
            this.mind.clearEditNode();
            return;
          }
          var node = this.mind.getSelectNode();
          if (node) {
            //add child node
            this.mind.execute("addChildNode", { parent: node });
          }
        }

        //editing node
        var editNode = this.mind.getEditNode();
        if (editNode) {
          return;
        }

        if (profile && profile.keyModel == "ithoughts") {
          if (!ctrlKey && !shiftKey && keyCode == 13) {
            //enter
            e.preventDefault();
            var node = this.mind.getSelectNode();
            if (node) {
              this.mind.execute("addSameNode", { parent: node });
            }
          }
        } else {
          if (shiftKey && keyCode == 13) {
            //shift + enter
            e.preventDefault();
            var node = this.mind.getSelectNode();
            if (node) {
              this.mind.clearEditNode();
              this.mind.execute("addSameNode", { parent: node });
            }
          }
        }

        // if (keyCode == 27) {
        //   //esc
        //   e.preventDefault();
        //   var editNode = this.mind.getEditNode();
        //   if (editNode) {
        //     this.mind.clearEditNode();
        //     return;
        //   }
        // }

        if (keyCode == 46) {
          //delete 键值
          var node = this.mind.getSelectNode();
          if (node) {
            var p = node.parent;
            this.mind.clearEditNode();
            this.mind.execute("deleteNode", { parent: node });
            this.mind.selectNode(p);
            this.mind.emit("hide");
          }
        }

       

        switch (keyCode) {
          case 38: //up
            if (this.navStatus == "remark") {
              return;
            }
            if (this.model == "showppt") {
              this.showppt("up");
            } else {
              var node = this.mind.getSelectNode();
              selectNode(node, "up");
            }

            break;

          case 40: //down
            if (this.navStatus == "remark") {
              return;
            }
            if (this.model == "showppt") {
              this.showppt("down");
            } else {
              var node = this.mind.getSelectNode();
              var layout = node.getLayout();
              selectNode(node, "down");
            }
            break;

          case 37: //left
            if (this.navStatus == "remark") {
              return;
            }
            if (this.model == "showppt") {
              this.prevPpt();
            } else {
              var node = this.mind.getSelectNode();
              selectNode(node, "left");
            }

            break;
          case 39: //right
            if (this.navStatus == "remark") {
              return;
            }
            if (this.model == "showppt") {
              this.nextPpt();
            } else {
              var node = this.mind.getSelectNode();
              selectNode(node, "right");
            }
            break;

          case 27: //esc 键
            //  e.preventDefault();
            //  if(this.model=='showppt'){
            this.backNormal();
            // }
            break;
        }
      };

      document.onkeydown = (e) => {
        var keyCode = e.keyCode || e.which || e.charCode;
        var ctrlKey = e.ctrlKey || e.metaKey;
        var shiftKey = e.shiftKey;
        this.ctrl = ctrlKey;
        this.mind.ctrlKey = ctrlKey;
        this.mind.shiftKey = shiftKey;
        if (keyCode == 9) {
          e.preventDefault();
        }
        if (keyCode == 32) {
          //space
          var node = this.mind.getSelectNode();
          if (!node.isEdit) {
            e.preventDefault();
            node.edit();
          }

          return;
        }

        var editNode = this.mind.getEditNode();
        if (editNode) {
          return;
        }
        
        if (ctrlKey && keyCode == "90") {
          this.mind.undo();
        }

        if (ctrlKey && keyCode == "89") {
          this.mind.redo();
        }

         if (ctrlKey && keyCode == 67) {
          //ctrl + c
          this.copyNode();
        }



      };

      document.onmousewheel = (event) => {
        var delta = 0;
        if (!event) event = window.event;
        if (event.wheelDelta) {
          //IE、chrome  -120
          delta = event.wheelDelta / 120;
          if (window.opera) delta = -delta;
        } else if (event.detail) {
          //FF 3
          delta = -event.detail / 3;
        }
        if (delta) {
          if (delta < 0) {
            if (this.ctrl) {
              this.setScale("down");
            }
          } else {
            if (this.ctrl) {
              this.setScale("up");
            }
          }
        }
      };
    },
    copyNode() {
      var node = this.mind.getSelectNode(),
        map = {},
        data = [];
      function copyNode(n, pid) {
        var d = n.getData();
        d.id = uuid();
        d.pid = pid;

        //cancel root
        if (d.isRoot) {
          d.isRoot = false;
        }
        if (d.main) {
          d.main = false;
        }
        data.push(d);

        n.children.forEach((c) => {
          copyNode(c, d.id);
        });
      }
      if (node) {
        this.mind.clearEditNode();
        copyNode(node, "");
        clipboard.writeText(JSON.stringify(data), "copyNode");
      }
    },
    //set node to center
    mindCenter() {
      this.mind.emit("showNode", { node: this.mind.getRoot() });
    },
    //save data to vuex
    storeData() {
      this._scrollTop = this.$refs.container.scrollTop;
      this._scrollLeft = this.$refs.container.scrollLeft;
      var data = this.mind.getData(null, null, true);
      data.scrollTop = this._scrollTop;
      data.scrollLeft = this._scrollLeft;
      return this.$store.dispatch("setMindData", data);
    },
    //tab status of node bar
    setStatus(status) {
      this.navStatus = status.key;
    },
    //go to tree list
    enterList() {
      this.storeData().then(() => {
        this.$router.push("/list");
      });
    },
    //context menu
    command(e) {
      var data = e.data;
       this.menuShow = false;
      if (data) {
        data = { ...data, ...{ parent: this.contextNode } };
      } else {
        data = {
          parent: this.contextNode,
        };
      }

      if (e.cmd.cmd == "copyNode") {
        this.copyNode();
        return;
      }

      if (e.cmd.cmd == "paste") {
        var data = clipboard.readText("copyNode");
        clipboard.clear("copyNode");
        if (data) {
          this.mind.execute("pasteNode", {
            node: this.contextNode,
            data: JSON.parse(data),
          });
        }
        return;
      }

      if (e.cmd.cmd == "addppt") {
        this.addppt = true;
        this.model = "showppt";
        if (this.contextNode.getLevel() == 0) {
          var box = this.contextNode.getDomBox();
        } else {
          var box = this.mind.getBBox(this.contextNode);
        }
        this.ppt.push(
          this.calcScale({
            left: box.x - 10,
            top: box.y - 10,
            width: box.width + 20,
            height: box.height + 20,
            num: 0,
            scale: 0,
          })
        );
      }

      if (e.cmd.cmd == "resizeNode") {
        // var frame=new Frame(this.contextNode,this.contextNode.dom,'node');
        this.contextNode.resizeNode();
        this.contextNode._resizeNode = this.contextNode;
        this.resizeNode = this.contextNode;
      }

      if (e.cmd.text.indexOf("Layout") > -1) {
        var layoutName = e.cmd.cmd;
        var node = this.contextNode;
        //console.log(layoutName)
        if (layoutName == "removeLayout") {
          var newLayout = "";
          if (!node.parent || node.nodeType == "induce") {
            return;
          }
        } else {
          var layout = node.getLayout();

          if (layoutName == "fish" || layoutName == "time") {
            var iscache = false;
          } else {
            iscache = true;
          }
          var newLayout = new layoutMap[layoutName](iscache);
          newLayout.root = node;
          newLayout.direct = (layout && layout.direct) || e.cmd.direct;

          if (layoutName.indexOf("minder") > -1) {
            newLayout.setDirect();
          }
        }

        console.log(iscache,layoutName)

        this.mind.execute("changeLayout", {
          node: node,
          layout: newLayout,
        });
      }

      if (e.cmd.cmd == "addRelateLink") {
        var link = new RelateLink(data.parent);
        this.mind.waitRelate = link;
        link.status = "addRelate";
        this.mind.status = "addRelate";
      } else {
        this.mind.execute(e.cmd.cmd, data);
      }
     
    },

    //node bar menu
    cmd(e) {
      switch (e.type) {
        case "addChildNode":
          var data = {
            parent: this.contextNode,
          };
          this.mind.execute(e.type, data);
          break;
        default:
          e.node = this.contextNode;
          if (e.type == "image") {
            e.data.isImageNode = true;
          }
          this.mind.execute("changeNode", e);
      }
    },

    //Image bar
    changeNodeImage(data) {
      this.mind.execute("changeNode", { nodes: [this.contextNode], data });
    },

    undo() {
      if (this.mind) {
        var editNode = this.mind.getEditNode();
        if (editNode) {
          return;
        }
        this.mind.undo();
      }
    },
    redo() {
      if (this.mind) {
        var editNode = this.mind.getEditNode();
        if (editNode) {
          return;
        }
        this.mind.redo();
      }
    },

    //恢复编辑器
    backNormal() {
      this.$refs.pptMarkCon.style.display = "none";
      if (this.isPlayptt) {
        exitfullscreen();
        this.isPlayptt = false;
        this.model = "normal";
        this.addppt = false;
        this.$refs.mind.style.transition = "";
        this.$refs.mind.style.transform = "";
        this.$refs.container.style.overflow = "auto";
        this.$refs.container.scrollLeft = this._scrollLeft;
        this.$refs.container.scrollTop = this._scrollTop;
      }
    },

    downloadPng() {
      this.scale(100);
      function getImagePortion(
        imgObj,
        newWidth,
        newHeight,
        startX,
        startY,
        ratio
      ) {
        /* the parameters: - the image element - the new width - the new height - the x point we start taking pixels - the y point we start taking pixels - the ratio */
        //set up canvas for thumbnail
        var tnCanvas = document.createElement("canvas");
        var tnCanvasContext = tnCanvas.getContext("2d");
        tnCanvas.width = newWidth;
        tnCanvas.height = newHeight;
        /* now we use the drawImage method to take the pixels from our bufferCanvas and draw them into our thumbnail canvas */
        tnCanvasContext.drawImage(
          imgObj,
          startX,
          startY,
          newWidth * ratio,
          newHeight * ratio,
          0,
          0,
          newWidth,
          newHeight
        );
        return tnCanvas.toDataURL();
      }

      var that = this;
      function generator() {
        // 生成图片
        var el = that.mind.el;
        var width = el.offsetWidth;
        var height = el.offsetHeight;
        // var scale = 2;
        // var canvas = document.createElement("canvas");
        // canvas.width = width * scale;
        // canvas.height = height * scale;
        // canvas.getContext("2d").scale(scale, scale);

        var box = that.mind.getMindBox();
        if (profile.canvasWidth == 8000) {
          var scale = 2;
        } else {
          var scale = 1;
        }

        html2canvas(that.mind.el, {
          //  canvas: canvas,
          useCORS: true,
          allowTaint: true, //允许跨域图片

          width: width,
          height: height,
          background: "transparent",
          scale: scale || window.devicePixelRatio,
          //   foreignObjectRendering:true
        }).then((canvas) => {
          var context = canvas.getContext("2d");
          // close Smooth
          context.mozImageSmoothingEnabled = false;
          context.webkitImageSmoothingEnabled = false;
          context.msImageSmoothingEnabled = false;
          context.imageSmoothingEnabled = false;

          //var imgData = canvas.toDataURL();
          // saveAs(imgData);

          var data = getImagePortion(
            canvas,
            box.width * scale + 40,
            box.height * scale + 40,
            box.x * scale - 20,
            box.y * scale - 20,
            1
          );
          //  that.imgData=data;

          dialog
            .showSaveDialog({
              title: "save images",
              defaultPath: "mind.png",
              filters: [{ name: "Images", extensions: ["png"] }],
            })
            .then(function ({ filePath }) {
              //console.log(path);
              if (filePath) {
                //fs.createWriteStream(data,path)
                var base64Data = data.replace(/^data:image\/\w+;base64,/, "");
                var dataBuffer = new Buffer(base64Data, "base64");
                fs.writeFileSync(filePath, dataBuffer);
              }
            });
        });
      }

      generator();
    },
    assistClick(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    remarkMousDown() {
      e.preventDefault();
      e.stopPropagation();
    },
    playptt(num) {
      if (!this.$store.state.MindData.vip.vip) {
        dialog
          .showMessageBox({
            type: "info",
            title: i18n.t("profile.tooltip"),
            defaultId: 0,
            message: i18n.t("profile.needVip"),
            //buttons: i18n.t('profile.profileBtns')
            buttons: i18n.t("profile.profileBtns"),
          })
          .then(({ response }) => {
            if (response === 0) {
              if (i18n.locale == "en") {
                var url = "http://www.ckminder.cn/index/en";
              } else {
                var url = "http://www.ckminder.cn/";
              }
              shell.openExternal(url);
            } else {
            }
          });
        return;
      }
      fullScreen();
      this.addppt = false;
      this.isPlayptt = true;
      //  if(this.nowppt){
      //    this.showppt('',this.pptIndex);
      //  }
      //  else{
      this._scrollTop = this.$refs.container.scrollTop;
      this._scrollLeft = this.$refs.container.scrollLeft;
      this.$refs.mind.style.transformOrigin = "0 0";
      setTimeout(() => {
        this.$refs.mind.style.transition = "all 0.6s ease";
      }, 500);

      this.$refs.container.style.overflow = "hidden";
      this.$refs.container.scrollLeft = "0px";
      this.$refs.container.scrollTop = "0px";
      setTimeout(() => {
        this.showppt("", 1);
      }, 100);
      // }
    },

    clearppt() {
      this.ppt = [];
    },
    deleteppt(data) {
      var index = this.ppt.indexOf(data);
      this.ppt.splice(index, 1);
      if (this.nowppt == data) {
        this.nowppt = null;
        this.pptIndex = 1;
      }
    },
    calcScale(data) {
      var bodyHeight = window.screen.height;
      var bodyWidth = window.screen.width;
      var dir = data.width / data.height;
      var bs = (bodyWidth - 80) / (bodyHeight - 80);
      var cl = data.left + data.width / 2;
      var ct = data.top + data.height / 2;

      if (dir <= bs) {
        var h = bodyHeight - 80;
        var w = parseInt(h * dir);
        var scale = h / data.height;
      } else {
        var w = bodyWidth - 80;
        var h = parseInt(w / dir);
        var scale = w / data.width;
      }

      data.scale = scale;
      return data;
    },

    prevPpt() {
      if (this.pptIndex > 1) {
        this.showppt("left", this.pptIndex - 1);
      }
    },

    nextPpt() {
      if (this.pptIndex < this.ppt.length) {
        this.showppt("right", this.pptIndex + 1);
      }
    },
    showppt(direct, page) {
      this.$refs.pptMarkCon.style.display = "block";
      if (page) {
        this.pptIndex = page;
        this.nowppt = this.ppt[this.pptIndex - 1];
      } else {
        //  switch(direct){
        //      case 'left':  //prev page
        //       if(this.pptIndex>0){
        //          this.showppt('',this.pptIndex);
        //       }
        //       break;
        //      case 'right':  //next page
        //       if(this.pptIndex<this.ppt.length){
        //         this.showppt('',this.pptIndex+1);
        //       }
        //       break;
        //  }
      }
      if (this.nowppt) {
        var bodyHeight = document.body.clientHeight;
        var bodyWidth = document.body.clientWidth;

        var cl = this.nowppt.left + this.nowppt.width / 2;
        var ct = this.nowppt.top + this.nowppt.height / 2;
        var scale = this.nowppt.scale;
        //this.$refs.mind.style.animation='all 1s ease';
        this.$refs.mind.style.transform = "";

        var w = parseInt(this.nowppt.width * scale);
        var h = parseInt(this.nowppt.height * scale);

        var box = {
          x: parseInt((bodyWidth - w) / 2),
          y: parseInt((bodyHeight - h) / 2),
          width: w,
          height: h,
        };

        document.getElementById("ppt-mark").style.display = "none";

        setTimeout(() => {
          var ctx = document.getElementById("ppt-mark").getContext("2d");
          document
            .getElementById("ppt-mark")
            .setAttribute("width", bodyWidth + "px");
          document
            .getElementById("ppt-mark")
            .setAttribute("height", bodyHeight + "px");

          ctx.moveTo(0, 0);
          ctx.lineTo(bodyWidth, 0);
          ctx.lineTo(bodyWidth, bodyHeight);
          ctx.lineTo(0, bodyHeight);
          ctx.closePath();
          ctx.moveTo(box.x, box.y);
          ctx.lineTo(box.x, box.y + box.height);
          ctx.lineTo(box.x + box.width, box.y + box.height);
          ctx.lineTo(box.x + box.width, box.y);
          ctx.closePath();
          ctx.fillStyle = "rgba(0,0,0,0.4)";
          ctx.fill();
          document.getElementById("ppt-mark").style.display = "";
        }, 650);

        this.$refs.mind.style.transform =
          "translate3d(" +
          (bodyWidth / 2 - cl * scale) +
          "px, " +
          (bodyHeight / 2 - ct * scale) +
          "px,0) scale(" +
          scale +
          ")  ";
      }
    },
    addMindMark(data) {
      this.mind.addMark(data);
      this.mindMarkList = this.mind.getMark();
    },
    removeMindMark(mark) {
      this.mind.removeMark(mark);
      this.mindMarkList = this.mind.getMark();
    },
    addNodeMark(data) {
      var selectNode = this.mind.getSelectNode();
      if (selectNode) {
        this.mind.execute("addNodeMark", { mark: data, node: selectNode });
        this.nodeMarkList = selectNode.data.marks;
      }
    },
    removeNodeMark(mark) {
      var selectNode = this.mind.getSelectNode();
      if (selectNode) {
        this.mind.execute("removeNodeMark", { mark, node: selectNode });
        this.nodeMarkList = selectNode.data.marks;
      }
    },
    changeMark(mark) {
      var selectNode = this.mind.getSelectNode();
      if (selectNode) {
        this.mind.execute("changeMark", { mark, node: selectNode });
        this.nodeMarkList = selectNode.data.marks.slice();
        this.mind.marks.forEach((item) => {
          if (item.id == mark.id) {
            item.fill = mark.fill;
          }
        });
        this.mindMarkList = this.mind.getMark();
      }
    },
    changeTheme(name) {
      this.mind.execute("changeTheme", {
        oldTheme: this.mind.themeName,
        theme: name,
      });
    },
    changeBackground(type, data) {
      this.mind.changeBackground(type, data);
    },
    changeStroke(type, data) {
      var node = this.mind.getSelectNode();
      if (node) {
        this.mind.changeStroke(node, type, data);
      }
    },
    mousedown(e) {
      if (this.addppt) {
        this.sx = e.pageX;
        this.sy = e.pageY;

        if (e.target.classList.contains("drag-frame")) {
          this.drag = true;
          this.sx = e.pageX;
          this.sy = e.pageY;
          this.nowppt = this.ppt[e.target.dataset.index];

          this.w = this.nowppt.width;
          this.h = this.nowppt.height;
        } else if (e.target.classList.contains("ppt-frame")) {
          this.nowppt = this.ppt[e.target.dataset.index];
          this.dragFrame = true;
          this.frameLeft = this.nowppt.left;
          this.frameTop = this.nowppt.top;
        }
      }
    },
    mousemove(e) {
      if (this.drag) {
        var dx = e.pageX - this.sx;
        var dy = e.pageY - this.sy;
        this.nowppt.width = this.w + dx;
        this.nowppt.height = this.h + dy;
        this.calcScale(this.nowppt);
      } else if (this.dragFrame) {
        var dx = e.pageX - this.sx;
        var dy = e.pageY - this.sy;
        this.nowppt.left = this.frameLeft + dx;
        this.nowppt.top = this.frameTop + dy;
      }
    },
    mouseup() {
      this.drag = false;
      this.dragFrame = false;
    },
    changeWireFrame(type, data) {
      this.mind.changeWireFrame(this.selecWireFrame, {
        wf: this.selecWireFrame,
        type,
        data,
      });
    },
    removeWireFrame() {
      console.log(this.selecWireFrame)
      this.mind.execute("removeWireFrame", { wf: this.selecWireFrame });
      this.showWireFrame = false;
    },
    setLayout(layoutName, direct) {
      var node = this.mind.getSelectNode();
      if (!node) return;
      var layout = node.getLayout();
      var iscache;

      if (layoutName == "fish" || layoutName == "time") {
        iscache = false;
      } else {
        iscache = true;
      }
      var newLayout = new layoutMap[layoutName](iscache);
      newLayout.root = node;
      newLayout.direct = direct;
      if (layoutName.indexOf("minder") > -1) {
        newLayout.setDirect();
      }
      this.mind.execute("changeLayout", {
        node,
        layout: newLayout,
      });
    },

    //set node to center
    showRelateNode(type) {
      if (this.selectRelateShip) {
        if (type == "start") {
          this.mind.emit("showNode", { node: this.selectRelateShip.startNode });
        } else {
          this.mind.emit("showNode", { node: this.selectRelateShip.endNode });
        }
      }
    },
    //change relate link marker
    changeMaker(pos, type) {
      if (pos == "start") {
        var oldType = this.selectRelateShip.data.startMarker;
      } else {
        var oldType = this.selectRelateShip.data.endMarker;
      }

      this.mind.execute("changeMarker", {
        link: this.selectRelateShip,
        pos,
        type,
        oldType,
      });
    },
    deleteRelate() {
      this.mind.execute("deleteNode", {
        parent: this.selectRelateShip.textNode
      });
      this.selectRelateShip = null;
    },
    setting() {
      this.showSetup = !this.showSetup;
      this.showSkin = false;
    },
    skin() {
      this.showSkin = !this.showSkin;
      this.showSetup = false;
    },
    save() {
      var data = this.mind.getData();
      var zip = new JSZip();
      var name = this.mind.getRoot().textDom.innerText;
      if (name) {
        var file = name + ".json";
      } else {
        var file = "mind.json";
      }

      zip.file(file, JSON.stringify(data));
      zip.folder("images"); //.file("smile.gif", imgData, {base64: true});
      zip.generateAsync({ type: "nodebuffer" }).then(function (content) {
        dialog.showSaveDialog(
          {
            title: "save Mindmap",
            defaultPath: "mind.mind",
            filters: [{ name: "Mindmap", extensions: ["mind"] }],
          },
          function (path) {
            if (path) {
              fs.writeFileSync(path, content);
            }
          }
        );
      });
    },

    changeFile(e) {
      var me = this;
      var file = e.target.files[0];
      var reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = function () {
        var zip = JSZip.loadAsync(reader.result);
        //  var p=new Promise();
        zip.then(function (e) {
          var files = e.files;
          for (var k in files) {
            if (k.endsWith(".json")) {
              files[k].async("text").then((res) => {
                var mindData = JSON.parse(res);
                me.mind.init(mindData);
              });
            }
          }
        });
      };
    },
    execute(type) {
      if (this.mind) {
        switch (type) {
          case "addNode":
            this.mind.execute("addSameNode", {
              parent: this.mind.getSelectNode(),
            });
            break;
          case "addChild":
            this.mind.execute("addChildNode", {
              parent: this.mind.getSelectNode(),
            });
            break;
          case "induce":
            this.mind.execute("addInduce", {
              parent: this.mind.getSelectNode(),
            });
            break;
          case "wireFrame":
            this.mind.execute("addWireFrame", {
              parent: this.mind.getSelectNode(),
            });
            break;
          case "remark":
            break;
        }
      }
    },
    dragDown(e, $event) {
      this._moveDirect = e;
      this.sx = $event.pageX;
      this.sy = $event.pageY;
      if (this._moveDirect == "up" || this._moveDirect == "down") {
        this.dragTop = this.changeAssist.y;
        this.dragHeight = this.changeAssist.height;
      } else {
        this.dragLeft = this.changeAssist.x;
        this.dragWidth = this.changeAssist.width;
      }
      this.drag = true;
      this._dragMove = this.dragMove.bind(this);
      this._dragup = this.dragup.bind(this);
      document.addEventListener("mousemove", this._dragMove);
      document.addEventListener("mouseup", this._dragup);
    },
    dragMove(e) {
      e.preventDefault();
      e.stopPropagation();
      if (this.drag) {
        var dx = e.pageX - this.sx;
        var dy = e.pageY - this.sy;

        if (this._moveDirect == "up") {
          this.changeAssist.y = this.dragTop + dy;
          this.changeAssist.height = this.dragHeight - dy;
        } else if (this._moveDirect == "down") {
          //  this.changeAssist.y=this.dragTop+dy;
          this.changeAssist.height = this.dragHeight + dy;
        } else if (this._moveDirect == "left") {
          this.changeAssist.x = this.dragLeft + dx;
          this.changeAssist.width = this.dragWidth - dx;
        } else {
          this.changeAssist.width = this.dragWidth + dx;
        }
      }
    },
    dragup() {
      var me = this;
      document.removeEventListener("mousemove", this._dragMove);
      document.removeEventListener("mouseup", this._dragup);
      this.drag = false;
      this.showWireFrame = false;
      this.showInduce = false;
      var item = this.changeAssist.item;
      var node = item.node;
      var parent = node.parent;
      var rangeNode = item.rangeNode.slice();
      //var scale=this.mind.scaleNum;

      var fromNode = null,
        toNode = null,
        newRangeNode = [],
        a = [];
      parent.children.forEach((child, i) => {
        var box = child.getDomBox();

        if (collide(box, me.changeAssist)) {
          a.push(i);
        }
      });
      //newRangeNode.unique();

      parent.children.forEach((c, i) => {
        if (i == a[0]) fromNode = c;
        if (i == a[a.length - 1]) toNode = c;
        if (i >= a[0] && i <= a[a.length - 1]) {
          newRangeNode.push(c);
        }
      });

      if (rangeNode[0] == fromNode && rangeNode[rangeNode.length - 1] == toNode)
        return;

      this.mind.execute("changeRangeNode", {
        item,
        oldRangeNode: rangeNode,
        newRangeNode,
      });
    },

    scale(num) {
      if (num < 20) {
        num = 20;
      }
      if (num > 300) {
        num = 300;
      }
      this.mindScale = num;

      if (this.mind) {
        if (this.scaleCenter.length) {
          this.mind.el.style.transformOrigin = `${this.scaleCenter[0]}px ${this.scaleCenter[1]}px`;
          this.mind.el.style.transform = "scale(" + this.mindScale / 100 + ")";
        } else {
          this.mind.el.style.transform = "scale(" + this.mindScale / 100 + ")";
        }
        this.mind.scaleNum = this.mindScale / 100;
      }
    },
    setScale(type) {
      if (type == "up") {
        var n = this.mindScale + 10;
      } else {
        var n = this.mindScale - 10;
      }
      this.scale(n);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.mind-editor {
  width: 100%;
  height: 100%;
  overflow: auto;
}

#mind {
  width: 12000px;
  height: 12000px;
  position: relative;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}
.nodeNav {
  transition: all 0.3s ease;
}

.control {
  position: fixed;
  top: 24px;
  z-index: 3000;
  width: 100%;
  /* left:50%;
  transform: translate(-50%,0); */
  text-align: center;
  height: 36px;
  line-height: 36px;
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
  box-sizing: border-box;
  -webkit-app-region: drag;
  -webkit-user-select: none;
}
.control span {
  display: inline-block;
  width: 50px;
  height: 24px;
  border-radius: 3px;
  background: #fff;
  border: 1px solid #929292;
  line-height: 24px;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  -webkit-app-region: no-drag;
}

.theme-dark .control span {
  display: inline-block;
  border-radius: 3px;
  background: #464545;
  border: 1px solid #929292;
  color: #929292;
}

.control span:hover {
  background: rgba(60, 60, 60, 0.3);
}
.control span.list {
  float: right;
  margin-right: 10px;
  font-size: 14px;
  margin-top: 6px;
}

/* .ppt-frame-container{
  position: absolute;
  z-index: 3000;
} */
.ppt-frame {
  display: block;
  position: absolute;
  z-index: 2000;
  background: rgba(243, 243, 243, 0.6);
  border: 1px solid #333;
}
.ppt-frame {
  cursor: move;
  user-select: none;
}
.ppt-num {
  display: block;
  float: left;
  width: 30px;
  height: 30px;
  background: #333;
  color: #fff;
  line-height: 30px;
  /* border-radius: 3px; */
}
.ppt-delete {
  position: absolute;
  right: 6px;
  top: 6px;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  cursor: pointer;
}
.drag-frame {
  cursor: nw-resize;
  position: absolute;
  width: 40px;
  height: 26px;
  /* background:#ccc; */
  z-index: 10;
  right: 6px;
  bottom: 1px;
  font-size: 20px;
  text-align: right;
}

/* .ppt-control{
  position: absolute;
  width: 60px;
  height:40px;
  right:10px;
  bottom: 10px;
  color: #666;
} */
/* .ppt-control:first-child{
  right: 80px;
} */
.ppt-control:hover {
  color: #333;
}
.ppt-info {
  position: absolute;
  right: 40px;
  bottom: 40px;
  /* // width: 100px; */
  background: #f5f5f5;
  border: 1px solid #ccc;
  padding: 10px;
  color: #666;
  z-index: 9000;
}
.ppt-info * {
  margin: 0 6px;
  cursor: pointer;
}

.setting {
  color: #666;
  position: fixed;
  left: 10px;
  bottom: 12px;
  z-index: 3000;
  cursor: pointer;
  font-size: 16px;
  -webkit-app-region: no-drag;
  user-select: none;
}
.setting * {
  display: inline-block;
  margin-left: 6px;
}

.theme-dark .control {
  background: #424242;
  color: #ccc;
  border-bottom: 1px solid #000;
}
.theme-dark .setting {
  color: #a9aaab;
}

.theme-dark .setup {
  color: #a9aaab;
  background: #424242;
  border-left: 1px solid #000;
}

.theme-dark .theme-list {
  color: #a9aaab;
  background: #424242;
  border-left: 1px solid #000;
}

.drag {
  position: absolute;
  z-index: 7000;
  left: 2000px;
  top: 2000px;
  color: #f5f5f5;
  min-height: 20px;
  min-width: 60px;
  border: 1px solid rgb(0, 170, 255);
  background: none;
  pointer-events: none;
}

.drag-top {
  background-color: rgb(0, 170, 255);
  height: 10px;
  width: 100%;
  top: -10px;
  left: 0;
  cursor: n-resize;
  position: absolute;
  pointer-events: all;
}
.drag-top .d3 {
  margin: 0 auto;
  margin-top: -20px;
  width: 0;
  height: 0;
  border-width: 10px;
  border-style: solid;
  border-color: transparent rgb(0, 170, 255) transparent transparent;
  transform: rotate(90deg); /*顺时针旋转90°*/
}

.drag-bottom {
  background-color: rgb(0, 170, 255);
  height: 10px;
  width: 100%;
  bottom: -10px;
  left: 0;
  cursor: s-resize;
  position: absolute;
  pointer-events: all;
}

.drag-bottom .d4 {
  margin: 0 auto;
  width: 0;
  height: 0;
  top: 0;
  border-width: 10px;
  border-style: solid;
  border-color: rgb(0, 170, 255) transparent transparent;
  margin-top: 10px;
}

.drag.model-right .drag-top {
  background-color: rgb(0, 170, 255);
  height: 100%;
  width: 10px;
  top: 0;
  left: -10px;
  cursor: w-resize;
  position: absolute;
  pointer-events: all;
}
.drag.model-right .drag-top .d3 {
  margin: 0 auto;
  margin-left: -20px;
  width: 0;
  height: 0;
  border-width: 10px;
  border-style: solid;
  border-color: transparent rgb(0, 170, 255) transparent transparent;
  transform: rotate(0);
  position: absolute;
  top: 50%;
  margin-top: -10px;
}

.drag.model-right .drag-bottom {
  background-color: rgb(0, 170, 255);
  height: 100%;
  width: 10px;
  top: 0;
  right: -10px;
  cursor: e-resize;
  position: absolute;
  pointer-events: all;
  left: 100%;
}

.drag.model-right .drag-bottom .d4 {
  margin: 0 auto;
  width: 0;
  height: 0;
  top: 0;
  border-width: 10px;
  border-style: solid;
  border-color: rgb(0, 170, 255) transparent transparent;
  margin-top: 10px;
  position: absolute;
  top: 50%;
  margin-top: -10px;
  margin-left: 10px;
  transform: rotate(-90deg);
}
.ppt-mark-con {
  position: absolute;
  top: 0px;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 8000;
  width: 100%;
  height: 100%;
  display: none;
}
.ppt-mark {
  width: 100%;
  height: 100%;
}

.win-reduce {
  position: fixed;
  left: 20px;
  bottom: 40px;
  background-color: #fff;
  color: #333;
  padding: 3px 6px;
  border-radius: 3px;
  z-index: 1000;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}

.win-reduce .icon-suoxiao {
  font-size: 15px;
}
.drag-type {
  width: 50px;
  height: 50px;
  position: absolute;
  z-index: 8000;
  background: #fff;
  text-align: center;
  line-height: 50px;
  display: none;
}

.arrow-right {
  background: url("../assets/arrow.png");
  background-size: cover;
  transform: rotate(90deg);
}
.arrow-top {
  background: url("../assets/arrow.png");
  background-size: cover;
}
.arrow-down {
  background: url("../assets/arrow.png");
  background-size: cover;
  transform: rotate(180deg);
}
.arrow-left {
  background: url("../assets/arrow.png");
  background-size: cover;
  transform: rotate(-90deg);
}

.relate-ship {
  position: absolute;
  z-index: 8000;
  background: #fff;
  font-size: 12px;
  width: 240px;
  height: 200px;
  border: 1px solid #f5f5f5;
  border-radius: 3px;
  text-align: left;
  padding: 8px;
  cursor: pointer;
}

.relate-ship span {
  display: inline-block;
  position: relative;
}

.relate-start > span,
.relate-end > span {
  width: 30px;
  height: 26px;
}

.relate-ship span.shape {
  position: absolute;
  top: 7px;
  background: #ccc;
}

.relate-ship span.line {
  width: 24px;
  height: 2px;
  background: #ccc;
}

/* 连线头样式 */
.circle .shape {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.sline .shape {
  width: 2px;
  height: 10px;
}
.relate-ship span.sline .line {
  width: 20px;
}

.rect .shape {
  width: 10px;
  height: 10px;
}

.arrow .shape {
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-left: 10px solid #ccc;
  border-bottom: 5px solid transparent;
  background: transparent !important;
}

.arrow1 .shape {
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-right: 10px solid #ccc;
  border-bottom: 5px solid transparent;
  background: transparent !important;
}

.relate-jump span {
  width: 46%;
  display: inline-block;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border: 1px solid #f5f5f5;
  margin: 2%;
}
.relate-ship button {
  margin-top: 6px;
  line-height: 30px;
  height: 30px;
}
.relate-ship h3 {
  line-height: 28px !important;
}
</style>
