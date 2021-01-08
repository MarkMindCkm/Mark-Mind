import Node from '../node'
import connection from '../path/connection'
import polylineCenter from '../util/polylineCenter'
export default class RelateLink{
    constructor(startNode,data){
         var defaultOps={
            'color':'#f06',
            'width':2,
            'nodeData':{
                'text':'label',
                'nodeType':'relateLink',
                'backgroundColor':'#f06'
             },
            'type':'bs',
            'dashArray':[0],
            'nodeHide':false,
            'startMarker':'circle',
            'endMarker':'arrow'
          };

          this.startNode=startNode;
          this.mind=this.startNode.getMind();
         
          this.data={...defaultOps,...(data||{})};
          this.group=this.startNode.getMind().draw.group();
          this.draw=this.startNode.getMind().draw;
          this.box={
              x:0,
              y:0,
              x1:0,
              y1:0,
              cpx1:0,
              cpy1:0,
              cpx2:0,
              cpy2:0,
              startDirect:'',
              startDx:0,
              startDy:0,
              endDirect:'',
              endDx:0,
              endDy:0
          }

          this.entryExt = 20;
          this.exitExt = 20;
          this.entryDirection=[0,1];
          this.exitDirection=[0,1];

          this.isAdd=true;
          this.name='relateLink';
          this.actived=true;
          this.isShow=true;

          this.create();
          this.calcLimit();
          this.setStartPoint();
          this._addEvent();
          this.active();
          this.added=true;
    }


    
    create(){
 
        this.textNode=new Node(this.data.nodeData,this.mind);

        this.textNode.dom.classList.add('node-relate');
        this.textNode.relateLink=this;
        this.textNode.dom.setAttribute('draggable',false);

        this.line1=this.group.line().stroke({color:'#666',width:1,linecap: 'round', linejoin: 'round'}).hide();
        this.line2=this.group.line().stroke({color:'#666',width:1,linecap: 'round', linejoin: 'round'}).hide();
        
        if(this.data.type=='bs'){
            this.bs=this.group.path();
        }
        else if(this.data.type=='line'){
            this.bs=this.group.line();
        }
        else{
            this.bs=this.group.polyline();
        }
        
        this.bs.stroke({cursor:'pointer',color: this.data.color, width: this.data.width, dasharray:this.data.dashArray,linecap: 'round', linejoin: 'round' }).fill('none');
       
        this.createMarker();
       
        this.corl1=document.createElement('div');
        this.corl1.className="relate-ctrl";
        this.corl1.style=`cursor:move;position:absolute;z-index:1000;width:10px;height:10px;border-radius:50%;background:${this.data.color}`
        this.corl2=document.createElement('div');
        this.corl2.className="relate-ctrl";
        this.corl2.style=`cursor:move;position:absolute;z-index:1000;width:10px;height:10px;border-radius:50%;background:${this.data.color}`
      
        this.corl1.setAttribute('nochilddrag',true);
        this.corl1.setAttribute('direct','start');
        this.corl2.setAttribute('nochilddrag',true);
        this.corl2.setAttribute('direct','end');

        this.mind.el.appendChild(this.corl1);
        this.mind.el.appendChild(this.corl2);
        this.mind.el.appendChild(this.textNode.dom);

    }

