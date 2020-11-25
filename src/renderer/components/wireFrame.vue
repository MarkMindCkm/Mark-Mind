<template>
  <div
    nochilddrag
    class="wireFrame win"
    @click.stop=""
    :style="'left:' + left + 'px;top:' + top + 'px'"
  >
    <div class="wireFrame-setup win-content">
      <span class="head">{{ $t("node.strokeColor") }}</span>
      <ul class="stroke-color">
        <li
          v-for="(item, i) in colors"
          v-bind:key="i"
          :class="item == 'transparent' ? 'transparent' : ''"
          :style="'background:' + item"
          @click="change('stroke', { stroke: item })"
        ></li>
      </ul>
      <span class="head">{{ $t("node.wireFrameFill") }}</span>
      <ul class="fill-color">
        <li
          v-for="(item, i) in colors"
          v-bind:key="i"
          :class="item == 'transparent' ? 'transparent' : ''"
          :style="'background:' + item"
          @click="change('fill', { fill: item })"
        ></li>
      </ul>
      <span>{{ $t("node.strokeWidth") }}</span>
      <ul>
        <li
          v-for="(item, i) in width"
          v-bind:key="i"
          @click="change('fill', { lineWidth: item })"
        >
          {{ item }}
        </li>
      </ul>
      <span>{{ $t("node.strokeStyle") }}</span>
      <ul class="stroke-style">
        <!-- <li v-for="(item,i) in lineDash" v-bind:key='i'  @click="change('lineDash',{'lineDash':item.slice()})">{{item}}</li> -->
        <li class="stroke-solid" @click="change('lineDash', { lineDash: [0] })">
          solid
        </li>
        <li
          class="stroke-dashed"
          @click="change('lineDash', { lineDash: [6, 2] })"
        >
          dash
        </li>
        <li
          class="stroke-dotted"
          @click="change('lineDash', { lineDash: [2, 2] })">
          dott
        </li>
      </ul>
      <span>{{ $t("node.borderRadius") }}</span>
      <ul>
        <li
          v-for="(item, i) in radius"
          v-bind:key="i"
          @click="change('radius', { radius: item })"
        >
          {{ item }}
        </li>
      </ul>

      <button @click="changeText(true)">{{ $t("node.addText") }}</button>
      <button @click="changeText(false)">{{ $t("node.removeText") }}</button>

      <button @click.stop="$emit('removewireframe')">
        {{ $t("node.removeWireFrame") }}
      </button>
    </div>
  </div>
</template>
<script>
export default {
  name: "setup",
  props: ["left", "top", "changeWireFrame", "wftext"],
  data() {
    return {
      colors: [
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
        "transparent",
      ],
      width: [0, 1, 2, 3],
      radius: [0, 10, 20, 30],
      menus: [
        {
          id: 1,
          text: "添加节点",
        },
      ],
    };
  },

  mounted() {},
  methods: {
    change(type, data) {
      this.$emit("changeWireFrame", type, data);
    },
    changeText(flag) {
      var t = this.wftext || "label";
      if (!flag) {
        t = "";
      }
      this.$emit("changeWireFrame", "data", {
        data: { text: t, nodeType: "wireFrame" },
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
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
a {
  color: #42b983;
}
.wireFrame {
  position: absolute;
  padding: 2px;
  background: #fff;
  z-index: 3000;
  font-size: 14px;
  text-align: left;
  border-radius: 3px;
}
.wireFrame-setup {
  width: 280px;
}
.head {
  font-weight: bold;
  line-height: 24px;
}
/* .wireFrame-setup{
  width: 100%;
  height: 100%;
  background: #f5f5f5;
} */

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
.fill-color li,
.text-color li,
.stroke-color li {
  border: 1px solid #ccc;
}
.transparent {
  background: url("../assets/transparent.png") repeat !important;
  background-size: contain !important;
}
</style>
