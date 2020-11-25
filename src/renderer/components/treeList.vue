 <template>
  <div id="cicada-list" class="cicada-list">
    <span
      class="enterMind iconfont icon-treeedit"
      :title="$t('node.gotoMind')"
      @click="enterMind"
    ></span>

    <div v-if="!isPrint" class="export iconfont icon-export">
      <div class="content">
        <span
          class="printPdf iconfont icon-PDF"
          :title="$t('node.downloadPdf')"
          @click.stop="print"
        ></span>
        <span
          class="printPdf iconfont icon-word"
          :title="$t('node.downloadWord')"
          @click.stop="printWord"
        ></span>
      </div>
    </div>

    <div class="route">
      <ul>
        <li
          class="route-item"
          v-for="(item, i) in routes"
          :key="i"
          @click="showNode(item)"
        >
          <span class="text">{{ item.text }}</span
          ><span class="iconfont icon-dakai"></span>
        </li>
      </ul>
    </div>

    <ul id="list" :class="'markdown-body ' + (isPrint ? 'print' : '')"></ul>

    <ul id="copy-list" style="visibility: hidden"></ul>

    <div class="search" v-show="openSearch">
      <input
        type="text"
        ref="searchKey"
        @input="refresh"
        @keyup.enter="search"
        @blur.stop="search"
        @mouseup.stop=""
        :placeholder="$t('node.keyword')"
      />
    </div>

    <!-- 
       <div class="rich-edit" v-show="showEdit">
           <div class="btn-group" v-for="(group,i) in cmds" :key="i">
                <a v-for="(cmd ,key) in group" :key="key" href="#" :class='cmd.class' :style="'background:'+cmd.value" @click="changeStyle(cmd)">{{((cmd.command=='foreColor'||cmd.command=='BackColor')?'':(cmd.class?'':(cmd.value?cmd.value:'')))}}</a>
           </div>
       </div> -->

    <!-- <div class="win-tooltip linkSetup" v-if="showLink" :style="'position:absolute;left:'+linkLeft+'px;top:'+linkTop+'px'">
            <span>删除</span>
            <span>打开</span>
      </div> -->

    <!-- <div class="win-tooltip linkSetup" v-if="showLink" :style="'position:absolute;left:'+linkLeft+'px;top:'+linkTop+'px'">
            <span>删除</span>
            <span>打开</span>
       </div> -->

    <div
      class="win-tooltip"
      v-if="showpriority"
      v-bind:style="
        'left:' + showpriorityleft + 'px;top:' + showprioritytop + 'px'
      "
    >
      <div class="priority">
        <ul>
          <li
            class="iconfont icon-shanchu"
            @click.stop="changeNode('', 'priority', 'changeNode')"
          ></li>
          <li
            class="node-priority"
            data-priority="1"
            @click.stop="changeNode(1, 'priority', 'changeNode')"
          >
            1
          </li>
          <li
            class="node-priority"
            data-priority="2"
            @click.stop="changeNode(2, 'priority', 'changeNode')"
          >
            2
          </li>
          <li
            class="node-priority"
            data-priority="3"
            @click.stop="changeNode(3, 'priority', 'changeNode')"
          >
            3
          </li>
          <li
            class="node-priority"
            data-priority="4"
            @click.stop="changeNode(4, 'priority', 'changeNode')"
          >
            4
          </li>
          <li
            class="node-priority"
            data-priority="5"
            @click.stop="changeNode(5, 'priority', 'changeNode')"
          >
            5
          </li>
          <li
            class="node-priority"
            data-priority="6"
            @click.stop="changeNode(6, 'priority', 'changeNode')"
          >
            6
          </li>
          <li
            class="node-priority"
            data-priority="7"
            @click.stop="changeNode(6, 'priority', 'changeNode')"
          >
            7
          </li>
          <li
            class="node-priority"
            data-priority="8"
            @click.stop="changeNode(6, 'priority', 'changeNode')"
          >
            8
          </li>
        </ul>
      </div>
    </div>

    <div
      class="win-tooltip"
      v-if="showpercent"
      v-bind:style="
        'left:' + showpercentleft + 'px;top:' + showpercenttop + 'px'
      "
    >
      <div class="percent">
        <ul>
          <li
            class="iconfont icon-shanchu"
            @click.stop="changeNode('', 'percent', 'changeNode')"
          ></li>
          <li
            class="percent pie iconfont icon-weikaishi"
            @click.stop="changeNode('not-start', 'percent', 'changeNode')"
          ></li>
          <li
            class="percent pie"
            data-percent="10"
            @click.stop="changeNode(10, 'percent', 'changeNode')"
          ></li>
          <li
            class="percent pie"
            data-percent="30"
            @click.stop="changeNode(30, 'percent', 'changeNode')"
          ></li>
          <li
            class="percent pie"
            data-percent="50"
            @click.stop="changeNode(50, 'percent', 'changeNode')"
          ></li>
          <li
            class="percent pie"
            data-percent="70"
            @click.stop="changeNode(70, 'percent', 'changeNode')"
          ></li>
          <li
            class="percent pie"
            data-percent="90"
            @click.stop="changeNode(90, 'percent', 'changeNode')"
          ></li>
          <li
            class="percent pie iconfont icon-wancheng"
            @click.stop="changeNode(100, 'percent', 'changeNode')"
          ></li>
        </ul>
      </div>
    </div>

    <div
      class="win-tooltip"
      v-show="showmarks"
      v-bind:style="'left:' + showmarksleft + 'px;top:' + showmarkstop + 'px'"
    >
      <div class="mark-input">
        <input
          type="text"
          ref="mindInput"
          placeholder="Add Tag"
          @keyup.enter.stop="addMark"
        />
      </div>
      <div class="mark-list">
        <span>{{ $t("node.allTag") }}</span>
        <div>
          <div
            class="mark-item"
            :style="'background:' + item.fill + ';color:' + item.color"
            v-for="item in mindMarkList"
            v-bind:key="item.id"
          >
            <input
              :id="item.id"
              :checked="item.checked"
              @change="addToNodeMark($event, item)"
              type="checkbox"
            />
            <label :for="item.id">{{ item.text }}</label>
          </div>
        </div>
      </div>
      <div class="mark-list">
        <span>{{ $t("node.nodeTag") }}</span>
        <div>
          <div
            class="mark-item"
            v-for="item in nodeMarkList"
            v-bind:key="item.id"
            :style="'background:' + item.fill + ';color:' + item.color"
          >
            <span>{{ item.text }}</span>
            <!-- <i @click.stop="deleteNodeMark(item)" class="iconfont icon-shanchu"></i> -->
          </div>
        </div>
      </div>
    </div>

    <div class="win-tooltip win-toolbar" ref="winToolbar">
      <span @click.stop="execute('bold')" class="iconfont icon-jiacu"></span>
      <span
        @click.stop="execute('italic')"
        class="iconfont icon-qingxie"
      ></span>
      <span
        @click.stop="execute('deleteLine')"
        class="iconfont icon-shanchuxian"
      ></span>
      <span
        @click.stop="execute('underLine')"
        class="iconfont icon-xiahuaxian"
      ></span>
      <span
        @click.stop="execute('highlight')"
        class="iconfont icon-gaoliang"
      ></span>
      <span
        @click.stop="execute('emptyText')"
        class="iconfont icon-hide"
      ></span>
      <span @click.stop="showColorList" class="color iconfont icon-color1">
        <div
          class="color-list"
          @mouseleave.stop="hideColorList"
          v-show="showColor"
        >
          <p>{{ $t("node.textColor") }}</p>
          <span class="red" @click.stop="execute('color', '.red')">A</span>
          <span class="orange" @click.stop="execute('color', '.orange')"
            >A</span
          >
          <span class="yellow" @click.stop="execute('color', '.yellow')"
            >A</span
          >
          <span class="green" @click.stop="execute('color', '.green')">A</span>
          <span class="blue" @click.stop="execute('color', '.blue')">A</span>
          <span class="gray" @click.stop="execute('color', '.gray')">A</span>
          <span class="black" @click.stop="execute('color', '.black')">A</span>
          <span class="white" @click.stop="execute('color', '.white')">A</span>

          <p>{{ $t("node.fillColor") }}</p>
          <span class="bg-red" @click.stop="execute('color', '.bg-red')"
            >A</span
          >
          <span class="bg-orange" @click.stop="execute('color', '.bg-orange')"
            >A</span
          >
          <span class="bg-green" @click.stop="execute('color', '.bg-green')"
            >A</span
          >
          <span class="bg-blue" @click.stop="execute('color', '.bg-blue')"
            >A</span
          >
          <span class="bg-gray" @click.stop="execute('color', '.bg-gray')"
            >A</span
          >
          <span class="bg-black" @click.stop="execute('color', '.bg-black')"
            >A</span
          >
          <span class="bg-white" @click.stop="execute('color', '.bg-white')"
            >A</span
          >

          <p>{{ $t("node.CombineColor") }}</p>
          <span
            class="bg-red white"
            @click.stop="execute('color', '.white .bg-red')"
            >A</span
          >
          <span
            class="bg-orange white"
            @click.stop="execute('color', '.white .bg-orange')"
            >A</span
          >
          <span
            class="bg-green white"
            @click.stop="execute('color', '.white .bg-green')"
            >A</span
          >
          <span
            class="bg-blue white"
            @click.stop="execute('color', '.white .bg-blue')"
            >A</span
          >
          <span
            class="bg-gray white"
            @click.stop="execute('color', '.white .bg-gray')"
            >A</span
          >
          <span
            class="bg-black white"
            @click.stop="execute('color', '.white .bg-black')"
            >A</span
          >
          <span
            class="bg-white black"
            @click.stop="execute('color', '.black .bg-white')"
            >A</span
          >

          <span
            class="bg-red green"
            @click.stop="execute('color', '.green .bg-red')"
            >A</span
          >
          <span
            class="bg-orange green"
            @click.stop="execute('color', '.green .bg-orange')"
            >A</span
          >
          <span
            class="bg-green yellow"
            @click.stop="execute('color', '.yellow .bg-green')"
            >A</span
          >
          <span
            class="bg-blue orange"
            @click.stop="execute('color', '.orange .bg-blue')"
            >A</span
          >
          <span
            class="bg-orange green"
            @click.stop="execute('color', '.green .bg-orange')"
            >A</span
          >
          <span
            class="bg-red black"
            @click.stop="execute('color', '.black .bg-red')"
            >A</span
          >
          <span
            class="bg-gray orange"
            @click.stop="execute('color', '.orange .bg-gray')"
            >A</span
          >
          <span
            class="bg-red gray"
            @click.stop="execute('color', '.gray .bg-red')"
            >A</span
          >
        </div>
      </span>

      <span
        @click.stop="execute('clearText')"
        class="iconfont icon-qingchugeshi"
      ></span>
    </div>

    <div class="win-tooltip win-replace" v-show="openReplace">
      <div class="keyword">
        <input
          type="text"
          ref="searchWord"
          placeholder="Find"
          @mouseup.stop=""
          @input="refresh"
          @blur.stop="handleBlur"
        />
      </div>
      <div class="replace">
        <input
          type="text"
          placeholder="Replace"
          v-model="replaceText"
          @mouseup.stop=""
          @keydown.enter.stop="replaceWord"
        />
      </div>

      <div v-if="matchNum > 0">
        <span v-html="matchText"></span>
      </div>
    </div>
  </div>