    createMarker(){

        var that=this;

        if(this.startMarker){
            this.startMarker.remove();
        }

        if(this.endMarker){
            this.endMarker.remove();
        }

        if(this.data.startMarker=='circle'){
            this.startMarker=this.draw.marker(8,8,function(add){
                add.circle(4).center(4,4).fill(`${that.data.color}`)
            });
           
        }else if(this.data.startMarker=='rect'){
            this.startMarker = this.draw.marker( 4, 4, function(add) {
                add.rect(4,4).fill(`${that.data.color}`)
            });
        }else if(this.data.startMarker=='line'){
            this.startMarker = this.draw.marker(2, 6, function(add) {
                add.rect(1,6).fill(`${that.data.color}`);
            });
        }else if(this.data.startMarker=='arrow'){
            this.startMarker=this.draw.marker(5,4,function(add){
                add.polygon('0,0,5,2,0,4');
                this.fill(`${that.data.color}`);
            });
        }else if(this.data.startMarker=='arrow1'){
            this.startMarker=this.draw.marker(5,4,function(add){
                add.polygon('5,0,0,2,5,4');
                this.fill(`${that.data.color}`);
            });
        }else{
            if(this.startMarker){
                this.startMarker.remove();
                this.startMarker=null;
            }
        }

        if(this.startMarker){
            this.bs.marker('start',this.startMarker);
        }

        if(this.data.endMarker=='circle'){
            this.endMarker=this.draw.marker(8,8,function(add){
                add.circle(4).center(4,4).fill(`${that.data.color}`)
            });
           
        }else if(this.data.endMarker=='rect'){
            this.endMarker = this.draw.marker( 4, 4, function(add) {
                add.rect(4,4).fill(`${that.data.color}`)
            });
        }else if(this.data.endMarker=='line'){
            this.endMarker = this.draw.marker(2, 6, function(add) {
                add.rect(1,6).fill(`${that.data.color}`);
            });
        }else if(this.data.endMarker=='arrow'){
            this.endMarker=this.draw.marker(5,4,function(add){
                add.polygon('0,0,5,2,0,4');
                this.fill(`${that.data.color}`);
            });
        }else if(this.data.endMarker=='arrow1'){
            this.endMarker=this.draw.marker(5,4,function(add){
                add.polygon('5,0,0,2,5,4');
                this.fill(`${that.data.color}`);
            });
        }else{
            if(this.endMarker){
                this.endMarker.remove();
                this.endMarker=null;
            }
        }

        if(this.endMarker){
            this.bs.marker('end',this.endMarker);
        }
    }

    remove(){
        this.group.remove();
        this.mind.el.removeChild(this.corl1);
        this.mind.el.removeChild(this.corl2);
        this.mind.el.removeChild(this.textNode.dom);
    }

    off(){
        this.mind.draw.off('mousemove',this.drawFunc1);
        this.mind.draw.off('mouseup',this.drawFunc2);
    }

    offEvent(){
        this.corl1.removeEventListener('mousedown',this.func);
        this.corl2.removeEventListener('mousedown',this.func);
        this.corl1.removeEventListener('click',this.clickFn);
        this.corl2.removeEventListener('click',this.clickFn);
        this.off();
    }

    calcLimit(){
         var box=this.startNode.getBox();
         this.startBox=box;
         this.startLimit={
             x:box.x-6,
             y:box.y-6,
             x1:box.x+box.width+6,
             y1:box.y+box.height+6,
             cx:box.width/2+box.x,
             cy:box.height/2+box.y
         };

         if(this.endNode){
            var box=this.endNode.getBox();
            this.endBox=box;
            this.endLimit={
                x:box.x-6,
                y:box.y-6,
                x1:box.x+box.width+6,
                y1:box.y+box.height+6,
                cx:box.width/2+box.x,
                cy:box.height/2+box.y
            };
         }
    }

    active(){
        this.actived=true;
        this.corl1.style.display='block';
        this.corl2.style.display='block';
        this.line1.show();
        this.line2.show();
        this.addEvent();
    }

    unactive(){
        this.actived=false;
        this.corl1.style.display='none';
        this.corl2.style.display='none';
        this.line1.hide();
        this.line2.hide();
        this.offEvent();
    }

    hide(){
        this.unactive();
        this.isShow=false;
        this.textNode&&this.textNode.hide();
        this.group.hide();
    }

    show(){
        this.isShow=true;
        this.group.show();
    }

    calcDirect(){
       
        var p1={
            x:this.startLimit.cx,
            y:this.startLimit.cy
        }
        var p2={
            x:this.endLimit.cx,
            y:this.endLimit.cy
        }

        var direct=this.calcPos(p1,p2);
    
        switch(direct){
            case 'lefttop':
                 this.box.x=p1.x;
                 this.box.y=this.startLimit.y;
                break;
            case 'leftbottom':
                 this.box.x=p1.x;
                 this.box.y=this.startLimit.y1;
                 break;
            case 'righttop':
                this.box.x=p1.x;
                 this.box.y=this.startLimit.y;
                break;
            case 'rightbotom':
                 this.box.x=p1.x;
                 this.box.y=this.startLimit.y1;
             break;
        }

      
        this.calcPoint();  
        this.clacDD();
        this.refresh();
    }

  

