<template>
  <div class="menu" v-bind:style='"left:"+left+"px;top:"+top+"px;box-shadow:0px 0px 6px #ccc"'>
       <ul class="menu-conatiner">

            <li v-for="item in $t('contextMenu')"  v-bind:key="item.id" :class="item.type=='split'?'split':''" v-show="item.show" @click="$emit('command',{cmd:item})">
               {{item.text?item.text:''}}
               <span class="shorCut" v-if="item.shortCut">{{item.shortCut}}</span>
               <span v-if="item.submenu" class="iconfont icon-dakai" style="float:right;"></span>
               <ul v-if="item.submenu" class="submenu">
                        <li v-for="(submenu,i) in item.submenu" v-bind:key="i" :class="submenu.type=='split'?'split':''" @click="$emit('command',{cmd:submenu})">
                              {{submenu.text}}
                              <span class="shorCut" v-if="item.shortCut">{{submenu.shortCut}}</span>
                              <span v-if="submenu.submenu" class="iconfont icon-dakai" style="float:right;"></span>
                              <ul v-if="submenu.submenu" class="submenu">
                                  <li v-for="(smenu,i) in submenu.submenu" :class="smenu.type=='split'?'split':''" v-bind:key="i" @click="$emit('command',{cmd:smenu})">
                                        {{smenu.text}}
                                  </li>
                              </ul>
                        </li>
                    </ul>
            </li>

       </ul>
  </div>
</template>

<script>
export default {
  name: 'nodeMenu',
  props:['left','top','nodeType'],
  watch:{
      nodeType: {
      handler: function(val, oldval) {
          if(val=='callout'||val=='relateLink'){
             var allowMenu=[4,5];
             this.$t('contextMenu').forEach(menu=>{
                if(allowMenu.indexOf(menu.id)>-1){
                   menu.show=true;
                }
                else{
                  menu.show=false;
                }
                
             });
           }else if(val=='wireFrame'){
              this.$t('contextMenu').forEach(menu=>{
                  menu.show=false;
             });
           }
           else{
             this.$t('contextMenu').forEach(menu=>{
               menu.show=true;
             })
           }
        },
         immediate:true
      }
  },
  data(){
      return {
            menus:[]
    
      };
  },
  mounted(){

  },
  methods:{

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
ul {
  list-style-type: none;
  padding: 0;
  margin:0;
}

.menu{
  position: absolute;
  left: 0;
  top:0;
  z-index: 3000;
  background: #fff;
  border-radius: 3px;
  width:240px;
}
.menu ul{
  text-indent: 10px;
  font-size: 12px;
  width: 240px;
}
li{
  line-height: 30px;
  padding: 0 10px;
  cursor: pointer;
  text-align: left;
}
li:hover{
  background: #f5f5f5;
}
.shorCut{
  float: right;
  margin-right: 10px;
}
li ul{
  left:238px;
}
.split{
  height:1px;
  background:#ccc;
  margin:0 6px
}
.theme-dark .split{
  background: #5f5e5e;
}
</style>
