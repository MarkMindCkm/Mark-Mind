<template>
  <div class="theme-list">
       <ul>
           <li @click="$emit('changetheme',item.name)" v-for="item in theme" v-bind:key="item.id">
               <img :src="item.image"/>
           </li>
       </ul>
  </div>
</template>

<script>
export default {
  name: 'theme',
  props:['changeTheme'],
  data(){
      return {
         theme:[
             {
                 id:'blue',
                 name:'blue',
                 image:require('../assets/theme/blue.png')
             },
              {
                 id:'blue2',
                 name:'blue2',
                 image:require('../assets/theme/blue2.png')
             },
              {
                 id:'blue3',
                 name:'blue3',
                 image:require('../assets/theme/blue3.png')
             },
             {
                 id:'blue4',
                 name:'blue4',
                 image:require('../assets/theme/blue4.png')
              },
              {
                 id:'black',
                 name:'black',
                 image:require('../assets/theme/black.png')
             },
              {
                 id:'black2',
                 name:'black2',
                 image:require('../assets/theme/black2.png')
             },
              {
                 id:'white',
                 name:'white',
                 image:require('../assets/theme/white.png')
             },
              {
                 id:'white1',
                 name:'white1',
                 image:require('../assets/theme/white1.png')
             },
               {
                 id:'orange',
                 name:'orange',
                 image:require('../assets/theme/orange.png')
             },
              {
                 id:'red',
                 name:'red',
                 image:require('../assets/theme/red.png')
             },
               {
                 id:'green2',
                 name:'green2',
                 image:require('../assets/theme/green2.png')
             },
             {
                 id:'normal',
                 name:'normal',
                 image:require('../assets/theme/normal.png')
             }
         ]
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

.theme-list{
    position: fixed;
    right:0;
    width:300px;
    
    overflow-y:auto;
    overflow-x:hidden;
    z-index: 4000;
    top:60px;
    background: #fff;
    border-left:1px solid #f5f5f5;
    user-select: none;
    box-sizing: border-box;
    bottom:0;

}
.theme-list li{
  
    height: auto;
    float: left;
    margin:2px;
}
.theme-list li img{
    width: 80%;
}

</style>
