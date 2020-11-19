//var list=[];
import uuid from '../uuid'
// import {canvasWidth,canvasHeight} from '../profile'
let Store=require('electron-store');
var store=new Store();
var profile=store.get('config');

let canvasWidth=profile.canvasWidth;
let canvasHeight=profile.canvasHeight;

var mind={
    "theme":'blue',
    "mindData":[],
    "induceData":[],
    "wireFrameData":[],
    "relateLink":[],
    "background":'',
    "relateLinkData":[],
    "calloutData":[],
    'marks':[]
};

var color=['#fda16c','#74bdf7','#71FF5E','orange','#D4D4AA','yellow'];

const importXmind=function(data){
    mind={
        "theme":'blue',
        "mindData":[],
        "induceData":[],
        "wireFrameData":[],
        "relateLink":[],
       
        "background":'',
        "relateLinkData":[],
        "calloutData":[],
        'marks':[],
    };
      
   // mind.data=[];
    //data.forEach(d=>{
         var mainlist=[];
         transferData(data.rootTopic,null,mainlist,true);
         var root=mainlist[0];
        

         data.rootTopic.children&&data.rootTopic.children.detached&&data.rootTopic.children.detached.forEach(d=>{
            var list=[]
            transferData(d,root.id,list);
            // list[0].direct="";
            // list[0].pid=root.id;
            // list[0].nodeType='richText';
            // console.log()
            mainlist=mainlist.concat(list);
        });

        mind.mindData.push(mainlist);
   // });

   data.relationships&&data.relationships.forEach(rl=>{
       var obj={
        startNodeId: rl.end1Id,
        endNodeId: rl.end2Id,
        nodeData:{
            'text':'',
            'nodeType':'relateLink',
            'backgroundColor':'#f06'
        }
       }
       if(rl.title){
           obj.nodeData.text=rl.title;
       }
       mind.relateLinkData.push(obj);
   })

    
    //list=[];
    // transferData(data.root,null);
    // var marks=[];
    // var obj={};
    // list.forEach(node=>{
    //     node.resource&&node.resource.forEach(r=>{
    //       if(!obj[r]){
    //           var id=parseInt(+new Date())+parseInt(Math.random()*50);
    //           var tagObj={
    //             id,
    //             text:r
    //           };
    //           marks.push(tagObj);
    //           node.marks.push(tagObj);
    //           obj[r]=true;
    //       }else{
    //         marks.forEach(item=>{
    //             if(item.text==r){
    //               node.marks.push(item);
    //             }
    //         })
    //       }
    //   })
    //   delete node.resource;
    // });
    // var len=color.length;
    // marks.forEach((item,i)=>{
    //     if(i<len){
    //         item.fill=color[i];
    //     }else{
    //         item.fill=color[parseInt(Math.random()*len)];
    //     }
    //     item.checked=false;
    // });

   // mind.data.push(list);
   // mind.marks=marks;
    return mind;
};

var task={
    'task-start':'0',
    'task-oct':'10',
    'task-3oct':'30',
    'task-5oct':'50',
    'task-7oct':'70',
    'task-9oct':'90',
    'task-done':'100',
}
function transferData(data,parentId,list,mainFlag){
     if(data.title){
         var text=data.title.replace(/(\r\n)|(\n)/g,'<br/>');
     }
     else{
         var text='';
     }
    var node={
        id:data.id,
        pid:parentId,
        text:text,
      //  percent:data.data.progress<=8?data.data.progress*10:'',
       // priority:data.data.priority,
        //link:data.href,
        remark:'',
        //tag:data.data.resource
        marks:[],
       // resource:data.data.resource,
        isExpand:true,
        image:'',
        imageName:'',
        x:0,
        y:0
    };
    // if(data.data.progress==9){
    //     node.percent='100';
    //     //node.icon=['wancheng']
    // }

    if(!parentId){
        node.layout={};
        node.layout.layoutName="minder2";
        node.layout.direct="right";
        if(mainFlag){
            node.isRoot=true;
            node.main=true;
            node.x=canvasWidth/2;
            node.y=canvasHeight/2;
        }
    }

    if(data.href){
        node.link=data.href;
    }
    if(data.notes){
       // console.log(data.notes);
        node.remark=data.notes.plain.content.replace(/\n/g,"<br>").trim();
    }
    if(data.image){
        node.isImageNode=true;
       
        node.image='';
        node.imageName=data.image.src.replace('xap:resources/','');

        // node.imageWidth=data.data.imageSize.width;
        // node.imageHeight=data.data.imageSize.height;
    }

    if(data.labels){
        node.marks=[];
        data.labels.forEach(lab=>{
            node.marks.push({
                id:uuid(),
                text:lab,
                fill:color[parseInt(Math.random()*color.length)]
            });
        })
    }

    if(data.markers){
        data.markers.forEach(item=>{
            if(item.markerId.indexOf('priority')>-1){
               node.priority=item.markerId.split('-')[1];
            }
            if(item.markerId.indexOf('task')>-1){
                node.percent=task[item.markerId]
            }
        })
    }

    list.push(node);

    data.children&&data.children.attached&&data.children.attached.forEach(c=>{
        transferData(c,data.id,list);
    });

    //归纳
    data.summaries&&data.summaries.forEach(sum=>{
          var r=sum.range.substring(1,sum.range.length-1);
         // console.log(r,'induce');
         var s=r.split(',')[0];
         var e=r.split(',')[1];
         
          var induceData={
            induceData:{
                nodeId:sum.topicId,
                range:r,
                id:sum.id
            }
          }
          data.children.attached.forEach((c,i)=>{
             if(i==s){
                induceData.induceData.nodeId=c.id
             }
             if(i==e){
                induceData.induceData.endNodeId=c.id
             }
          });


          var mData=[];
          var summary=data.children.summary;
          var sumData=summary.filter(item=>{
              return item.id==sum.topicId
          })[0];

          transferData(sumData,null,mData);
          mData[0].nodeType='induce';
          induceData.mindData=mData;
          mind.induceData.push(induceData);
    });

    //外框
    data.boundaries&&data.boundaries.forEach(bum=>{
        var r=bum.range.substring(1,bum.range.length-1);
        var s=r.split(',')[0];
        var e=r.split(',')[1];

        var wf={
            stroke: "rgb(206, 214, 218)",
            fill: "transparent",
            lineDash:  [6, 2],
            radius:10,
            data:{
                text:'',
                nodeType:'wireFrame'
            }
        };
        if(bum.title){
            wf.data={
                text:bum.title,
                nodeType:'wireFrame'
            }
        }

        data.children.attached.forEach((c,i)=>{
            if(i==s){
                wf.nodeId=c.id
            }
            if(i==e){
                wf.endNodeId=c.id
            }
        });
        wf.range=r;
        mind.wireFrameData.push(wf);
    });

    //collout
    data.children&&data.children.callout&&data.children.callout.forEach(c=>{
       var callout={
           nodeId:data.id,
           color:'#f06',
           rootData:{
               text:c.title,
               id:c.id
           }
       }
       mind.calloutData.push(callout);
    });
   
  

}


export default importXmind;