</template>

<script>
let ipcRenderer = require("electron").ipcRenderer;
let { dialog } = require("electron").remote;
let Store = require("electron-store");
const { shell } = require("electron");
import i18n from "../locales/index";
import uuid from "../mind/uuid";
import $ from "jquery";
import theme from "../mind/theme";

import { saveAs } from "file-saver";

import List, { Node } from "../mind/list/list";

function debounce(func, wait) {
  let timeout;
  return function () {
    let context = this;
    let args = arguments;

    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}
var store = new Store();
var profile = store.get("config");

let canvasWidth = profile.canvasWidth;
let canvasHeight = profile.canvasHeight;

export default {
  name: "tree-list",
  props: [],
  computed: {
    matchText() {
      return i18n
        .t("node.matchText")
        .replace("{{matchNum}}", this.matchNum)
        .replace("{{matchNode}}", this.matchNode);
    },
  },
  created() {
    this.cacheRange = null;
    this.cacheNode = null;
    this.cacheText = "";
    document.onselectionchange = () => {
      if (this.cacheNode) {
        this.cacheNode.shoudRender = true;
        if (this.cacheNode != window.node) {
          this.cacheNode.parseText();
        }
        this.cacheNode = null;
      }
      var selection = window.getSelection();
      var range = selection.getRangeAt(0);
      var anchorNode = range.anchorNode;
      var nodes = $(range.endContainer.parentNode).closest(".text");
      var len = range.cloneContents().childNodes.length;

      if (nodes.length && len == 1) {
        if (range) {
          if (range.collapsed) {
            this.$refs.winToolbar.style = `display:none;`;
            this.cacheRange = null;
            this.cacheText = "";
            if (this.cacheNode) {
              this.cacheNode.shoudRender = true;
              this.cacheNode = null;
            }
          } else {
            this.cacheRange = range;
            this.cacheNode = $(range.endContainer.parentNode)
              .closest(".li-node")
              .get(0).node;
            this.cacheNode.shoudRender = false;
            this.cacheText = selection.toString();

            var rects = range.getClientRects();
            if (rects.length > 0) {
              var rect = rects[0];
              this.$refs.winToolbar.style = `display:block;left:${
                rect.x
              }px;top:${rect.y - 40}px`;
              this.showColor = false;
            }
          }
        }
      } else {
        if (this.$refs.winToolbar) {
          this.$refs.winToolbar.style = `display:none;`;
        }
        this.cacheRange = null;
        this.cacheText = "";
        if (this.cacheNode) {
          this.cacheNode.shoudRender = true;
          this.cacheNode = null;
        }
      }
    };

    var me = this;
    var focusItem = null,
      oldSelection = null,
      oldSelectionFocusOffset;

    window.shiftNode = null;
    window.shiftKey = null;
    window.ctrl = null;

    document.onkeyup = (e) => {
      shiftKey = null;
      shiftNode = null;
      ctrl = null;
    };

    document.onmousewheel = (event) => {
      var delta = 0;
      if (!event) event = window.event;
      if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
        if (window.opera) delta = -delta;
      } else if (event.detail) {
        delta = -event.detail / 3;
      }
      if (delta) {
        if (delta < 0) {
          if (ctrl) {
            me.scale += 0.1;
            document.getElementById(
              "list"
            ).style = `transform:scale(${me.scale});transform-origin:center 0`;
            var pt = (me.scale * 100).toFixed(0);
            me.message(`${pt}%`);
          }
        } else {
          if (ctrl) {
            me.scale -= 0.1;
            document.getElementById(
              "list"
            ).style = `transform:scale(${me.scale});transform-origin:center 0`;
            var pt = (me.scale * 100).toFixed(0);
            me.message(`${pt}%`);
          }
        }
      }
    };

    document.onkeydown = (e) => {
      var keyCode = e.keyCode || e.which || e.charCode;
      var ctrlKey = e.ctrlKey || e.metaKey;

      shiftKey = e.shiftKey;
      ctrl = e.ctrlKey;

      if (ctrlKey && keyCode == "70") {
        //ctrl+f
        this.openSearch = !this.openSearch;
        this.openReplace = false;
        if (!this.openSearch) {
          this.list.search("");

          this.showNode({ node: this.list.root });
        } else {
          this.$refs.searchKey.value = "";
          this.$nextTick(() => {
            me.$refs.searchKey.focus();
          });
        }
        return;
      }

      if (ctrlKey && keyCode == "72") {
        //ctrl+h
        this.openReplace = !this.openReplace;
        this.openSearch = false;
        if (!this.openReplace) {
          this.list.search("");
          setTimeout(() => {
            me.showNode({ node: this.list.root });
          }, 15);
        } else {
          this.replaceText = "";
          this.$nextTick(() => {
            me.$refs.searchWord.value = "";
            me.$refs.searchWord.focus();
          });
          this.matchNum = 0;
          this.matchNode = 0;
        }
        return;
      }

      focusItem = me.list.getSelectNode();
      if (keyCode == 8) {
        if (focusItem) {
          if (!focusItem.getTxt().trim()) {
            var prevNode = getPrevNode(focusItem);
            var p = focusItem.parent;
            var index = p.children.indexOf(focusItem);

            if (index == 0) {
              if (me.list.showingNode == p) {
                return;
              } else {
                me.list.execute("removeNode", { node: focusItem, parent: p });
              }
            } else if (index > 0) {
              me.list.execute("removeNode", { node: focusItem, parent: p });
            }

            me.list.selecNode(prevNode);
            setTimeout(() => {
              prevNode && prevNode.focus();
            }, 0);
          }
        }
        return;
      }

      if (ctrlKey && shiftKey && keyCode == 9) {
        //ctrl + shift +tab
        e.preventDefault();
        e.stopPropagation();
        var p = focusItem.parent;
        if (p && p == me.list.showingNode) {
          return;
        }
        var pp = p.parent;
        if (pp) {
          focusItem.shoudRender = false;
          me.list.execute("shiftCtrlTabNode", {
            node: focusItem,
            newParent: pp,
            oldParent: p,
          });
          me.list.selecNode(focusItem);
          setTimeout(() => {
            focusItem.focus();
            focusItem.shoudRender = true;
          }, 0);
        }
        console.log("shiftTabCtrl");
        return;
      }

      if (shiftKey && keyCode == 9) {
        //shift+tab
        e.preventDefault();
        e.stopPropagation();
        if (focusItem) {
          var p = focusItem.parent;
          if (p && p == me.list.showingNode) {
            return;
          }
          var pp = p.parent;
          if (pp) {
            if (me.list.shiftNodes && me.list.shiftNodes.length) {
              //多选的情况
              me.list.execute("shiftTabNodes", {
                nodes: me.list.shiftNodes,
                newParent: pp,
                oldParent: p,
              });
              return;
            }

            focusItem.shoudRender = false;

            me.list.execute("shiftTabNode", {
              node: focusItem,
              newParent: pp,
              oldParent: p,
            });

            me.list.selecNode(focusItem);
            setTimeout(() => {
              focusItem.focus();
              focusItem.shoudRender = true;
            }, 0);
          }
        }
        return;
      }

      if (keyCode == 9) {
        //tab
        e.preventDefault();
        e.stopPropagation();

        if (focusItem) {
          var p = focusItem.parent;
          if (me.list.shiftNodes && me.list.shiftNodes.length) {
            var index = p.children.indexOf(me.list.shiftNodes[0]);
            if (index > 0) {
              var prev = p.children[index - 1];
              me.list.execute("tabNodes", {
                nodes: me.list.shiftNodes,
                index,
                parent: prev,
                oldParent: p,
              });
            }
            return;
          } else {
            var index = p.children.indexOf(focusItem);
          }

          if (index > 0) {
            var prev = p.children[index - 1];

            me.list.execute("tabNode", {
              node: focusItem,
              index,
              parent: prev,
              oldParent: p,
            });

            me.list.selecNode(focusItem);

            focusItem.refresh();
            p.refresh();
            prev.refresh();
            focusItem.focus();
          }
        }
      }

      if (shiftKey && keyCode == 13) {
      }

      if (!shiftKey && keyCode == 13) {
        //enter
        if (me.openSearch) {
          return;
        }

        e.preventDefault();
        if (document.activeElement == me.$refs.mindInput) return;
        if (focusItem) {
          if (focusItem == me.list.showingNode) {
            var n = new Node({
              id: +new Date(),
              text: "",
            });

            me.list.execute("addNode", { node: n, parent: focusItem });
            me.list.selecNode(n);
            n.focus();
            n.refresh();
            focusItem.refresh();
            return;
          }
          var p = focusItem.parent;
          if (p) {
            var index = p.children.indexOf(focusItem);
            var n = new Node({
              id: +new Date(),
              text: "",
            });

            me.list.execute("addSameNode", {
              node: n,
              focusNode: focusItem,
              parent: p,
              index: index + 1,
            });
            me.list.selecNode(n);
            n.focus();
            focusItem.refresh();
            p.refresh();
          }
        }
      }

      if (ctrlKey && keyCode == 221) {
        if (focusItem) {
          me.list.showNode(focusItem);
          me.routes = me.list.routes;
        }
      }

      if (ctrlKey && keyCode == 219) {
        if (me.list.showingNode && me.list.showingNode.parent) {
          me.list.showNode(me.list.showingNode.parent);
          me.routes = me.list.routes;
        }
      }

      if (ctrlKey && keyCode == 38) {
        //ctrl + up
        e.preventDefault();
        if (focusItem) {
          var nodeId = focusItem.getId();
          var prevNode = getPrevNode(focusItem);
          prevNode.dropType = "top";

          node.list.moveNode(nodeId, prevNode);
        }
        return;
      }

      if (ctrlKey && keyCode == 40) {
        //ctrl + down
        e.preventDefault();
        if (focusItem) {
          var nodeId = focusItem.getId();
          var nextNode = getNextNode(focusItem);
          while (nextNode && nextNode.parent == focusItem) {
            var nd = getNextNode(nextNode);
            if (nd == nextNode) {
              break;
            } else {
              nextNode = nd;
            }
          }

          if (nextNode.children.length) {
            nextNode = nextNode.children[0];
            nextNode.dropType = "top";
          } else {
            nextNode.dropType = "down";
          }
          node.list.moveNode(nodeId, nextNode);
        }
        return;
      }

      if (keyCode == 38) {
        if (focusItem) {
          if (focusItem.getTxt() == "") {
            var n = getPrevNode(focusItem);
            if (n) {
              me.list.selecNode(n);
              setTimeout(() => {
                n.keepFocusEnd();
              }, 0);
            }
            return;
          }

          var posType = checkCursor(focusItem);

          if (posType == "beginning") {
            var n = getPrevNode(focusItem);
            if (n) {
              me.list.selecNode(n);
              setTimeout(() => {
                n.keepFocusEnd();
              }, 0);
            }
          }
        }
      }

      if (keyCode == 40) {
        if (focusItem) {
          if (focusItem.getTxt() == "") {
            var nextNode = getNextNode(focusItem);
            if (nextNode) {
              me.list.selecNode(nextNode);
              setTimeout(() => {
                nextNode.keepFocusEnd();
              }, 0);
            }
            return;
          }

          var posType = checkCursor(focusItem);

          if (posType == "end") {
            var nextNode = getNextNode(focusItem);
            if (nextNode) {
              me.list.selecNode(nextNode);
              setTimeout(() => {
                nextNode.keepFocusEnd();
              }, 0);
            }
          }
        }
      }

      if (ctrlKey && keyCode == "90") {
        if (this.list) {
          this.list.undo();
        }
      }

      if (ctrlKey && keyCode == "89") {
        if (this.list) {
          this.list.redo();
        }
      }

      if (ctrlKey && shiftKey && keyCode == "78") {
        //ctrl+shift+n  toggle note
        if (focusItem) {
          var oldData = focusItem.getPlainData();
          if (oldData.remark) {
            var newData = { ...oldData, ...{ remark: "" } };
          } else {
            var newData = { ...oldData, ...{ remark: "note" } };
          }
          this.list.execute("changeNode", {
            node: focusItem,
            oldData,
            newData,
          });
          if (oldData.remark) {
            focusItem.keepFocusEnd();
          } else {
            focusItem.focusNote();
          }
        }
      }

      if (ctrlKey && shiftKey && keyCode == "77") {
        //ctrl+shift+m  toggle link
        if (focusItem) {
          var link = focusItem.data.link;
          var oldData = focusItem.getPlainData();
          if (link) {
            var newData = { ...oldData, ...{ link: "" } };
          } else {
            var newData = { ...oldData, ...{ link: "https://" } };
          }
          this.list.execute("changeNode", {
            node: focusItem,
            oldData,
            newData,
          });
          focusItem.focusLink();
        }
      }

      //   if(ctrlKey&&shiftKey&&keyCode=='77'){      //ctrl+shift+n  toggle link
      //        if(focusItem){
      //         var link=focusItem.data.link;
      //         var oldData=focusItem.getPlainData();
      //         if(link){
      //            var newData={...oldData,...{link:''}}
      //         }else{
      //            var newData={...oldData,...{link:'https://'}}
      //         }
      //         this.list.execute('changeNode',{
      //                node:focusItem,
      //                oldData,
      //                newData
      //            });
      //            focusItem.focusLink();
      //     }
      //   }
    };

    // document.onkeydown=(e)=>{
    //      var keyCode = e.keyCode || e.which || e.charCode;
    //      var ctrlKey = e.ctrlKey || e.metaKey;
    //      var shiftKey=e.shiftKey;
    //      if(ctrlKey&&keyCode=='90'){
    //        if(this.mind){
    //           this.mind.undo();
    //        }
    //      }

    //     if(ctrlKey&&keyCode=='89'){
    //        if(this.mind){
    //           this.mind.redo();
    //        }
    //      }
    // }

    function getFirstTextChild(dom) {
      var d = null;
      if (dom.nodeType == 1) {
        d = getFirstTextChild(dom.firstChild);
      } else if (dom.nodeType == 3) {
        d = dom;
      }
      return d;
    }

    function checkCursor(node) {
      if (!node) return;
      var selection = window.getSelection();
      var re = selection.getRangeAt(0);
      var re2 = document.createRange();
      re2.selectNodeContents(getFirstTextChild(node.textDom.firstChild));
      if (re.compareBoundaryPoints(Range.START_TO_START, re2) <= 0) {
        return "beginning";
      }

      if (re2.collapsed && re2.startOffset == 0) {
        return "beginning";
      }

      var re3 = document.createRange();
      re3.selectNodeContents(getFirstTextChild(node.textDom.lastChild));
      if (re3.collapsed && re3.startOffset == 0) {
        return "end";
      }

      if (re.compareBoundaryPoints(Range.END_TO_END, re3) >= 0) {
        return "end";
      }
    }

    function checkPrevCursor(focusItem) {
      var node = me.list.getSelectNode();
      if (node == focusItem) {
        if (oldSelectionFocusOffset == 0) {
          var n = getPrevNode(focusItem);
          if (n) {
            me.list.selecNode(n);
            n.focus();
            n.keepFocusEnd();
          }
        }
      }
    }

    function checkNextCursor(focusItem) {
      var node = me.list.getSelectNode();
      var newSelection = window.getSelection();
      if (node == focusItem) {
        if (newSelection.focusOffset == oldSelectionFocusOffset) {
        }
      }
    }

    function getNextNode(node) {
      if (node.isExpand && node.childrenDom.children.length) {
        return node.childrenDom.children[0].node;
      } else {
        var n = null;
        var anchor = node;
        while (anchor) {
          if (anchor.liDom.nextSibling) {
            if (anchor.liDom.nextSibling.node) {
              n = anchor.liDom.nextSibling.node;
              break;
            }
          }
          anchor = anchor.parent;
        }
      }
      return n;
    }

    function getPrevNode(node) {
      var n = null;
      var anchor = node;
      if (anchor.liDom.previousSibling) {
        var ns = getChildNode(anchor.liDom.previousSibling);
        if (ns) {
          n = ns;
        } else {
          n = anchor.liDom.previousSibling.node;
        }
      } else {
        n = anchor.parent;
      }

      return n;
    }

    function getChildNode(dom) {
      var anchor = dom.node;

      if (anchor.isExpand && anchor.childrenDom) {
        var lastChild = anchor.childrenDom.lastElementChild;
        if (lastChild) {
          anchor = getChildNode(lastChild);
        }
      }

      return anchor;
    }

    function insertAfter(newEl, targetEl) {
      var parentEl = targetEl.parentNode;

      if (parentEl.lastChild == targetEl) {
        parentEl.appendChild(newEl);
      } else {
        parentEl.insertBefore(newEl, targetEl.nextSibling);
      }
    }
  },
  data() {
    return {
      isPrint: false,
      openSearch: false,
      openReplace: false,
      replaceText: "",
      matchNum: 0,
      matchNode: 0,
      showColor: false,
      scale: 1,
      listData: {
        id: "1",
        text: "第一级",
        isRoot: true,
        children: [
          {
            id: "new stuff",
            text: "new stuff",
            //  link:'http://www.baidu.com',
            //  remark:'hello world',
            //  image:'https://www.baidu.com/img/bd_logo1.png',
            //  imageWidth:200,
            //  imageHeight:100,
            priority: 1,
            percent: 30,
            children: [
              {
                id: "23",
                text: "",
                //  link:'http://www.baidu.com',
                //  remark:'hello world',
                //  image:'https://www.baidu.com/img/bd_logo1.png',
                //  imageWidth:200,
                //  imageHeight:100,
              },
            ],
          },
        ],
      },
      routes: [],
      showEdit: true,
      showLink: true,
      linkTop: 0,
      linkLeft: 0,
      showpriority: false,
      showpriorityleft: 0,
      showprioritytop: 0,

      showpercent: false,
      showpercentleft: 0,
      showpercenttop: 0,

      showmarks: false,
      showmarksleft: 0,
      showmarkstop: 0,

      nodeMarkList: [],
      mindMarkList: [],
    };
  },

  beforeRouteLeave(to, from, next) {
    document.onkeydown = null;
    document.onkeyup = null;
    document.onmouseup = null;
    document.onmousewheel = null;
    $(document).off("click");
    $("body").off("click");
    if (this.list) {
      this.list.off("showLink", this.showLinkEvent);
      this.list.off("showNode", this.showNodeEvent);
      this.list.off("hide", this.hideEvent);
      this.list.off("mounted", this.mountedEvent);
      this.list.off("save", this.saveEvent);
      this.list.off("selectNode", this.selectNodeEvent);
      this.list.removeEvent();
      this.list.remove();
    }
    next();
  },

  mounted() {
    var mindData = JSON.parse(JSON.stringify(this.$store.state.MindData));
    var images = mindData.images;
    var me = this;

    try {
      var data = JSON.parse(JSON.stringify(this.$store.getters.getData));
      if (mindData) {
        if (mindData.theme) {
          theme.use(mindData.theme);
        }
      }
    } catch (e) {
      theme.use("blue");
      this.$store.dispatch("setFilePath", { path: "" });
      this.$store.dispatch("setTag", "local");
      var id = uuid();
      var data = {
        id: id,
        text: i18n.t("node.topic"),
        main: true,
        isRoot: true,
        showingNode: id,
        isExpand: true,
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        layout: {
          layoutName: "minder2",
          direct: "right",
        },
        marks: [],
      };
    }

    this.el = document.getElementById("list");

    this.list = new List(this.el);
    this.el.list = this.list;

    this.showLinkEvent = (e) => {
      var node = e.detail.node;
      var top = node.offsetTop(node.linkDom);
      var left = node.offsetLeft(node.linkDom);
      this.linkLeft = left;
      this.showLink = true;
      var h = node.linkDom.offsetHeight;
      this.linkTop = top + h;
    };

    this.list.on("showLink", this.showLinkEvent);
    this.showNodeEvent = (e) => {
      me.showNode(e.detail);
    };
    this.list.on("showNode", this.showNodeEvent);

    this.hideEvent = () => {
      me.hidden();
      if (me._shiftNodes.length) {
        me._shiftNodes.forEach((n, i) => {
          if (n.liDom.classList.contains("shiftSelect")) {
            n.liDom.classList.remove("shiftSelect");
          }
        });
        me._shiftNodes = [];
        me.list.shiftNodes = [];
        me.shiftNode = null;
      }
    };
    this.list.on("hide", this.hideEvent);

    this._shiftNodes = [];
    this.selectNodeEvent = (e) => {
      var node = e.detail.node;
      if (shiftKey) {
        if (shiftNode) {
          if (shiftNode != node) {
            if (shiftNode.parent == node.parent) {
              me._shiftNodes = [];
              var p = node.parent;
              var d = p.children.indexOf(shiftNode);
              var d1 = p.children.indexOf(node);
              var min = Math.min.apply(null, [d, d1]);
              var max = Math.max.apply(null, [d, d1]);
              p.children.forEach((n, i) => {
                if (i >= min && i <= max) {
                  me._shiftNodes.push(n);
                }
              });

              me.list.shiftNodes = me._shiftNodes.slice();
              me.shiftSelectNode();
            }
          }
        } else {
          shiftNode = node;
        }
      }
    };

    this.list.on("selectNode", this.selectNodeEvent);

    this.saveEvent = () => {
      me.saveToStore(false);
    };

    this.list.on("save", this.saveEvent);

    this.mountedEvent = (e) => {
      var routes = e.detail.routes;
      this.routes = routes;
    };

    this.list.on("mounted", this.mountedEvent);

    this.list.init(data, images);

    $("body").off("click");
    $("body").on("click", ".li-node .node-priority", function (e) {
      e.stopPropagation();
      var p = $(this).get(0);
      var node = p.node;
      me.selecNode = node;

      me.list.selecNode(node);
      var left = $(this).offset().left;
      var top = $(this).offset().top;
      me.showpriority = true;
      me.showpercent = false;
      me.showmarks = false;
      (me.showpriorityleft = left - 100), (me.showprioritytop = top + 30);
    });

    $("body").on("click", ".li-node .node-percent", function (e) {
      e.stopPropagation();
      var p = $(this).get(0);
      var node = p.node;
      me.selecNode = node;
      me.list.selecNode(node);
      var left = $(this).offset().left;
      var top = $(this).offset().top;
      me.showpercent = true;
      me.showpriority = false;
      me.showmarks = false;
      (me.showpercentleft = left - 100), (me.showpercenttop = top + 30);
    });

    $("body").on("click", ".li-node .magic-checkbox", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var p = $(this).closest(".li-node").get(0);
      var node = p.node;
      node.toggleTodoState();
      me.selecNode = node;
      me.list.selecNode(node);
    });

    $("body").on("click", ".li-node .node-markList", function (e) {
      e.stopPropagation();
      var p = $(this).get(0);
      var node = p.node;
      me.selecNode = node;
      me.list.selecNode(node);
      var left = $(this).offset().left;
      var top = $(this).offset().top;
      me.nodeMarkList = node.data.marks.slice();

      me.mindMarkList = me.$store.state.MindData.mindData.marks.map((item) => {
        return { ...{}, ...item };
      });

      me.mindMarkList.forEach((item) => {
        item.checked = false;
      });

      setTimeout(() => {
        me.mindMarkList.forEach((item) => {
          me.nodeMarkList.forEach((nt) => {
            if (item.id == nt.id) {
              item.checked = true;
            }
          });
        });
      }, 0);
      me.showmarks = true;
      me.showpriority = false;
      me.showpercent = false;
      (me.showmarksleft = left - 100), (me.showmarkstop = top + 30);
    });

    $("body").on("click", ".win-tooltip", function (e) {
      e.stopPropagation();
    });

    $(document).on("click", () => {
      me.hidden();
    });
    if (document.body.classList.contains("mark-mind")) {
      document.body.classList.remove("mark-mind");
    }
    if (!document.body.classList.contains("mark-list")) {
      document.body.classList.add("mark-list");
    }

    window.onresize = () => {
      this.hidden();
    };
  },

  methods: {
    showColorList() {
      this.showColor = true;
    },
    hideColorList() {
      this.showColor = false;
    },
    shiftSelectNode() {
      var me = this;
      this._shiftNodes.forEach((n) => {
        n.shiftSelect();
      });
    },
    replaceWord() {
      if (this.replaceText) {
        var nodes = [];
        var word = this.$refs.searchWord.value;
        $(".search_key").each((i, dom) => {
          var node = $(dom).closest(".li-node").get(0).node;
          if (nodes.indexOf(node) == -1) {
            nodes.push(node);
          }
        });
        this.list.execute("replaceText", {
          nodes,
          word,
          replaceWord: this.replaceText,
        });
      }
    },
    handleBlur(e) {
      var me = this;
      var val = e.target.value.trim();
      //  var cha=['*','_','$','**','$$','~~','==','***','``','```',':::'];
      //  if(cha.indexOf(val)>-1){
      //      val='';
      //  }
      //  e.target.value=val;
      if (val) {
        val = val.replace(/' '/gi, "");
        this.search(e, function () {
          me.matchNum = $(".search_key").length;
          me.matchNode = me.list.searchNode.length;
        });
      } else {
        this.list.search("");
      }
    },
    execute(type, value) {
      this.cacheText = this.cacheText.trim();
      switch (type) {
        case "bold":
          var text = `**${this.cacheText}**`;
          break;
        case "italic":
          var text = `*${this.cacheText}*`;

          break;
        case "deleteLine":
          var text = `~~${this.cacheText}~~`;

          break;
        case "underLine":
          var text = `_${this.cacheText}_`;
          break;
        case "highlight":
          var text = `==${this.cacheText}==`;
          break;
        case "color":
          var text = `[${this.cacheText}]{{${value}}}`;
          break;
        case "emptyText":
          var text = `--${this.cacheText}--`;
          break;
        case "clearText":
          var text = this.cacheText.replace(/\*/gi, "");
          text = text.replace(/-/gi, "");
          text = text.replace(/=/gi, "");
          text = text.replace(/_/gi, "");
          text = text.replace(/~/gi, "");
          text = text.replace(/\[/gi, "");
          text = text.replace(/\]/gi, "");
          var reg = /\{\{(.*?)\}\}/gm;
          let array = [];
          var temp;
          while ((temp = reg.exec(text))) {
            array.push(temp[0]);
          }
          if (array.length) {
            array.forEach((t) => {
              text = text.replace(new RegExp(t, "g"), "");
            });
          }
          break;
      }

      this.cacheRange.deleteContents();
      this.cacheRange.insertNode(document.createTextNode(text));
      var selection = window.getSelection();
      this.cacheText = selection.toString();
      this.cacheNode.refreshMdText();
      selection.removeAllRanges();
      selection.addRange(this.cacheRange);
      selection.collapseToEnd();
      this.cacheNode.shoudRender = true;
      this.$refs.winToolbar.style = "display:none";
    },
    hidden() {
      this.showLink = false;
      this.showpriority = false;
      this.showpercent = false;
      this.showmarks = false;
    },
    search(e, cb) {
      this.routes = [];
      var value = e.target.value;

      if (this.list) {
        this.list.search(value);
        cb && cb();
      }
    },
    changeStyle(data) {
      data.value
        ? document.execCommand(data.command, false, data.value)
        : document.execCommand(data.command, false, null);
    },

    changeNode(value, type, cmdName) {
      var node = this.selecNode || this.list.getSelectNode();
      if (node) {
        var oldData = node.getPlainData();
        if (type == "priority") {
          if (oldData[type] != value) {
            this.list.execute(cmdName, {
              node,
              oldData,
              newData: { ...oldData, ...{ priority: value } },
            });
          }
        } else if (type == "percent") {
          if (oldData[type] != value) {
            this.list.execute(cmdName, {
              node,
              oldData,
              newData: { ...oldData, ...{ percent: value } },
            });
          }
        }
      }
    },

    addMark(e) {
      var value = e.target.value;
      if (value) {
        this.$store.dispatch("addMindMark", {
          id: uuid(),
          text: value,
          checked: false,
          fill: "red",
          color: "#333",
        });
        e.target.value = "";
      }
    },

    deleteNodeMark(item) {
      var me = this;
      var node = this.selecNode || this.list.getSelectNode();
      if (node) {
        var oldMarks = node.data.marks.slice();
        var oldData = node.getPlainData();
        var index = null;
        oldMarks.forEach((m, i) => {
          if (m.id == item.id) {
            index = i;
          }
        });
        var newMarks = oldMarks.slice();
        newMarks.splice(index, 1);
        this.list.execute("changeNode", {
          node,
          oldData,
          newData: {
            ...oldData,
            ...{
              marks: newMarks,
            },
          },
        });

        node.initMark();
        node.keepFocusEnd();

        me.nodeMarkList = node.data.marks.slice();
        if (me.nodeMarkList.length) {
          me.showmarks = true;
        } else {
          me.showmarks = false;
        }
      }
    },

    addToNodeMark(e, item) {
      var me = this;
      var mark = { ...item };
      var node = this.selecNode || this.list.getSelectNode();
      if (e.target.checked) {
        if (node) {
          var oldMarks = node.data.marks.slice();
          var oldData = node.getPlainData();
          var newMarks = oldMarks.slice();
          newMarks.push(mark);
          this.list.execute("changeNode", {
            node,
            oldData,
            newData: {
              ...oldData,
              ...{
                marks: newMarks,
              },
            },
          });

          node.initMark();
          node.keepFocusEnd();
          me.nodeMarkList = node.data.marks.slice();
          me.showmarks = true;
        }
      } else {
        this.deleteNodeMark(mark);
      }
    },

    showNode(item) {
      this.list.showNode(item.node);
      this.routes = this.list.routes;
    },
    saveToStore(deleteEvent) {
      var data = JSON.parse(
        JSON.stringify(this.list.getData(null, false, deleteEvent))
      );
      var children = data.children;
      var rootChild = [];
      var induce = [];
      var freeNode = [];

      children.forEach((n, i) => {
        if (n.nodeType == "freeNode") {
          freeNode.push(n);
        } else if (n.nodeType == "induce") {
          induce.push(n);
        } else {
          rootChild.push(n);
        }
      });

      data.children = rootChild;
      var mindData = [],
        induceData = [];
      mindData.push(this.dataToList(data));

      if (freeNode.length) {
        freeNode.forEach((n) => {
          mindData.push(this.dataToList(n));
        });
      }

      if (induce.length) {
        induce.forEach((ind) => {
          var obj = {
            belongInduce: ind.belongInduce,
            nodes: this.dataToList(ind),
          };
          induceData.push(obj);
        });
      }

      var m = JSON.parse(JSON.stringify(this.$store.state.MindData));

      var oldInduceData = m.mindData.induceData;
      var newInduceData = [];
      induceData.forEach((d) => {
        var belongInduce = d.belongInduce;
        var obj = {};
        var old = oldInduceData.filter((ind) => {
          return ind.induceData.id == belongInduce;
        })[0];
        if (old) {
          obj.induceData = old.induceData;
          obj.mindData = d.nodes;
          newInduceData.push(obj);
        }
      });

      m.mindData.mindData = mindData;
      m.mindData.induceData = newInduceData;
      if (this.$store.state.MindData.mindData.marks) {
        m.mindData.marks = this.$store.state.MindData.mindData.marks.slice();
      } else {
        m.mindData.marks = [];
        m.mindData.induceData = [];
        m.mindData.wireFrameData = [];
        m.mindData.calloutData = [];
        m.mindData.relateLinkData = [];
      }

      return this.$store.dispatch("setMindData", m.mindData);
    },
    enterMind() {
      if (!this.list.stack.dirty()) {
        this.$router.push("/");
        return;
      }
      this.saveToStore(true).then(() => {
        this.$router.push("/");
      });
    },

    refresh(e) {
      if (!e.target.value) {
        this.list.search("");
      }
    },

    dataToList(data) {
      var list = [];
      function pushList(data) {
        list.push(data);
        data.children.forEach((c) => {
          pushList(c);
        });
      }
      pushList(data);
      return list;
    },
    message(msg) {
      this.$parent.message(msg);
    },
    printWord() {
      var me = this;
      $("#copy-list").html($("#list").html()).css("display", "block");
      $("#copy-list").wordExport(this.list.showingNode.getTxt());
      $("#copy-list").html("").css("display", "none");
    },
    print(e) {
      var me = this;
      this.isPrint = true;
      document.querySelector("html").classList.add("print");
      function printSucess() {
        me.isPrint = false;
        if (document.querySelector("html").classList.contains("print")) {
          document.querySelector("html").classList.remove("print");
        }
      }

      function printFail() {
        me.isPrint = false;
        if (document.querySelector("html").classList.contains("print")) {
          document.querySelector("html").classList.remove("print");
        }
        alert("导出失败");
      }

      ipcRenderer.once("export-list-success", printSucess);

      ipcRenderer.once("export-list-fail", printFail);
      ipcRenderer.once("export-list-cancel", printSucess);

      ipcRenderer.send("export-list");
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.cicada-list {
  background: #f2f2f2;
  top: 24px;
  overflow-y: auto;
  text-align: left;
  /* position: fixed; */
  left: 0;
  bottom: 0;
  right: 0;
  top: 0;
  height: 100%;
}
.cicada-list ul {
  margin-left: 10px;
  padding: 0;
  border-left: 1px dashed #eee;
  line-height: 30px;
}

.cicada-list li {
  list-style: none;
  padding-left: 16px;
}

/* .cicada-list ul>li:first-child{
  border-left:1px dotted #ccc;
} */
.cicada-list .text {
  /* display: inline-block;  */

  outline: transparent dotted thick;
  /* margin-left:30px; */
}
/* .cicada-list li.select{
    border:1px solid #ccc;
} */
#list {
  border-left: 0;
  width: 900px;
  margin: 80px auto;
  min-width: 600px;
  max-width: 1000px;
  font-size: 16px;
  min-height: 900px;
  background: #fff;
  padding: 60px 80px 160px 80px;
}
.theme-dark #list {
  background: #282828;
  box-shadow: 0 0 4px #333;
}

