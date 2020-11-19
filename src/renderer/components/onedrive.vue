<template>
  <div class="onedrive">
        <span @click="close" class="close iconfont icon-searchclose"></span>
        <div class="onedrive-head">
             <span @click="back" class="iconfont icon-fanhui" style="font-size:12px;text-align:center" v-if="routes.length>1"></span>{{folderName}}
        </div>
        <div class="onedrive-content">
           <div class="onedrive-list">
               <ul>
                   <li v-for="item in list" v-bind:key="item.id" @click="select($event,item)" @dblclick="open(item)"><span :class="'iconfont'+(item.folder?' icon-folder':' icon-file')"></span>{{item.name}}</li>
               </ul>
           </div>
        </div>
        <div class="onedrive-footer">
                <button v-if="showAccessBtn" @click.stop="openOnedrive">{{$t('node.accessBtn')}}</button>
                <button class="" @click="saveItem" v-if="showSave">{{$t('node.saveBtn')}}</button>
                <button class="" @click="openItem">{{$t('node.openBtn')}}</button>
        </div>
        <div class="loading" v-if="loading"><span class="iconfont icon-load1"></span></div>
  </div>
</template>
<script>

var ipcRenderer=require('electron').ipcRenderer;
import JSZip from 'jszip';
import i18n from '../locales/index';
var fs=require('fs');
let Store=require('electron-store');
var store=new Store();
var profile=store.get('config');

let canvasWidth=profile.canvasWidth;
let canvasHeight=profile.canvasHeight;

