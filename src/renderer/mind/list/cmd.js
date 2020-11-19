import Command from '../command/command'


function getNextNode(node){
    // console.log(node.isExpand);
     if(node.isExpand&&node.childrenDom.children.length){
          return node.childrenDom.children[0].node;
     }else{
         var n=null;
         var anchor=node;
         while(anchor){
            if(anchor.liDom.nextSibling){
               if(anchor.liDom.nextSibling.node){
                   n=anchor.liDom.nextSibling.node;
                   break;
               }
           }
           anchor=anchor.parent;
       }
     }
    return n;
}

function getPrevNode(node){
       var n=null;
       var anchor=node;
       if(anchor.liDom.previousSibling){
           var ns=getChildNode(anchor.liDom.previousSibling);
           if(ns){
               n=ns;
           }else{
               n=anchor.liDom.previousSibling.node;
           }
       }else{
           n=anchor.parent;
       }

    return n;
};

function getChildNode(dom){
var anchor=dom.node;

if(anchor.isExpand&&anchor.childrenDom){
        var lastChild=anchor.childrenDom.lastElementChild;
        if(lastChild){
            anchor=getChildNode(lastChild);
        }
 }

return anchor;
};

function insertAfter(newEl, targetEl){
   var parentEl = targetEl.parentNode;
           
   if(parentEl.lastChild == targetEl)
   {
       parentEl.appendChild(newEl);
   }else
   {
       parentEl.insertBefore(newEl,targetEl.nextSibling);
   }            
};


class AddNode extends Command{         //添加子节点
    constructor(node,parent,index){
        super('addNode');
        this.node=node;
        this.parent=parent;
        this.index=index;
    }

    execute(){
        this.parent.childrenDom.insertBefore(this.node.liDom,this.parent.childrenDom.childNodes[0]);
        this.parent.addChild(this.node);
    }

    undo(){
        this.index=this.parent.removeChild(this.node);
        this.parent.removeChild(this.node);
        this.parent.childrenDom.removeChild(this.node.liDom);
    }

}

class AddSameNode extends Command{      //添加同级节点
    constructor(node,prevNode,parent,index){
        super('addSameNode')
        this.node=node;
        this.parent=parent;
        this.prevNode=prevNode;
        this.index=index;
    }

    execute(){
           this.parent.addChild(this.node,this.index);
           insertAfter(this.node.liDom,this.prevNode.liDom);
           this.parent.list.selecNode(this.node);
           this.node.keepFocusEnd();
    }
    
    undo(){
        var prevNode=getPrevNode(this.node)||this.parent;
         this.parent.childrenDom.removeChild(this.node.liDom);
         this.parent.removeChild(this.node);
         prevNode.list.selecNode(this.parent);
         prevNode.keepFocusEnd();
    }
}

class TabNode extends Command{
    constructor(node,index,oldParent,parent){
        super('tabNode')
        this.node=node;
        this.index=index;
        this.parent=parent;
        this.oldParent=oldParent;
    }
    execute(){
        this.oldParent.removeChild(this.node);
        this.oldParent.childrenDom.removeChild(this.node.liDom);
        this.node.list.addNode(this.node,this.parent);
        this.parent.childrenDom.appendChild(this.node.liDom);
        this.node.parent=this.parent;
        this.parent.list.selecNode(this.node);
        setTimeout(()=>{
            this.node.keepFocusEnd();
        },0)
        this.refreshClass()
    }
    undo(){
       this.parent.removeChild(this.node);
       this.parent.childrenDom.removeChild(this.node.liDom);
       this.oldParent.addChild(this.node,this.index);
       if(this.index==0){
          this.oldParent.childrenDom.insertBefore(this.node.liDom,this.oldParent.childrenDom.childNodes[0]);
       }else{
          insertAfter(this.node.liDom,this.oldParent.childrenDom.childNodes[this.index-1]);
       }
       this.oldParent.list.selecNode(this.node);
       setTimeout(()=>{
           this.node.keepFocusEnd();
       },0)
       this.refreshClass()
    }
    refreshClass(){
        this.oldParent.refreshClass()
        this.parent.refreshClass()
        this.node.refreshClass()
    }
}

