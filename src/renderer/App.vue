<template>
  <div id="app" @keydown="shortCut" tabindex="-1">
    <div class="top-bar">
      <div :class="'logo ' + (platform=='drawin'?'drawin':'')">
        <span class="iconfont icon-sanheng" @click="toggleMenu"></span>
      </div>

      <tomato v-if="tomato" />
      <div :class="'btn-group ' + (platform=='drawin'?'drawin':'')">
        <div class="iconfont icon-min min" @click="min"></div>
        <div class="iconfont icon-max-two max" @click="max"></div>
        <div class="iconfont icon-searchclose close" @click="close"></div>
      </div>

      <div class="menu" v-if="showMenu">
        <ul>
          <li
            v-for="(item, k) in $t('topMenu')"
            v-bind:key="k"
            @click.stop="menu(item.id)"
          >
            {{ item.name }}
            <span v-if="item.shortCut" class="node-shortcut">{{
              item.shortCut
            }}</span>
            <span
              v-if="item.subMenu"
              class="iconfont icon-dakai"
              style="float: right; margin-right: 16px"
            ></span>
            <ul v-if="item.subMenu" class="submenu">
              <li
                v-for="(submenu, i) in item.subMenu"
                v-bind:key="i"
                @click.stop="menu(submenu.id)"
              >
                {{ submenu.name }}
                <span v-if="submenu.shortCut" class="node-shortcut">{{
                  submenu.shortCut
                }}</span>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <div class="about" v-if="about.show">
        <span
          class="close iconfont icon-searchclose"
          @click="about.show = false"
        ></span>
        <img :src="logo" />
        <h1>MarkMind</h1>
        <p>{{ about.version }}</p>
        <p>Twitter: <a @click="openlink('https://twitter.com/MarkMind9')">@MarkMind</a></p>
        <p>github: <a @click="openlink('https://github.com/MarkMindLtd/Mark-Mind')">@MarkMindLtd</a></p>
      </div>
    </div>

    <div class="activeCode" v-if="showactive">
      <span
        class="close iconfont icon-searchclose"
        @click="showactive = false"
      ></span>
      <div class="">
        <h1>{{ $t("node.activeTitle") }}</h1>
        <textarea ref="activeCode"></textarea>
        <button @click.stop="activeSoft">{{ $t("node.activeBtn") }}</button>
      </div>
    </div>

    <div ref="msg" class="tooltip-msg">
      {{ msg }}
    </div>

    <router-view></router-view>

    <Onedrive :showSave="showSave" v-if="$store.state.MindData.showOneDrive" />
  </div>
</template>

<script>
let ipcRenderer = require("electron").ipcRenderer;
let { dialog } = require("electron").remote;
let logo = require("./assets/logo.png");
const { shell } = require("electron");
const crypto = require("crypto");
const path = require("path");
import uuid from "./mind/uuid";
import $ from "jquery";

import parseHtml from "./mind/parseHtml";

import fs from "fs";
import JSZip from "jszip";

import exportMd from "./mind/export/exportMD";
import exportFreeMind from "./mind/export/exportFreeMind";
import exportHtml from "./mind/export/exportHTML";
import exportKityMind from "./mind/export/exportKityMind";
import exportOPML from "./mind/export/exportOPML";

import importOPML from "./mind/import/importOPML";
import importKityMind from "./mind/import/importKityMind";
import importXmind from "./mind/import/importXmind";
import importMarkdown from "./mind/import/importMarkdown";
import importTxt from "./mind/import/importTxt";
import i18n from "./locales/index";
import Onedrive from "./components/onedrive";
import tomato from "./components/tomato";

let Store = require("electron-store");
var store = new Store();
var profile = store.get("config");
var activeCode = store.get("activeCode");

let canvasWidth = profile.canvasWidth;
let canvasHeight = profile.canvasHeight;

function transferDataToList(data) {
  var arr = [];
  data.pid = null;
  data.isRoot = true;
  data.x = canvasWidth / 2;
  data.y = canvasHeight / 2;
  data.isExpand = true;
  data.layout = {};
  (data.layout.layoutName = "minder3"), (data.layout.direct = "");
  data.main = true;

  function list(d) {
    d.id = uuid();
    d.isExpand = true;
    if (d._images) {
      d.isImageNode = true;
      try {
        var imgInfo = JSON.parse(decodeURIComponent(d._images));
        d.image = "http://mubu.com/" + imgInfo[0].uri;
        d.imageWidth = imgInfo[0].ow;
        d.imageHeight = imgInfo[0].oh;
      } catch (e) {
        d.isImageNode = false;
      }
    }

    if (d._note) {
      d.remark = d._note;
    }
    if (d._color) {
      d.color = d._color;
    }
    arr.push(d);
    d.children &&
      d.children.forEach((ele) => {
        ele.pid = d.id;
        list(ele);
      });

    d.children = null;
    delete d.children;
  }

  list(data);
  return arr;
}

