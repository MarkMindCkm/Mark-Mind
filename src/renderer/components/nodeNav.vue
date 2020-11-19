<template>
  <div
    nochilddrag
    class="nodeNav"
    @click.stop=""
    v-bind:style="'left:' + left + 'px;top:' + top + 'px'"
  >
    <ul class="nav">
      <li
        class="iconfont icon-jiahao"
        v-if="showAddNode"
        @click.stop="cmd('addChildNode')"
      ></li>
      <li class="iconfont icon-beijing" @click.stop="show('node')"></li>
      <li
        style="font-size: 20px"
        @click.stop="show('link')"
        class="iconfont icon-infenicon15"
      ></li>
      <li
        class="iconfont icon-picture"
        v-if="showAddNode"
        @click.stop="show('image')"
      ></li>
      <li class="iconfont icon-beizhu" @click.stop="show('remark')"></li>
      <li class="iconfont icon-biaoqian" @click.stop="show('mark')"></li>
    </ul>

    <div class="win" v-show="showLink">
      <div class="win-content">
        <input
          type="text"
          :placeholder="$t('node.enterLink')"
          v-model="currentLink"
        />
        <span
          class="iconfont icon-Fillx"
          @keyup.enter="cmd('link')"
          @click.stop="cmd('link')"
          style="color: green; margin-right: 4px; margin-left: 4px"
        ></span>
        <span
          class="iconfont icon-chahao"
          @click.stop="showLink = false"
          style="color: red"
        ></span>
      </div>
    </div>

    <div class="win" v-show="showImage">
      <div class="tab">
        <ul>
          <li
            @click.stop="tab('localImage')"
            :class="localImage ? 'active' : ''"
          >
            {{ $t("node.localImage") }}
          </li>
          <!-- <li @click.stop="tab('webImage')" :class="webImage?'active':''">Web Image</li> -->
        </ul>
      </div>
      <div class="win-content">
        <div class="local-image" v-show="localImage">
          <button @click.stop="openImage">
            {{ $t("node.openLocalImage") }}
          </button>
          <input
            @click.stop=""
            type="file"
            id="imageFile"
            @change="fileChange"
            style="display: none"
          />
          <img
            :src="currentImage"
            alt=""
            style="
              display: block;
              width: 200px;
              height: 200px;
              margin-top: 10px;
            "
          />
        </div>
        <!-- 
              <div class="web-image" v-show="webImage">
                <input  @click.stop="" type="text" placeholder="Please enter image link"  @keyup.enter="cmd('image')" v-model="currentWebImage"/>
                <span class="iconfont icon-Fillx" @click.stop="cmd('image')" style="color:green;margin-right:4px;margin-left:4px"></span>
                <span class="iconfont icon-chahao" @click.stop="showImage=false" style="color:red"></span>
              </div> -->
      </div>
    </div>

    <div class="win" v-show="showRemark">
      <div class="win-content">
        <span
          class="iconfont icon-Fillx"
          @click.stop="cmd('remark')"
          style="color: green; margin-right: 4px; margin-left: 4px"
        ></span>
        <span
          class="iconfont icon-chahao"
          @click.stop="showRemark = false"
          style="color: red"
        ></span>
        <div id="quill-editor" class="editor"></div>
      </div>
    </div>

    <div class="win" v-show="showMark">
      <div class="win-content">
        <div class="mark-input">
          <input type="text" @keyup.enter.stop="addMark" />
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
              <i
                @click.stop="deleteMindMark(item)"
                class="iconfont icon-shanchu"
              ></i>
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
              <span @click="selectMark($event, item)">{{ item.text }}</span>
              <i
                @click.stop="deleteNodeMark(item)"
                class="iconfont icon-shanchu"
              ></i>
            </div>
          </div>
        </div>
        <div class="mark-color">
          <span>{{ $t("node.tagColor") }}</span>
          <ul>
            <li
              v-for="(item, i) in tagColors"
              v-bind:key="i"
              :style="'background:' + item"
              @click="setMarkColor(item)"
            ></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="win" v-show="showNode">
      <div class="win-content">
        <div class="cmd-group">
          <h3>{{ $t("node.fillColor") }}</h3>
          <ul class="fill-color">
            <li
              v-for="(item, i) in colorList"
              v-bind:key="i"
              :class="'bg-' + item"
              @click.stop="changeNode(item, 'backgroundColor')"
              :style="'background:' + item"
            ></li>
          </ul>
        </div>
        <div class="cmd-group">
          <h3>{{ $t("node.textColor") }}</h3>
          <ul class="text-color">
            <li
              v-for="(item, i) in colorList"
              v-bind:key="i"
              :class="'bg-' + item"
              @click.stop="changeNode(item, 'color')"
              :style="'background:' + item"
            ></li>
          </ul>
        </div>

        <div class="cmd-group">
          <h3>{{ $t("node.textAlign") }}</h3>
          <ul>
            <li
              class="textAlign iconfont icon-AlignLeft"
              @click.stop="changeNode('left', 'textAlign')"
            ></li>
            <li
              class="textAlign iconfont icon-AlignRight"
              @click.stop="changeNode('right', 'textAlign')"
            ></li>
            <li
              class="textAlign iconfont icon-juzhongduiqi"
              @click.stop="changeNode('center', 'textAlign')"
            ></li>
          </ul>
        </div>

        <div class="cmd-group">
          <h3 v-if="showAddNode">{{ $t("node.strokeColor") }}</h3>
          <ul v-if="showAddNode" class="stroke-color">
            <li
              v-for="(item, i) in colorList"
              v-bind:key="i"
              :class="'bg-' + item"
              @click.stop="changeNode(item, 'borderColor')"
              :style="'background:' + item"
            ></li>
          </ul>
          <h3>{{ $t("node.strokeWidth") }}</h3>
          <ul class="stroke-width">
            <li
              :class="'stroke-' + item"
              v-for="(item, i) in strokeWidth"
              :key="i"
              @click.stop="changeNode(item, 'borderWidth')"
            >
              {{ item }}
            </li>
          </ul>
          <h3>{{ $t("node.strokeStyle") }}</h3>
          <ul class="stroke-style">
            <li
              :class="'stroke-' + item"
              v-for="(item, i) in strokeStyle"
              :key="i"
              @click.stop="changeNode(item, 'borderStyle')"
            >
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="cmd-group">
          <h3>{{ $t("node.fontSize") }}</h3>
          <ul class="stroke-width">
            <li @click.stop="changeNode(12, 'fontSize')">12</li>
            <li @click.stop="changeNode(14, 'fontSize')">14</li>
            <li @click.stop="changeNode(16, 'fontSize')">16</li>
            <li @click.stop="changeNode(18, 'fontSize')">18</li>
            <li @click.stop="changeNode(20, 'fontSize')">20</li>
          </ul>
        </div>

        <div class="cmd-group" v-if="showAddNode">
          <h3>{{ $t("node.nodeShape") }}</h3>
          <ul class="stroke-style node-shapeType">
            <li
              class="iconfont icon-juxing"
              style="font-size: 18px"
              @click.stop="changeNode('rect', 'shapeType', 'changeNode')"
            ></li>
            <!-- <li class="iconfont icon-tuoyuan" @click.stop="changeNode('ellipse','shapeType','changeNode')"></li> -->
            <li
              class="iconfont icon-lingxing"
              @click.stop="changeNode('diamond', 'shapeType', 'changeNode')"
            ></li>
            <li
              class="iconfont icon-pinghangsibianxing"
              @click.stop="
                changeNode('parallelogram', 'shapeType', 'changeNode')
              "
            ></li>
            <!-- <li class="iconfont" @click.stop="changeNode('roundRect','shapeType','changeNode')">
                           <div class="icon-roundRect"></div>
                        </li> -->
          </ul>
        </div>

        <div class="cmd-group">
          <h3>{{ $t("node.priority") }}</h3>
          <ul>
            <li
              class="iconfont icon-shanchu"
              @click.stop="changeNode('', 'priority', 'changeNode')"
            ></li>
            <li
              class="node-priority"
              :data-priority="item"
              v-for="(item, i) in priority"
              :key="i"
              @click.stop="changeNode(item, 'priority', 'changeNode')"
            >
              {{ item }}
            </li>
          </ul>
        </div>

        <div class="cmd-group">
          <h3>{{ $t("node.percent") }}</h3>
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
              v-for="(item, i) in percent"
              :data-percent="item"
              :key="i"
              @click.stop="changeNode(item, 'percent', 'changeNode')"
            ></li>
            <li
              class="percent pie iconfont icon-wancheng"
              @click.stop="changeNode(100, 'percent', 'changeNode')"
            ></li>
          </ul>
        </div>
        <div class="cmd-group">
          <h3>{{ $t("node.borderRadius") }}</h3>
          <ul class="stroke-width">
            <li
              v-for="(item, i) in borderRadius"
              :key="i"
              @click.stop="changeNode(item, 'borderRadius')"
            >
              {{ item }}
            </li>
          </ul>
        </div>
        <div class="cmd-group">
          <h3>{{ $t("node.nodeSize") }}</h3>
          <ul class="node-size">
            <li @click.stop="changeNode('tiny small', 'size', 'changeNode')">
              Tiny Small
            </li>
            <li @click.stop="changeNode('small', 'size', 'changeNode')">
              Small
            </li>
            <li @click.stop="changeNode('normal', 'size', 'changeNode')">
              Normal
            </li>
            <li @click.stop="changeNode('big', 'size', 'changeNode')">Big</li>
            <li @click.stop="changeNode('bigger', 'size', 'changeNode')">
              Bigger
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Quill from "quill";
const { dialog } = require("electron").remote;
const { shell } = require("electron");
import i18n from "../locales/index";