class ShiftTabNode extends Command{
    constructor(node,oldParent,newParent){
        super('shiftTabNode');
        this.node=node;
        this.oldParent=oldParent;
        this.newParent=newParent;
    }
    execute(){
        this.index=this.oldParent.children.indexOf(this.node);   //保存原 第几个子节点
        var index=this.newParent.children.indexOf(this.oldParent);
        this.oldParent.removeChild(this.node);
        this.oldParent.childrenDom.removeChild(this.node.liDom);
        this.node.list.addNode(this.node,this.newParent,index+1);
        this.node.parent=this.newParent;
        insertAfter(this.node.liDom,this.oldParent.liDom);
        this.newParent.list.selecNode(this.node);
        this.node.keepFocusEnd();
        this.refreshClass()
    }
    undo(){
        this.newParent.removeChild(this.node);
        this.newParent.childrenDom.removeChild(this.node.liDom);
        this.oldParent.addChild(this.node,this.index);

        if(this.index==0){
            this.oldParent.childrenDom.insertBefore(this.node.liDom,this.oldParent.childrenDom.childNodes[0]);
        }else{
            insertAfter(this.node.liDom,this.oldParent.childrenDom.childNodes[this.index-1]);
        }

        this.oldParent.list.selecNode(this.node);
        this.node.keepFocusEnd();
        this.refreshClass();
    }
    refreshClass(){
        this.oldParent.refreshClass()
        this.newParent.refreshClass()
        this.node.refreshClass()
    }
}

class ShiftCtrlTabNode extends Command{
    constructor(node,oldParent,newParent){
        super('shiftCtrlTabNode')
        this.node=node;
        this.oldParent=oldParent;
        this.newParent=newParent;
        this.cache=[]
    }
    execute(){
            this.index=this.oldParent.children.indexOf(this.node);
            this.oldParent.children.forEach((c,i)=>{
                if(i>=this.index){
                    this.cache.push(c);
                }
            });

            this.cache.forEach(c=>{
                 this.oldParent.removeChild(c);
                 this.oldParent.childrenDom.removeChild(c.liDom);
            });

            var index=this.newParent.children.indexOf(this.oldParent);
            index++;
            this.newParent.addChild(this.node,index);
            insertAfter(this.node.liDom,this.oldParent.liDom);
            this.cache.forEach((c,i)=>{
                if(i!=0){
                    //this.node.addChild(c);
                    this.node.children.push(c);
                    c.parent=this.node;
                    var length=this.node.children.length;
                    if(length==1){
                        this.node.childrenDom.insertBefore(c.liDom,this.node.childrenDom.childNodes[0]);
                    }else{
                       insertAfter(c.liDom,this.node.childrenDom.childNodes[length-2]);
                    }
                }
            });
            this.refreshClass();
    }
    undo(){
       this.newParent.removeChild(this.node);
       this.newParent.childrenDom.removeChild(this.node.liDom);
       this.cache.forEach((c,i)=>{
           if(i!=0){
               this.node.removeChild(c);
               this.node.childrenDom.removeChild(c.liDom)
           }
       });
       this.oldParent.addChild(this.node,this.index);
      
       if(this.index==0){
           this.oldParent.childrenDom.insertBefore(this.node.liDom,this.oldParent.childrenDom.childNodes[0]);
       }else{
           insertAfter(this.node.liDom,this.oldParent.childrenDom.childNodes[this.index-1]);
       }
       var preDom=this.node.liDom;
       this.index++;
       var index=this.index;
       this.cache.forEach((c,i)=>{
           if(i!=0){
               this.oldParent.addChild(c,index);
               insertAfter(c.liDom,preDom);
               index++;
               preDom=c.liDom;
           }
       });
       this.refreshClass();
    }
    refreshClass(){
        this.oldParent.refreshClass()
        this.newParent.refreshClass()
        this.node.refreshClass()
    }
}

class DragNode extends Command{
    constructor(node,oldParent,newParent,dropNode,type){
        super('dragNode');
        this.node=node;
        this.oldParent=oldParent;
        this.newParent=newParent;
        this.dropNode=dropNode;
        this.type=type
    }
    execute(){
        this.index=this.oldParent.removeChild(this.node);
        this.oldParent.childrenDom.removeChild(this.node.liDom);

        if(this.type=='top'){
            var index=this.newParent.children.indexOf(this.dropNode);
            this.newParent.addChild(this.node,index);
            this.dropNode.liDom.parentNode.insertBefore(this.node.liDom,this.dropNode.liDom);
        }
        else{
           var index=this.newParent.children.indexOf(this.dropNode);  
           this.newParent.addChild(this.node,index+1);
           insertAfter(this.node.liDom,this.dropNode.liDom);
        }

        this.refreshClass();

    }
    undo(){
         this.newParent.removeChild(this.node);
         this.newParent.childrenDom.removeChild(this.node.liDom);

         this.oldParent.addChild(this.node,this.index);
         if(this.index==0){
            this.oldParent.childrenDom.insertBefore(this.node.liDom,this.oldParent.childrenDom.childNodes[0]);
        }else{
            insertAfter(this.node.liDom,this.oldParent.childrenDom.childNodes[this.index-1]);
        }

        this.refreshClass();
    }
    refreshClass(){
        this.oldParent.refreshClass()
        this.newParent.refreshClass()
       // this.dropNode.refreshClass()
        this.node.refreshClass()
    }
}

