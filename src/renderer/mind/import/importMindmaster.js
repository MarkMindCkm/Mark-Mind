import uuid from '../uuid'
import $ from 'jquery'
let Store=require('electron-store');
var store=new Store();
var profile=store.get('config');

let canvasWidth=profile.canvasWidth;
let canvasHeight=profile.canvasHeight;

var mind=null;
var nodes = {};
var root=null;
var summary=[];
var summaryBoundary={};

var color=['#fda16c','#74bdf7','#71FF5E','orange','#D4D4AA','yellow'];

const importMindmaster=function(data){
   nodes = {};
   root=null;
   summary=[];
   summaryBoundary={};
   mind={
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

    var elements = data.children[0].children;
    for (var i=0,len = elements.length;i<len;i++){
       var ele = elements[i];
       var $ele = $(ele);
       
       if($ele.attr('Type')&&($ele.attr('Type') == 'MainIdea'||$ele.attr('Type')=='MainTopic'||$ele.attr('Type')=='SubTopic'||$ele.attr('Type')=='SummaryTopic')){
           var nodeData ={
            id:'',
            pid:'',
            text:'',
            remark:'',
            marks:[],
            isExpand:true,
            image:'',
            imageName:'',
            x:0,
            y:0,
            eleType:'node',
            children:[]
         };
         nodeData.id = $ele.attr('ID');
         $ele.children().each(function(i,item){
             if(item.tagName == 'Text'){
                var textArr=$(item).text().trim().split('\n');
                var t=textArr.filter(t=>t.trim().length);
                var text=t.join('<br>');
                nodeData.text=text;
             }
             if(item.tagName=='Note'){
                var textArr=$(item).text().trim().split('\n');
                var t=textArr.filter(t=>t.trim().length);
                var text=t.join('<br>');
                nodeData.remark=text;
             }
             if(item.tagName=='HyperLinks'){
                 nodeData.link=$(item).find('Address').attr('V');
             }
             if($ele.attr('Type')=='SummaryTopic'){
                 if(item.tagName=='LevelData'){
                    nodeData.superids = $(item).find('Super').attr('V');
                    if($(item).find('SubLevel')){
                        nodeData.childrenIds = $(item).find('SubLevel').attr('V');
                    }
                 }
             }else{
                if(item.tagName=='LevelData'){
                    nodeData.childrenIds = $(item).find('SubLevel').attr('V');
                }
             }
            
         });

         //主节点
         if($ele.attr('Type') == 'MainIdea'){
            nodeData.main=1;
            nodeData.isRoot=1;
            nodeData.x=canvasWidth/2;
            nodeData.y=canvasHeight/2;
            root=nodeData;
         }

         //总结根节点
         if($ele.attr('Type') == 'SummaryTopic'){
            nodeData.eleType = 'SummaryTopic';
            nodeData.nodeType="induce";
            summary.push(nodeData);
         }

         nodes[$ele.attr('ID')] = nodeData;

       }
   
       //callout
       if($ele.attr('Type')&&$ele.attr('Type')=='Callout'){
          var callout={
               nodeId:'',
               color:'#f06',
               rootData:{
                   text:'',
                   id:$ele.attr('ID'),
                   paddingLeft: 6,
                   paddingRight: 6,
                   paddingBottom: 2,
                   paddingTop: 2,
                   fontSize:12
               }
          };

          $ele.children().each(function(i,item){
             if(item.tagName == 'Text'){
                var textArr=$(item).text().trim().split('\n');
                var t=textArr.filter(t=>t.trim().length);
                var text=t.join('<br>');
                
                callout.rootData.text=text;
             }
             if(item.tagName=='Data'){
                callout.nodeId=$(item).attr('V');
             }
          }); 

          mind.calloutData.push(callout);
       }

       //summary
       if($ele.attr('Type')&&$ele.attr('Type')=='Summary'){
            var sd={
               id:$ele.attr('ID'),
               nodes:''
            };
            $ele.children().each(function(i,item){
                if(item.tagName=='BoundaryData'){
                    sd.nodes=$(item).find('Shapes').attr('V');
                };
             }); 
            summaryBoundary[$ele.attr('ID')]=sd;
       }

    }


    combineData(nodes);

    var mainlist=[];
    transferData(root,null,mainlist,true);
    mind.mindData.push(mainlist);

    //summary
    if(summary&&summary.length){
        summary.forEach(item=>{
              var induceData={
                 induceData:{
                     range:'',
                     id:item.id
                 }
               };
               if(item.superids){
                   if(summaryBoundary[item.superids]){
                     var v = summaryBoundary[item.superids].nodes.split(';');
                     induceData.induceData.nodeId=v[0];
                     induceData.induceData.endNodeId=v[0];
                     var mData=[];
                     var da = nodes[item.id];
                     if(da){
                        transferData(da,null,mData);
                     }
                     induceData.mindData=mData;
                     mind.induceData.push(induceData);
                   }
               }
        });
    }
    return mind;
};


function combineData(nodes){
   for(var i in nodes){
       if(nodes[i].childrenIds){
            var cids=nodes[i].childrenIds.split(';');
            if(cids.length){
                cids.forEach(cid=>{
                    if(nodes[cid]){
                        nodes[i].children.push(nodes[cid]);
                        nodes[cid].pid=nodes[i].id;
                    }
                });
            }
       }
   }
}

function transferData(data,parentId,list,mainFlag){
    if(!parentId){
        data.layout={};
        data.layout.layoutName="minder2";
        data.layout.direct="right";
        if(mainFlag){
            data.isRoot=true;
            data.main=true;
            data.x=canvasWidth/2;
            data.y=canvasHeight/2;
        }else{
            data.layout.layoutName="minder1";
        }
    }

    list.push(data);

    data.children&&data.children.forEach(c=>{
        transferData(c,data.id,list);
    });
}


export default importMindmaster;