export default {
  name: "app",
  components: {
    Onedrive,
    tomato,
  },
  data() {
    return {
      showMenu: false,
      priority: {
        49: 1,
        50: 2,
        51: 3,
        52: 4,
        53: 5,
        54: 6,
        55: 7,
        56: 8,
      },
      msg: "",
      about: {
        show: false,
        version: "1.1.6",
      },
      logo: logo,
      showactive: false,
      showSave: false,
      tomato: false,
      platform:process.platform
    };
  },

  beforeCreate() {
    var theme = localStorage.getItem("theme") || profile.theme;
    document.querySelector("html").classList = [];
    document.querySelector("html").classList.add(theme);
    setLang(profile.language);
  },
  created() {
    var openFilePath = this.$store.state.MindData.openFile;
    if (openFilePath.trim()) {
      this.$router.push("/refresh");
      this.$store.dispatch("setMindData", {});
      this.openFile(openFilePath);
    }
  },
  mounted() {
    var me = this;

    this.checkVersion();

    var openFilePath = this.$store.state.MindData.openFile;
    this.$store.dispatch("vip", {
      vip: true,
    });

    ipcRenderer.on("cmd", (e, arg) => {
      this.menu(arg["type"]);
    });
    if (openFilePath) {
    } else {
      this.$router.push("/list");
    }

    document.addEventListener("paste", (e) => {
      e.preventDefault();
      var text;
      var clp = (e.originalEvent || e).clipboardData;
      if (clp === undefined || clp === null) {
        text = window.clipboardData.getData("text") || "";

        if (text !== "") {
          if (window.getSelection) {
            var newNode = document.createElement("span");
            newNode.innerHTML = text;
            window.getSelection().getRangeAt(0).insertNode(newNode);
          } else {
            document.selection.createRange().pasteHTML(text);
          }
        }
      } else {
        text = clp.getData("text/plain") || "";
        if (text !== "") {
          document.execCommand("insertText", false, text);
        }
      }
    });

    ipcRenderer.on("onedrive_success", () => {
      this.success();
      this.$store.dispatch("setShowOneDrive", false);
      this.clearTime();
    });

    ipcRenderer.on("onedrive_big", () => {
      this.msg = i18n.t("node.bigFile");
      this.$refs.msg.style.display = "block";
      this.setTime(60000);
      this.$store.dispatch("setShowOneDrive", false);
    });

    ipcRenderer.on("onedrive_error", () => {
      this.fail();
      this.clearTime();
    });

    ipcRenderer.on("saveOneDrive", (e, arg) => {
      this.save(true, arg.path, arg);
    });
  },
  methods: {
    clearTime() {
      if (this.t) clearTimeout(this.t);
    },
    setTime(time) {
      if (this.t) clearTimeout(this.t);
      this.t = setTimeout(() => {
        this.$refs.msg.style.display = "none";
      }, time);
    },
    cancelVip() {
      this.$store.dispatch("vip", {
        vip: false,
      });
      store.set("config.useMarkDown", false);
    },
    success() {
      this.msg = i18n.t("node.saveSuccess");
      this.message(this.msg);
    },
    fail() {
      this.msg = i18n.t("node.saveFail");
      this.message(this.msg);
    },

    message(msg) {
      this.msg = msg;
      this.$refs.msg.style.display = "block";
      setTimeout(() => {
        this.$refs.msg.style.display = "none";
      }, 2000);
    },
    shortCut(e) {
      var keyCode = e.keyCode || e.which || e.charCode;
      var ctrlKey = e.ctrlKey || e.metaKey;
      var shiftKey = e.shiftKey;

      if (ctrlKey && (keyCode == 80 || keyCode == 45)) {
        this.menu("New Parent Node");
      }

      if (ctrlKey && keyCode == 191) {
        this.menu("expand-or-collapse");
      }

      if (ctrlKey && keyCode >= 49 && keyCode <= 56) {
        this.menu("priority", this.priority[keyCode]);
      }

      if (ctrlKey && keyCode == 84) {
        this.tomato = !this.tomato;
      }
    },
    min() {
      ipcRenderer.send("win-min");
    },
    max() {
      ipcRenderer.send("win-max");
    },
    close() {
      ipcRenderer.send("win-close");
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
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
    checkVersion() {
      var checkTime = localStorage.getItem("checkTime");
      if (!checkTime) {
        checkTime = +new Date();
        localStorage.setItem("checkTime", checkTime);
        return;
      }

      var now = +new Date();
      if (now - checkTime > 24 * 60 * 60 * 1000) {
        $.ajax({
          url: "http://www.ckminder.cn/version",
          type: "get",
        })
          .done((res) => {
            if (res && res.success && res.data.version != this.about.version) {
              dialog
                .showMessageBox({
                  type: "info",
                  title: i18n.t("profile.tooltip"),
                  defaultId: 0,
                  message: i18n.t("profile.newVersion"),
                  buttons: i18n.t("profile.newVersionBtn"),
                })
                .then(({ response }) => {
                  if (response === 0) {
                    var url =
                      "https://github.com/MarkMindLtd/Mark-Mind/releases";
                    shell.openExternal(url);
                  }
                  localStorage.setItem("checkTime", +new Date());
                });
            }
          })
          .fail((err) => {});
      }
    },
    save(isCreate, path, arg) {
      var me = this;
      var path = path || this.$store.state.MindData.folderPath;
      if (path) {
        try {
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
          var zip = new JSZip();
          var file = "mind.json";
          var imgFolder = zip.folder("images");
          if (this.$route.name == "editor") {
            var mind = document.getElementById("mind").mind;
            if (mind.getEditNode()) {
              mind.getEditNode().cancelEdit();
            }
            var data = mind.getData(false, imgFolder);
            var p = document.getElementById("mind").parentElement;
            data.scrollLeft = p.scrollLeft;
            data.scrollTop = p.scrollTop;
          } else {
            var list = document.getElementById("list").list;
            if (list.getEditNode()) {
              var n = list.getEditNode();
              n.shoudRender = true;
              n.cancelEdit();
            }

            var data = me.listGetData(list, imgFolder);
            !data.scrollLeft && (data.scrollLeft = canvasWidth / 2);
            !data.scrollLeft && (data.scrollTop = canvasHeight / 2);
          }
          if (!data) {
            return;
          }
          zip.file(file, JSON.stringify(data));
          zip.generateAsync({ type: "nodebuffer" }).then(function (content) {
            if (me.$route.name == "editor") {
              var mind = document.getElementById("mind").mind;
              mind.save();
            } else {
              var list = document.getElementById("list").list;
              list.save();
            }

            me.$store.dispatch("setNeedSave", false);
            fs.writeFileSync(path, content);

            if (isCreate) {
              //onedrive ----> create new file
              ipcRenderer.send("saveToOneDrive", {
                pid: arg.pid,
                name: arg.name,
                route: path,
              });
              return;
            }

            if (me.$store.state.MindData.tag == "local") {
              // save to local file ----> success
              me.success();
            } else if (me.$store.state.MindData.tag == "onedrive") {
              //onedrive ----> update file
              ipcRenderer.send("saveToOneDrive", {
                id: me.$store.state.MindData.openOnedrive.id,
                name: me.$store.state.MindData.openOnedrive.name,
                route: path,
              });
            }
          });
        } catch (e) {
          me.fail();
        }
      } else {
        this.saveAs();
      }
    },
    saveAs(closed) {
      var me = this;
      var zip = new JSZip();
      var file = "mind.json";
      var imgFolder = zip.folder("images");
      if (this.$route.name == "editor") {
        var mind = document.getElementById("mind").mind;
        if (mind.getEditNode()) {
          mind.getEditNode().cancelEdit();
        }
        var data = mind.getData(false, imgFolder);
        var p = document.getElementById("mind").parentElement;
        data.scrollLeft = p.scrollLeft;
        data.scrollTop = p.scrollTop;
        var name = mind.getRoot().getTxt() || "markmind";
      } else {
        var list = document.getElementById("list").list;
        if (list.getEditNode()) {
          list.getEditNode().cancelEdit();
        }
        var data = this.listGetData(list, imgFolder);
        !data.scrollLeft && (data.scrollLeft = canvasWidth / 2);
        !data.scrollLeft && (data.scrollTop = canvasHeight / 2);
        var name = list.getRoot().getTxt() || "markmind";
      }

      if (!data) {
        return;
      }

      zip.file(file, JSON.stringify(data));
      zip.generateAsync({ type: "nodebuffer" }).then(function (content) {
        dialog
          .showSaveDialog({
            title: "save Mindmap",
            defaultPath: `${name}.mind`,
            filters: [{ name: "Mindmap", extensions: ["mind"] }],
          })
          .then(function ({ filePath }) {
            if (filePath) {
              try {
                if (me.$route.name == "editor") {
                  var mind = document.getElementById("mind").mind;
                  mind.save();
                } else {
                  var list = document.getElementById("list").list;
                  list.save();
                }

                fs.writeFileSync(filePath, content);
                me.success();
                window.baseUrl = path.dirname(filePath);
                me.$store.dispatch("setFilePath", { path: filePath });
                me.$store.dispatch("setNeedSave", false);
                if (closed) {
                  ipcRenderer.send("win-close");
                }
              } catch (e) {
                me.fail();
              }
            }
          });
      });
    },
    listGetData(list, zip, flag) {
      var data = JSON.parse(JSON.stringify(list.getData(zip, flag)));
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
      }
      return m.mindData;
    },
    openFile(path, flag) {
      // if(!path.endsWith('.mind')){
      //   console.log(111)
      //   this.$router.push('/');
      //   return;
      // }
      var me = this;
      var p = path;
      if (me.$route.name != "refresh") {
        me.$router.push("/refresh");
      }
      fs.readFile(p, function (err, data) {
        if (err) {
          me.$store.dispatch("setFilePath", "").then(() => {
            if (me.$route.name != "editor") {
              me.$router.push("/list");
            }
          });
          return;
        }

        var zip = JSZip.loadAsync(data);
        zip.then(function (e) {
          var files = e.files;
          var images = {
            name: "img",
            image: {},
          };
          var parr = [],
            types = [],
            keys = [];
          for (var k in files) {
            if (k.startsWith("images") && !files[k].dir) {
              var type = "data:image/png;base64,";
              if (k.endsWith("jpg")) {
                type = "data:image/jpeg;base64,";
              }
              if (k.endsWith("gif")) {
                type = "data:image/gif;base64,";
              }
              if (k.endsWith("svg")) {
                type = "data:image/svg+xml;base64,";
              }
              types.push(type);
              keys.push(k);
              parr.push(files[k].async("base64"));
            }
          }
          if (parr.length) {
            Promise.all(parr).then((res) => {
              res.forEach((data, i) => {
                images.image[keys[i]] = types[i] + data;
              });
              me.$store.dispatch("setImage", images).then(() => {
                for (var k in files) {
                  if (k.endsWith(".json")) {
                    files[k].async("text").then((res) => {
                      var mindData = JSON.parse(res);

                      me.$store.dispatch("setFilePath", { path: p });
                      me.$store.dispatch("setMindData", mindData).then(() => {
                        if (flag) return;
                        var p = "/";
                        setTimeout(() => {
                          me.$router.push("/list");
                        }, 0);
                      });
                    });
                  }
                }
              });
            });
          } else {
            for (var k in files) {
              if (k.endsWith(".json")) {
                files[k].async("text").then((res) => {
                  var mindData = JSON.parse(res);

                  me.$store.dispatch("setFilePath", { path: p });
                  me.$store.dispatch("setMindData", mindData).then(() => {
                    if (flag) return;
                    var p = "/";

                    setTimeout(() => {
                      me.$router.push("/list");
                    }, 0);
                  });
                });
              }
            }
          }
        });
      });
    },
    checkUpdate() {
      if (i18n.locale == "en") {
        var url = "http://www.ckminder.cn/download/en";
      } else {
        var url = "http://www.ckminder.cn/download";
      }
      shell.openExternal(url);
    },

    activeSoft() {
      var me = this;
      var code = this.$refs.activeCode.value;
      if (!code) return;

      if (!navigator.onLine) {
        this.message(i18n.t("node.offline"));
        return;
      }
    },
    getData() {
      if (this.$route.name == "editor") {
        var mind = document.getElementById("mind").mind;
        var data = mind.getData(false);
      } else {
        var list = document.getElementById("list").list;
        var data = this.listGetData(list, null, false);
      }
      var m = JSON.parse(JSON.stringify(this.$store.state.MindData));
      data.scrollTop = m.mindData.scrollTop;
      data.scrollLeft = m.mindData.scrollLeft;
      return data;
    },
    openlink(link){
      shell.openExternal(link);
    },
    menu(id, dataObj) {
      var me = this;
      this.showMenu = false;
      switch (id) {
        case "New File":
          if (this.$route.name == "editor") {
            var mind = document.getElementById("mind").mind;
            var needSave = mind.dirty();
          } else {
            var list = document.getElementById("list").list;
            var needSave = list.dirty();
          }

          if (needSave) {
            // save file before create new mind file
            this.saveAs();
            return;
          }
          me.$store.dispatch("setFilePath", { path: "" });
          me.$router.push("/refresh");
          this.$store.dispatch("setMindData", {}).then(() => {
            me.$router.push("/list");
          });

          break;
        case "Open File":
          dialog
            .showOpenDialog({
              properties: ["openFile"],
              filters: [{ name: "MindMap", extensions: ["mind"] }],
            })
            .then(({ filePaths }) => {
              if (filePaths.length) {
                window.baseUrl = path.dirname(filePaths[0]);
                this.openFile(filePaths[0]);
              }
            });
          break;
        case "Save":
          this.save();

          break;
        case "Save As":
          this.saveAs();

          break;
        case "Setting":
          if (this.$route.name == "editor") {
            var mind = document.getElementById("mind").mind;
            var needSave = mind.dirty();
          } else {
            var list = document.getElementById("list").list;
            var needSave = list.dirty();
          }

          if (needSave) {
            this.msg = i18n.t("node.beforeEnterSetup");
            this.$refs.msg.style.display = "block";
            setTimeout(() => {
              this.$refs.msg.style.display = "none";
            }, 2000);
            return;
          }
          this.$router.push("/profile");
          break;
        case "Export-FreeMind":
          var data = this.getData();
          this.$store.dispatch("setMindData", data).then(() => {
            var listData = JSON.parse(
              JSON.stringify(this.$store.getters.getData)
            );
            var d = exportFreeMind(listData);
            // this.$store.dispatch("setMindData", m.mindData);
            dialog
              .showSaveDialog({
                title: "Save FreeMind",
                defaultPath: "mind.mm",
                filters: [{ name: "MindMap", extensions: ["mm"] }],
              })
              .then(function ({ filePath }) {
                if (filePath) {
                  fs.writeFileSync(filePath, d);
                }
              });
          });
          break;
        case "Export-OPML":
          var data = this.getData();
          this.$store.dispatch("setMindData", data).then(() => {
            var listData = JSON.parse(
              JSON.stringify(this.$store.getters.getData)
            );
            var d = exportOPML(listData, listData.text || "markmind");
            // this.$store.dispatch("setMindData", m.mindData);
            dialog
              .showSaveDialog({
                title: "Save OPML",
                defaultPath: "mind.opml",
                filters: [{ name: "OPML", extensions: ["opml"] }],
              })
              .then(function ({ filePath }) {
                if (filePath) {
                  fs.writeFileSync(filePath, d);
                }
              });
          });

          break;
        case "Export-MarkDown":
          var data = this.getData();
          this.$store.dispatch("setMindData", data).then(() => {
            var listData = JSON.parse(
              JSON.stringify(this.$store.getters.getData)
            );
            var md = exportMd(listData);
            // console.log(m.marks);
            // this.$store.dispatch("setMindData", m.mindData);
            dialog
              .showSaveDialog({
                title: "Save Markdown",
                defaultPath: "mind.md",
                filters: [{ name: "Markdown", extensions: ["md"] }],
              })
              .then(function ({ canceled, filePath }) {
                if (filePath) {
                  fs.writeFileSync(filePath, md);
                }
              })
              .catch((e) => {});
          });
          break;
        case "Export-KityMind":
          var data = this.getData();
          this.$store.dispatch("setMindData", data).then(() => {
            var listData = JSON.parse(
              JSON.stringify(this.$store.getters.getData)
            );
            var d = JSON.stringify(exportKityMind(listData));
            // this.$store.dispatch("setMindData", m.mindData);
            dialog
              .showSaveDialog({
                title: "Save KityMind",
                defaultPath: "mind.km",
                filters: [{ name: "KityMind", extensions: ["km"] }],
              })
              .then(function ({ filePath }) {
                if (filePath) {
                  fs.writeFileSync(filePath, d);
                }
              });
          });
          break;
        case "Import-OPML":
          dialog
            .showOpenDialog({
              properties: ["openFile"],
              filters: [{ name: "OPML", extensions: ["opml"] }],
            })
            .then(({ filePaths }) => {
              if (filePaths.length) {
                var p = filePaths[0];
                me.$router.push("/refresh");
                fs.readFile(p, function (err, data) {
                  if (err) throw err;
                  importOPML(data)
                    .then((json) => {
                      if (json.title) {
                        json.text = json.title;
                      }

                      var list = transferDataToList(json);

                      var mindData = {
                        theme: "blue",
                        mindData: [list],
                        induceData: [],
                        wireFrameData: [],
                        relateLinkData: [],
                        calloutData: [],
                        marks: [],
                      };
                      me.$store.dispatch("setFilePath", { path: "" });
                      me.$store.dispatch("setMindData", mindData).then(() => {
                        setTimeout(() => {
                          me.$router.push("/list");
                        }, 0);
                      });
                    })
                    .catch((e) => {});
                });
              }
            });
          break;

        case "Import-KityMind":
          dialog
            .showOpenDialog({
              properties: ["openFile"],
              filters: [{ name: "KityMind", extensions: ["km"] }],
            })
            .then(({ filePaths }) => {
              if (filePaths.length) {
                var p = filePaths[0];
                me.$router.push("/refresh");
                fs.readFile(p, function (err, data) {
                  if (err) throw err;
                  var mdata = importKityMind(JSON.parse(data.toString()));

                  var mindData = {
                    theme: "blue",
                    mindData: JSON.parse(JSON.stringify(mdata.data)),
                    induceData: [],
                    wireFrameData: [],
                    relateLinkData: [],
                    calloutData: [],
                    scrollLeft: 3800,
                    scrollTop: 3800,
                    marks: mdata.marks,
                  };
                  me.$store.dispatch("setMindData", mindData).then(() => {
                    me.$router.push("/list");
                  });
                });
              }
            });

          break;
        case "Import-Xmind Zen":
          dialog
            .showOpenDialog({
              properties: ["openFile"],
              filters: [{ name: "xmind zen", extensions: ["xmind"] }],
            })
            .then(({ filePaths }) => {
              if (filePaths.length) {
                var p = filePaths[0];
                me.$router.push("/refresh");
                fs.readFile(p, function (err, data) {
                  if (err) throw err;
                  var zip = JSZip.loadAsync(data);
                  zip.then(function (e) {
                    var files = e.files;
                    var images = {
                      name: "img",
                      image: {},
                    };
                    var parr = [],
                      types = [],
                      keys = [];
                    for (var k in files) {
                      if (k.startsWith("resources") && !files[k].dir) {
                        var type = "data:image/png;base64,";
                        if (k.endsWith("jpg")) {
                          type = "data:image/jpeg;base64,";
                        }
                        if (k.endsWith("gif")) {
                          type = "data:image/gif;base64,";
                        }
                        if (k.endsWith("svg")) {
                          type = "data:image/svg+xml;base64,";
                        }

                        types.push(type);
                        keys.push(k);
                        parr.push(files[k].async("base64"));
                      }
                    }
                    if (parr.length) {
                      Promise.all(parr).then((res) => {
                        res.forEach((data, i) => {
                          images.image[keys[i]] = types[i] + data;
                        });
                        me.$store.dispatch("setImage", images).then(() => {
                          for (var k in files) {
                            if (k == "content.json") {
                              files[k].async("text").then((res) => {
                                var mindData = JSON.parse(res);
                                me.$store.dispatch("setFilePath", { path: "" });
                                me.$store
                                  .dispatch(
                                    "setMindData",
                                    importXmind(mindData[0])
                                  )
                                  .then(() => {
                                    var p = "/";
                                    me.$router.push("/list");
                                  });
                              });
                            }
                          }
                        });
                      });
                    } else {
                      for (var k in files) {
                        if (k == "content.json") {
                          files[k].async("text").then((res) => {
                            var mindData = JSON.parse(res);
                            me.$store.dispatch("setFilePath", { path: "" });
                            me.$store
                              .dispatch("setMindData", importXmind(mindData[0]))
                              .then(() => {
                                me.$router.push("/list");
                              });
                          });
                        }
                      }
                    }
                  });
                });
              }
            });
          break;

        case "Import-MarkDown":
          dialog
            .showOpenDialog({
              properties: ["openFile"],
              filters: [{ name: "markdown", extensions: ["md"] }],
            })
            .then(({ filePaths }) => {
              if (filePaths.length) {
                var p = filePaths[0];
                me.$router.push("/refresh");
                fs.readFile(p, function (err, data) {
                  if (err) throw err;
                  var data = importMarkdown(data.toString("utf-8"));
                  me.$store.dispatch("setFilePath", { path: "" });
                  me.$store.dispatch("setMindData", data).then(() => {
                    me.$router.push("/list");
                  });
                });
              }
            });
          break;

        case "Import-txt":
          dialog
            .showOpenDialog({
              properties: ["openFile"],
              filters: [{ name: "Pre Txt", extensions: ["txt"] }],
            })
            .then(({ filePaths }) => {
              if (filePaths.length) {
                var p = filePaths[0];
                me.$router.push("/refresh");
                fs.readFile(p, function (err, data) {
                  if (err) throw err;
                  var data = importTxt(data.toString("utf-8"));
                  me.$store.dispatch("setFilePath", { path: "" });
                  me.$store.dispatch("setMindData", data).then(() => {
                    me.$router.push("/list");
                  });
                });
              }
            });
          break;
        case "Exit":
          ipcRenderer.send("win-close");
          break;
        case "Expand-1":
        case "Expand-2":
        case "Expand-3":
        case "Expand-4":
        case "Expand-5":
        case "Expand-10000":
          var level = id.split("-")[1];
          if (this.$route.name == "editor") {
            var mind = document.getElementById("mind").mind;
            mind.expandLevel(level);
            mind.refresh();
          } else {
            var list = document.getElementById("list").list;
            list.expandLevel(level);
          }

          break;
        case "New Parent Node":
          if (this.$route.name == "editor") {
            var mind = document.getElementById("mind").mind;
            mind.execute("addParentNode");
          }
          break;
        case "expand-or-collapse":
          if (this.$route.name == "editor") {
            var mind = document.getElementById("mind").mind;
            var node = mind.getSelectNode();
            if (node && !node.isLeaf()) {
              if (node.isExpand()) {
                mind.execute("collapseNode", { node });
              } else {
                mind.execute("expandNode", { node });
              }
            }
          } else {
            var list = document.getElementById("list").list;
            var node = list.getSelectNode();
            if (node && !node.isLeaf()) {
              if (node.isExpand) {
                list.execute("collapseNode", { node });
              } else {
                list.execute("expandNode", { node });
              }
            }
          }
          break;
        case "priority":
          if (this.$route.name == "editor") {
            var mind = document.getElementById("mind").mind;
            mind.execute("changeNode", { data: { priority: dataObj } });
          } else {
            var list = document.getElementById("list").list;
            list.execute("changeNode", { data: { priority: dataObj } });
          }
          break;

        case "percent":
          if (this.$route.name == "editor") {
            var mind = document.getElementById("mind").mind;
            mind.execute("changeNode", { data: { percent: dataObj } });
          } else {
            var list = document.getElementById("list").list;
            list.execute("changeNode", { data: { percent: dataObj } });
          }
          break;
        case "About":
          this.about.show = true;
          break;
        case "Activate":
          this.showactive = true;
          break;
        case "Save To Onedrive":
          ipcRenderer.send("refreshToken");
          this.$store.dispatch("setShowOneDrive", true);
          this.showSave = true;
          break;
        case "Open From Onedrive":
          ipcRenderer.send("refreshToken");
          this.$store.dispatch("setShowOneDrive", true);
          this.showSave = false;
          break;
      }
    },
  },
};
</script>