    clacDD(){

        this.startBox=this.startNode.getBox();
        this.endBox=this.endNode.getBox();
        
        this.data.startDirect=this.calcStroke({
            x:this.box.x,
            y:this.box.y
        },this.startBox);

        this.data.endDirect=this.calcStroke({
            x:this.box.x1,
            y:this.box.y1
        },this.endBox);


        this.data.startDx=(this.box.x-this.startBox.x)/this.startBox.width;
        this.data.startDy=(this.box.y-this.startBox.y)/this.startBox.height;
        this.data.endDx=(this.box.x1-this.endBox.x)/this.endBox.width;
        this.data.endDy=(this.box.y1-this.endBox.y)/this.endBox.height;

        this.data.gapsx=this.box.cpx1- this.startBox.x;
        this.data.gapsy=this.box.cpy1- this.startBox.y;
        this.data.gapex=this.box.cpx2- this.endBox.x;
        this.data.gapey=this.box.cpy2- this.endBox.y;

    }

    //calc control points
    calcPoint(){
        var w=this.box.x1-this.box.x;
        var h=this.box.y1-this.box.y;
        
        this.box.cpx1=this.box.x+w/6;
        this.box.cpy1=this.box.y+h/6;
        this.box.cpx2=this.box.x+w/6*5;
        this.box.cpy2=this.box.y+h/6*5;
    }

    calcStroke(p,box){
      
        var mark=''
        if(Math.abs(p.x-box.x+4)<=2){
            mark+= 'left'
        }
        if(Math.abs(p.x-box.x-box.width-4)<=2){
            mark+= 'right'
        }
        if(Math.abs(p.y-box.y+4)<=2){
            mark+= 'top'
        }
        if(Math.abs(p.y-box.y-box.height-4)<=2){
            mark+= 'bottom'
        }
        
        return mark;
    }

    _update(){

        this.startNode&&(this.startBox=this.startNode.getBox());
        this.endNode&&(this.endBox=this.endNode.getBox());

        this.box.x=this.startBox.x+this.data.startDx*this.startBox.width;
        this.box.y=this.startBox.y+this.data.startDy*this.startBox.height;

        this.box.x1=this.endBox.x+this.data.endDx*this.endBox.width;
        this.box.y1=this.endBox.y+this.data.endDy*this.endBox.height;

        this.box.cpx1=this.startBox.x+this.data.gapsx;
        this.box.cpy1=this.startBox.y+this.data.gapsy;
        this.box.cpx2=this.endBox.x+this.data.gapex;
        this.box.cpy2=this.endBox.y+this.data.gapey;
        
    }