export default {
  name: "nodeNav",
  props: [
    "left",
    "top",
    "link",
    "image",
    "remark",
    "nodeType",
    "nodeMarkList",
    "mindMarkList",
    "addMindMark",
    "removeMindMark",
    "addNodeMark",
    "removeNodeMark",
    "setStatus",
  ],
  data() {
    return {
      fontFamily: ["微软雅黑", "宋体"],
      fontSize: [12, 14, 16, 18, 20, 24, 32],
      colorList: [
        "#333",
        "rgb(78, 52, 46)",
        "#666",
        "#ccc",
        "orange",
        "rgb(51, 51, 51)",
        "rgb(240, 244, 195)",
        "red",
        "blue",
        "rgb(5, 196, 235)",
        "rgb(16, 151, 232)",
        "rgb(164, 195, 190)",
        "rgb(67, 160, 71)",
        "rgb(115, 154, 163)",
        "rgb(40, 53, 147)",
        "white",
        "#44CEF6",
        "#72A779",
        "#6DD625",
        "#3E76A5",
        "#943ACA",
        "#7ADD99",
        "#E82C0D",
        "#B386B8",
        "#D8B24D",
        "transparent",
      ],
      tagColors: [
        "#333",
        "#666",
        "#ccc",
        "orange",
        "red",
        "blue",
        "rgb(5, 196, 235)",
        "rgb(16, 151, 232)",
        "rgb(164, 195, 190)",
        "rgb(67, 160, 71)",
        "rgb(115, 154, 163)",
      ],
      strokeWidth: [0, 1, 2, 3, 4],
      priority: [1, 2, 3, 4, 5, 6, 7, 8],
      percent: [10, 30, 50, 70, 90],
      strokeStyle: [
        "solid",
        "dashed",
        "dotted",
        // 'double'
      ],
      borderRadius: [0, 2, 4, 6, 8, 10, 20, 30, 40, 50, 60],

      layout: [
        {
          name: "mind",
          direct: "",
          enable: true,
        },
        {
          name: "mind",
          direct: "left",
          enable: true,
        },
        {
          name: "mind",
          direct: "right",
          enable: true,
        },
        {
          name: "tree",
          direct: "down",
          enable: true,
        },
        {
          name: "tree",
          direct: "up",
          enable: true,
        },
        {
          name: "time",
          direct: "",
          enable: true,
        },
        {
          name: "fish",
          direct: "left",
          enable: true,
        },
        {
          name: "fish",
          direct: "right",
          enable: true,
        },
        {
          name: "down",
          direct: "",
          enable: true,
        },
      ],
      markList: [],
      nowMark: null,
      showAddNode: true,
      currentLink: "",
      currentImage: "",
      currentImageName: "",
      currentWebImage: "",
      showLink: false,
      showImage: false,
      showRemark: false,
      showFouram: false,
      showNode: false,
      showMark: false,
      localImage: true,
      webImage: false,
    };
  },
  watch: {
    link: {
      handler: function (val) {
        this.currentLink = val;
      },
    },
    image(val) {
      if (val.startsWith("http")) {
        this.localImage = true;
        this.webImage = false;
        this.currentWebImage = val;
      } else {
        this.currentImage = val;
        this.localImage = true;
        this.webImage = false;
      }
    },
    remark(val) {
      //this.editor.setContents(val);
      this.editor.root.innerHTML = val;
    },
    nodeType: {
      immediate: true,
      handler(val) {
        var t = ["relateLink", "callout", "wireFrame"];
        if (t.indexOf(val) > -1) {
          this.showAddNode = false;
        } else {
          this.showAddNode = true;
        }
      },
    },
    nodeMarkList: {
      immediate: true,
      handler(val) {
        var list = val;
        this.mindMarkList.forEach((item) => {
          item.checked = false;
        });
        if (list.length) {
          list.forEach((item) => {
            this.mindMarkList.forEach((it) => {
              if (it.id == item.id) {
                it.checked = true;
              }
            });
          });
        }
      },
    },
  },

  mounted() {
    var toolbarOptions = [
      [
        "bold",
        "italic",
        "underline",
        "strike",
        { color: [] },
        { background: [] },
        { list: "ordered" },
        { list: "bullet" },
        "code-block",
      ],
    ];

    this.editor = new Quill(".editor", {
      theme: "snow",

      modules: {
        formula: false,
        toolbar: toolbarOptions,
      },
    });
    // console.log(this.editor);
    this.editor.root.innerHTML = this.remark;
    this.currentLink = this.link;
  },
  methods: {
    tab(type) {
      if (type == "localImage") {
        this.localImage = true;
        this.webImage = false;
      } else {
        this.localImage = false;
        this.webImage = true;
      }
    },
    show(type) {
      this.showLink = false;
      this.showImage = false;
      this.showRemark = false;
      this.showFouram = false;
      this.showNode = false;
      this.showMark = false;

      if (type == "node") {
        this.showNode = true;
        this.$emit("setStatus", { key: "node" });
      } else if (type == "link") {
        this.showLink = true;
        this.$emit("setStatus", { key: "link" });
      } else if (type == "image") {
        this.showImage = true;
        this.$emit("setStatus", { key: "image" });
      } else if (type == "remark") {
        this.showRemark = true;
        this.$emit("setStatus", { key: "remark" });
      } else {
        this.showMark = true;
        this.$emit("setStatus", { key: "tag" });
      }
    },
    cmd(type) {
      if (type == "link") {
        this.$emit("command", {
          data: {
            link: this.currentLink,
          },
          type: "link",
        });
        this.showLink = false;
      } else if (type == "image") {
        this.$emit("command", {
          data: {
            image: this.localImage ? this.currentImage : this.currentWebImage,
            imageName: this.localImage ? this.currentImageName : "",
          },
          type: "image",
        });
        this.showImage = false;
      } else if (type == "remark") {
        if (this.editor.getText().trim()) {
          var remark = this.editor.root.innerHTML;
        } else {
          var remark = "";
        }
        this.$emit("command", {
          data: {
            remark,
          },
          type: "remark",
        });
        this.showRemark = false;
        this.$emit("setStatus", { key: "node" });
      } else if (type == "addChildNode") {
        this.$emit("command", {
          type: "addChildNode",
        });
      }
    },
    changeNode(value, key, type) {
      var data = {};
      if (key == "borderRadius") {
        data["borderTopLeftRadius"] = value;
        data["borderTopRightRadius"] = value;
        data["borderBottomLeftRadius"] = value;
        data["borderBottomRightRadius"] = value;
      } else {
        data[key] = value;
      }

      this.$emit("command", {
        data,
        type: type || "changeNodeStyle",
      });
    },
    openImage() {
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
      document.getElementById("imageFile").click();
    },

    fileChange(e) {
      var that = this;
      var file = e.target.files[0];
      if (file) {
        // console.log(file.name);
        if (["image/png", "image/jpeg", "image/gif"].indexOf(file.type) > -1) {
          var imgFile = new FileReader();
          imgFile.readAsDataURL(file);
          imgFile.onload = function () {
            var imgData = this.result;
            that.currentImage = imgData;
            that.currentImageName = file.name;
            document.getElementById("imageFile").value = "";
            that.cmd("image");
          };
        } else {
          alert("image type error");
        }
      }
    },

    changeLayout(item) {
      this.$emit("changeLayout", {
        data: item,
        type: "changeLayout",
      });
    },

    addMark(e) {
      var colors = [];
      var value = e.target.value;
      if (value) {
        this.$emit("addMindMark", {
          id: +new Date(),
          text: value,
          fill: "red",
          color: "#333",
          checked: false,
        });
        e.target.value = "";
      }
    },

    addToNodeMark(e, mark) {
      if (e.target.checked) {
        //console.log(mark);
        this.$emit("addNodeMark", mark);
      } else {
        this.$emit("removeNodeMark", mark);
      }
    },
    deleteMindMark(mark) {
      this.$emit("removeMindMark", mark);
    },
    deleteNodeMark(mark) {
      this.$emit("removeNodeMark", mark);
    },
    selectMark(e, mark) {
      this.nowMark = mark;
      if (!e.target.parentNode.classList.contains("active")) {
        e.target.parentNode.classList.add("active");
      }
      function siblings(elm) {
        var p = elm.parentNode.children; //获取父级所有子集元素
        for (var i = 0, pl = p.length; i < pl; i++) {
          if (p[i] !== elm) {
            //剔除自己
            if (p[i].classList.contains("active")) {
              p[i].classList.remove("active");
            }
          }
        }
      }
      siblings(e.target.parentNode);
    },
    setMarkColor(color) {
      if (this.nowMark) {
        this.nowMark.fill = color;
        this.$emit("changeMark", this.nowMark);
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.markdown-body li + li {
  margin-top: 4px !important;
}
li {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 4px;
  margin-top: 4px;
  box-sizing: border-box;
  vertical-align: middle;
}
li:hover {
  background: #ccc;
}
.tab li {
  width: auto;
  padding: 3px 6px;
  font-size: 12px;
}
.tab li.active {
  background: #f5f5f5;
}
a {
  color: #42b983;
}
.iconfont {
  margin: 0 4px;
  cursor: pointer;
}
.nodeNav {
  position: absolute;
  background: #fff;
  color: #333;
  border-radius: 3px;
  padding: 2px;
  z-index: 8000;
  min-width: 180px;
  text-align: left;
  user-select: none;
  box-shadow: 2px 2px 6px #ccc;
  max-width: 380px;
  font-size: 14px;
}
.nav {
  line-height: 36px;
}

button {
  display: block;
  height: 28px;
  border: 0;
  background: rgb(5, 196, 235);
  color: #fff;
  border-radius: 3px;
  width: 100%;
  cursor: pointer;
}
#toolbar {
  height: 60px;
}
.editor {
  width: 320px;
  height: 300px;
}
.win h3 {
  padding: 0;
  margin: 0;
  font-size: 14px !important;
  line-height: 28px !important;
}
.cmd-group {
  margin-bottom: 4px;
}
.stroke-width {
  height: 24px;
  font-size: 10px;
}

.stroke-0:after {
  content: "";
  display: block;
  height: 0px;
  border-bottom: 1px dashed #333;
  width: 100%;
}
.stroke-1:after {
  content: "";
  display: block;
  height: 0px;
  border-bottom: 1px solid #333;
  width: 100%;
}
.stroke-2:after {
  content: "";
  display: block;
  height: 0px;
  border-bottom: 2px solid #333;
  width: 100%;
}
.stroke-3:after {
  content: "";
  display: block;
  height: 0px;
  border-bottom: 3px solid #333;
  width: 100%;
}
.stroke-4:after {
  content: "";
  display: block;
  height: 0px;
  border-bottom: 4px solid #333;
  width: 100%;
}
.stroke-style {
  font-size: 10px;
}
.stroke-style li {
  width: 36px;
}

.stroke-solid:after {
  border-bottom: 1px solid #333;
  content: "";
  display: block;
  height: 0px;
}
.stroke-dashed:after {
  border-bottom: 1px dashed #333;
  content: "";
  display: block;
  height: 0px;
}
.stroke-dotted:after {
  border-bottom: 1px dotted #333;
  content: "";
  display: block;
  height: 0px;
}
.stroke-double:after {
  border-bottom: 3px double #333;
  content: "";
  display: block;
  height: 0px;
}

.node-shapeType {
  font-size: 20px;
}

.icon-roundRect {
  width: 16px !important;
  height: 10px !important;
  border-top-left-radius: 6px;
  border-bottom-right-radius: 6px;
  border: 1px solid #999;
  display: inline-block;
  margin-top: 3px;
}
.textAlign {
  font-size: 20px;
}
.node-size li {
  font-size: 12px;
  width: auto;
}
.fill-color li.bg-white,
.text-color li.bg-white,
.stroke-color li.bg-white {
  border: 1px solid #eaeaea;
}
.bg-transparent {
  background: url("../assets/transparent.png") repeat !important;
  background-size: contain !important;
  border: 1px solid #eaeaea;
}
#quill-editor .ql-editor {
  padding: 10px !important;
}
</style>
