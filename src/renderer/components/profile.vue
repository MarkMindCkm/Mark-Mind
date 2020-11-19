<template>
  <div class="profile">
       <button class="back" type="button" @click="back">{{$t('node.back')}}</button>
       <div class="profile-content">

           <div class="theme">
                 {{$t('profile.theme')}}:
                 <input type="radio"  v-model="theme" @change="changeTheme" id="theme-light" name="theme"  class="magic-radio" value="theme-light"/>
                 <label for="theme-light">Light</label>
                 <input type="radio"  v-model="theme" @change="changeTheme" id="theme-dark" value="theme-dark"  class="magic-radio" name="theme"/>
                 <label for="theme-dark">Dark</label>
           </div>

           <div class="language">
                {{$t('profile.lang')}}：
                <select name="lang" id="lang" v-model="lang" @change="changeLang">
                        <option value="zh">简体中文</option>
                        <option value="en">English</option>
                </select>
           </div>

           <div class="markdown">
                 {{$t('profile.markdown')}}:
                <input type="checkbox" id="useMarkdown"  class="magic-checkbox" v-model="useMarkDown" name="useMarkDown"/>
                <label for="useMarkdown">{{$t('node.open')}}</label>
           </div>

            <div class="shortcut">
                 {{$t('profile.shortcut')}}:
                 <input type="radio"  v-model="keyModel"  id="shortcut1" name="keyModel"  class="magic-radio" value="default"/>
                 <label for="shortcut1">{{$t('profile.shortcutModel1')}}</label>
                 <input type="radio"  v-model="keyModel"  id="shortcut2" value="ithoughts"  class="magic-radio" name="keyModel"/>
                 <label for="shortcut2">{{$t('profile.shortcutModel2')}}</label>
           </div>

             <div class="math">
                 {{$t('profile.math')}}:
                 <input type="radio"  v-model="math"  id="math1" name="math"  class="magic-radio" value="katex"/>
                 <label for="math1">{{$t('profile.katex')}}</label>
                 <input type="radio"  v-model="math"  id="math2" value="mathjax"  class="magic-radio" name="math"/>
                 <label for="math2">{{$t('profile.mathjax')}}[{{$t('profile.mathTip')}}]</label>
           </div>

            <div class="plantuml">
                {{$t('profile.plantuml')}}：<input type="text" v-model="plantuml" class="form-input"/>
           </div>

           <div class="canvas-size">
               {{$t('profile.canvasSize')}}
               <br>
               <div v-for="(item,i) in sizeArr" v-bind:key="i" @click.stop="changeSize(i)" :class="'size '+(i==size?'active':'')">{{item}}</div>
           </div>

           <button class="sure" type="button" @click="sure">{{$t('node.sure')}}</button>

       </div>
  </div>
</template>

<script>

let ipcRenderer = require('electron').ipcRenderer;
let Store=require('electron-store')
const {dialog} = require('electron').remote;
const { shell } = require('electron');

import i18n from '../locales/index';

// import profile from '../mind/profile.json';
import fs from 'fs'
import path from 'path'

var store=new Store();
var profile=store.get('config');
const LOCALE_KEY = 'localeLanguage';



 


export default {
  name: 'Profile',
  data(){
      return {
         sizeArr:[
            '8000x8000',
            '10000x10000',
            '12000x12000',
            '14000x14000',
            '16000x16000',
         ],
         theme:profile.theme,
         lang:profile.language,
         useMarkDown:profile.useMarkDown,
         size:profile.size,
         width:profile.canvasWidth,
         height:profile.canvasHeight,
         plantuml:profile.plantumlServer||'',
         keyModel:profile.keyModel||'default',
         math:profile.math
      };
  },
  mounted(){
     document.body.classList.contains('mark-mind')?document.body.classList.remove('mark-mind'):'';
  },
  methods:{
     back(){
        this.$router.push('/list');
     },
     changeTheme(e){
         var theme=e.target.value;
         localStorage.setItem('theme',theme);
     },
     changeLang(e){
       // setLang(e.target.value);
      // this.lang=e.target.value;
      // localStorage.setItem(LOCALE_KEY,e.target.value);
     },
     changeUseMd(e){
           
          //this.saveConfig();
     },
     saveConfig(){
        // if(this.$store.state.MindData.vip.vip){
            var config={...profile,...{
                       theme:this.theme,
                       language:this.lang,
                       useMarkDown:this.useMarkDown,
                       canvasWidth:this.width,
                       canvasHeight:this.height,
                       size:this.size,
                       plantumlServer:this.plantuml,
                       keyModel:this.keyModel,
                       math:this.math
            }}
            store.set('config',config);
        // }else{
             
        // }
     },
     changeSize(i){
      
        var obj={
           0:8000,
           1:10000,
           2:12000,
           3:14000,
           4:16000
        }
        this.size=i;
        this.width=obj[i];
        this.height=obj[i];
     },
     sure(){
         if(this.useMarkDown&&!this.$store.state.MindData.vip.vip){
             dialog.showMessageBox({
               type: 'info',
               title: i18n.t('profile.tooltip'),
               defaultId: 0,
               message: i18n.t('profile.needMarkdown'),
               //buttons: i18n.t('profile.profileBtns')
               buttons: i18n.t('profile.profileBtns')
            }).then(({response})=>{
             
               if(response===0){
                  if(i18n.locale=='en'){
                      var url='http://www.ckminder.cn/index/en'
                  }else{
                      var url='http://www.ckminder.cn/'
                  }
                  shell.openExternal(url);
               } else {
                 
               }
            }) 
         }else{
            this.saveConfig();
            ipcRenderer.send('setMenu');
            window.location.reload();
         }
     }
  }
}
</script>
<style scoped>

   .profile button{
      max-width:200px;
      padding: 4px 6px;
      height:auto;
      cursor: pointer;
   }
   button.back{
      width:50px;
   }
   .magic-radio + label:after{
      top: 4px;
      left: 4px;
   }
   div>*{
      margin-top:10px;
      margin-bottom:4px;
   }

   select{
      padding: 4px 6px;
      border:1px solid #ccc;
   }
   .theme-dark select{
      background-color:#333;
      color: #ccc;
      border: 1px solid #333;
   }
   .size{
      display: inline-block;
      line-height: 28px;
      border:1px solid #d6d6d6;
      border-radius:2px;
      cursor: pointer;
      padding: 0 6px;
      margin-right: 4px;
      font-size: 12px;
   }
   .size.active{
        border:1px solid #3e97eb;
   }
   .theme-dark button {
      background: #3e6488;
      border:1px solid #3e6488;
      color:#fff;
   }
   .form-input{
      border:1px solid #d6d6d6;
      height:24px;
      line-height: 24px;
      width:300px;
      text-indent: 6px;
      outline: none;
      border-radius:2px;
   }
   .theme-dark .form-input{
       background-color:#333;
      color: #ccc;
      border: 1px solid #333;
   }
</style>
