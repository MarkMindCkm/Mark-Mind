var  htmlToText = require( '../markdown/jsHtmlToText').default
const exportKityMind=(data)=>{
    var obj={
        theme:'classic',
        version:'1.4.43',
        root:{
            data:{
                id:data.id,
                text:htmlToText(data.text),
                priority:data.priority,
                progress:data.percent?(parseInt(data.percent/10)-1):'',
                hyperlink:data.link,
                note:data.remark,
                image:data.isImageNode?data.image:'',
                imageSize:data.isImageNode?{width:data.imageWidth,height:data.imageHeight}:{},
                resource:[]
            }
        }
    }
    if(data.marks.length){
        data.marks.forEach(ele=>{
            obj.root.data.resource.push(ele.text)
        })
    }
    var c=createJson(data.children);
    obj.root.children=c;
    return obj;
}

const createJson=(arr)=>{
    var children=[];
    arr.forEach(ele=>{
        if(!ele)return;
          var obj={
            data:{
                id:ele.id,
                text:ele.text,
                priority:ele.priority,
                progress:ele.percent?(parseInt(ele.percent/10)-1):'',
                hyperlink:ele.link,
                note:ele.remark,
                image:ele.isImageNode?ele.image.src:'',
                imageSize:ele.isImageNode?{width:ele.image.w,height:ele.image.h}:{},
                resource:[]
            }
          }
          ele.marks.forEach(tag=>{
            obj.data.resource.push(tag.text)
          })
          var c=createJson(ele.children);
          obj.children=c;
          children.push(obj);
    });
    return children
}

export default exportKityMind;