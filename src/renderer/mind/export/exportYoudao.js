const exportYoudao=(list)=>{

    var list=JSON.parse(list);
     var obj={
        nodes:[],
        remarks:{},
        resourceList:'',
        zoom:1
     };
     var arr=[];
     list.forEach((ele)=>{
         var object= {
            "id":ele.id,
            "topic":ele.text,
            "isroot":ele.isRoot,
            "expanded":true,
            "parentid":ele.pid,
            "style":{
                // "left":ele.position.x+'px',
                // "top":ele.position.y+'px',
                "display":"",
                "visibility":"visible"
            },
            "customStyle":{},
            "expanderStyle":{},
            "view":{
                // "width":parseInt(ele.box.width)+'px',
                // "height":parseInt(ele.box.height)+'px'
            },
            "images":[],
            "link":{}
        };
         ele.link&&(object.link={
             id:+new Date(),
             value:ele.link
         });

         if(ele.remark){
             obj.remarks[ele.id]=ele.remark;
         }
         delete ele.children;
         arr.push(object)
     });
     obj.nodes=obj.nodes.concat(arr);

     return obj;
}


export default exportYoudao;