    refresh(flag){
       
        if(this.startNode&&this.endNode){
            if(this.startNode.isShow()&&this.endNode.isShow()){
                this.show();
            }else{
                this.hide();
                return;
            }
        }

        if(!this.data.nodeHide){
            this.textNode.show();
        }else{
            this.textNode.hide();
        }

        if(flag){
            this._update();
        }

        if(this.data.type=='line'){
            this.bs.plot(this.box.x,this.box.y,this.box.x1,this.box.y1);
            var point = {x:(this.box.x+this.box.x1)/2,y:(this.box.y+this.box.y1)/2};
            var box=this.textNode.getDomBox();
            this.textNode.setPosition(point.x-box.width/2,point.y-box.height/2);
        }
        else if(this.data.type=='bs'){
            var path=`M${this.box.x} ${this.box.y}  C ${this.box.cpx1} ${this.box.cpy1}, ${this.box.cpx2} ${this.box.cpy2}, ${this.box.x1} ${this.box.y1}`;
            this.bs.plot(path);
            var length = this.bs.length();
            var point = this.bs.pointAt(length/2);
            var box=this.textNode.getDomBox();
            this.textNode.setPosition(point.x-box.width/2,point.y-box.height/2);
        }
        else{
            let obj = {
                entryPoint: [this.box.x, this.box.y],
                exitPoint: [this.box.x1, this.box.y1],
                entryDirection: this.entryDirection,
                exitDirection: this.exitDirection,
                entryExt: this.entryExt,
                exitExt: this.exitExt
            };

            var ps = connection(obj);
            var points = [];

            ps.forEach(item => {
                points.push(item.position);
            });

            if (this.data.width % 2 == 1) {
                points.forEach(item => {
                    item[0] = parseInt(item[0]) + 0.5;
                    item[1] = parseInt(item[1]) + 0.5;
                });
            } else {
                points.forEach(item => {
                    item[0] = parseInt(item[0]);
                    item[1] = parseInt(item[1]);
                });
            }

            var p=polylineCenter(points);
            var box=this.textNode.getDomBox();
            this.textNode.setPosition(p[0]-box.width/2,p[1]-box.height/2);
           
            this.bs.plot(points);
        }


        this.bs.stroke({color:this.data.color, width: this.data.width, dasharray:this.data.dashArray,linecap: 'round', linejoin: 'round'}).fill('none');
        this.createMarker();

        this.bs.attr('cursor','pointer');
        this.corl1.style.left=this.box.cpx1-5+'px';
        this.corl1.style.top=this.box.cpy1-5+'px';

        this.corl2.style.left=this.box.cpx2-5+'px';
        this.corl2.style.top=this.box.cpy2-5+'px';
      
        this.line1.plot(this.box.x,this.box.y,this.box.cpx1,this.box.cpy1);
        this.line2.plot(this.box.x1,this.box.y1,this.box.cpx2,this.box.cpy2);
    }

    select(){
        this.isSelect=true;
    }

    unSelect(){
        this.isSelect=false;
    }

    calcPos(point1,point2){
      
        if(point2.x<=point1.x&&point2.y<=point1.y){
            return 'lefttop';
        }
        else if(point2.x<=point1.x&&point2.y>point1.y){
            return 'leftbottom';
        }
        else if(point2.x>point1.x&&point2.y<=point1.y){
            return 'righttop';
        }
        else {
            return 'rightbotom';
        }
    }

    move(x,y){
        this.box.x1=x;
        this.box.y1=y;
        this.calcPoint();
        this.refresh();
    }

    setEndNode(node){
        this.endNode=node;
        this.calcLimit();
        this.calcDirect();
    }

    setStartPoint(x,y){
        if(x&&y){
            this.box.x=x;
            this.box.y=y;
        }else{
            var box=this.startNode.getBox();
            this.box.x=box.x+box.width/2;
            this.box.y=box.y+box.height/2;
        }
    }

    setEndPoint(x,y){
        this.box.x1=x;
        this.box.y1=y;
    }

    setBox(box){
        this.box=box;
        this.refresh();
    }
    
    getData(){
        this.data.nodeData=this.textNode.getData()
        return {...{
            startNodeId:this.startNode.getId(),
            endNodeId:this.endNode.getId(),
           },
           ... this.data,
           ...{
             box:{...this.box},
           }
           
        }
    }

    _mouseDown(e){
       if(this.func1){document.removeEventListener('mousemove',this.func1)};
       if(this.func2){document.removeEventListener('mousemove',this.func2)};

       document.removeEventListener('mouseup',this.func2);
       this.mind=this.startNode.getMind();
       //this.startBox=this.startNode.getBox();
       //this.endNode&&(this.endBox=this.endNode.getBox());
       this.sx=e.pageX;
       this.sy=e.pageY;
       this.pageX=e.pageX;
       this.pageY=e.pageY;
       this.dx=0;
       this.dy=0;
       this.drag=true;
       this.mind.status='changeRelate';
       this.target=e.target;
       this.oldBox={...this.box};
       this.func1=this._mouseMove.bind(this);
       this.func2=this._mouseUp.bind(this);
       
       document.addEventListener('mousemove',this.func1);
       document.addEventListener('mouseup',this.func2);
    }