<style>
@font-face {
  font-family: "bdfont";
  src: url("./assets/logo/bdfont.eot"); /* IE9*/
  src: url("./assets/logo/bdfont.eot?#iefix") format("embedded-opentype"),
    /* IE6-IE8 */ url("./assets/logo/bdfont.woff") format("woff"),
    /* chrome、firefox */ url("./assets/logo/bdfont.ttf") format("truetype"),
    /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/
      url("./assets/logo/bdfont.svg#uxbdfont") format("svg"); /* iOS 4.1- */
}

.bdfont {
  font-family: "bdfont" !important;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-logo:after {
  content: "\e001";
}

.clearfix:after {
  content: "";
  display: block;
  visibility: hidden;
  height: 0;
  clear: both;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #fff;
}

h1,
h2,
h3,
h4,
h5,
h6,
p {
  margin: 0;
  padding: 0;
}

svg {
  user-select: none;
}

.ql-tooltip {
  min-width: 320px;
  z-index: 2000;
}

/* emoji */
.ap,
.ql-emojiblot {
  vertical-align: middle;
}

.markdown-body {
  font-family: "Helvetica Neue", Helvetica, Arial, "PingFang SC",
    "Microsoft YaHei", sans-serif !important;
}

/* list print pdf */
html.print {
  width: 100%;
  height: auto;
  overflow: auto;
}
.print body {
  width: 100%;
  height: auto;
  overflow: auto;
}
.print .top-bar {
  display: none;
}
.print .cicada-list {
  position: inherit;
}
.print #app {
  width: 100%;
  height: auto;
}
.print .cicada-list .route {
  display: none;
}

