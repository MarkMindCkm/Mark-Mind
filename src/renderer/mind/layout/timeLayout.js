import Layout from './layout';
// import minderUtil from '../util/util';
import theme from "../theme";
export default class TimeLayout extends Layout{
      constructor(isCache=true){
      	super();
      	this.type='time';
      	this.firstLevelDis=30;
      	this.dis=10;
      	this.topNodes=[];
      	this.bottomNodes=[];
      	this.direct='time';
        this.limitWidth=1000;
        this.layoutName="time";
        this.isCache=isCache;
       // this.draw = SVG().addTo('#mind').size('100%', '100%');
      }
       layout(node,direct){
       
    	    var me=this;
    	    this.direct=direct||'time';
          this.root=node||this.root;
          if(!this.group)this.group=this.root.getMind().edgeGroup.group();
          this.root.layout=this;
          
          this.topNodes=[];
          this.bottomNodes=[];
   
	        if(this.direct=='top'){
	        	node.getChildren().forEach(function(child,index){
	               	me.topNodes.push(child);
	               	child.direct='top';
                   setNodeDirect(child,'top');
                   if(child.isLeaf()&&!child.dom.classList.contains('node-leaf')){
                    child.dom.classList.add('node-leaf');
                   }else{
                    if(child.dom.classList.contains('node-leaf')){
                      child.dom.classList.remove('node-leaf')
                    }
                  }
	           });
	        }else if(this.direct=='bottom'||this.direct=='stype'){
	        	   node.getChildren().forEach(function(child,index){
	             	  me.bottomNodes.push(child);
	             	  child.direct='bottom';
                   setNodeDirect(child,'bottom');
                   if(child.isLeaf()&&!child.dom.classList.contains('node-leaf')){
                     child.dom.classList.add('node-leaf');
                   }else{
                    if(child.dom.classList.contains('node-leaf')){
                      child.dom.classList.remove('node-leaf')
                    }
                  }
	             });
	        }else{
	        	 node.getChildren().forEach(function(child,index){
		              if(index%2==0){
		               	me.topNodes.push(child);
		               	child.direct='top';
		               	setNodeDirect(child,'top');
		              }else{
		             	  me.bottomNodes.push(child);
		             	  child.direct='bottom';
		             	  setNodeDirect(child,'bottom');
		              }
	           });
	        }
	      
	        function setNodeDirect(node,d){
             node.direct=d;
             if(node.isLeaf()&&!node.dom.classList.contains('node-leaf')){
              node.dom.classList.add('node-leaf');
            }else{
             if(node.dom.classList.contains('node-leaf')){
              node.dom.classList.remove('node-leaf')
             }
           }
	           node.getChildren().forEach(function(child){
	           	 setNodeDirect(child,d);
	           });
		      }
       //  this.createExpandCollapse();
	        me._doLayout(node);
    	   // this.createLink();
    	    if(this.direct=='stype'){
    	    	// if(node.getChildren().length<=3){
    	    	// 	this.limitWidth=800;
    	    	// }
            // this._minder.updateAssist();
    	    	this.createStype();
          }
          
          this._updateRootAssist();

    }
    _doLayout(node){
     	    var me=this;
    	    var dis=30; 
          var pos=node.getPosition();
          var box=node.getBox();
          var nextPoint=[0,0];
          node.getChildren().forEach(function(child,i){
          	var childBox = child.getBox();
          	if(i==0){
              var x=pos.x+box.width+60;
          		child.setPosition(x,pos.y+box.height/2-childBox.height/2);
          	   nextPoint[0]=x+childBox.width+dis;
          	}else{
                child.setPosition(nextPoint[0],pos.y+box.height/2-childBox.height/2);
                nextPoint[0]=nextPoint[0]+childBox.width+dis;
          	}
          });
          node.getChildren().forEach(function(child){
             me._layout(child);
          });

          if(this.direct!='stype'){
               this.doLayout();
          }
    }
    _layout(node){
      var me=this;
    	var box=node.getBox();
    	var pos=node.getPosition();

      var children=node.getChildren();
      var mind=node.getMind();
      if(node.callout){
        node.callout.refresh();
      }
    	if(children.length==0){
    		return;
      }

      if(!node.isExpand()){
        return;
      }
      
    	// children.forEach(function(child,index){
      //      var childBox=child.getBox();
      //      h+=childBox.height;
      //      if(!child.isLast()){
      //          h+=me.dis;
      //      }
    	// });
    
    	if(node.direct=='top'){
           
            var firstPoint={x:pos.x+box.width/2+me.dis,y:pos.y};
            children.forEach(function(child,index){
                var childBox=child.getCBox();

                if(index==0){
                   var y=firstPoint.y-childBox.height-childBox.bh-me.dis;
                   child.setPosition(firstPoint.x,y);
                }else{
                  // var prevNodePos=children[index-1].getPosition();
                   if(me.isCache&&child.boundingRect){
                     var b=child.boundingRect;
                   }
                   else{
                     var b=mind.getBBox(children[index-1]);
                     child.boundingRect=b;
                   }

                  //  var ph=0;
                  //  if(children[index-1].wireFrame){
                  //    ph=children[index-1].wireFrame.getTextBox().height;
                  //  }

                   child.setPosition(firstPoint.x,b.y-me.dis-childBox.height-childBox.bh);
                }

                // mind.wireFrames.forEach(wf=>{
                //   wf.refresh();
                // });
                mind.updateAssist();
                

              me._layout(child);
            
            });
           
    	}else{
            
           var firstPoint={x:pos.x+box.width/2+me.dis,y:pos.y+box.height};
         
            children.forEach(function(child,index){
                 var childBox=child.getCBox();
                if(index==0){
                	var y=firstPoint.y+me.dis+childBox.th;
                    child.setPosition(firstPoint.x,y);
                }else{
                  if(me.isCache&&child.boundingRect){
                    var b=child.boundingRect;
                  }
                  else{
                    var b=mind.getBBox(children[index-1]);
                    child.boundingRect=b;
                  }
                  // var ph=0;
                  // if(children[index-1].wireFrame){
                  //   ph=children[index-1].wireFrame.getTextBox().height;
                  // }
                   child.setPosition(firstPoint.x,b.y+b.height+me.dis+childBox.th);
                }

                mind.wireFrames.forEach(wf=>{
                  wf.refresh();
                });
               me._layout(child);

               
            });
    	}

      // children.forEach(function(child){
      //     me._layout(child);
      // });
    }
    refresh(){
    
       this.layout(this.root,this.direct);
       if(this.direct!='stype'){
         this.doLayout();
       }
       this.createLink();
    }
    createLink(){
     //   var tree=this.root.getMind();
        var me=this;
        // if(this.gLine){
        //   tree.lineGroup.remove(this.gLine);
        // }
        
        if(!this.group){
          return
        }
        this.group&&this.group.clear();
        if(this.root.getChildren().length==0){
          return;
        }
       // this.group.clear();
        // this.gLine=new zrender.Group();
        let config=theme.use().config;
        let stroke=config['stroke'];
        let lineWidth=config['lineWidth'];
       
        var num=0;
        if(lineWidth==1){
          num=0.5
        }
        //tree.addLine(this.gLine);

        function createTwoLink(node){
              var pbox=node.getBox();
              var ppos=node.getPosition();
              var fromPoint={x:ppos.x+pbox.width,y:ppos.y+pbox.height/2};
              var children=node.getChildren();
              if(me.direct!='stype'){
                 	children.forEach(function(child){
	                var pos=child.getPosition();
	                var box=child.getBox();
	                var toPoint={x:pos.x,y:pos.y+box.height/2};
                 // stroke=child.stroke||stroke||'rgb(160,160,160)';

                 var line=me.group.line(fromPoint.x+num, fromPoint.y+num, toPoint.x+num, toPoint.y+num).stroke({ color: stroke, width: 2, linecap: 'round', linejoin: 'round' });
                 
	                var lineData={
	                   from:node,
	                   to:child,
	                   line
	                };
	                lineData.line.lineData=lineData;
	              //  me.gLine.add(lineData.line);
	             });
              }
 
              children.forEach(function(child){
                   createThirdLink(child);
              });
        };

        createTwoLink(this.root);
         //console.log(11)
        function createThirdLink(node){
            if(!node.isExpand()){
              return;
           }
            var children=node.getChildren();
            var pos=node.getPosition();
            var box=node.getBox();
            if(node.direct=='top'){
                 children.forEach(function(child){
                     var childPos=child.getPosition();
                     var childBox=child.getBox();
                     
                     var fromPoint=[parseInt(pos.x+box.width/2)+num,parseInt(pos.y)+num];
                     var endPoint=[parseInt(childPos.x)+num,parseInt(childPos.y+childBox.height/2)+num];
                     var toPoint=[fromPoint[0],endPoint[1]];
                      
                   //  stroke=child.stroke||stroke||'rgb(160,160,160)';

                    if(child.isLast()){
                      var point=[fromPoint,toPoint,endPoint];
                    }else{
                      var point=[toPoint,endPoint];
                    }

                    var line = me.group.polyline(me.linePoint(point,2));
                    line.fill('none');
                    line.stroke({ color: stroke, width: 2, linecap: 'round', linejoin: 'round' });

                     var lineData={
                        from:node,
                        to:child,
                        line
                      };
                      lineData.line.lineData=lineData;
                  //    me.gLine.add(lineData.line);

                      createLink(child,'top');
                 });
            }else{
                 children.forEach(function(child){
                     var childPos=child.getPosition();
                     var childBox=child.getBox();
                     var fromPoint=[pos.x+box.width/2,pos.y+box.height/2];
                     var endPoint=[childPos.x,childPos.y+childBox.height/2];
                     var toPoint=[fromPoint[0],endPoint[1]];
                   
                   //  stroke=child.stroke||stroke||'rgb(160,160,160)';
                      if(child.isLast()){
                        var point=[fromPoint,toPoint,endPoint];
                      }else{
                        var point=[toPoint,endPoint];
                      }

                      var line = me.group.polyline(me.linePoint(point,2));
                      line.fill('none');
                      line.stroke({ color: stroke, width: 2, linecap: 'round', linejoin: 'round' });
                    
                     var lineData={
                        from:node,
                        to:child,
                        line
                      };
                      lineData.line.lineData=lineData;
                     // me.gLine.add(lineData.line);
                      createLink(child,'bottom');
                 });
            }
        };

        function createLink(node,type){
           if(!node.isExpand()){
            return;
           }
            var children=node.getChildren();
            var pos=node.getPosition();
            var box=node.getBox();
            children.forEach(function(child){
                     var childPos=child.getPosition();
                     var childBox=child.getBox();
                    
                     if(type=='top'){
                       var fromPoint=[pos.x+box.width/2,pos.y];
                     }else{
                       var fromPoint=[pos.x+box.width/2,pos.y+box.height];
                     }
                     var endPoint=[childPos.x,childPos.y+childBox.height/2];
                     var toPoint=[fromPoint[0],endPoint[1]];
                     
                  //   stroke=child.stroke||stroke||'rgb(160,160,160)';
                     if(child.isLast()){
                      var point=[fromPoint,toPoint,endPoint];
                    }else{
                      var point=[toPoint,endPoint];
                    }
                    var line = me.group.polyline(me.linePoint(point,2));
                    line.fill('none');
                    line.stroke({ color: stroke, width: 2, linecap: 'round', linejoin: 'round' });

                     var lineData={
                        from:node,
                        to:child,
                        line
                      };
                      lineData.line.lineData=lineData;
                      //me.gLine.add(lineData.line);
                      createLink(child,type);
                 });
       
        }
    }
    adjustNode(node){
      var dis=this.dis;
      var me=this;
      var box=node.getBox();

    	if(node.direct=='top'){
         var parent=node.getParent();
         while(parent.getLevel()>1){
             var pos=parent.getPosition();
             var siblings=parent.getSiblings();
             siblings.forEach(function(sib){
                var sibPos=sib.getPosition();
                if(sibPos.y<pos.y){
                   me.moveNode(sib,0,-box.height-dis);
                }
             });
             parent=parent.getParent();
         }
       }else{
           var parent=node.getParent();
           while(parent.getLevel()>1){
               var pos=parent.getPosition();
               var siblings=parent.getSiblings();
               siblings.forEach(function(sib){
                  var sibPos=sib.getPosition();
                  if(sibPos.y>pos.y){
                     me.moveNode(sib,0,box.height+dis);
                  }
               });
               parent=parent.getParent();
           }
       }
    }
  