.print {
  box-shadow: 0 0 0 !important;
}
.rich-edit {
  position: fixed;
  right: 20px;
  top: 20px;
  background: #fff;
  padding: 6px;
  border-radius: 3px;
  border: 1px solid #f5f5f5;
  font-size: 14px;
  z-index: 4000;
  cursor: pointer;
}
/* .btn-group{
    font-weight: bold;
} */
.btn-group a {
  text-decoration: none;
  color: #666;
  display: inline-block;
  min-width: 24px;
  line-height: 24px;
  text-align: center;
  margin: 2px;
  height: 24px;
  border-radius: 50%;
  vertical-align: middle;
}
.btn-group > a:first-child {
  color: #ccc;
}

.li-node {
  position: relative;
  box-sizing: border-box;
}

.li-node ul {
  top: 0;
  visibility: visible;
}

.li-node ul.hide {
  position: absolute;
  top: -500px;
  visibility: hidden;
  transition: top, visibility 0.5s, 0.5s ease, ease;
}

.li-node .node-open {
  font-size: 12px;
  vertical-align: top;
  padding-right: 6px;
  cursor: pointer;
  position: absolute;
  left: -38px;
  display: none;
  color: #666;
}

.li-node .icon-dott {
  display: inline-block;
  width: 6px;
  background-color: #fff;
  position: absolute;
  left: -20px;
  top: 0px;
  height: 30px;
  cursor: move;
  z-index: 3000;
}
.li-node .icon-dott:hover span {
  background-color: #666;
}