.print .enterMind {
  display: none;
}

.print #list {
  margin-top: 10px;
}
.print .cicada-list ul {
  border: 0;
}
.print .node-open {
  display: none !important;
}

/* app css */
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  font-size: 16px;
  outline: none;
}

.top-bar {
  user-select: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 24px;
  line-height: 24px;
  background: #f6f6f6;
  color: #333;
  z-index: 6000;
  -webkit-app-region: drag;
}

.theme-dark .top-bar {
  background: #424242;
  color: rgba(255, 255, 255, 0.01);
  /* border-bottom: 1px solid #000; */
}

.top-bar .close:hover {
  background: red;
}

.btn-group {
  position: fixed;
  right: 0;
  top: 0;
  z-index: 5000;
  color: #333;
  width: 120px;
  overflow: hidden;
  -webkit-app-region: no-drag;
  -webkit-user-select: none;
  height: 24px;
}
.btn-group div {
  font-size: 12px;
  width: 40px;
  text-align: center;
  cursor: pointer;
  float: left;
}

.btn-group div:hover {
  background: #ccc;
}

.theme-dark .btn-group div:hover {
  background: #666;
}
.theme-dark .btn-group {
  color: #fff;
}
.btn-group.drawin{
  display: none;
}

.logo {
  float: left;
  margin-left: 6px;
  /* color: #69ccb5; */
  color: #333;
  font-size: 12px;
  -webkit-app-region: no-drag;
  -webkit-user-select: none;
}
.logo .iconfont {
  font-size: 12px;
  cursor: pointer;
}
.logo.drawin{
  margin-left:70px;
}