class RemoveNode extends Command{
    constructor(node,parent){
        super('removeNode');
        this.node=node;
        this.parent=parent;
        
    }
    execute(){
        this.index=this.parent.removeChild(this.node);
        this.parent.childrenDom.removeChild(this.node.liDom);
        this.refreshClass();
    }
    undo(){
        if(this.index==0){
           this.parent.addChild(this.node);
           this.parent.childrenDom.insertBefore(this.node.liDom,this.parent.childrenDom.childNodes[0]);
        }else{
            insertAfter(this.node.liDom,this.parent.childrenDom.childNodes[this.index-1]);
            this.parent.addChild(this.node,this.index);
        }

        this.node.list.selecNode(this.node);
        this.node.keepFocusEnd();
        this.refreshClass();
    }
    refreshClass(){
        this.parent.refreshClass();
    }
}

class ChangeText extends Command{
    constructor(node,oldText,newText){
        super('changeText');
        this.node=node;
        this.oldText=oldText;
        this.newText=newText;
    }
    execute(){
        this.node.textDom.blur();
        this.node.setMdText(this.newText);
    }
    undo(){
        this.node.textDom.blur();
        this.node.setMdText(this.oldText);
    }
}

class ChangeNode extends Command{
    constructor(node,oldData,newData){
        super('changeNode');
        this.node=node;
        this.oldData=oldData;
        this.newData=newData
    }
    execute(){
        this.node.setPlainData(this.newData)
    }
    undo(){
        this.node.setPlainData(this.oldData);
    }
}

class ExpandNode extends Command {
    constructor(node){
        super('expandNode');
        this.node=node;
    }
    execute(){
        this.node.expand()
    }
    undo(){
        this.node.collapse()
    }
}

class CollapseNode extends Command {
    constructor(node){
        super('CollapseNode');
        this.node=node;
        
    }
    execute(){
        this.node.collapse()
    }
    undo(){
        this.node.expand()
    }
}

class ReplaceText extends Command{
    constructor(node,word,replaceWord){
        super('replaceText');
        this.node=node;
        this.word=word;
        this.replaceWord=replaceWord;
        this.oldText=this.node.data.mdText;
    }
    execute(){
        var re=new RegExp(this.word,'ig');
        var mdText= this.node.data.mdText.replace(re,this.replaceWord);
        this.node.setMdText(mdText);
    }
    undo(){
        this.node.setMdText(this.oldText);
    }
}

//多个命令同时执行
class ManyCommand extends Command{
    constructor(cmd){
        super('manyCmd');
        this.cmd=cmd;
    }
    execute(){
        this.cmd.forEach(cmd=>cmd.execute())
    }
    undo(){
        this.cmd.forEach(cmd=>cmd.undo());
    }
}