    removeLink(parent,node){
      var me=this;
      if(parent&&node){
          this.gLine.traverse(function(line){
              var lineData=line.lineData;
              var from=lineData.from;
              var to=lineData.to;
              if(from==parent&&to==node){
                me.gLine.remove(line);
              }
          });
      }else{
        this.gLine.removeAll();
        this.gLine=null;
      }
    }

    doLayout(){
      var me=this;
      var tree=this.root.getMind();
      var root=this.root;
      var len=root.getChildren().length;
      var dis=60;

     root.getChildren().forEach(function(child,i){
          if(i!=0){
           //  var prevNodeBox=minderUtil.getNodeBox(root.getChildren()[i-1],'induce');
             var prevNodeBox=tree.getBBox(root.getChildren()[i-1])
             var box=root.getChildren()[i-1].getBox();
             if(child.direct=='top'){
               var index=me.topNodes.indexOf(child);
               if(index>0){
                var pNodeBox=tree.getBBox(me.topNodes[index-1])
                // var pNodeBox=minderUtil.getNodeBox(me.topNodes[index-1],'induce');
               }
             }else{
               var index=me.bottomNodes.indexOf(child);
               if(index>0){
                //var pNodeBox=minderUtil.getNodeBox(me.bottomNodes[index-1],'induce');
                var pNodeBox=tree.getBBox(me.bottomNodes[index-1]);
               }
             }
             if(!pNodeBox){
                  return
             }
             pNodeBox.x1=pNodeBox.x+pNodeBox.width;

             if(pNodeBox.x1<prevNodeBox.x+box.width){
               var prevNodeX=prevNodeBox.x+box.width;
             }else if(pNodeBox.x1<=prevNodeBox.x1){
              var prevNodeX=pNodeBox.x1;
             }else{
              var prevNodeX=pNodeBox.x1;
             }

             //var nodeBox=minderUtil.getNodeBox(child);
             var nodeBox= tree.getBBox(child)
             var thisNodeX=nodeBox.x;
             var dx=prevNodeX+dis-thisNodeX;
             me.moveNode(child,dx,0);
          }
          //tree.updateAssist();
      });

  }

