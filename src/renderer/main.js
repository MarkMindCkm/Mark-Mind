


import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import i18n from './locales/index'
import '../renderer/exportWord/exportword'

var path =require('path');
let ipcRenderer=require('electron').ipcRenderer;

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

import './assets/icon/iconfont.css'
import './assets/newicon/iconfont.css';
import './assets/mindIcon/iconfont.css'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.bubble.css'
import 'quill/dist/quill.snow.css'
import './assets/emoji/quill-emoji.css'
import './assets/github-markdown-css.css'
import 'markdown-it-icons/dist/index.css'

import '@iktakahiro/markdown-it-katex/node_modules/katex/dist/katex.min.css'

if (typeof Array.prototype.unique !== 'function') {
  Array.prototype.unique = function(){
      var obj = {},
        len = this.length,
        newArr = [];
      for(var i =0;i<len;i++)
      {
       if(i==0){
         newArr.push(this[i])
       }else{
         if(newArr.indexOf(this[i])==-1){
           newArr.push(this[i]);
         }
       }
      }
      return newArr;
    }
}


Vue.config.productionTip = false
store.dispatch('setMindData',{});
ipcRenderer.send('open-file');
ipcRenderer.on('lm-open-flie',(e,arg)=>{
    store.dispatch('setTag','local');
    store.dispatch('setOpenFile',arg).then(res=>{
      if(arg){
        window.baseUrl=path.dirname(arg);
      }
      new Vue({
          components: { App },
          i18n,
          router,
          store,
          template: '<App/>'
      }).$mount('#app');
    });
});

