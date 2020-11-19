<template>
  <div class="image-setup" v-bind:style='"left:"+left+"px;top:"+top+"px"'>
        <div class="image-menu">
              
              <div class="head">位置</div>
              <div class="content">
                  <span @click.stop="setImage('imagePosition','top')">上</span>
                  <span @click.stop="setImage('imagePosition','right')">右</span>
                  <span @click.stop="setImage('imagePosition','bottom')">下</span>
                  <span @click.stop="setImage('imagePosition','left')">左</span>
              </div>
              <div class="head">圆角</div>
              <div class="content">
                  <span @click.stop="setImage('imageRadius','0px')">0</span>
                  <span @click.stop="setImage('imageRadius','5px')">5</span>
                  <span @click.stop="setImage('imageRadius','10px')">10</span>
                  <span @click.stop="setImage('imageRadius','15px')">15</span>
                  <span @click.stop="setImage('imageRadius','20px')">20</span>
                  <span @click.stop="setImage('imageRadius','30px')">30</span>
      
              </div>

              <button type="button" @click.stop="deleteImage">Delete Image</button>
        </div>
  </div>
</template>

<script>
export default {
  name: 'ImageSetup',
  props:['left','top','command'],
  data(){
      return {
       
      };
  },
  mounted(){

  },
  methods:{
     setImage(type,mark){
          var data={};
          data[type]=mark;
          this.$emit('command',data);
     },
     deleteImage(){
       this.$emit('command',{
         isImageNode:false,
         image:null
       });
     }
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
}
li{
  line-height: 30px;
  padding: 0 10px;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
}
li:hover{
  background: #f5f5f5;
}
.image-setup{
  position: absolute;
  z-index: 60;
  user-select: none;
  background: #fff;
  padding: 10px;
  text-align: left;
  border-radius: 3px;
  font-size: 12px;
}
h3{
  font-size: 16px;
}
.head{
  font-size: 14px;
  font-weight: bold;
  line-height: 24px;
}
span{
  display: inline-block;
  width:24px;
  height: 24px;
  cursor: pointer;
}

.image-setup button{
   width: 100%;
   height:24px;
   border:1px solid #d6d6d6;
   background: #fff;
}

</style>