  createStype(){
  	    var me=this;
        var root=this.root;
        var rootBox=root.getBox();
        var rootPos=root.getPosition();
        var widthArr=[];
        root.getChildren().forEach(function(child){
            var box=minderUtil.getNodeBox(child,'induce');
            box.node=child;
            widthArr.push(box);
        });
        var rowArr=[];
        function allot(){
            if(widthArr.length){
            	var w=0;
            	var len=widthArr.length-1;
            	for(let i=0;i<=len;i++){
            		let wr=widthArr[i];
            		w=w+wr.width;
            		if(i==len&&(w<=me.limitWidth)){
            			rowArr.push(widthArr.splice(0));
            			break;
            		}
                if(len==0){
                   if(widthArr[0].width>me.limitWidth){
                     me.limitWidth=widthArr[0].width;
                   }
                   rowArr.push(widthArr.splice(0,1));
                  break;
                }
                if(i==len&&(w>me.limitWidth)){
                  widthArr.length&&rowArr.push(widthArr.splice(0,i));
                  break;
                }

            		if(i<len&&w>me.limitWidth){
                       if(i==0){
                       	 rowArr.push(widthArr.splice(0,1));
                       }else{
                       	 rowArr.push(widthArr.splice(0,i));
                       }
                       break;
            		}
            	}
            	allot();
            }
        }

        allot();

        this.createStypeLayout(rowArr); 
     
  }
  _getMaxHeight(arr){
  	var h=0;
  	var node=null;
  	arr.forEach(function(box){
  		if(box.height>h){
           h=box.height;
           node=box.node;
  		}
  	});
    return {
    	height:h,
    	node:node
    };
  }