.li-node .icon-dott span {
  border-radius: 50%;
  width: 6px;
  height: 6px;
  background-color: #7a7a7a;
  position: absolute;
  left: 1px;
  top: 12px;
  line-height: 30px;
}

.li-node.node-expand > .node-control > .icon-dott span:before {
  display: "block";
  content: "";
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 0;
  left: -3px;
  top: -3px;
}

.li-node > .node-control > .icon-dott span:before {
  display: "block";
  content: "";
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid #444343;
  left: -3px;
  top: -3px;
}

/* .li-node .node-open.icon-iconjia{
    display: block;
} */

.li-node.node-no-border {
  padding-left: 0;
}
.li-node.node-no-border > ul {
  margin-left: 0px;
  padding: 0;
  border-left: 0px dashed #eee;
}

.node-control:hover > .node-open {
  display: block;
}
.node-leaf .node-control:hover > .node-open {
  display: none;
}

.node-add-top > .node-control:before {
  display: block;
  content: "";
  position: absolute;
  top: 0;
  height: 2px;
  background-color: blue;
  width: 100%;
  box-sizing: border-box;
  z-index: 10;
  margin: 2px 0;
}

.node-add-bottom > .node-control:after {
  display: block;
  content: "";
  position: absolute;
  bottom: 0;
  height: 2px;

  background-color: blue;
  width: 100%;
  box-sizing: border-box;
  z-index: 10;
  margin: 2px 0;
}
.node-control {
  position: relative;
}

