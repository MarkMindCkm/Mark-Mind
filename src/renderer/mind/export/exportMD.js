let Store=require('electron-store');
var store=new Store();
var profile=store.get('config');
var  htmlToText = require( '../markdown/jsHtmlToText').default

const exportMD=(data)=>{
    return transferNode(data,0);
}

const transferNode=(data,num)=>{
    if(!data){
        return ''
    }
    var space="    ";
    var arr=[];
    if(profile.useMarkDown){
        var md='';
    }else{
        var md='+ ';
    }
    var isImageNode=data.isImageNode;
    var hasLink=data.link;

    md+=htmlToText(data.text);
    if(hasLink){
        md+= '[link]('+data.link+')'
    }
    if(isImageNode){
        md+= '![image]('+data.image+')'
    }

    md+='\n';
    num++;
    if(!profile.useMarkDown){
       
        for(let i=0;i<num;i++){
          arr.push(space);
        }
    }else{
        md+='\n';
    }

    if(data.children){
        data.children.forEach(element => {
          md=md+arr.join('')+transferNode(element,num);
      });
    }

   return md;
}

export default exportMD;