import Node from '../node'

export default class Callout {
    constructor(node,data={text:'callout',nodeType:'callout'},color='#f06'){
      this.node=node;
      this.data=data;
      this.color=color;
      this.root=new Node(data,this.node.getMind());
      this.root.nodeType="callout";
      this.root.addClass('node-callout');
      
      this.group=this.node.getMind().calloutGroup;
      this.node.getMind().el.appendChild(this.root.dom);
      this.root.mind=this.node.getMind();
      this.root.refreshBox();
      this.node._refreshBounding();
      this.node.callout=this;
      this.root.callout=this;
    //  this.box={};
      this.direct=this.data.direct||'top';
      this.name='callout';
      this.init();
    }

    init(){
        this.calcLimit()
        this.create();
        this.initEvent();
    }

    off(){
        this.root.dom.removeEventListener('mousedown',this._mouseDown);
    }

    remove(){
        //this.node.getMind().el.removeChild(this.root.dom);
        this.polygon&&this.polygon.remove();
        this.polygon=null;
    }
    move(dx,dy){
        this.point={
            x:this.point.x+dx,
            y:this.point.y+dy
        }

        this.root.move(dx,dy);
        this.refresh()
    }

    calcLimit(){
        var box=this.node.getBox();
        this.limit={
            x:box.x,
            y:box.y,
            width:box.width,
            height:box.height,
            cx:box.x+box.width/2,
            cy:box.y+box.height/2,
            x1:box.x+box.width,
            y1:box.y+box.height
        }
    }

    beforeCreate(){
        !this.polygon&&(this.polygon=this.group.polygon().fill(this.color));
        this.root.dom.setAttribute('draggable',false);
        this.root.dom.classList.add('node-callout');
    }

    create(){

          this.beforeCreate();

          if(this.data.x&&this.data.y){
              
              this.root.setPosition(this.data.x,this.data.y);
           
              if(this.data.box){
                   this.box=this.data.box;
              }

          }else{
              var box=this.root.getBox();
              this.root.setPosition(this.limit.x+this.limit.width/2-box.width/2,this.limit.y-box.height-10);
          }
          
        
          if(this.data.point){
                this.point=this.data.point;
          }else{
              this.point={
                 x:this.limit.cx,
                 y:this.limit.y
              }
          }

          if(!this.box){
            var pos=this.root.getPosition();
            this.box={
               dx:(pos.x-this.limit.x)/this.limit.width,
               dy:(pos.y-this.limit.y)/this.limit.height,
               px:(this.point.x-this.limit.x)/this.limit.width,
               py:(this.point.y-this.limit.y)/this.limit.height
            };
          }


        this.refresh(true);
        
    }

    refresh(flag){

        if(!this.polygon) return;

        if(this.node.isShow()){
            this.show();
        }
        else{
            this.hide();
            return;
        }

        this.calcLimit();
        
        if(!flag){
            this.point.x=this.box.px*this.limit.width+this.limit.x;
            this.point.y=this.box.py*this.limit.height+this.limit.y;
            this.root.setPosition(this.box.dx*this.limit.width+this.limit.x,this.box.dy*this.limit.height+this.limit.y)
        }

        var box=this.root.getBox();

        var c={
          cx:box.x+box.width/2,
          cy:box.y+box.height/2
        }


        if(this.point.x||this.point.y){
            if(this.direct=='top'||this.direct=='bottom'){
                this.polygon.plot(`${this.point.x},${this.point.y} ${c.cx-8},${c.cy} ${c.cx+8},${c.cy}`).fill(this.color);
            }else{
                this.polygon.plot(`${this.point.x},${this.point.y} ${c.cx},${c.cy-8} ${c.cx},${c.cy+8}`).fill(this.color);
            }
        }

        this.root.shapeDom.style.backgroundColor=this.color;

    }

    hide(){
        this.isShow=false;
        this.root.hide();
        this.polygon.hide();
    }

