<template>
  <div class="refresh iconfont icon-load1">
        {{$t('node.loadData')}}
  </div>
</template>

<script>
export default {
  name: 'refresh',
  
  data(){
      return {
       
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
.refresh{
  width:180px;
  height:180px;
  position: absolute;
  top:50%;
  left:50%;
  margin-top:-90px;
  margin-left:-90px;
  font-size:12px;
  color:#666;
}




</style>
