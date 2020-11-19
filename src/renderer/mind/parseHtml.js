import uuid from './uuid'
import $ from 'jquery'


let parseHtml=function(str,text){
    var nodeData=[];
    var dom=$(str);
    var len=dom.length;
    var tagDom=dom.first().get(0);
    var tagName=tagDom&&tagDom.tagName&&tagDom.tagName.toLowerCase();
    if(!tagName){
        return nodeData
    }
    if(len==1){
        if(tagName=='ol'||tagName=='ul'){
           dom.find('li').each((i,item)=>{
              var obj={};
              obj.text=$(item).text();
              obj.id=uuid();
              nodeData.push(obj)
           });
        }else if(['h1','h2','h3','h4','h5','h6','title','dd','dt','td'].indexOf(tagName)>-1){
            let obj={
                text:dom.text()||text,
                id:uuid()
            }
            nodeData.push(obj);
        }else if(tagName=='li'){
            let obj={
                text:$.trim(dom.text())||text,
                id:uuid()
            }
            if(dom.find('a').length){
                 obj.link=text;
                 if(dom.find('a').first().children('div,h1,h2,h3,h4,h5,h6,p,span,li,title').length){
                    var titleDom=dom.find('a').first().children('div,h1,h2,h3,h4,h5,h6,p,span,li,title').first();
                    var txt=$.trim(titleDom.text());
                 }else{
                    var txt=$.trim(dom.find('a').text()||dom.find('a').attr('title')||dom.text()||text);
                 }
                 txt=txt.substr(0,20);
                 obj.text=text;
            }
            nodeData.push(obj);
        }else if(tagName=='a'){
            let obj={
                link:text,
                text:$.trim(dom.text()||dom.attr('title')||''),
                id:uuid()
            }
            if(dom.find('img').length){
               var src=dom.find('img').attr('src');
               if(src.startsWith('http')){
                  obj.isImageNode=true;
                  obj.src=src;
               }
            }
            nodeData.push(obj);
        }else if(tagName=='div'||tagName=="p"||tagName=="span"){
            let obj={
                text:dom.text()||text,
                id:uuid()
            }
            nodeData.push(obj);
        }else if(tagName=='img'){
            let obj={
                text:dom.attr('alt')||dom.attr('title')||'',
                id:uuid(),
                src:text,
                isImageNode:true
            }
            nodeData.push(obj)
        }else{
            let obj={
                text:text,
                id:uuid()
            }
            nodeData.push(obj);
        }
    }else if(len>1){
        nodeData=getArrayData(dom,text);
    }
    // nodeData.forEach(item=>{
    //     if(!item.text.indexOf('\n')>-1){
    //         item.text=changeText(item.text,getFontNum());
    //     }
    // })

    return nodeData;
}

// function changeText(text,length){
//     var t=[];
//     var n=Math.ceil(text.length/length);
//     for(let i=0;i<n;i++){
//         t.push(text.substring(i*length,(i+1)*length));
//     }
//     return t.join('\n');
//   }

function getArrayData(dom,text){
   var data=[];
   var tagName=$(dom).first().get(0).tagName;
   var arr=[];
   dom.each((i,item)=>{
       arr.push($(item).get(0).tagName);
   });
   var flag=arr.every(item=>item==tagName);
   if(flag){
       dom.each((i,item)=>{
           var d=parseHtml(item,text);
           if($(item).text()){
               data=data.concat(d);
           }
       });
   }else{
      var textArr=text.split('\n');
      textArr.forEach(item=>{
          if($.trim(item)){
              data.push({
                  id:uuid(),
                  text:item
              });
          }
      });
   }
   return data;
}

export default parseHtml;