.route {
  width: 1060px;
  margin: 10px auto;
  /* border-bottom: 1px solid #f6f6f6; */
  cursor: pointer;
  color: #666;
  font-size: 12px;
  margin: 0 auto;
  margin-top: 30px;
}

.route ul {
  border: 0 !important;
  margin: 0;
  line-height: 24px;
}
.route li {
  display: inline-block;
  line-height: 28px;
  padding-left: 0;
}

.route li span {
  display: inline-block;
  vertical-align: middle;
}

.route li span.text {
  max-width: 200px;
  padding: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.route li:first-child {
  margin-left: 0;
}
.route li:hover {
  color: #333;
}
.theme-dark .route li {
  color: rgba(255, 255, 255, 0.4);
}

.theme-dark .route li:hover {
  color: rgba(255, 255, 255, 0.6);
}

/* .route-item span{
    margin:0 6px;
} */

.li-node .node-link {
  color: #666;
  font-size: 14px;
}
.li-node .node-remark {
  background: #f5f5f5;
  outline: transparent solid 2px;
  padding: 2px 4px;
  color: inherit;
  font-size: 12px;
  line-height: 24px;
}
.theme-dark .li-node .node-remark {
  background: #2d2d2d;
}

.li-node .node-image {
  padding: 6px;
  background: transparent;
  position: relative;
  display: inline-block;
  border: 1px solid transparent;
}

.li-node .node-image:hover {
  border: 1px solid #ccc;
}

.li-node .node-image:hover .node-resize,
.li-node .node-image:hover .node-delete {
  display: block;
}

.li-node .node-resize {
  position: absolute;
  width: auto;
  height: 20px;
  z-index: 200;
  right: 0;
  bottom: 4px;
  cursor: nw-resize;
  display: none;
}
.li-node .node-delete {
  position: absolute;
  right: 2px;
  top: 0;
  cursor: pointer;
  display: none;
}

.li-node .node-assist {
  height: 30px;
  box-sizing: border-box;
  padding-top: 8px;
}

.linkSetup {
  position: absolute;
  z-index: 120;
  padding: 6px 10px;
  /* border:1px solid #ccc; */
  background: #ffeac3;
  border-radius: 2px;
}
.linkSetup::before {
  content: "";
  display: block;
  width: 0;
  height: 0;
  border: 8px solid;
  border-color: transparent transparent #ffeac3;
  top: -16px;
  position: absolute;
  left: 8px;
}

.linkSetup span {
  display: inline-block;
  width: 50px;
  height: 30px;
  line-height: 30px;
  background: #666;
  color: #fff;
  margin: 6px;
  text-align: center;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
}

.linkSetup span:hover {
  opacity: 0.8;
}

.cicada-list li.node-showNode {
  padding-left: 0;
}
.cicada-list li.node-showNode > .node-control {
  margin-bottom: 40px;
}
.cicada-list li.node-showNode > .node-control .text {
  border-bottom: 2px solid #f5f5f5;
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 3px;
}

/* .cicada-list li ul,
.cicada-list li .node-control{
    transition: all 0.6s ease;
} */

.cicada-list li.node-showNode > .node-control .node-open,
.cicada-list li.node-showNode > .node-control .icon-dott {
  display: none;
}
.text {
  min-height: 30px;
}

.text ul {
  border-left: 0;
  list-style: outside;
}

.text ul li {
  list-style-type: circle;
  padding-left: 0;
}

.text ol li {
  list-style-type: disc;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6,
.text p {
  margin: 0 !important;
  line-height: inherit !important;
}
.text table {
  line-height: 24px;
}

.markdown-body li + li {
  margin-top: 0 !important;
}
.markdown-body h1,
.markdown-body h2 {
  border-bottom: 0 !important;
  padding-bottom: 0;
}

/* .markdown-body pre{
    background: #424344!important;
} */

.markdown-body ol,
.markdown-body ul {
  padding-left: 0 !important;
}

/* .printPdf{
    width:50px;
    position: fixed;
    right:20px;
    height:28px;
    line-height: 28px;
    top:66px;
    text-align: center;
    cursor: pointer;
} */

.search {
  position: fixed;
  top: 30px;
  right: 140px;
  height: 26px;
  width: 200px;
}

.search input {
  height: 100%;
  border: 1px solid #8e8e8e;
  text-indent: 6px;
  width: 100%;
  border-radius: 3px;
}

.control {
  position: fixed;
  top: 24px;
  z-index: 6000;
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

.control button {
  -webkit-app-region: no-drag;
}

.theme-dark .control {
  background: #424242;
  color: #ccc;
  border-bottom: 1px solid #000;
}

.enterMind {
  position: fixed;
  top: 30px;
  right: 20px;
  cursor: pointer;
  width: 50px;
  height: 26px;
  text-align: center;
  line-height: 26px;
  border-radius: 3px;
  background: #fff;
  border: 1px solid #929292;
  z-index: 6000;
}

.icon-export {
  position: fixed;
  right: 77px;
  top: 30px;
  width: 50px;
  height: 26px;
  cursor: pointer;
  text-align: center;
  line-height: 26px;
  font-size: 14px !important;
  border-radius: 3px;
  background: #fff;
  border: 1px solid #929292;
  z-index: 6000;
}

.icon-export span {
  height: 26px;
  width: 50px;
  margin-top: 4px;
}
.icon-export .content {
  position: absolute;
  left: -48px;
  top: 0;
  display: none;
  width: 50px;
}

.theme-dark .icon-export {
  background: #464545;
  color: #929292;
  border-radius: 4px;
  border: 1px solid #666;
}

.icon-export:hover > .content {
  display: block;
}

.theme-dark .enterMind {
  background: #464545;
  color: #929292;
  border-radius: 4px;
  border: 1px solid #666;
}

.theme-dark .printPdf {
  background: #464545;
  color: #929292;
  border-radius: 4px;
  /* border:1px solid #666; */
}
.win-tooltip ul {
  margin: 0;
  padding: 0;
  border-left: 0;
}
.win-tooltip {
  border: 1px solid #f5f5f5;
  padding: 6px;
  position: absolute;
  z-index: 2000;
  background: #fff;
}

.win-tooltip ul li {
  padding-left: 0;
  display: inline-block;
  vertical-align: middle;
  line-height: 20px;
  width: 20px;
  height: 20px;
  font-size: 14px;
  margin-right: 0;
  text-align: center;
  cursor: pointer;
}
.win-tooltip ul li:hover {
  opacity: 0.9;
}

.li-node .icon-wancheng:before {
  margin-left: -2px;
  margin-top: -2px;
  color: rgb(40, 204, 93);
  font-size: 18px;
  border-radius: 50%;
  background: #fff;
}
.li-node .icon-wancheng {
  margin-top: -6px;
}

.li-node .icon-weikaishi:before {
  margin-left: -2px;
  margin-top: -2px;
  color: rgb(40, 204, 93);
  font-size: 18px;
  border-radius: 50%;
  background: #fff;
}
.li-node .icon-weikaishi {
  margin-top: -6px;
}

.win-tooltip .icon-wancheng:before {
  margin-left: -1px;
  margin-top: -1px;
  color: rgb(40, 204, 93);
  font-size: 20px;
  border-radius: 50%;
  background: #fff;
}

.win-tooltip .icon-weikaishi:before {
  margin-left: -1px;
  margin-top: -1px;
  color: rgb(40, 204, 93);
  font-size: 20px;
  border-radius: 50%;
  background: #fff;
}

.li-node .todo-container {
  padding-top: 1px;
}

.node-link {
  word-break: break-all;
}

.win-toolbar {
  position: fixed;
  top: 100px;
  left: 200px;
  background: #fff;
  font-size: 12px;
  cursor: pointer;
  display: none;
  user-select: none;
  box-shadow: 0 0 6px #ccc;
  max-width: 260px;
}

.win-toolbar > span {
  padding: 0 6px;
}
.win-toolbar .color {
  font-size: 14px;
  width: auto;
}

.win-toolbar .color-list {
  left: calc(100% + 10px);
  top: -1px;
  background: #d6d6d6;
  padding: 2px;
  /* display: none; */
  border-radius: 3px;
  position: absolute;
  width: 200px;
  box-shadow: 0 0 6px #ccc;
}
.win-toolbar .color-list span {
  display: inline-block;
  width: 18px;
  text-align: center;
  line-height: 16px;
  margin: 1px;
}

/* .win-toolbar .color:hover .color-list{
   display: block;
} */

.print {
  -webkit-print-color-adjust: exact;
}
.print .cicada-list {
  background: #fff;
}

.print ::-webkit-scrollbar-track-piece {
  width: 14px;
  background-color: #fff;
}

.print ::-webkit-scrollbar {
  width: 10px;
  height: 8px;
  background: transparent;
}

.print ::-webkit-scrollbar-thumb {
  height: 50px;
  background: #fff;
  cursor: pointer;
}

.print ::-webkit-scrollbar-thumb:hover {
  background: #fff;
  cursor: pointer;
}

.print ::-webkit-scrollbar-corner {
  background-color: #fff;
}

.win-replace {
  position: fixed;
  z-index: 3000;
  background: #fff;
  right: 140px;
  top: 30px;
  font-size: 12px;
}
.win-replace input {
  margin-bottom: 6px;
}

.li-node.shiftSelect .node-control {
  background: #b5b5ce;
}
</style>
