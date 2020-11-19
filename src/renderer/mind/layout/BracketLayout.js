import MindLayout from './MindLayout';
import theme from '../theme'


export default class BracketLayout extends MindLayout {

    constructor(isCache=true) {
        super('bracket');
        this.layoutName = 'bracket';
        this.levelDis = 20;
        this.nodeDis = 10;
        this.firstLevelDis=40;
        this.firstNodeDis=20;
        this.root = null;
        this.lefts=[];
        this.rights=[];
        this.isCache=isCache;
        this.type='mind'
    }

    createLink() {
        var me=this;
        var minder = this.root.getMind(); 
        this.group&&this.group.clear();
        if(this.root.getChildren().length==0){
          return;
        }
        
        if(!this.group){
            return
        }
 
        //每次先删除所有连线
        //minder.removeAllLine();
        // var c=theme.use().config;
        // var stroke=c['stroke'];
        //var lineWidth=c['lineWidth'];
        var lineWidth=theme.use().config['lineWidth'];
        var stroke=theme.use().config['stroke'];
        var rootLevel=this.root.getLevel();

        function createLine(node){
            if(node==me.root){

			}else{
				if(node.layout){
					return;
				}
			}
            if (!node.isExpand()) {
                return;
            }

            var children = node.getChildren();
            var box = node.getBox();
            var position = node.getPosition();
            var level=node.getLevel();
            var len=children.length;

            var a=2,b=1;
           
            var levelDis=level==rootLevel?me.firstLevelDis:me.firstNodeDis;

            children.forEach((child) => {

                var direct = child.direct;
                var childBox = child.getBox();
                var childPos = child.getPosition();

                var points=[];

                let _stroke=child.stroke||stroke||'rgb(160,160,160)';

                if (direct == 'right') {
                    //四个转折点
                    var startPoint = [(box.width + position.x),(box.height / 2 + position.y)];
                    var endPoint = [(childPos.x), (childBox.height / 2 + childPos.y)];
                  
                    
                    if(endPoint[1]>startPoint[1]){
                        var transPoint1 = [(startPoint[0] + levelDis / a*b), startPoint[1]+3];
                        var transPoint2 = [transPoint1[0], endPoint[1]];
                    }
                    else{
                        var transPoint1 = [(startPoint[0] + levelDis / a*b), startPoint[1]-3];
                        var transPoint2 = [transPoint1[0], endPoint[1]];
                    }

                    if (endPoint[1] > startPoint[1]) {
                        var t3 = [transPoint1[0], endPoint[1] - 2];
                        var t4 = [transPoint1[0] + 2, endPoint[1]]
                      } else {
                        var t3 = [transPoint1[0], endPoint[1] + 2];
                        var t4 = [transPoint1[0] + 2, endPoint[1]]
                      }
                   
                  
                } else {
                
                    var startPoint = [(position.x), (box.height / 2 + position.y)];
                    var endPoint = [(childPos.x+childBox.width), (childBox.height/2 + childPos.y)];
                       
                   
                    if(endPoint[1]>startPoint[1]){
                        var transPoint1 = [(startPoint[0] - levelDis / a*b), startPoint[1]+3];
                        var transPoint2 = [transPoint1[0], endPoint[1]];
                    }
                    else{
                        var transPoint1 = [(startPoint[0] - levelDis / a*b), startPoint[1]-3];
                        var transPoint2 = [transPoint1[0], endPoint[1]];
                    }

                    if (endPoint[1] > startPoint[1]) {
                        var t3 = [transPoint1[0], endPoint[1] - 2];
                        var t4 = [transPoint1[0] - 2, endPoint[1]]
                      } else {
                        var t3 = [transPoint1[0], endPoint[1] + 2];
                        var t4 = [transPoint1[0] - 2, endPoint[1]]
                      }
                
                }

                if(len==1){
                    // if(level==rootLevel+1){   
                    //     var points = [startPoint,endPoint];
                    // }else{
                        // if(Math.abs(startPoint[1]-endPoint[1])>2){
                        //     var points = [startPoint,transPoint2,endPoint];
                        // }else{
                            var points = [startPoint,endPoint];
                      //  }
                  //  }
                   
                }else{
                  if(level==rootLevel){
                    var r=me.rights;
                    var l=me.lefts;

                    if(((r.length>=2)&&r.indexOf(child)==0)||((r.length>=2)&&r.indexOf(child)==r.length-1)){
                      
                      var points = [startPoint, transPoint1, t3, t4, endPoint];
                    
                    }else if(((l.length>=2)&&l.indexOf(child)==0)||((l.length>=2)&&l.indexOf(child)==l.length-1)){
                        var points = [startPoint, transPoint1, t3, t4, endPoint];
                    } 

                    if(r.length==1&&l.length==1){
                        var points = [startPoint,endPoint];
                    }

                    if(r.length>1&&l.length==1){
                        if(direct=='right'){
                            var points = [startPoint,transPoint2,endPoint];
                        }else{
                            var points = [startPoint,endPoint];
                        }
                    }

                  
                  } else {
                    if (direct == 'right') {
                      if (child.isFirst() || child.isLast()) {
                          if (endPoint[1] > startPoint[1]) {
                            var t3 = [transPoint1[0], endPoint[1] - 2];
                            var t4 = [transPoint1[0] + 2, endPoint[1]]
                          } else {
                            var t3 = [transPoint1[0], endPoint[1] + 2];
                            var t4 = [transPoint1[0] + 2, endPoint[1]]
                          }
                          var points = [startPoint, transPoint1, t3, t4, endPoint];
                         
                        } 
                    } else {
                      if (child.isFirst() || child.isLast()) {
                          if (endPoint[1] > startPoint[1]) {
                            var t3 = [transPoint1[0], endPoint[1] - 2];
                            var t4 = [transPoint1[0] - 2, endPoint[1]]
                          } else {
                            var t3 = [transPoint1[0], endPoint[1] + 2];
                            var t4 = [transPoint1[0] - 2, endPoint[1]]
                          }
                          var points = [startPoint, transPoint1, t3, t4, endPoint];
                        } 
                    }
                  }            
                }

                var line = me.group.polyline(me.linePoint(points,lineWidth));
                line.fill('none');
                line.stroke({ color: _stroke, width: lineWidth, linecap: 'round', linejoin: 'round' });
             
                line.source = node;
                line.target = child;

                createLine(child);
            });
        }

        createLine(this.root);

		this.root.children.forEach(c=>{
			createLayoutLine(c);
		});
	
		function createLayoutLine(node){
			if(node.isExpand()){
				if(node.layout){
					node.layout.createLink();
					return;
				}
				node.children.forEach(c=>{
					createLayoutLine(c);
				});
			}
		};
        
    }

}