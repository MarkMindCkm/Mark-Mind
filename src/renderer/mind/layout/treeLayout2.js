import TreeLayout from './treeLayout';
import theme from '../theme';

export default class TreeLayout2 extends TreeLayout{
	constructor(isCache){
		super(isCache);
		this.dis=10;
		this.firstLevel=40;
		this.levelDis=20;
        this.type='tree2';
        this.layoutName='tree';
        this.lineWidth=2;
	}

	createDownLink(){
        var me=this;
        var root=this.root;
        this.group&&this.group.clear();

        if(this.root.getChildren().length==0){
            return;
        }
        
        if(!this.group){
            return
        }
        
       let config=theme.use().config;
       let stroke=config['stroke'];
       let lineWidth=config['lineWidth'];

    	function createLine(node){
           
            if(node.layout&&node!=me.root){
				return;
			}
            if(!node.isExpand()){
                return;
            }
            var pos=node.getPosition();
            var box=node.getBox();
    		node.getChildren().forEach(function(child){
    			let childBox=child.getBox();
    			let childPos=child.getPosition();
    			let fromPoint={
    				x:pos.x+box.width/2,
    				y:pos.y+box.height
    			};
    			let toPoint={
    				x:childPos.x+childBox.width/2,
    				y:childPos.y
    			};
               
                let _stroke=child.stroke||stroke||'rgb(160,160,160)';
             
    			if(node.getChildren().length==1){
                    if(lineWidth%2==1){
                        var x1=parseInt(fromPoint.x)+0.5
                        var y1=parseInt(fromPoint.y)+0.5
                        var x2=parseInt(toPoint.x)+0.5
                        var y2=parseInt(toPoint.y)+0.5
                    }else{
                        var x1=parseInt(fromPoint.x)
                        var y1=parseInt(fromPoint.y)
                        var x2=parseInt(toPoint.x)
                        var y2=parseInt(toPoint.y)
                    }
                        
                    var line=me.group.line(x1, y1, x2, y2).stroke({ color: _stroke, width: lineWidth, linecap: 'round', linejoin: 'round' });

    			}else{
    				 
    				    var from=[pos.x+box.width/2,pos.y+box.height];
                        var to=[childPos.x+childBox.width/2,childPos.y];
                        if(node.getLevel()==0){
                            var transPoint=[from[0],from[1]+me.firstLevel/2];
                        }else{
                            var transPoint=[from[0],from[1]+me.levelDis/2];
                        }
                        if(child.isFirst()||child.isLast()){
                            if((childPos.x+childBox.width/2)>(pos.x+box.width/2)){
                                var to1=[to[0]-2,transPoint[1]];
                                var to2=[to[0],transPoint[1]+2];
                            }else{
                                var to1=[to[0]+2,transPoint[1]];
                                var to2=[to[0],transPoint[1]+2];
                           
                            }
                            var point=[from,transPoint,to1,to2,to];
                        }else{
                            var to1=[to[0],transPoint[1]];
                            var point=[to1,to]
                        }
                       
                        var line = me.group.polyline(me.linePoint(point,lineWidth));
                        line.fill('none');
                        line.stroke({ color: _stroke, width: lineWidth, linecap: 'round', linejoin: 'round' });
    				
    			}
              
          
              createLine(child);
    	   });
         }

       createLine(root);
  

    root.children.forEach(c=>{
		createLayoutLine(c);
	});

	function createLayoutLine(node){
		if(node.isExpand()){
            if(node.layout){
                node.layout.createLink();
                return
            }
			node.children.forEach(c=>{
				createLayoutLine(c);
			});
		}
	}
	}
    createUpLink(){
        var me=this;
        var root=this.root;
       
        
        this.group&&this.group.clear();
        if(this.root.getChildren().length==0){
            return;
        }

        
        if(!this.group){
            return
        }
         
       
       let config=theme.use().config;
       let stroke=config['stroke'];
       let lineWidth=config['lineWidth'];
   
        var root=this.root;
        function createLine(node){
            if(node.layout&&node!=me.root){
				node.layout.group&&node.layout.group.clear();
			}
            if(!node.isExpand()){
                return;
            }
           
            var pos=node.getPosition();
            var box=node.getBox();
            var level=node.getLevel();
            node.getChildren().forEach(function(child){
                let childBox=child.getBoundingRect();
                let childPos=child.getPosition();
                let fromPoint={
                   x:parseInt(pos.x+box.width/2),
                   y:parseInt(pos.y)
                };

                let toPoint={
                    x:parseInt(childPos.x+childBox.width/2),
                    y:parseInt(childPos.y+childBox.height)
                };
        
             let _stroke=child.stroke||stroke||'rgb(160,160,160)';;
         
        if(node.getChildren().length==1){
                if(lineWidth%2==1){
                    var x1=parseInt(fromPoint.x)+0.5
                    var y1=parseInt(fromPoint.y)+0.5
                    var x2=parseInt(toPoint.x)+0.5
                    var y2=parseInt(toPoint.y)+0.5
                }else{
                    var x1=parseInt(fromPoint.x)
                    var y1=parseInt(fromPoint.y)
                    var x2=parseInt(toPoint.x)
                    var y2=parseInt(toPoint.y)
                }
               
                   var line=me.group.line(x1, y1, x2, y2).stroke({ color: _stroke, width: lineWidth, linecap: 'round', linejoin: 'round' });
                }else{
                       
                        var from=[pos.x+box.width/2,pos.y];
                        var to=[childPos.x+childBox.width/2,childPos.y+childBox.height];
                        var transPoint=[from[0],from[1]-me.levelDis/2];
                        if(child.isFirst()||child.isLast()){
                            if((childPos.x+childBox.width/2)>(pos.x+box.width/2)){
                                var to1=[to[0]-2,transPoint[1]];
                                var to2=[to[0],transPoint[1]-2];
                                
                            }else{
                                var to1=[to[0]+2,transPoint[1]];
                                var to2=[to[0],transPoint[1]-2];
                                level=5;
                            }
                            var points=[from,transPoint,to1,to2,to]
                        }else{
                            var to1=[to[0],transPoint[1]];
                            var points=[to1,to];
                        }

                        
                        var line = me.group.polyline(me.linePoint(points,lineWidth));
                        line.fill('none');
                        line.stroke({ color: _stroke, width: lineWidth, linecap: 'round', linejoin: 'round' });
                       
                }

              
              var lineData={
                      from:node,
                      to:child
              };

              line.lineData=lineData;
              createLine(child);

            });
        }

        createLine(root);


    }
}