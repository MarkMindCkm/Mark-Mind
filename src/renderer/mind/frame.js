export default class Frame {
    constructor(node,resizeDom,type='image'){
        this.node=node;
        this.resizeDom=resizeDom;
        this.type=type;
        this.init();
        this._addEvent();
    } 
    init(){
        this.frame=document.createElement('div');
        this.bar=document.createElement('div');
        this.frame.className='resize-frame';
        this.bar.className='resize-bar iconfont icon-resize';
        this.bar.style="position:absolute;width:20px;height:20px;right:0;bottom:0;color:#333;z-index:8000;cursor:nw-resize";
        this.frame.appendChild(this.bar);
        this._refreshFrame();
       
        this.node.dom.appendChild(this.frame);
        
    }

    _refreshFrame(){
        if(this.type=='image'){
            var left=this.resizeDom.offsetLeft;
            var top=this.resizeDom.offsetTop;
        }else{
            var left=0;
            var top=0;
        }
        var w=this.resizeDom.offsetWidth;
        var h=this.resizeDom.offsetHeight;
        this.frame.style=`background:rgba(255,255,255,.3);width:${w}px;height:${h}px;position:absolute;left:${left}px;top:${top}px;border:1px solid blue;text-align:right`
    }

    remove(){
        this.frame&&this.node.dom.removeChild(this.frame);
        this.bar.removeEventListener('click',this._click);
        this.bar.removeEventListener('mousedown',this._mouseDown);
        document.removeEventListener('mousemove',this._mouseMove);
        document.removeEventListener('mouseup',this._mouseUp);
        this.frame=null;
        this.node.imageMark=null;
    }

    _click(e){
        e.stopPropagation();
    } 

    _mouseDown(e){
        e.stopPropagation();
        this.sx=e.pageX;
        this.sy=e.pageY;
        this.drag=true;
        this.oldw=this.resizeDom.offsetWidth;
        this.oldh=this.resizeDom.offsetHeight;
        this.node.dom.setAttribute('draggable',false);
        this.resizeDom.setAttribute('draggable',false);
        this.node.dom.style.zIndex=50;
        this.func1=this._mouseMove.bind(this);
        this.func2=this._mouseUp.bind(this);
        document.addEventListener('mousemove',this.func1);
        document.addEventListener('mouseup',this.func2);
      
        this.node.getMind().emit('hide');
       
      
    }

    _mouseMove(e){
        if(this.drag){
            var x=e.pageX;
            var y=e.pageY;
            this.dx=x-this.sx;
            this.dy=y-this.sy;
            this.resizeDom.style.width=this.oldw+this.dx+'px';
            this.resizeDom.style.height=this.oldh+this.dy+'px';
            this.frame.style.width=this.oldw+this.dx+'px';
            this.frame.style.height=this.oldh+this.dy+'px';
            if(this.type=='image'){
                var left=this.resizeDom.offsetLeft;
                var top=this.resizeDom.offsetTop;
                this.frame.style.left= `${left}px`;
                this.frame.style.top=`${top}px`;
            }
            this.node.refreshBox();
        }
    }

    _mouseUp(){
        this.drag=false;
        this.node._refreshBounding();
        this.node.refreshBox();
        document.removeEventListener('mousemove',this.func1);
        document.removeEventListener('mouseup',this.func2);
        this.node.dom.setAttribute('draggable',true);
        this.resizeDom.setAttribute('draggable',true);
        this.node.dom.style.zIndex=this.node.data.z;
        var w=this.resizeDom.offsetWidth;
        var h=this.resizeDom.offsetHeight;

        this.remove();

        if(this.type=='image'){
            this.node.getMind().execute('changeNode',{
                nodes:[this.node],
                data:{
                   key:'imageSize',
                   imageWidth:w,
                   imageHeight:h
               } 
            });
            
        }else{
            this.node.getMind().execute('changeNode',{
                nodes:[this.node],
                data:{
                   key:'nodeSize',
                   nodeWidth:w,
                   nodeHeight:h
               }
            });
        }
    }

    _addEvent(){
        this.drag=false;
        this.sx=0;
        this.sy=0;
        this.dx=0;
        this.bar.addEventListener('click',this._click.bind(this));
        this.bar.addEventListener('mousedown',this._mouseDown.bind(this));
    }

}