  _calcDis(arr){
  	this.adjustDis=100;
  	var w=0;
  	arr.forEach(function(box){
  		w=w+box.width;
  	});
  	if(arr.length>=2){
  		var dis=(this.limitWidth-w+this.adjustDis)/arr.length
      return dis<0?6:dis;
  	}else{
      return (this.limitWidth-w);
  	}
  }

  createStypeLayout(arr){
     	  var me=this;
  	    var root=this.root;
        var rootBox=root.getBox();
        var rootPos=root.getPosition();
        var fromPoint={x:rootPos.x+rootBox.width,y:rootPos.y+rootBox.height/2};
        var nextPoint=[0,0];

        arr.forEach(function(row,index){
        	let dis=me._calcDis(row);
        
        	if(index%2==1){
              row=row.reverse();
        	}
        	row.forEach(function(box,i){
        		    var node=box.node;
                var nodeBox=node.getBox();
                var nodePos=node.getPosition();
                if(index==0){
                	if(i==0){
                      var x=rootPos.x+rootBox.width+dis;
	                    var dx=x-nodePos.x;
	                    var dy=0;
	                    nextPoint[0]=x+box.width+dis;
                	}else{
                        var dx= nextPoint[0]-nodePos.x;
                        var dy=0;
                        nextPoint[0]=nextPoint[0]+box.width+dis;
                	}
            	    me.moveNode(node,dx,dy);
                  node.getMinder().updateAssist();
                }else{
                	var maxHeight=me._getMaxHeight(arr[index-1]).height;
                	var prevNode=me._getMaxHeight(arr[index-1]).node;
                	var prevBox=minderUtil.getNodeBox(prevNode,'induce');
                    var y=prevBox.y1+60;
                    var dy=y-nodePos.y;
                    if(i==0){
                         var x=rootPos.x+rootBox.width+dis;
                         var dx=x-nodePos.x;
                         nextPoint[0]=x+box.width+dis;
                    }else{
                         var dx= nextPoint[0]-nodePos.x;
                         nextPoint[0]=nextPoint[0]+box.width+dis;
                    }
                    me.moveNode(node,dx,dy);
                    node.getMinder().updateAssist();
                }
        	});
          
        });
        me.createLink();
        me.createStypeLine(arr);
  }