export default {
  name: 'Dropbox',
  props:['showSave'],
  data(){
      return {
          routes:[],
          list:[],
          selectFile:null,
          loading:false,
          showAccessBtn:false
      };
  },
  computed:{
    folderName(){
        var len=this.routes.length;
        if(len){
            return this.routes[len-1].name||'MarkMind';
        }else{
           return "MarkMind";
        }
    }
  },
  beforeDestroy(){
     ipcRenderer.removeAllListeners('list');
     ipcRenderer.removeAllListeners('expire');
     ipcRenderer.removeAllListeners('onedrive_err');
     ipcRenderer.removeAllListeners('appRoot');
     ipcRenderer.removeAllListeners('getFile');
  },
  mounted(){
     ipcRenderer.on('list',(e,arg)=>{
          this.opened=true;
          this.$store.dispatch('setOnedrive',{list:[],opened:true,id:arg['id']});
          this.list=arg.value;
          this.loading=false;
          this.showAccessBtn=false;
     });

     ipcRenderer.on('expire',(e,arg)=>{
          this.opened=false;
          this.loading=false;
          this.showAccessBtn=true;
     });

     ipcRenderer.on('onedrive_err',(e,arg)=>{
        this.loading=false;
        this.routes=[];
        this.showAccessBtn=true;
     });

     ipcRenderer.on('appRoot',(e,arg)=>{
         this.routes.push({
             id:arg.id,
             name:arg.name
         });
         this.$store.dispatch('setOneRoot',arg);
         ipcRenderer.send('getChildren',{id:arg.id});
         this.showAccessBtn=false;
     });

     ipcRenderer.on('getFile',(e,arg)=>{
         var route=arg.route;
         this.$store.dispatch('setTag','onedrive');
         this.$store.dispatch('setOpenOnedrive',{
           id:this.selectFile.id,
           name:this.selectFile.name
         });
         if(route){
            this.openFile(route);
         }
     });
     this.loading=true;
     setTimeout(()=>{
       ipcRenderer.send('getAppRoot');
     },200);
     
  },
  methods:{
       close(){
            this.$store.dispatch('setShowOneDrive',false);
       },
       openOnedrive(){
           ipcRenderer.send('openOnedrive');
       },
     
       openFolder(){
           ipcRenderer.send('openFolder',{path:'',id:''});
       },
       back(){
           if(this.routes.length>=2){
               this.loading=true;
               this.routes.pop();
               this.list=[];
               var item=this.routes[this.routes.length-1];
               ipcRenderer.send('getChildren',{id:item.id});
           }
       },
       select(e,item){
         this.selectFile=item;
         var li=e.target; 
         if(!li.classList.contains('active')){
             li.classList.add('active');
         }
          var elseLi = li.parentNode.children;
          for (var i = 0, elseLil = elseLi.length; i < elseLil; i++) {
            if (elseLi[i] !== li) {
                if(elseLi[i].classList.contains('active')){
                   elseLi[i].classList.remove('active');
                }
             }
         }
       },
       saveItem(){
           this.loading=true;
           var len=this.routes.length;
           var item=this.routes[len-1];
           if(item){
            if(this.$route.name=='editor'){
                var mind=document.getElementById('mind').mind;
                var name=mind.getRoot().getTxt()?mind.getRoot().getTxt()+'.mind':`markmind-${+new Date()}.mind`
            }else{
                 var list=document.getElementById('list').list;
                 var name=list.getRoot().getTxt()?list.getRoot().getTxt()+'.mind':`markmind-${+new Date()}.mind`;
            }
             ipcRenderer.send('saveOneDrive',{pid:item.id,name:name});
           }

       },
       openItem(){
         if(this.selectFile){
           this.open(this.selectFile);
         }
       },
       open(item){
           this.loading=true;
           if(item.folder){
                 this.routes.push({
                   id:item.id,
                   name:item.name
                 });
                 this.list=[];
                ipcRenderer.send('getChildren',{id:item.id});
           }else{

                var name=item.name.toLowerCase();
                if(name.endsWith('.mind')){
                    ipcRenderer.send('getFile',{id:item.id,url:item["@microsoft.graph.downloadUrl"]});
                }else{
                    this.loading=false;
                    ipcRenderer.send('openUrl',{id:item.id,url:item["@microsoft.graph.downloadUrl"]});
                }
           }
       },
        openFile(path){
              this.loading=true;
             if(!path.endsWith('.mind')){
                 this.loading=false;
                return;
              }   
              var me=this;
              var p=path;
                    fs.readFile(p, function(err, data) {
                      if (err) {
                          me.$store.dispatch('setFilePath','').then(()=>{
                             if(me.$route.name!='editor'){
                               me.$router.push('/list');
                             }
                               this.loading=false;
                          });
                           return;
                      };
                        
                         var zip=JSZip.loadAsync(data)
                         zip.then(function(e){
                            var files=e.files;
                            var images={
                               name:'img',
                               image:{

                               }
                            };
                            var parr=[],types=[],keys=[];
                            for(var k in files){
                                if(k.startsWith('images')&&!files[k].dir){
                                  var type='data:image/png;base64,';
                                  if(k.endsWith('jpg')){
                                    type='data:image/jpeg;base64,';
                                  }
                                  if(k.endsWith('gif')){
                                     type='data:image/gif;base64,';
                                  }
                                  if(k.endsWith('svg')){
                                    type='data:image/svg+xml;base64,';
                                  }
                                  types.push(type);
                                  keys.push(k);
                                  parr.push(files[k].async("base64"));
                                }
                            }
                            if(parr.length){
                              Promise.all(parr).then(res=>{
                                  res.forEach((data,i)=>{
                                     images.image[keys[i]]=types[i]+data;
                                  });
                                  me.$store.dispatch('setImage',images).then(()=>{
                                      for(var k in files){
                                        if(k.endsWith('.json')){
                                          files[k].async('text').then(res=>{
                                            var mindData=JSON.parse(res);
                                            me.$store.dispatch('setFilePath',{path:p});
                                            me.$store.dispatch('setMindData',mindData).then(()=>{
                                                var p='/';
                                                if(me.$route.name!='refresh'){
                                                   me.$router.push('/refresh');
                                                }
                                                  me.loading=false;
                                                  me.$store.dispatch('setShowOneDrive',false);
                                                setTimeout(()=>{
                                                  me.$router.push('/list');
                                                },500);
                                            });
                                        });
                                      }
                                     }
                                  });

                              });
                            }else{
                                 for(var k in files){
                                        if(k.endsWith('.json')){
                                          files[k].async('text').then(res=>{
                                            var mindData=JSON.parse(res);
                                         
                                            me.$store.dispatch('setFilePath',{path:p});
                                            me.$store.dispatch('setMindData',mindData).then(()=>{
                                                var p='/';
                                                if(me.$route.name!='refresh'){
                                                   me.$router.push('/refresh');
                                                }
                                                 me.loading=false;
                                                 me.$store.dispatch('setShowOneDrive',false);
                                                setTimeout(()=>{
                                                  me.$router.push('/list');
                                                },500);
                                            });
                                        });
                                      }
                                     }
                            }
                      });
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
  font-size: 14px;;
}

.onedrive{
    position: absolute;
    left:50%;
    width: 600px;
    height: 400px;
    top:50%;
    transform: translate(-50%,-50%);
    background: #fff;
    bottom: 0;
    z-index: 3000;
    text-align: left;
    background: #fff;
    border:1px solid #f5f5f5;
    box-sizing: border-box;
    user-select: none;
    overflow: hidden;
}
.onedrive-head{
    height:30px;
    line-height: 30px;
    background: #fff;
    border-bottom:1px solid #f5f5f5;
    font-size: 12px;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    padding-left:6px;
}

.addFile {
  width:calc(100% - 6px);
  height:24px;
  line-height: 24px;
  border:1px solid #eaeaea;
  outline: none;
  margin:6px 0;
  margin-left:2px;
  text-indent: 4px;
}
button{
  display: inline-block;
  height: 30px;
  line-height: 30px;
  width:auto;
  cursor: pointer;
}


.onedrive-footer{
  position: absolute;
  bottom:0;
  width:100%;
  height: 40px;
  text-align: right;
  padding-right:10px;
  box-sizing: border-box;
}

.onedrive-list li.active{
   background-color: #f5f5f5;
}
.loading{
  position: absolute;
  z-index: 200;
}
.loading span{
    line-height: 24px;
    text-align: center;
}

.close{
  position: absolute;
  right:0;
  top:0;
  color:red;
  text-align: center;
  line-height: 24px;;
}

.onedrive-content{
  padding-bottom:50px;
  overflow:hidden;
  height:310px;
}
.onedrive-list{
  height:100%;
  overflow-y:auto;
}
.theme-dark .onedrive{
   background: #282828;
   border:1px solid #111;
   color:#ccc;
}

.theme-dark .onedrive-head{
  background:#424242;
  border-bottom:1px solid #666;
}
.theme-dark li:hover{
  background: #888;
}
.theme-dark .onedrive-list li.active{
  background: #888;
}

.theme-dark button{
    background:#424242 ;
    color:#c5c3c3;
    border:1px solid #333;
}

</style>
