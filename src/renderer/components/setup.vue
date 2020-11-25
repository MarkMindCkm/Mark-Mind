<template>
  <div nochilddrag class="setup">
    <div class="layout-container">
      <div class="layout-now">
        <div style="float: left; padding-top: 20px; font-weight: bold">
          {{ $t("node.layout") }}
        </div>
        <div class="now-layout" @click.stop="showLayoutList">
          <img v-if="nowLayout" :src="nowLayout.image" />
        </div>
        <ul class="layout-list" v-show="showLayouts">
          <li
            v-for="item in layouts"
            v-show="item.show"
            v-bind:key="item.id"
            :class="item.class"
            @click.stop="setLayout('changelayout', item.name, item.direct)"
          >
            <img :src="item.image" alt="" />
          </li>
        </ul>
      </div>
    </div>

    <!-- <div class="theme theme-list">
          <div>主题</div>
          <ul>
               <li @click="$emit('changeTheme',item.name)" v-for="item in theme" v-bind:key="item.id">
               <img :src="item.image" alt="">
           </li>
          </ul>
      </div> -->
    <div class="background">
      <div class="head">{{ $t("node.background") }}</div>
      <ul class="color-list">
        <li
          v-for="(item, i) in colors"
          v-bind:key="i"
          @click.stop="$emit('changebackground', 'color', { color: item })"
          :style="'background:' + item"
        ></li>
      </ul>
      <div class="head">{{ $t("node.texture") }}</div>
      <ul class="grain-list">
        <li
          @click.stop="$emit('changebackground', 'grain', item)"
          v-for="item in grains"
          v-bind:key="item.id"
        >
          <img :src="item.image" />
        </li>
      </ul>
    </div>

    <div class="node-setup">
      <div class="head">{{ $t("node.branch") }}</div>
      <div class="head">
        {{ $t("node.branchColor") }}
        <ul class="color-list">
          <li
            v-for="(item, i) in colors"
            v-bind:key="i"
            @click.stop="$emit('changestroke', 'color', { color: item })"
            :style="'background:' + item"
          ></li>
        </ul>
      </div>
      <!-- <div class="head">
             线条渐细
        </div> -->
    </div>
  </div>
</template>
<script>
import Layout from "../mind/layout/layout";

