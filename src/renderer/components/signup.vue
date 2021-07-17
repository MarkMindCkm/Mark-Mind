<template>
  <div class="signup">
      <div class="signup-logo"><img  :src="logo" alt=""></div>
      <div class="signup-header" v-if="!user.isLogin">
          用户登录
      </div>
      <div class="signup-content" v-if="!user.isLogin">
            <div class="input">
                <input type="text" v-model="user.email" placeholder="email"/>
                <input type="password"  v-model="password" placeholder="password"/>
            </div>
            <div>
                <button @enter.stop="login" @click="login">登录</button>
            </div>
      </div>
      <div class="signup-footer" v-if="!user.isLogin">
             <a @click.stop="signup">{{$t('node.register')}}</a>
      </div>

      <div class="" v-if="user.isLogin">
         <div class="user-info">{{user.username||email}}</div>
         <div class="end-date">{{$t('node.end')}}:{{user.endDate}}</div>
         <div class="tip">{{tip}}</div>
         <button @enter.stop="quite" @click="quite">退出</button>
      </div>
  </div>
</template>
<script>
let logo = require("../assets/logo.png");
import { shell } from "electron";
import $ from 'jquery';
import Store from "electron-store";
import i18n from '../locales';

var store = new Store();
var userData = store.get("user");

export default {
  name: "signup",
  data() {
    return {
        password:'',
        logo:logo,
        user:{
            isLogin:userData&&(userData.isLogin||false),
            isVip:false,
            username:userData&&(userData.username||''),
            activeCode:userData&&(userData.activeCode||''),
            endDate:userData&&(userData.endDate||''),
            email:''
        },
        tip:''
    };
  },
  created() {},
  beforeDestroy() {
    
  },
  mounted() {
     
      if(userData&&userData.activeCode){
         this.activeSoft(userData.activeCode);
        // console.log(userData);
      }
  },
  methods: {
    login(){
       var me=this;
       if(!this.user.email){
           return
       }
       if(!this.password){
           return
       }
       $.ajax({
           url:'http://www.ckminder.cn/token/getToken',
           type:'post',
           data:{
               email:this.user.email,
               password:this.password
           }
       }).done(res=>{
           if(res&&res.success){
              me.user.isLogin=true;
              me.user.username=res.user.name;
              me.user.activeCode=res.user.activeCode;
              me.user.endDate=res.user.endDate;
              me.password='';
              store.set('user',me.user);
              if(res.user.activeCode){
                  me.activeSoft(res.user.activeCode);
              }
              
           }else{
               alert('Login Fail');
           }
       }).fail(xhr=>{
           alert('Login Fail');
       })
    },
    signup(){
      shell.openExternal('http://www.ckminder.cn/register');
    },
    activeSoft(code){
        var r=this.$parent.activeSoft(code);
        if(r){
            if(r.flag){
                this.user.isVip=true;
                this.tip=i18n.t('active');
            }else{
                this.user.isVip=false;
                this.tip=i18n.t('node.dateLimit');
            }
            
        }
    },
    quite(){
        this.user.isLogin=false;
        store.set('user',this.user);
    }
  }
};
</script>
<style  scoped>
.signup{
    margin-top: 100px;
    line-height: 30px;
    font-size: 12px;
}
.signup-logo{
    width:120px;
    height: 120px;
    margin: 6px auto;
}
.signup-logo img{
    width: 100%;
    height: 100%;
}
.signup-content input{
     line-height: 30px;
     display:block;
     margin: 6px auto;
     width:280px;
     text-indent: 6px;
     border:1px solid #dadada;
     border-radius:3px;
     outline: none;
}
.signup-footer{
   cursor: pointer;
   color:#0981e8;
}
button{
     line-height: 30px;
     display:block;
     margin: 6px auto;
     width:280px;
     text-indent: 6px;
     border:1px solid #dadada;
     border-radius:3px;
     background: #f5f5f5;
     outline: none;
     cursor: pointer;
}
button:hover{
    opacity: 0.8;
}
.tip{
    color:green
}



</style>