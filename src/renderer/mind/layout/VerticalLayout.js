import Layout from './layout';
import theme from "../theme";
import MindLayout from './MindLayout1';

export default class VerticalLayout extends Layout{
    constructor(isCache=true){
        super()
        this.layoutName='vertical';
        this.type='vertical';
        this.dis=40;
        this.direct='vertical';
        this.root=null;
        this.isCache=isCache;
    }

    layout(node,direct){
          var me=this;
    	  this.direct=direct||'vertical';
          this.root=node||this.root;
          if(!this.root.parent){
             this.root.dom.classList.add('node-root');
		  }
          if(!this.group)this.group=this.root.getMind().edgeGroup.group();
          this.root.layout=this;
          
          this._layout();
          this._updateRootAssist();
    }
    _layout(){
       var me=this;
        var mind=this.root.getMind();
        var rootPos=this.root.getPosition();
        var rootbox=this.root.getBox();
        var rootcenter={
            x:rootPos.x+rootbox.width/2,
            y:rootPos.y+rootbox.height
        };
        if(!this.root.isExpand()){
            return;
        }
        this.root.children.forEach((node,index)=>{
            (!node.layout)&&(node.layout=new MindLayout(this.isCache));
            node.layout.root=node;
            var box=node.getBox();
            if(index==0){
                node.setPosition(rootcenter.x-box.width/2,rootcenter.y+this.dis);
            }
            else{
                var prevNode=this.root.children[index-1];
                var rect=mind.getBBox(prevNode);
                node.boundingRect=rect;
                var y=rect.bottom;
                node.setPosition(rootcenter.x-box.width/2,y+this.dis);
            }
            node.layout.layout(node,node.layout.direct||this.direct||'');

            if(node.callout){
                node.callout.refresh();
            }

            var pos=node.getPosition();
            var box=mind.getBBox(node);
          
            var dy=Math.abs(pos.y-box.y);
            this.moveNode(node,0,dy);

            node.dom.classList=[];
	     	node.dom.classList.add('node');
		    node.dom.classList.add('node-down');

            if(node.isLeaf()){
                if(!node.dom.classList.contains('node-leaf')){
                    node.dom.classList.add('node-leaf');
                }
            }else{
                if(node.dom.classList.contains('node-leaf')){
                    node.dom.classList.remove('node-leaf');
                }
            }
            this._updateNodeAssist(node,me.root);
        });
        this._updateNodeAssist(this.root,this.root);

    }

    createLink(){
        var cs=this.root.children;
        var len=cs.length;
        this.group&&this.group.clear();
        
        if(!this.group){
            return
        }
        
        if(len==0){
            return;
        }
        let config=theme.use().config;
        let stroke=config['stroke'];
        var lastNode=cs[len-1];
        let lineWidth=config['lineWidth'];
        var rootPos=this.root.getPosition();
        var rootbox=this.root.getBBox();
        var box=lastNode.getBBox();
        var pos=lastNode.getPosition();
        
        var x1=rootPos.x+rootbox.width/2,
            x2=x1,
            y1=rootPos.y+rootbox.height,
            y2=pos.y;;
     
        this.group.line(x1, y1, x2, y2).stroke({ color: stroke, width: lineWidth, linecap: 'round', linejoin: 'round' });
        cs.forEach(c=>{
            c.layout.createLink();
        });
    }

    refresh(){
        this.layout(this.root,this.direct);
        this.createLink();
    }

}