export default {
  name: "setup",
  props: ["isRoot", "layoutName", "layoutDirect", "nodeDirect"],
  data() {
    return {
      nowLayout: {},
      showLayouts: false,
      layouts: [
        {
          id: 1,
          name: "minder2",
          direct: "mind",
          class: "mind-layout",
          image: require("../assets/layout/mind.png"),
          show: true,
        },
        {
          id: 2,
          name: "minder2",
          direct: "right",
          class: "right-layout",
          image: require("../assets/layout/right.png"),
          show: true,
        },
        {
          id: 3,
          name: "minder2",
          direct: "left",
          class: "left-layout",
          image: require("../assets/layout/left.png"),
          show: true,
        },
        {
          id: 4,
          name: "multipleTree",
          direct: "",
          class: "muilte-layout",
          image: require("../assets/layout/muilte.png"),
          show: true,
        },
        {
          id: 5,
          name: "tree",
          direct: "top",
          class: "top-layout",
          image: require("../assets/layout/top.png"),
          show: true,
        },
        {
          id: 6,
          name: "tree",
          direct: "down",
          class: "down-layout",
          image: require("../assets/layout/down.png"),
          show: true,
        },
        {
          id: 7,
          name: "fish",
          direct: "left",
          class: "rightfish-layout",
          image: require("../assets/layout/rightfish.png"),
          show: true,
        },
        {
          id: 8,
          name: "fish",
          direct: "right",
          class: "leftfish-layout",
          image: require("../assets/layout/leftfish.png"),
          show: true,
        },
        //   {
        //      id:9,
        //      name:'time',
        //      direct:'',
        //      class:'time-layout',
        //      image:require('../assets/layout/time.png'),
        //      show:true
        //  },
        {
          id: 10,
          name: "vertical",
          direct: "",
          class: "vertical-layout",
          image: require("../assets/layout/vertical.png"),
          show: true,
        },
      ],

      colors: [
        "#F5F5F5",
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
        "#003153",
        "#B386B8",
        "#D8B24D",
        "#FDB8A2",
        "#520057",
        "#44CEF6",
        "#72A779",
        "#6DD625",
        "#3E76A5",
        "#943ACA",
        "#7ADD99",
        "#019F6D",
        "#E82C0D",
        "#DADADE",
        "white",
        "transparent",
      ],
      grains: [
        {
          id: "1",
          name: "grain1",
          image: require("../assets/grain/grain1.png"),
        },
        {
          id: "2",
          name: "grain2",
          image: require("../assets/grain/grain2.png"),
        },
        {
          id: "3",
          name: "grain3",
          image: require("../assets/grain/grain3.gif"),
        },
        {
          id: "4",
          name: "grain4",
          image: require("../assets/grain/grain4.jpg"),
        },
        {
          id: "5",
          name: "grain5",
          image: require("../assets/grain/grain5.png"),
        },
        {
          id: "6",
          name: "grain6",
          image: require("../assets/grain/grain6.gif"),
        },
      ],
    };
  },
  watch: {
    layoutName: {
      handler: function (val, oldval) {
        // var layout=this.layouts.filter(item=>item.name.indexOf(val)>-1&&item.direct==this.layoutDirect)[0];
        //  this.nowLayout=layout;
        //  console.log(this.nowLayout)
        //console.log(val,JSON.stringify(this.nowLayout),this.layoutDirect);
        //if(val.indexOf('minder')>-1){
        //  console.log()
        // if(val=='fish'){
        //     var layout=this.layouts.filter(item=>item.name.indexOf(val)>-1&&item.direct==this.layoutDirect)[0];
        //     this.nowLayout=layout;
        //     this.layouts.forEach((data)=>{
        //           //  if(data.name==vla){
        //           //       data.show=false
        //           //  }else{
        //           //    data.show=false
        //           //  }
        //     });
        //     return
        // }
        //  console.log(val)
        var layout = this.layouts.filter(
          (item) => item.name == val && item.direct == this.layoutDirect
        )[0];
        this.nowLayout = layout;
        // console.log(this.nowLayout)
        // var allow=['minder2','tree','fish','time','multipleTree','vertical'];
        //   if(this.layoutDirect=='right'){
        this.layouts.forEach((data) => {
          // if((data.direct==this.layoutDirect||data.direct==this.nodeDirect)){
          data.show = true;
          // }else{
          //  data.show=false
          //  }

          // if(data.name=='tree'){
          //   data.show=true;
          // }
        });
        // }
        // else if(this.layoutDirect=='left'){

        // }
        // else{

        // }
        // }
        //  if(val=='tree'){
        //     var layout=this.layouts.filter(item=>item.name.indexOf(val)>-1&&item.direct==this.layoutDirect)[0];
        //      this.nowLayout=layout;
        //       if(this.layoutDirect=='down'){
        //            this.layouts.forEach((data)=>{
        //             data.show=true
        //            });
        //       }
        //       else{

        //            this.layouts.forEach((data)=>{
        //              if(this.isRoot){
        //                data.show=true
        //              }else{
        //                data.show=false
        //              }
        //            });
        //       }
        //  }

        //  if(val=='time'){
        //     var layout=this.layouts.filter(item=>item.name.indexOf(val)>-1&&item.direct==this.layoutDirect)[0];
        //      this.nowLayout=layout;
        //         this.layouts.forEach((data)=>{
        //               data.show=false
        //       });
        //  }

        //  if(val.indexOf('multipleTree')>-1){
        //     var layout=this.layouts.filter(item=>item.name.indexOf('multipleTree')>-1&&item.direct==this.layoutDirect)[0];
        //      this.nowLayout=layout;
        //      var allow=['minder2','tree','fish','time','multipleTree','vertical'];
        //   //   if(this.layoutDirect=='right'){
        //          this.layouts.forEach((data)=>{
        //             if(allow.indexOf(data.name)>-1&&(data.direct==this.layoutDirect||data.direct==this.nodeDirect)){
        //               data.show=true
        //             }
        //             else{
        //               data.show=false
        //             }

        //             if(data.name=='tree'){
        //               data.show=true;
        //             }
        //          });
        //  }

        //  if(val=='vertcal'){
        //       if(this.layoutDirect=='right'){

        //       }
        //       else if(this.layoutDirect=='left'){

        //       }
        //       else{

        //       }
        //  }
      },
      immediate: true,
    },
  },

  mounted() {},
  methods: {
    showLayoutList() {
      this.showLayouts = true;
    },
    setLayout(mark, layoutName, direct) {
      this.showLayouts = false;
      this.$emit(mark, layoutName, direct);
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
}
li {
  display: inline-block;
  margin: 0 10px;
  cursor: pointer;
}
a {
  color: #42b983;
}
.setup {
  position: fixed;
  top: 60px;
  right: 0px;
  z-index: 3000;
  width: 340px;
  height: 100%;
  background: #fff;
  padding: 10px;
  box-sizing: border-box;
  border-left: 1px solid #f5f5f5;
  overflow-y: auto;
  overflow-x: hidden;
}

.layout-container {
  right: 20px;
  top: 50px;
  z-index: 3000;
  cursor: pointer;
}
.layout-container ul li {
  border: 1px solid #e4e4e4;
  width: 80px;
  height: 80px;
  float: left;
  overflow: hidden;
  background-color: rgb(86, 163, 179);
}
.layout-container ul li img {
  width: 100%;
  text-align: center;
}

.mind-layout img {
  transform: translate(0, 26px);
}
.right-layout img {
  transform: translate(0, 26px);
}
.left-layout img {
  transform: translate(0, 24px);
}
.muilte-layout img {
  transform: translate(0, 18px);
}
.top-layout img {
  transform: translate(0, 6px);
}
.down-layout img {
  transform: translate(0, 6px);
}

.rightfish-layout img {
  transform: translate(0, 24px);
}
.leftfish-layout img {
  transform: translate(0, 24px);
}

.vertical-layout img {
  width: 60% !important;
  transform: translate(0, 2px);
}

.time-layout img {
  transform: translate(0, 26px);
}

.layout-now {
  width: 100%;
  height: 80px;
  background: #f5f5f5;
  padding: 10px;
  box-sizing: border-box;
}

.now-layout {
  width: 60%;
  border: 1px solid #f5f5f5;
  border-radius: 3px;
  overflow: hidden;
  background: rgb(86, 163, 179);
  float: right;
  height: 60px;
  overflow: hidden;
}
.now-layout img {
  max-height: 100%;
  max-width: 100%;
}
.layout-list {
  position: absolute;
  width: 100%;
  border: 1px solid #f5f5f5;
  background: #fff;
  top: 70px;
  clear: both;
  left: 0;
  padding: 10px;
  box-sizing: border-box;
}

.theme-list {
  width: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 4000;
  clear: both;
}
.theme-list li {
  width: 200px;
  height: auto;
  float: left;
  margin: 2px;
}
.theme-list li img {
  width: 80%;
}

.grain-list {
  clear: both;
  text-align: left;
}
.grain-list li {
  width: 24px;
  height: 24px;
  /* float: left; */
  /* margin:4px; */
  border-radius: 3px;
  margin: 0 3px;
}

.grain-list li img {
  width: 100%;
  height: 100%;
  border-radius: 3px;
}
.head {
  font-weight: bold;
  text-align: left;
  margin-top: 20px;
}
.color-list {
  text-align: left;
}
.color-list li {
  width: 24px;
  height: 24px;
  border-radius: 3px;
  display: inline-block;
  margin: 0 3px;
  cursor: pointer;
}
</style>