.theme-dark .logo {
  color: #fff;
}

/* node css */
.node {
  position: absolute;
  left: 0;
  top: 0;
  cursor: pointer;
  text-align: left;
  user-select: none;
  background-color: transparent;
}
.node .node-text {
  max-width: 800px;
  word-break: break-all;
}
.li-node .text {
  word-break: break-all;
}
.node-text table,
.node-text p,
.node-text img {
  margin: 4px 0;
}
.node-text img,
.li-node .text img {
  vertical-align: top;
}
.node-text img.emoji {
  margin: 0 0;
}

.node-priority {
  display: inline-block;
  width: 18px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  font-size: 12px;
  border-radius: 3px;
  background: #ccc;
  color: #fff;
  margin-right: 4px;
  vertical-align: middle;
  box-sizing: border-box;
}

[data-priority="1"] {
  background: rgb(231, 70, 67);
}
[data-priority="2"] {
  background: rgb(255, 180, 8);
}
[data-priority="3"] {
  background: rgb(88, 106, 255);
}
[data-priority="4"] {
  background: rgb(141, 49, 241);
}
/* [data-priority="5"]{
   background: rgb(231, 70, 67);
}
[data-priority="6"]{
   background: rgb(231, 70, 67);
} 
[data-priority="7"]{
   background: rgb(231, 70, 67);
} 
[data-priority="8"]{
   background: rgb(231, 70, 67);
}  */

.node-group {
  display: flex;
  vertical-align: middle;
}

.node-percent {
  display: inline-block;
  width: 18px;
  height: 18px;
  text-align: center;
  margin-right: 4px;
  vertical-align: middle;
}

.pie {
  width: 18px;
  height: 18px;
  border-radius: 50% !important;
  background: #fff;
  border: 1px solid rgb(40, 204, 93);
  background-image: linear-gradient(
    to right,
    transparent 50%,
    rgb(40, 204, 93) 0
  );
  box-sizing: border-box;
}

.pie::before {
  content: "";
  display: block;
  margin-left: 50%;
  height: 100%;
  border-radius: 0 100% 100% 0/50%;
  background-color: inherit;
  transform-origin: left;
}

.pie[data-percent="10"]::before {
  transform: rotate(0.1turn);
}

.pie[data-percent="30"]::before {
  transform: rotate(0.3turn);
}

.pie[data-percent="50"]::before {
  transform: rotate(0.5turn);
}