    _mouseUp(){

       this.drag=false;
      
       this.sx=0;
       this.sy=0;
       this.dx=0;
       this.dy=0;
      
       this.mind=this.startNode.getMind();
    
       this.mind.execute('changeRelateLink',{link:this,data:{
           oldBox:this.oldBox,
           box:this.box,
           type:'changeRelateLinkBox'
       }});

       this.target=null;

       document.removeEventListener('mousemove',this.func1);
       document.removeEventListener('mouseup',this.func2);
     
    }

    _mouseMove(e){
      
       if(this.status=='addRelate'){
           this.move(e.offsetX,e.offsetY);
       }
       else {
           if(!this.drag) return;
           if(this.target){
               var dx=e.pageX-this.pageX;
               var dy=e.pageY-this.pageY;
               this.dx=e.pageX-this.sx;
               this.dy=e.pageY-this.sy;
               
               this.pageX=e.pageX;
               this.pageY=e.pageY;
               var d=this.target.getAttribute('direct');
               this.calcLimit();
               if(d=='start'){
                  this.box.cpx1=this.oldBox.cpx1+this.dx;
                  this.box.cpy1=this.oldBox.cpy1+this.dy;
                  var direct=this.calcStroke({x:this.box.x,y:this.box.y},this.startBox);
                  
                  if(this.startBox.width>400){
                      var num=1.2;
                  }
                  else if(this.startBox.width>200){
                    var num=1.5
                  }
                  else {
                    var num=2
                  }
                  switch(direct){
                      case 'left':
                          this.entryDirection = [-1, 0];
                          if(this.box.y>=this.startLimit.y&&this.box.y<=this.startLimit.y1){
                            this.box.y+=dy/num
                          }
                          else{
                            if(this.box.y<this.startLimit.y)this.box.y=this.startLimit.y;
                            if(this.box.y>this.startLimit.y1)this.box.y=this.startLimit.y1;
                          }
                          break;
                      case 'right':
                          this.entryDirection = [1, 0];
                        if(this.box.y>=this.startLimit.y&&this.box.y<=this.startLimit.y1){
                            this.box.y+=dy/num
                        }
                        else{
                            if(this.box.y<this.startLimit.y)this.box.y=this.startLimit.y;
                            if(this.box.y>this.startLimit.y1)this.box.y=this.startLimit.y1;
                        }
                        break;
                      case 'top':
                            this.entryDirection = [0, -1];
                            
                           if(this.box.x>=this.startLimit.x&&this.box.x<=this.startLimit.x1){
                            this.box.x+=dx/num
                           }
                           else{
                            if(this.box.x<this.startLimit.x)this.box.x=this.startLimit.x
                            if(this.box.x>this.startLimit.x1)this.box.x=this.startLimit.x1
                           }
                           break;
                      case 'bottom':
                            this.entryDirection = [0, 1];
                      
                        if(this.box.x>=this.startLimit.x&&this.box.x<=this.startLimit.x1){
                            this.box.x+=dx/num
                        }
                        else{
                            if(this.box.x<this.startLimit.x)this.box.x=this.startLimit.x
                            if(this.box.x>this.startLimit.x1)this.box.x=this.startLimit.x1
                        }
                         break;
                     default:
                        if(this.box.x>=this.startLimit.x&&this.box.x<=this.startLimit.x1){
                            this.box.x+=dx/num
                        }
                        else{
                            if(this.box.x<this.startLimit.x)this.box.x=this.startLimit.x
                            if(this.box.x>this.startLimit.x1)this.box.x=this.startLimit.x1
                        }
                        if(this.box.y>=this.startLimit.y&&this.box.y<=this.startLimit.y1){
                            this.box.y+=dy/num
                        }
                        else{
                            if(this.box.y<this.startLimit.y)this.box.y=this.startLimit.y;
                            if(this.box.y>this.startLimit.y1)this.box.y=this.startLimit.y1;
                        }
                  }

               }
               else {
                    this.box.cpx2=this.oldBox.cpx2+this.dx;
                    this.box.cpy2=this.oldBox.cpy2+this.dy;
                    var direct=this.calcStroke({x:this.box.x1,y:this.box.y1},this.endBox);
                    
                    switch(direct){
                        case 'left':
                            this.exitDirection = [-1, 0];
                            if(this.box.y1>=this.endLimit.y&&this.box.y1<=this.endLimit.y1){
                                this.box.y1+=dy/3
                            }
                            else{
                                if(this.box.y1<this.endLimit.y)this.box.y1=this.endLimit.y;
                                if(this.box.y1>this.endLimit.y1)this.box.y1=this.endLimit.y1;
                            }
                            break;
                        case 'right':
                            this.exitDirection = [1, 0];
                          if(this.box.y1>=this.endLimit.y&&this.box.y1<=this.endLimit.y1){
                              this.box.y1+=dy/3
                          }
                          else{
                              if(this.box.y1<this.endLimit.y)this.box.y1=this.endLimit.y;
                              if(this.box.y1>this.endLimit.y1)this.box.y1=this.endLimit.y1;
                          }
                         
                          break;
                        case 'top':
                            this.exitDirection = [0,-1];
                            if(this.box.x1>=this.endLimit.x&&this.box.x1<=this.endLimit.x1){
                                this.box.x1+=dx/3
                            }
                            else{
                                if(this.box.x1<this.endLimit.x)this.box.x1=this.endLimit.x
                                if(this.box.x1>this.endLimit.x1)this.box.x1=this.endLimit.x1
                            }
                            break;
                        case 'bottom':
                            this.exitDirection = [0,1];
                          if(this.box.x1>=this.endLimit.x&&this.box.x1<=this.endLimit.x1){
                              this.box.x1+=dx/3
                          }
                          else{
                              if(this.box.x1<this.endLimit.x)this.box.x1=this.endLimit.x
                              if(this.box.x1>this.endLimit.x1)this.box.x1=this.endLimit.x1
                          }
                           break;
                       default:
                          if(this.box.x1>=this.endLimit.x&&this.box.x1<=this.endLimit.x1){
                              this.box.x1+=dx/3;
                          }
                          else{
                              if(this.box.x1<this.endLimit.x)this.box.x1=this.endLimit.x
                              if(this.box.x1>this.endLimit.x1)this.box.x1=this.endLimit.x1
                          }
                          if(this.box.y1>=this.endLimit.y&&this.box.y1<=this.endLimit.y1){
                              this.box.y1+=dy/3;
                          }
                          else{
                              if(this.box.y1<this.endLimit.y)this.box.y1=this.endLimit.y;
                              if(this.box.y1>this.endLimit.y1)this.box.y1=this.endLimit.y1;
                          }
                    }
               }

               this.clacDD();
               this.refresh();
           }
       }
    }
    
    _clickFn(e){
        e.preventDefault();
        e.stopPropagation();
    }

    _addEvent(){
        var me=this;
        this.drawFunc1=this._mouseMove.bind(this);
        this.drawFunc2=this._mouseUp.bind(this);
       
        this.mind.draw.on('mousemove',this.drawFunc1);
        this.mind.draw.on('mouseup', this.drawFunc2);

        this.bs.dblclick(()=>{
            if(!this.textNode.data.text){
               if(!this.textNode.data.isImageNode){
                  this.data.nodeHide=false;
                  this.startNode.mind.updateRelateLink();
               }
            }
       });

       this.bs.click((e)=>{
            e.preventDefault();
            e.stopPropagation();
            var x=e.offsetX;
            var y= e.offsetY;
            me.mind.emit('showRelateShip',{
                x:x,
                y:y,
                relateLink:me
            });
       });
    }

    addEvent(){

        this.func=this._mouseDown.bind(this);
        this.clickFn=this._clickFn.bind(this);

        this.corl1.addEventListener('mousedown', this.func);
        this.corl2.addEventListener('mousedown', this.func);
        this.corl1.addEventListener('click',  this.clickFn);
        this.corl2.addEventListener('click',  this.clickFn);
        
    }

}