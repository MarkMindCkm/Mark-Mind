import normal from './theme/normal';
import white from './theme/white';
import white1 from './theme/white1';
import white2 from './theme/white2';
import blue from './theme/blue';
import blue2 from './theme/blue2';
import blue3 from './theme/blue3';
import blue4 from './theme/blue4';
import black from './theme/black';
import black2 from './theme/black2';
import red from './theme/red';
import red1 from './theme/red1';
import red2 from './theme/red2';
import free from './theme/free';
import green from './theme/green';
import green1 from './theme/green1';
import green2 from './theme/green2';
import orange from './theme/orange';
import dark from './theme/dark';

import markdown from './theme/markdown'


const themeArray=[
  normal,
  white,
  white1,
  white2,
  black,
  black2,
  blue,
  blue2,
  blue3,
  blue4,
  red,
  red1,
  red2,
  green,
  green1,
  green2,
  free,
  orange,
  markdown,
  dark
];


//公共配置
var themeCommon={
    'main-root-textPadding':[18,14,18,14],
    'second-node-textPadding':[8,7,8,7],
    'free-root-textPadding':[8,7,8,7],
    'free-second-node-textPadding':[7,5,7,5],
    'node-textPadding':[6,5,6,5]
}

const theme=()=>{}

theme.use=(name)=>{
    var data=null;
    themeArray.forEach((item)=>{
        if(name){
            if(item.name==name){
                item.use=true
                data=item;
            }else{
                item.use=false
            }
        }else{
            if(item.use){
                data=item;
            }
        }
    });
   
  
    data.config={...data.config,...themeCommon};
    return data;
}

theme.register=(name,config)=>{
    themeArray.push({
        name,
        config
    });
}

export default theme;