    show(){
        this.isShow=true;
        this.root.show();
        this.polygon.show();
    }
    
    getData(){
        var rootData=this.root.getData();
        rootData.point=this.point
        rootData.box=this.box;
        return {
            nodeId:this.node.getId(),
            rootData,
            color:this.color,
            direct:this.direct
        }
    }

    setData(data){
        this.color=data.color;
    }
    
    getBox(){
        var box=this.polygon.bbox();
      //  console.log(box);
        var nodeBox=this.root.getBox();
        var x=Math.min(box.x,nodeBox.x);
        var y=Math.min(box.y,nodeBox.y);
        var x1=Math.max(box.x2,nodeBox.x+nodeBox.width);
        var y1=Math.max(box.y2,nodeBox.y+nodeBox.height);
        return {
            x,
            y,
            x1,
            y1,
            width:x1-x,
            height:y1-y
        }
    }

  

    initEvent(){
        var drag=false,sx,sy,dx,dy,dx1,dy1,pos;

        function _mouseDown(e){
            if(this.root.isEdit){
                return;
            }
            drag=true;
            sx=e.pageX;
            sy=e.pageY;
            this.px=e.pageX;
            this.py=e.pageY;
            pos=this.root.getPosition();

            var box={...{},...this.box};
            pos.direct=this.direct;
            pos.box=box;

            document.addEventListener('mousemove',this._mouseMove);
            document.addEventListener('mouseup',this._mouseUp);
        }

        this._mouseDown=_mouseDown.bind(this);

        this.root.dom.addEventListener('mousedown',this._mouseDown);

        function _mouseMove(e){
            if(drag){ 
                dx1=e.pageX-this.px;
                dy1=e.pageY-this.py;
                dx=e.pageX-sx;
                dy=e.pageY-sy;
                if(this.point.x<=this.limit.x||this.point.x>=this.limit.x1){
                    this.point.y+=dy1/4
                }else{
                    this.point.x+=dx1/4
                }

                if(this.point.y<=this.limit.y||this.point.y>=this.limit.y1){
                    this.point.x+=dx1/4
                }else{
                    this.point.y+=dy1/4
                }
               
                if(this.point.x<=this.limit.x){
                    this.point.x=this.limit.x;
                    this.direct='left'
                }

                if(this.point.x>=this.limit.x1){
                    this.point.x=this.limit.x1
                    this.direct='right'
                }

                if(this.point.y<=this.limit.y){
                    this.point.y=this.limit.y;
                    this.direct='top'
                }

                if(this.point.y>=this.limit.y1){
                    this.point.y=this.limit.y1
                    this.direct='bottom'
                }
                
                 this.root.setPosition(pos.x+dx,pos.y+dy);

                 this.box={
                     dx:(pos.x+dx-this.limit.x)/this.limit.width,
                     dy:(pos.y+dy-this.limit.y)/this.limit.height,
                     px:(this.point.x-this.limit.x)/this.limit.width,
                     py:(this.point.y-this.limit.y)/this.limit.height
                 }
                //  console.log(this.box);
                 this.refresh(true);
                 this.px=e.pageX;
                 this.py=e.pageY;
             }
        };
        this._mouseMove=_mouseMove.bind(this);

        function _mouseUp(e){
            drag=false;
         
           
            this.node._refreshBounding();
         
            this.refresh();
            this.node.refreshCBox();
           
            // this.node.getMind().refresh();
            // this.node.getMind().updateRelateLink();
             var newPos=this.root.getPosition();
             newPos.box={...{},...this.box};
             newPos.direct=this.direct;
      
             this.node.getMind().execute('movePos',
               {
                 node:this.root,
                 oldPos:pos,
                 newPos:newPos
               }
             )

            document.removeEventListener('mousemove',this._mouseMove);
            document.removeEventListener('mouseup',this._mouseUp);
        }

        this._mouseUp=_mouseUp.bind(this);

       // console.log(112233);
    }
}