  createStypeLine(arr){
  	    var me=this;
  	    var root=this.root;
        var rootBox=root.getBox();
        var rootPos=root.getPosition();
        var fromPoint={x:rootPos.x+rootBox.width,y:rootPos.y+rootBox.height/2};

        var lineWidth=this.adjustDis+this.limitWidth+120;
        var len=arr.length;
        var lineObj={};

        let config=theme.use().config;
        let stroke=config['stroke'];
        let lw=config['lineWidth'];

        stroke=stroke||root.stroke||'#f5f5f5';
         
        for(let i=0;i<=len-1;i++){
              let line=new zrender.Line({
              	style:{
                  stroke,
                  lineWidth:lw
              	},
              	shape:{
              		x1:fromPoint.x,
              		y1:fromPoint.y,
              		x2:fromPoint.x+lineWidth,
              		y2:fromPoint.y
              	},
                z:1
              });
              lineObj[i]=line;
              me.gLine.add(line);
         }
         
         arr.forEach(function(row,i){
         	  if(i>0){
                 var pos=row[0].node.getPosition();
                 var box=row[0].node.getBox();
                 lineObj[i].attr({
                 	shape:{
                 		y1:pos.y+box.height/2,
                 		y2:pos.y+box.height/2
                 	}
                 })
         	  }
         });

         for(let key in lineObj){
         	var nextKey=parseInt(key)+1;
         	if(lineObj.hasOwnProperty(nextKey)){
         		 var shapeTop=lineObj[key].shape;
         		 var shapeBottom=lineObj[nextKey].shape;
         		 if(key%2==1){
         		 	var arc=new zrender.Arc({
		                style:{
		                	stroke:stroke
		                },
		                shape:{
                            cx:shapeTop.x1,
                            cy:shapeTop.y1+(shapeBottom.y1-shapeTop.y1)/2,
                            r:(shapeBottom.y1-shapeTop.y1)/2,
                            startAngle:Math.PI/2,
                            endAngle:-Math.PI/2,
		                },
                    z:1
		             });
         		 	 me.gLine.add(arc);
		         }else{
		         	var arc=new zrender.Arc({
		                style:{
		                	stroke:stroke
		                },
		                shape:{
                            cx:shapeTop.x2,
                            cy:shapeTop.y2+(shapeBottom.y2-shapeTop.y2)/2,
                            r:(shapeBottom.y2-shapeTop.y2)/2,
                            startAngle:Math.PI/2,
                            endAngle:-Math.PI/2,
                            clockwise:false
		                },
                    z:1
		             });
		             me.gLine.add(arc);
		         }
         	}
         }

      
  }


}