.pie[data-percent="70"] {
  background: rgb(40, 204, 93);
  background-image: linear-gradient(to left, transparent 50%, #fff 0);
}

.pie[data-percent="70"]::before {
  transform: rotate(0.2turn);
}

.pie[data-percent="90"] {
  background: rgb(40, 204, 93);
  background-image: linear-gradient(to left, transparent 50%, #fff 0);
}

.pie[data-percent="90"]::before {
  transform: rotate(0.4turn);
}

.node-text {
  display: inline-block;
  vertical-align: middle;
  border: 0;
  outline: transparent;
  overflow: visible !important;
  cursor: pointer;
}
.node-text * {
  cursor: pointer;
}

.relate-ctrl {
  user-select: none;
}

.node-remark {
  vertical-align: middle;
  margin-left: 2px;
}

.todo-container {
  display: inline-block;
  vertical-align: middle;
  box-sizing: border-box;
  outline: none;
  width: 20px;
  height: 20px;
  padding-left: 2px;
  padding-top: 2px;
  margin-right: 4px;
}

.node-assist {
  height: 18px;
  display: inline-block;
  vertical-align: middle;
  box-sizing: border-box;
  width: auto;
}
.node-assist > * {
  float: left;
}

.node-shape {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  /* background-color:lightskyblue!important;
  border-color:cornflowerblue !important; */
  /* box-shadow: 2px 2px 6px #666; */
  z-index: -6;
  box-sizing: border-box;
  border-radius: 8px;
  /* transform: skew(-15deg); */
}

.node-shape.node-parallelogram {
  transform: skew(-10deg);
}

.node-shape.node-ellipse {
  border-radius: 50%;
}

.node-shape.node-roundRect {
  border-top-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.node-callout .node-shape {
  background: #f06;
  border-radius: 6px;
}

.mind-editor .node-todo-done {
  text-decoration: line-through;
}

.cicada-list .node-todo-done {
  color: #a2a2a2;
}
.cicada-list .node-todo-done > .node-control > div > .text {
  text-decoration: line-through;
}

.cicada-list .li-node .node-assist {
  cursor: pointer;
}

.mind-editor .node-remark,
.mind-editor .node-link {
  width: 20px;
  height: 24px;
  vertical-align: middle;
}
.mind-editor .node-link::before {
  display: block;
  margin-top: -2px;
}

/* node bar */
.node .node-bar {
  display: none;
  background: transparent;
}
.node-bar:hover {
  background: #ccc;
}

.node.node-right .node-bar {
  right: -14px;
  top: calc(50% - 7px);
}

.node.node-left .node-bar {
  left: -14px;
  top: calc(50% - 7px);
}

.node .icon-jiahao {
  display: block !important;
}
.node.node-down .node-bar {
  left: calc(50% - 7px);
  top: 100%;
}

.node.node-up .node-bar {
  left: calc(50% - 7px);
  top: -14px;
}
.node.node-top .node-bar {
  left: calc(50% - 7px);
  top: -14px;
}
.node:hover .node-bar {
  display: block;
  background: #ccc;
}
.node-root:hover .node-bar {
  display: none;
}

.node-leaf:hover .node-bar {
  display: none !important;
}

.node-callout .node-bar,
.node-wireFrame .node-bar,
.node-relate .node-bar {
  display: none !important;
}

.node-mark-item {
  display: inline-block;
  padding: 0 2px;
  height: 18px;
  border-radius: 3px;
  line-height: 18px;
  padding: 0 4px;
  font-size: 12px;
  color: #333;
  margin-right: 2px;
}
.node-markList {
  line-height: 22px;
}

.theme-white .node-bar {
  color: #333 !important;
}

.theme-blue4 .node-bar {
  color: rgb(48, 61, 77) !important;
}

.theme-black .node-bar {
  color: rgb(115, 154, 163) !important;
}
.theme-black2 .node-bar {
  color: rgb(56, 56, 51) !important;
}

.theme-blue .node-bar,
.theme-blue2 .node-bar {
  background: #fff !important;
}

.theme-normal .node-bar {
  color: #fff !important;
}
.theme-blue3 .node-bar {
  color: #fff !important;
}

.theme-blue3 .node-bar {
  color: #fff !important;
}
.theme-white1 .node-bar {
  color: rgb(40, 53, 147) !important;
}

/* radio checkbox css */
@keyframes hover-color {
  from {
    border-color: #c0c0c0;
  }
  to {
    border-color: #3e97eb;
  }
}

.magic-radio,
.magic-checkbox {
  position: absolute;
  display: none;
}

.magic-radio[disabled],
.magic-checkbox[disabled] {
  cursor: not-allowed;
}

.magic-radio + label,
.magic-checkbox + label {
  position: relative;
  display: block;
  padding-left: 30px;
  cursor: pointer;
}
.magic-radio + label:hover:before,
.magic-checkbox + label:hover:before {
  animation-duration: 0.4s;
  animation-fill-mode: both;
  animation-name: hover-color;
}
.magic-radio + label:before,
.magic-checkbox + label:before {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  width: 16px;
  height: 16px;
  content: "";
  border: 1px solid #c0c0c0;
  box-sizing: border-box;
}
.magic-radio + label:after,
.magic-checkbox + label:after {
  position: absolute;
  display: none;
  content: "";
}

.magic-radio[disabled] + label,
.magic-checkbox[disabled] + label {
  cursor: not-allowed;
  color: #e4e4e4;
}
.magic-radio[disabled] + label:hover,
.magic-radio[disabled] + label:before,
.magic-radio[disabled] + label:after,
.magic-checkbox[disabled] + label:hover,
.magic-checkbox[disabled] + label:before,
.magic-checkbox[disabled] + label:after {
  cursor: not-allowed;
}
.magic-radio[disabled] + label:hover:before,
.magic-checkbox[disabled] + label:hover:before {
  border: 1px solid #e4e4e4;
  animation-name: none;
}
.magic-radio[disabled] + label:before,
.magic-checkbox[disabled] + label:before {
  border-color: #e4e4e4;
}

.magic-radio:checked + label:before,
.magic-checkbox:checked + label:before {
  animation-name: none;
}

.magic-radio:checked + label:after,
.magic-checkbox:checked + label:after {
  display: block;
}

.magic-radio + label:before {
  border-radius: 50%;
}

.magic-radio + label:after {
  top: 6px;
  left: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3e97eb;
}

.magic-radio:checked + label:before {
  border: 1px solid #3e97eb;
}

.magic-radio:checked[disabled] + label:before {
  border: 1px solid #c9e2f9;
}

.magic-radio:checked[disabled] + label:after {
  background: #c9e2f9;
}

.magic-checkbox + label:before {
  border-radius: 3px;
}

.magic-checkbox + label:after {
  top: 3px;
  left: 6px;
  box-sizing: border-box;
  width: 4px;
  height: 10px;
  transform: rotate(45deg);
  border-width: 2px;
  border-style: solid;
  border-color: #fff;
  border-top: 0;
  border-left: 0;
}

.magic-checkbox:checked + label:before {
  border: #3e97eb;
  background: #3e97eb;
}

.magic-checkbox:checked[disabled] + label:before {
  border: #c9e2f9;
  background: #c9e2f9;
}

.theme-dark .magic-radio + label:before,
.magic-checkbox + label:before {
  border: 1px solid #6d6d6d;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.red {
  color: red;
}
.orange {
  color: orange;
}
.green {
  color: green;
}
.yellow {
  color: yellow;
}
.blue {
  color: blue;
}
.gray {
  color: gray;
}
.white {
  color: white;
}
.black {
  color: #333;
}

.lightgreen {
  color: lightgreen;
}
.lightpink {
  color: lightpink;
}
.lightgray {
  color: lightgray;
}
.lightyellow {
  color: lightyellow;
}

.darkred {
  color: darkred;
}
.darkcyan {
  color: darkcyan;
}
.darkorange {
  color: darkorange;
}
.darksalmon {
  color: darksalmon;
}

.bg-red {
  background-color: red;
}
.bg-orange {
  background-color: orange;
}
.bg-green {
  background-color: green;
}
.bg-yellow {
  background-color: yellow;
}
.bg-blue {
  background-color: blue;
}
.bg-gray {
  background-color: gray;
}
.bg-greenyellow {
  background-color: greenyellow;
}
.bg-white {
  background-color: white;
}
.bg-black {
  background-color: #333;
}

.mind-editor .markdown-body blockquote,
.mind-editor .markdown-body details,
.mind-editor .markdown-body dl,
.markdown-body ol,
.mind-editor .markdown-body p,
.markdown-body pre,
.mind-editor .markdown-body table,
.mind-editor .markdown-body ul {
  margin-bottom: 0 !important;
}

/* .mind-editor .markdown-body{
 font-family: "Helvetica Neue", Helvetica, Arial, "PingFang SC", "Hiragino Sans GB", "Heiti SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
} */

.markdown-body .highlight pre,
.markdown-body pre {
  padding: 8px;
}

.markdown-body table tr td,
.markdown-body table tr th {
  background-color: #fff;
}

.markdown-body table tr:nth-child(2n) td {
  background-color: #f6f8fa;
}

/* .node-root .node-shape{
  box-shadow: 0px 0px 6px #f5f5f5;
} */

/* theme-blue */
.theme-blue {
  background-color: rgb(35, 39, 62);
}

/* .theme-blue .node-text{
  color:#f5f5f5;
} */

.theme-blue .node .node-shape {
  background-color: "transparent";
  border-color: rgb(5, 196, 235);
}

.theme-blue .node.root .node-shape {
  background-color: rgb(5, 196, 235);
  border-width: 1px;
  border-style: solid;
  border-color: rgb(115, 154, 163);
}

.theme-blue .node.second-level .node-shape {
  border-color: rgb(115, 154, 163);
  background-color: rgb(66, 78, 96);
}

/* skin */
.cadmium-light {
  background-color: #fff;
  color: rgba(0, 0, 0, 0.8) !important;
}

.cadmium-light a {
  color: rgba(33, 181, 111, 1) !important;
}

.cadmium-light table thead tr th,
.cadmium-light table tr:nth-child(2n) td {
  background-color: rgba(0, 0, 0, 0.03) !important;
}

.cadmium-light .magic-checkbox:checked + label:before {
  border: rgba(33, 181, 111, 1);
  background: rgba(33, 181, 111, 1);
}

.cadmium-light .highlight pre,
.cadmium-light pre {
  background-color: rgba(33, 181, 111, 0.08) !important;
}

.theme-cadmium-light {
  background-color: #fff;
  color: rgba(0, 0, 0, 0.8) !important;
}

.theme-cadmium-light a {
  color: rgba(33, 181, 111, 1) !important;
}

.theme-cadmium-light table thead tr th,
.theme-cadmium-light table tr:nth-child(2n) td {
  background-color: rgba(0, 0, 0, 0.03) !important;
}

.theme-cadmium-light .magic-checkbox:checked + label:before {
  border: rgba(33, 181, 111, 1);
  background: rgba(33, 181, 111, 1);
}

.theme-cadmium-light .highlight pre,
.theme-cadmium-light pre {
  background-color: rgba(33, 181, 111, 0.08) !important;
}

/* .theme-dark{
     background-color:#282828;;
     color:rgba(255, 255, 255, .8)!important;
} */

/* .theme-dark table{
  background:#282c34 ;
} */
.theme-dark table tr {
  background-color: transparent !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}
.theme-dark table thead tr th,
.theme-dark table tr:nth-child(2n) td {
  background: rgba(255, 255, 255, 0.04) !important;
}

.theme-dark table tr td,
.theme-dark table tr th {
  background: transparent !important;
  border-color: #7b7b7b !important;
}

.theme-dark .cicada-list {
  background-color: #545454;
}
.theme-dark .cicada-list .li-node .icon-dott {
  background: #282828;
}

.theme-dark .cicada-list .markdown-body {
  color: rgba(255, 255, 255, 0.6);
}

.theme-dark .cicada-list .li-node .icon-dott span {
  background: rgba(255, 255, 255, 0.3);
}

.theme-dark .cicada-list .li-node > .node-control > .icon-dott span:before {
  border-color: rgba(255, 255, 255, 0.3);
}
.theme-dark .cicada-list ul {
  border-color: rgba(255, 255, 255, 0.3);
}
.theme-dark .cicada-list .li-node .node-open {
  color: rgba(255, 255, 255, 0.6);
}

.theme-dark .cicada-list .node-todo-done {
  color: #5f5f5f;
}

.theme-dark .markdown-body .highlight pre.hljs,
.theme-dark .markdown-body pre.hljs {
  background: #404040;
}

.theme-dark .cicada-list li.node-showNode > .node-control .text {
  border-color: rgba(255, 255, 255, 0.6);
}
.theme-dark .route {
  border-color: rgba(255, 255, 255, 0.6);
}

.theme-dark .layout-now {
  background: #545454 !important;
  border: 1px solid #333 !important;
}
.theme-dark .now-layout {
  border: 1px solid #333 !important;
}
.theme-dark .layout-list {
  background: #545454 !important;
  border: 1px solid #333 !important;
}
.theme-dark .layout-container ul li {
  border: 1px solid #333 !important;
  margin-bottom: 2px;
}

::-webkit-scrollbar-track-piece {
  width: 14px;
  background-color: #e0e0e0;
}

::-webkit-scrollbar {
  width: 10px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  height: 50px;
  background: #b1b1b1;
  cursor: pointer;
}

::-webkit-scrollbar-corner {
  background-color: #b1b1b1;
}

.theme-dark ::-webkit-scrollbar-track-piece {
  width: 14px;
  background-color: #333;
}

.theme-dark ::-webkit-scrollbar {
  width: 10px;
  height: 8px;
  background: transparent;
}

.theme-dark ::-webkit-scrollbar-thumb {
  height: 50px;
  background: #666;
  cursor: pointer;
}

.theme-dark ::-webkit-scrollbar-thumb:hover {
  background: #aaa;
  cursor: pointer;
}

.theme-dark ::-webkit-scrollbar-corner {
  background-color: #333;
}

.theme-dark .win-reduce {
  background: #545454 !important;
  border: 1px solid #333 !important;
  color: #929292 !important;
}

/* menu */
.mark-list .top-bar .menu {
  top: 24px;
}

.mark-mind .top-bar .menu {
  top: 60px;
}

.top-bar .menu {
  position: fixed;
  width: 200px;
  border: 1px solid #f5f5f5;
  left: 0px;
  top: 24px;
  bottom: 0;
  z-index: 6000;
  color: #666;
  background: #f5f5f5;
  text-align: left;
  font-size: 12px;
  -webkit-app-region: no-drag;
  -webkit-user-select: none;
}

.top-bar .menu .node-shortcut {
  float: right;
  margin-right: 20px;
  font-size: 12px;
}
.menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
  line-height: 30px;
  text-indent: 20px;
}

.menu ul li {
  -webkit-app-region: no-drag;
  -webkit-user-select: none;
  position: relative;
  cursor: pointer;
}
.menu ul li:hover {
  background: #ccc;
}
.theme-dark .menu {
  border: 1px solid #222;
  background: #333 !important;
  color: #cccccc;
}
.theme-dark .menu ul li:hover {
  background: #222;
}
.theme-dark .menu .submenu {
  background: #333;
  border: 1px solid #000;
}
.theme-dark .top-bar .menu {
  border-top: 0;
}

.submenu {
  position: absolute;
  left: 198px;
  top: 0;
  display: none;
  width: 200px;
  border: 1px solid #ccc;
  background: #f5f5f5;
}

.menu ul li:hover > .submenu {
  display: block;
}

.emoji {
  height: 1.2em;
  vertical-align: middle !important;
  background: transparent !important;
}

.emoji img {
  background-color: transparent;
}

.markdown-body img {
  background: none !important;
}

.win-content {
  background: #fff;
  padding: 6px;
}
.win input,
.win-tooltip input {
  width: 300px;
  border: 1px solid #ccc;
  border-radius: 3px;
  line-height: 28px;
  outline: none;
  text-indent: 6px;
}

.mark-item {
  display: inline-block;
  padding: 2px 0 2px 2px;
  margin-right: 2px;
  font-size: 14px;
  vertical-align: bottom;
  cursor: pointer;
  border-radius: 3px;
}
.mark-item.active {
  border: 1px solid #333;
}
.mark-item input {
  width: auto;
  vertical-align: middle;
}
.mark-item i {
  display: inline-block;
  width: 20px;
  font-size: 14px;
  border-left: 1px solid #ccc;
  cursor: pointer;
  padding: 2px;
  text-align: center;
  margin: 0;
  margin-left: 4px;
  color: #eee;
}

.profile {
  text-align: left;
  font-size: 14px;
  padding: 20px;
  margin-top: 24px;
  user-select: none;
  height: 100%;
}

.theme-dark .profile {
  background: #282828;
  color: rgba(255, 255, 255, 0.6);
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  padding-bottom: 0 !important;
}

.markdown-body h1 {
  font-size: 1.3em !important;
}

.markdown-body h2 {
  font-size: 1.2em !important;
}

.markdown-body h3 {
  font-size: 1.1em !important;
}

.markdown-body li > p {
  margin-top: 0 !important;
}

.markdown-body blockquote,
.markdown-body details,
.markdown-body dl,
.markdown-body ol,
.markdown-body p,
.markdown-body pre,
.markdown-body table,
.markdown-body ul {
  margin-bottom: 0 !important;
}

.cicada-list .markdown-body .highlight pre,
.cicada-list .markdown-body pre {
  margin: 2px 0 !important;
  padding: 10px;
}
.text ol {
  margin-left: 18px;
}

.text ol > li {
  list-style-type: decimal !important;
  padding-left: 4px !important;
}

.text ul > li {
  margin-left: 18px !important;
  list-style-type: disc !important;
}

.theme-blue table tr td,
.theme-blue table tr th {
  border: 1px solid #c1c3c5 !important;
}
.theme-blue2 table tr td,
.theme-blue2 table tr th {
  border: 1px solid #c1c3c5 !important;
}

.theme-blue3 table tr td,
.theme-blue3 table tr th {
  border: 1px solid rgba(255, 255, 255, 0.6) !important;
  background: transparent !important;
}

.theme-blue3 table tr,
.theme-normal table tr {
  background: transparent !important;
}
.theme-blue3 table tr:nth-child(2n),
.theme-normal table tr:nth-child(2n) {
  background: rgba(255, 255, 255, 0.1) !important;
}
.theme-dark .theme-blue3.markdown-body pre.hljs {
  background: #378794 !important;
}

.theme-normal table tr td,
.theme-normal table tr th {
  background-color: transparent !important;
}

.theme-white1.markdown-body table td,
.theme-white1.markdown-body table th {
  border: 1px solid #6389b1 !important;
}

.theme-white1.markdown-body blockquote {
  color: #6d63a0 !important;
  border-left: 0.25em solid #6858a7 !important;
}

.theme-black.markdown-body blockquote {
  color: #255069 !important;
  border-left: 0.25em solid #43657d !important;
}

.theme-blue3.markdown-body blockquote {
  color: #d6d6d6 !important;
  border-left: 0.25em solid #d0d0d0 !important;
}

.theme-normal.markdown-body blockquote {
  color: #848586 !important;
  border-left: 0.25em solid #dfe2e5 !important;
}

.markdown-body ol {
  list-style-type: decimal !important;
}

.node-text > ul,
.node-text > ol {
  margin-left: 0;
}

.node-text ul,
.node-text ol {
  margin-left: 18px !important;
}

.theme-dark .cicada-list .markdown-body blockquote {
  border-left: 0.25em solid #848484 !important;
}

.markdown-body blockquote {
  font-size: 0.9em;
}

.win .icon-weikaishi:before {
  margin-left: -1px;
  margin-top: -1px;
  color: rgb(40, 204, 93);
  font-size: 24px;
  border-radius: 50%;
}

.node .icon-weikaishi {
  margin-top: -4px;
}

.node .icon-weikaishi:before {
  margin-left: -2px;
  margin-top: -2px;
  color: rgb(40, 204, 93);
  font-size: 18px;
  border-radius: 50%;
  background: #fff;
}
.win .icon-wancheng:before {
  margin-left: -1px;
  margin-top: -1px;
  color: rgb(40, 204, 93);
  font-size: 24px;
  border-radius: 50%;
  background: #fff;
}

.node .icon-wancheng {
  margin-top: -4px;
}

.node .icon-wancheng:before {
  margin-left: -2px;
  margin-top: -2px;
  color: rgb(40, 204, 93);
  font-size: 18px;
  border-radius: 50%;
  background: #fff;
}

button {
  width: 100%;
  height: 24px;
  border: 1px solid #d6d6d6;
  background: #fff;
  margin: 2px 0;
}

.cicada-list .markdown-body blockquote {
  line-height: 24px;
  border-left: 0.2em solid #dfe2e5;
}
.cicada-list .node-remark {
  margin-left: 0;
}
.fa {
  width: 16px;
  text-align: center;
}

.theme-blue4.markdown-body blockquote {
  padding: 0 1em;
  color: #8a929a;
  border-left: 0.25em solid #929eab;
}

.tooltip-msg {
  position: fixed;
  padding: 10px;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.6);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: none;
  color: #f5f5f5;
  font-size: 16px;
  z-index: 6000;
}

.about {
  width: 400px;
  height: 300px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #f5f5f5;
  background: #fff;
  color: #333;
}

.about img {
  width: 100px;
  height: 100px;
  margin-top: 30px;
}
.about h1 {
  font-size: 20px;
}
.about .close {
  position: absolute;
  top: 0px;
  right: 0px;
  color: red;
  width: 30px;
}
.about p {
  line-height: 24px;
  margin-top: 10px;
  font-size: 14px;
}
.about button {
  height: 30px;
  width: 200px;
  cursor: pointer;
  margin-top: 6px;
}
.about .close:hover {
  background: #fff;
}
.about a{
  color: #1890ff;
  cursor: pointer;
}

.activeCode {
  position: fixed;
  width: 600px;
  height: 320px;
  z-index: 6000;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid #f5f5f5;
  background: #fff;
  color: #333;
  text-align: left;
  padding: 10px;
}
.activeCode h1 {
  font-size: 14px;
  line-height: 40px;
  font-weight: normal;
}
.activeCode textarea {
  width: 98%;
  height: 200px;
  display: block;
  border: 1px solid #c7c7c7;
  resize: none;
  border-radius: 3px;
}
.activeCode button {
  margin-top: 20px;
  cursor: pointer;
}
.activeCode .close {
  position: absolute;
  top: 10px;
  right: 0px;
  color: red;
  width: 30px;
  cursor: pointer;
}

.activeCode button {
  height: 32px;
  border-radius: 3px;
}

.markdown-it-vue-alter-info {
  border: 1px solid #91d5ff;
  background-color: #e6f7ff;
}
.markdown-it-vue-alert-icon-info {
  color: #1890ff;
}
.markdown-it-vue-alter-success {
  border: 1px solid #b7eb8f;
  background-color: #f6ffed;
}
.markdown-it-vue-alert-icon-success {
  color: #52c41a;
}
.markdown-it-vue-alter-error {
  border: 1px solid #f5222d;
  background-color: #fff1f0;
}
.markdown-it-vue-alert-icon-error {
  color: #f5222d;
}
.markdown-it-vue-alter-warning {
  border: 1px solid #ffe58f;
  background-color: #fffbe6;
}
.markdown-it-vue-alert-icon-warning {
  color: #faad14;
}
.markdown-it-vue-alter {
  border-radius: 0;
  border: 0;
  margin-bottom: 0;
  display: inline-flex;
  font-family: "Chinese Quote", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue",
    Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol";
  font-size: 14px;
  font-variant: tabular-nums;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.65);
  box-sizing: border-box;
  padding: 0;
  list-style: none;
  position: relative;
  padding: 8px 15px 8px 37px;
  border-radius: 4px;
  width: 100%;
  min-height: 38px;
}
.markdown-it-vue-alter p {
  margin-bottom: 2px;
}
.markdown-it-vue-alert-icon {
  top: 10px;
  left: 16px;
  position: absolute;
}

.emptytext {
  color: rgba(0, 0, 0, 0);
  background: #f3f3f3;
}

.emptytext:hover {
  color: inherit;
  background: transparent;
}
</style>