class DragNodes extends Command{
    constructor(nodes,oldParent,newParent,dropNode,type){
        super('dragNodes');
        this.nodes=nodes;
        this.oldParent=oldParent;
        this.newParent=newParent;
        this.dropNode=dropNode;
        this.type=type;
        this.cache=[];
    }
    execute(){
         var me=this;
         var preNode=null,preIndex;
          //第一步 删除旧节点
          this.nodes.forEach((n,i)=>{
            if(i==0){
                 var index=me.oldParent.removeChild(n);
                 me.oldParent.childrenDom.removeChild(n.liDom);
                 me.cache.push({
                     index,
                     node:n
                 });
                 preIndex=index;
             }else{
                me.oldParent.removeChild(n)
                me.oldParent.childrenDom.removeChild(n.liDom);
                preIndex++
                me.cache.push({
                    index:preIndex,
                    node:n
                });
             }
         });

         if(this.type=="down"){
            //第二步 添加进新的节点
            var newPreIndex,newPreNode;
            this.nodes.forEach((n,i)=>{
                if(i==0){
                    newPreIndex=me.newParent.children.indexOf(me.dropNode);
                    newPreIndex++
                    me.newParent.addChild(n,newPreIndex);
                   //me.dropNode.liDom.parentNode.insertBefore(n.liDom,me.dropNode.liDom);
                   insertAfter(n.liDom,me.dropNode.liDom);
                }
                else{
                    newPreIndex++;
                    me.newParent.addChild(n,newPreIndex);
                    insertAfter(n.liDom,newPreNode.liDom);
                }
                newPreNode=n;
            });

         }else{
            
             //第二步 添加进新的节点
             var newPreIndex,newPreNode;
             this.nodes.forEach((n,i)=>{
                 if(i==0){
                     newPreIndex=me.newParent.children.indexOf(me.dropNode);
                    //newPreIndex++
                     me.newParent.addChild(n,newPreIndex);
                     me.dropNode.liDom.parentNode.insertBefore(n.liDom,me.dropNode.liDom);
                    // insertAfter(n.liDom,me.dropNode.liDom);
                 }
                 else{
                    // newPreIndex++;
                     var index = me.newParent.children.indexOf(newPreNode);
                     index++
                     me.newParent.addChild(n,index);
                     insertAfter(n.liDom,newPreNode.liDom);
                 }
                 newPreNode=n;
             });
         }
    }
    undo(){
        var me=this;
        //删除节点
        this.nodes.forEach(n=>{
            me.newParent.removeChild(n);
            me.newParent.childrenDom.removeChild(n.liDom);
        });
         var preNode=null;
        this.cache.forEach((c,i)=>{
             me.oldParent.addChild(c.node,c.index);
            if(i==0){
                if(c.index==0){
                   me.oldParent.childrenDom.insertBefore(c.node.liDom,me.oldParent.childrenDom.childNodes[0]);
                }else{
                   insertAfter(c.node.liDom,me.oldParent.childrenDom.childNodes[c.index-1]);
                }
            }
            else{
                insertAfter(c.node.liDom,preNode.liDom);
            }
            preNode=c.node;
        });
    }
}


class TabNodes extends Command{
    constructor(nodes,index,oldParent,parent){
        super('tabNodes');
        this.nodes=nodes;
        this.index=index;
        this.oldParent=oldParent;
        this.parent=parent;
    }
    execute(){
        this.nodes.forEach(n=>{
            this.oldParent.removeChild(n);
            this.oldParent.childrenDom.removeChild(n.liDom)
        });
        var index=this.parent.parent.children.indexOf(this.parent)
        this.nodes.forEach((n,i)=>{
           this.parent.addChild(n,index+1+i);
           this.parent.childrenDom.appendChild(n.liDom);
        });
    } 

    undo(){
        this.nodes.forEach(n=>{
            this.parent.removeChild(n);
            this.parent.childrenDom.removeChild(n.liDom)
        });

       this.nodes.forEach((n,i)=>{
            this.oldParent.addChild(n,this.index+i);
            insertAfter(n.liDom,this.oldParent.childrenDom.childNodes[this.index+i-1]);
       });

    }
}


class ShiftTabNodes extends Command{
    constructor(nodes,oldParent,newParent){
        super('shiftTabNodes');
        this.nodes=nodes;
        this.oldParent=oldParent;
        this.newParent=newParent;
    }
    execute(){
        this.index=this.oldParent.children.indexOf(this.nodes[0]);
        var index=this.newParent.children.indexOf(this.oldParent);
        
        this.nodes.forEach(n=>{
            this.oldParent.removeChild(n);
            this.oldParent.childrenDom.removeChild(n.liDom);
        });
        
        var preNode=this.oldParent;
        this.nodes.forEach((n,i)=>{
            this.newParent.addChild(n,index+1+i);
            insertAfter(n.liDom,preNode.liDom);
            preNode=n;
        });

    }
    undo(){

        this.nodes.forEach(n=>{
            this.newParent.removeChild(n);
            this.newParent.childrenDom.removeChild(n.liDom);
        });
       
        this.nodes.forEach((n,i)=>{
            this.oldParent.addChild(n,this.index+i);
            if(i==0){
                if(this.index==0){
                    this.oldParent.childrenDom.insertBefore(n.liDom,this.oldParent.childrenDom.childNodes[0]);
                }else{
                    insertAfter(n.liDom,this.oldParent.childrenDom.childNodes[this.index-1]);
                }
            }else{
                 insertAfter(n.liDom,this.oldParent.childrenDom.childNodes[this.index+i-1]);
            }
        });
     
    }
}






export {
    ChangeText,
    ChangeNode,
    ExpandNode,
    CollapseNode,
    AddNode,
    RemoveNode,
    AddSameNode,
    TabNode,
    ShiftTabNode,
    DragNode,
    ReplaceText,
    ManyCommand,
    DragNodes,
    ShiftCtrlTabNode,
    TabNodes,
    ShiftTabNodes
}