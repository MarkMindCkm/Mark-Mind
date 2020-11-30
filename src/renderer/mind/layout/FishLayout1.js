import Layout from './layout';
import {
	SVG
} from '@svgdotjs/svg.js';

export default class FishLayout1 extends Layout {
	constructor() {
		super();
		this.tops = [];
		this.bottoms = [];
		this.dis = 10;
		this.levelDis = 20;
		this.firstLevelDis = 20;
		this.layoutName = 'fish';
		this.direct = 'left';
		this.angle = this.deg = Math.PI * 7 / 18;
		this.draw = SVG().addTo('#mind').size('100%', '100%');
	}
	layout(node, direct) {
		this.direct = direct || 'left';
		var me = this;

		this.tops = [];
		this.bottoms = [];
		this.root = node || this.root;
		if (!this.group) this.group = this.root.getMind().edgeGroup.group();
		this.root.layout = this;

		this.root.getChildren().forEach((child, index) => {
			if (index % 2 == 0) {
				this.tops.push(child);
				child.getNodeList().forEach((n) => {
					n.mark = 'top';
				});
			} else {
				this.bottoms.push(child);
				child.getNodeList().forEach((n) => {
					n.mark = 'bottom';
				});
			}
		});
		//	this.createExpandCollapse();
		if (this.direct == 'left') {
			this._layoutLeft();
			//this.createLink();
			//this.creatBone();
		} else if (this.direct == 'right') {
			this._layoutRight();
			// this.createLink1();
			//this.creatBone1();
		}
	}
	_layoutLeft() {
		var me = this;
		var root = this.root;
		var mind = root.getMind();
		var box = root.getBox();
		var rootPos = root.getPosition();
		var centerY = rootPos.y + box.height / 2;
		var next = [];
		//上层布局
		this.tops.forEach((child, index) => {
			var childBox = child.getCBox();
			if (index == 0) {
				child.setPosition(box.width + rootPos.x + 40 + me.dis / Math.tan(me.angle), centerY - me.dis - childBox.height);
				next = [box.width + rootPos.x + 40 + me.dis / Math.tan(me.angle) + childBox.width + me.dis, 0]
			} else {
				child.setPosition(next[0] + me.dis / Math.tan(me.angle), centerY - me.dis - childBox.height);
				next = [next[0] + childBox.width + me.dis + 40, 0]
			}
			me._layout(child, 'top');
		});

		//下层布局
		this.bottoms.forEach((child, index) => {
			var childBox = child.getBox();
			if (index == 0) {
				var x = box.width + 50 + (me.dis + childBox.height) / Math.tan(me.angle) + me.dis;
				child.setPosition(x + rootPos.x, centerY + me.dis);
				next = [x + childBox.width + me.dis + 40, 0]
			} else {
				child.setPosition(next[0] + (me.dis + childBox.height) / Math.tan(me.angle) + me.dis, centerY + me.dis);
				next = [next[0] + childBox.width + me.dis, 0]
			}
			me._layout(child, 'bottom');
		});

		// root.getMinder().updateAssist();

		this.tops.forEach((n, index) => {
			if (index > 0) {
				// var nodeBox=util.getNodeBox(this.tops[index-1],'induce');
				var nodeBox = mind.getBoundingRect(this.tops[index - 1].getShowNodeList())
				var pos = n.getPosition();
				var dx = nodeBox.right - pos.x + this.dis + 40;
				this.moveNode(n, dx, 0);
			}
		});

		this.bottoms.forEach((n, index) => {
			if (index > 0) {
				//var nodeBox=util.getNodeBox(this.bottoms[index-1],'induce');
				var nodeBox = mind.getBoundingRect(this.bottoms[index - 1].getShowNodeList())
				var pos = n.getPosition();
				var dx = nodeBox.right - pos.x + this.dis + 40;
				this.moveNode(n, dx, 0);
			}
		});

	}
	_layoutRight() {

		var me = this;
		var root = this.root;
		var mind = root.getMind();
		var box = root.getBox();
		var rootPos = root.getPosition();
		var centerY = rootPos.y + box.height / 2;
		var next = [];
		//上层布局
		this.tops.forEach((child, index) => {
			var childBox = child.getBox();
			if (index == 0) {
				child.setPosition(rootPos.x - childBox.width - me.dis - me.dis / Math.tan(me.angle) - 40, centerY - me.dis - childBox.height);
				next = [rootPos.x - childBox.width - me.dis - me.dis / Math.tan(me.angle) - 40, 0]
			} else {
				child.setPosition(next[0] - childBox.width - me.dis - me.dis / Math.tan(me.angle) - 40, centerY - me.dis - childBox.height);
				next = [next[0] - childBox.width - me.dis - me.dis / Math.tan(me.angle) - 40, 0]
			}
			me._layout1(child, 'top');
		});



		//下层布局
		this.bottoms.forEach((child, index) => {
			var childBox = child.getBox();
			if (index == 0) {
				var x = rootPos.x - childBox.width - me.dis - (me.dis + childBox.height) / Math.tan(me.angle) - 40;
				child.setPosition(x, centerY + me.dis);
				next = [x, 0]
			} else {
				child.setPosition(next[0] - childBox.width - (me.dis + childBox.height) / Math.tan(me.angle) - me.dis - 40, centerY + me.dis);
				next = [next[0] - (me.dis + childBox.height) / Math.tan(me.angle) - me.dis - 40, 0]
			}
			me._layout1(child, 'bottom');
		});

		// root.getMinder().updateAssist();

		this.tops.forEach((n, index) => {
			if (index > 0) {
				// var nodeBox=util.getNodeBox(this.tops[index-1],'induce');
				var nodeBox = mind.getBoundingRect(this.tops[index - 1].getShowNodeList())
				var pos = n.getPosition();
				var box = n.getBox();
				var dx = pos.x - nodeBox.x + this.dis + box.width + 40;
				this.moveNode(n, -dx, 0);
			}

		});

		this.bottoms.forEach((n, index) => {
			if (index > 0) {
				// var nodeBox=util.getNodeBox(this.bottoms[index-1],'induce');
				var nodeBox = mind.getBoundingRect(this.bottoms[index - 1].getShowNodeList())
				var pos = n.getPosition();
				var box = n.getBox();
				var dx = pos.x - nodeBox.x + this.dis + box.width + 40;
				this.moveNode(n, -dx, 0);
			}
		});

	}
	_layout(node, type) {
		if (!node.isExpand()) {
			return;
		}
		if (node.callout) {
			node.callout.refresh();
		}

		var me = this;
		if (type == 'top') {

			var box = node.getBox();
			var pos = node.getPosition();
			var x = box.width + pos.x + me.dis;
			var next = [];
			node.getChildren().forEach((child, index) => {
				var childBox = child.getCBox();
				if (index == 0) {
					var firstx = x + (box.height + me.dis + childBox.bh) / Math.tan(me.angle);
					var firsty = pos.y - childBox.height - childBox.bh - me.dis;
					child.setPosition(firstx, firsty);
					//next=[firstx+(childBox.height+childBox.bh+me.dis)/Math.tan(me.angle),firsty-me.dis];
					next = [firstx, firsty]
				} else {
					var nx = next[0] + (childBox.height + childBox.bh + me.dis) / Math.tan(me.angle);
					var ny = next[1] - me.dis - childBox.height - childBox.bh;
					child.setPosition(nx, ny);
					// child.setPosition(next[0],next[1]-childBox.height-childBox.bh);
					// next=[next[0]+(childBox.height+childBox.bh+me.dis)/Math.tan(me.angle),next[1]-childBox.height-childBox.bh-me.dis];
					next = [nx, ny];
				}

			});

			node.getChildren().forEach((child, index) => {
				if (index == node.getChildren().length - 1) {
					me.adjustNode(child, type);
				}
			});

			node.getChildren().forEach((child) => {
				me._layout(child, type);
			});

		} else {
			var box = node.getBBox();
			var pos = node.getPosition();
			var x = box.width + pos.x + me.dis;
			var next = [];
			node.getChildren().forEach((child, index) => {
				var childBox = child.getCBox();
				childBox.height += childBox.th;
				if (index == 0) {
					var firstx = x + (childBox.height + me.dis) / Math.tan(me.angle);
					var firsty = pos.y + box.height + me.dis;
					child.setPosition(firstx, firsty);
					next = [firstx, firsty + me.dis + childBox.height];
				} else {
					child.setPosition(next[0] + (childBox.height + me.dis) / Math.tan(me.angle), next[1]);
					next = [next[0] + (childBox.height + me.dis) / Math.tan(me.angle), next[1] + childBox.height + me.dis];
				}

			});

			node.getChildren().forEach((child, index) => {
				if (index == node.getChildren().length - 1) {
					me.adjustNode(child, type);
				}
			});

			node.getChildren().forEach((child) => {
				me._layout(child, type);
			});
		}
	}

	_layout1(node, type) {
		if (!node.isExpand()) {
			return;
		}
		var me = this;
		if (type == 'top') {
			var box = node.getBBox();
			var pos = node.getPosition();
			var x = pos.x - me.dis;
			var next = [];
			node.getChildren().forEach((child, index) => {
				var childBox = child.getBBox();
				if (index == 0) {
					var firstx = x - childBox.width - (box.height + me.dis) / Math.tan(me.angle);
					var firsty = pos.y - childBox.height - me.dis;
					child.setPosition(firstx, firsty);
					next = [firstx, firsty - me.dis];
				} else {
					var prevNode = node.getChildren()[index - 1];
					var prevNodeBox = prevNode.getBBox();
					var prevNodePos = prevNode.getPosition();

					child.setPosition(prevNodePos.x + prevNodeBox.width - (prevNodeBox.height + me.dis) / Math.tan(me.angle) - childBox.width, next[1] - childBox.height);
					next = [prevNodePos.x + prevNodeBox.width - (prevNodeBox.height + me.dis) / Math.tan(me.angle) - childBox.width, next[1] - childBox.height - me.dis];
				}
			});

			node.getChildren().forEach((child, index) => {
				if (index == node.getChildren().length - 1) {
					me.adjustNode1(child, type);
				}
			});
			node.getChildren().forEach((child) => {
				me._layout1(child, type);
			});
		} else {
			var box = node.getBBox();
			var pos = node.getPosition();
			var x = pos.x - me.dis;
			var next = [];
			node.getChildren().forEach((child, index) => {
				var childBox = child.getBBox();
				if (index == 0) {
					var firstx = x - childBox.width - (childBox.height + me.dis) / Math.tan(me.angle);
					var firsty = pos.y + box.height + me.dis;
					child.setPosition(firstx, firsty);
					next = [firstx, firsty + me.dis + childBox.height];
				} else {
					var prevNode = node.getChildren()[index - 1];
					var prevNodeBox = prevNode.getBBox();
					var prevNodePos = prevNode.getPosition();

					child.setPosition(prevNodePos.x + prevNodeBox.width - (childBox.height + me.dis) / Math.tan(me.angle) - childBox.width, next[1]);
					next = [prevNodePos.x + prevNodeBox.width - (childBox.height + me.dis) / Math.tan(me.angle) - childBox.width, next[1] + childBox.height + me.dis];
				}

			});
			node.getChildren().forEach((child, index) => {
				if (index == node.getChildren().length - 1) {
					me.adjustNode1(child, type);
				}
			});
			node.getChildren().forEach((child) => {
				me._layout1(child, type);
			})
		}
	}

	// moveNode(node, dx, dy) {
	//     node && node.move(dx, dy);
	//     node && node.getChildren().forEach((child) => {
	//         this.moveNode(child, dx, dy);
	//     });
	// }

	adjustNode(node, type) {
		var pos = node.getPosition();
		var box = node.getBBox();
		var parent = node.getParent();
		var parentPos = parent.getPosition();
		var parentBox = parent.getBBox();
		if (type == 'top') {
			var h = parentPos.y - pos.y;
		} else {
			var h = pos.y - parentPos.y - parentBox.height + box.height;
		}
		var x = h / Math.tan(this.angle);
		while (parent.getLevel() > 1) {
			parentPos = parent.getPosition();
			var siblings = parent.getSiblings();
			siblings.forEach((sib) => {
				var sibPos = sib.getPosition();
				if (type == 'top') {
					if (sibPos.y < parentPos.y) {
						this.moveNode(sib, x, -h);
					}
				} else if (type == 'bottom') {
					if (sibPos.y > parentPos.y) {
						this.moveNode(sib, x, h);
					}
				}

			});
			parent = parent.getParent();
		}
	}

	adjustNode1(node, type) {
		var me = this;
		var pos = node.getPosition();
		var box = node.getBBox();
		var parent = node.getParent();
		var parentPos = parent.getPosition();
		var parentBox = parent.getBBox();
		if (type == 'top') {
			var h = parentPos.y - pos.y;
		} else {
			var h = pos.y - parentPos.y - parentBox.height + box.height;
		}
		var x = h / Math.tan(this.angle);
		while (parent.getLevel() > 1) {
			parentPos = parent.getPosition();
			var siblings = parent.getSiblings();
			siblings.forEach((sib) => {
				var sibPos = sib.getPosition();
				if (type == 'top') {
					if (sibPos.y < parentPos.y) {
						this.moveNode(sib, -x, -h);
					}
				} else if (type == 'bottom') {
					if (sibPos.y > parentPos.y) {
						this.moveNode(sib, -x, h);
					}
				}

			});
			parent = parent.getParent();
		}
	}

	createLink() {
		if (!this.group) {
			return
		}

		this.group.clear();

		if (this.root.getChildren().length == 0) {
			return;
		}

		if (this.direct == 'right') {
			this.createLink1();
			return;
		}
		
		var me = this;
		var dis = this.dis;
		
		var lineWidth = 2;

		function createLine(node, type) {

			var box = node.getBox();
			var pos = node.getPosition();
			// stroke=node.stroke||stroke||'rgb(160,160,160)';         

			if (node.getLevel() == 1) {
				if (type == 'top') {
					var fromPoint = [(pos.x - me.dis / Math.tan(me.angle)), (pos.y + box.height + me.dis)];
					var transPoint = [(pos.x), (pos.y + box.height) + 1];
					var toPoint = [(transPoint[0] + box.width) + 1, (transPoint[1])];
					
					var line = me.group.polyline(me.linePoint([fromPoint, transPoint, toPoint], lineWidth));
					line.fill('none');
					line.stroke({
						color: '#333',
						width: lineWidth,
						linecap: 'round',
						linejoin: 'round'
					});

				} else if (type == 'bottom') {
					var fromPoint = [(pos.x - (me.dis + box.height) / Math.tan(me.angle)), parseInt(pos.y - me.dis)];
					var transPoint = [(pos.x), (pos.y + box.height) + 1];
					var toPoint = [(transPoint[0] + box.width) + 1, transPoint[1]];
					
					var line = me.group.polyline(me.linePoint([fromPoint, transPoint, toPoint], lineWidth));
					line.fill('none');
					line.stroke({
						color: '#333',
						width: lineWidth,
						linecap: 'round',
						linejoin: 'round'
					});
				}
			} else {
				var parent = node.getParent();
				var ppos = parent.getPosition();
				var pbox = parent.getBox();

				if (node.isLast()) {
					var fromPoint = [(ppos.x + pbox.width) - 1, (ppos.y + pbox.height) + 1];
					var transPoint1 = [(fromPoint[0] + me.dis), fromPoint[1]];
					var transPoint2 = [(pos.x), (pos.y + box.height) + 1];
					var toPoint = [(transPoint2[0] + box.width), transPoint2[1]];
					var point = [fromPoint, transPoint1, transPoint2, toPoint];
				} else {
					var transPoint2 = [(pos.x), (pos.y + box.height) + 1];
					var toPoint = [(transPoint2[0] + box.width), transPoint2[1]];
					var point = [transPoint2, toPoint];
				}

				

				var line = me.group.polyline(me.linePoint(point, lineWidth));
				line.fill('none');
				line.stroke({
					color: '#333',
					width: lineWidth,
					linecap: 'round',
					linejoin: 'round'
				});

			}
			if (node.isExpand()) {
				node.getChildren().forEach((child) => {
					createLine(child, type);
				});
			}

		}

		this.tops.forEach((n) => {
			createLine(n, 'top');
		});
		this.bottoms.forEach((n) => {
			createLine(n, 'bottom');
		});

		this.creatBone();
	}

	createLink1() {
		var me = this;
		var dis = this.dis;
		if (this.root.getChildren().length == 0) {
			return;
		}

		if (!this.group) {
			return
		}
		this.group.clear();

		// this.gLine=new zrender.Group({
		// 	z:6
		// });

		// let config=theme.use().config;
		// let stroke=config['stroke'];
		// let lineWidth=config['lineWidth'];
		var lineWidth = 2;

		function createLine(node, type) {

			var box = node.getBox();
			var pos = node.getPosition();

			//   stroke=node.stroke||stroke||'rgb(160,160,160)';          

			var len = node.getChildren().length;
			if (node.getLevel() == 1) {
				if (type == 'top') {
					var fromPoint = [(pos.x + box.width + me.dis / Math.tan(me.angle)), (pos.y + box.height + me.dis)];
					var transPoint = [(pos.x + box.width), (pos.y + box.height) + 1];
					var toPoint = [(pos.x - 1), transPoint[1]];
					//  var line=new zrender.Polyline({
					//  	style:{
					//  		stroke,
					//  		lineWidth
					//  	},
					//  	shape:{
					//  	  points:me.linePoint([fromPoint,transPoint,toPoint],lineWidth)
					//  	}
					//  });
					// me.gLine.add(line);
					var line = me.group.polyline(me.linePoint([fromPoint, transPoint, toPoint], lineWidth));
					line.fill('none');
					line.stroke({
						color: '#333',
						width: lineWidth,
						linecap: 'round',
						linejoin: 'round'
					});

				} else if (type == 'bottom') {
					var fromPoint = [(pos.x + box.width + (me.dis + box.height) / Math.tan(me.angle)), (pos.y - me.dis)];
					var transPoint = [(pos.x + box.width), (pos.y + box.height) + 1];
					var toPoint = [(pos.x - 1), transPoint[1]];
					//   var line=new zrender.Polyline({
					//  	style:{
					//  		stroke,
					//  		lineWidth
					//  	},
					//  	shape:{
					// 		points:me.linePoint([fromPoint,transPoint,toPoint],lineWidth)
					//  	}
					//  });
					//  me.gLine.add(line);
					var line = me.group.polyline(me.linePoint([fromPoint, transPoint, toPoint], lineWidth));
					line.fill('none');
					line.stroke({
						color: '#333',
						width: lineWidth,
						linecap: 'round',
						linejoin: 'round'
					});
				}
			} else {
				var parent = node.getParent();
				var ppos = parent.getPosition()
				var pbox = parent.getBox();

				if (node.isLast()) {
					var fromPoint = [(ppos.x) + 1, (ppos.y + pbox.height) + 1];
					var transPoint1 = [(fromPoint[0] - me.dis), fromPoint[1]];
					var transPoint2 = [(pos.x + box.width), (pos.y + box.height) + 1];
					var toPoint = [(pos.x), transPoint2[1]];
					var point = [fromPoint, transPoint1, transPoint2, toPoint];
				} else {
					var transPoint2 = [(pos.x + box.width), (pos.y + box.height) + 1];
					var toPoint = [(pos.x), transPoint2[1]];
					var point = [transPoint2, toPoint];
				}

				// 	var line=new zrender.Polyline({
				// 	   style:{
				// 			 stroke,
				// 			 lineWidth
				// 	   },
				// 	   shape:{
				// 		   points:me.linePoint(point,lineWidth)
				// 	   },
				// 	   z:9
				// });
				//   me.gLine.add(line);
				var line = me.group.polyline(me.linePoint(point, lineWidth));
				line.fill('none');
				line.stroke({
					color: '#333',
					width: lineWidth,
					linecap: 'round',
					linejoin: 'round'
				});
			}
			if (node.isExpand()) {
				node.getChildren().forEach((child) => {
					createLine(child, type)
				});
			}
		}

		this.tops.forEach((n) => {
			createLine(n, 'top');
		});
		this.bottoms.forEach((n) => {
			createLine(n, 'bottom');
		});

		// this.root.getMinder().addLine(this.gLine);
		this.creatBone1();
	}

	creatBone() {
		var me = this;
		//   if(this.boneGroup){
		//       this.gLine.remove(this.boneGroup);
		//   }
		//   this.boneGroup=new zrender.Group();
		//   this.gLine.add(this.boneGroup);
		var mind = this.root.getMind();
		var root = this.root;
		var rootBox = root.getBox();
		var rootPos = root.getPosition();

		var nodeBox = mind.getBoundingRect(root.getShowNodeList());
		// let config=theme.use().config;
		//  let stroke=config['stroke'];
		// let lineWidth=config['lineWidth'];
		var lineWidth = 2;

		// stroke=stroke||root.stroke||child.stroke||'rgb(160,160,160)';          

		if (lineWidth % 2 == 1) {
			var x1 = parseInt(rootPos.x + rootBox.width) + 0.5;
			var y1 = parseInt(rootPos.y + rootBox.height / 2) + 0.5;
			var x2 = parseInt(rootPos.x + rootBox.width / 2 + nodeBox.width - 10) + 0.5;
			var y2 = y1;
		} else {
			var x1 = parseInt(rootPos.x + rootBox.width);
			var y1 = parseInt(rootPos.y + rootBox.height / 2);
			var x2 = parseInt(rootPos.x + rootBox.width / 2 + nodeBox.width - 10);
			var y2 = y1;
		}
		//   var line=new zrender.Line({
		//           style:{
		//           	stroke:stroke,
		//           	lineWidth:lineWidth
		//           },
		//           shape:{
		//           	 x1,
		//           	 y1,
		//           	 x2,
		//           	 y2
		//           }
		//   });
		me.group.line(x1, y1, x2, y2)
			.stroke({
				color: '#333',
				width: lineWidth,
				linecap: 'round',
				linejoin: 'round'
			});


		var points1 = [rootPos.x + rootBox.width / 2 + nodeBox.width - 10, y1];
		var points2 = [points1[0] + 60, points1[1] - 30];
		var points3 = [points1[0] + 60, points1[1] + 30];

		//   var s=new zrender.Polygon({
		//   	 style:{
		//   	 	fill:'transparent',
		// 		   stroke:stroke,
		// 		   lineWidth:lineWidth
		//   	 },
		//   	 shape:{
		//   	 	points:[points1,points2,points3]
		//   	 }
		//   })
		//   this.boneGroup.add(line);
		//   this.boneGroup.add(s);
		me.group.polygon([points1, points2, points3])
			.fill('lightskyblue')
			.stroke({
				color: '#333',
				width: 2,
				linecap: 'round',
				linejoin: 'round'
			});

	}

	creatBone1() {
		var me = this;
		//  if(this.boneGroup){
		//     this.gLine.remove(this.boneGroup);
		//   }
		//   this.boneGroup=new zrender.Group();
		//   this.gLine.add(this.boneGroup);

		var root = this.root;
		var mind = root.getMind();
		var rootBox = root.getBox();
		var rootPos = root.getPosition();
		var nodeBox = mind.getBoundingRect(root.getShowNodeList());

		//   var nodeBox=util.getNodeBox(root,'induce');
		//   let config=theme.use().config;
		//   let stroke=config['stroke'];
		//   let lineWidth=config['lineWidth'];
		var lineWidth = 2;

		//  stroke=stroke||root.stroke||child.stroke||'rgb(160,160,160)';         
		if (lineWidth % 2 == 1) {
			var x1 = parseInt(rootPos.x) + 0.5;
			var y1 = parseInt(rootPos.y + rootBox.height / 2) + 0.5;
			var x2 = parseInt(rootPos.x - nodeBox.width + 40) + 0.5;
			var y2 = y1;
		} else {
			var x1 = parseInt(rootPos.x);
			var y1 = parseInt(rootPos.y + rootBox.height / 2);
			var x2 = parseInt(rootPos.x - nodeBox.width + 40);
			var y2 = y1;
		}

		//   var line=new zrender.Line({
		//           style:{
		//           	stroke:stroke,
		//           	lineWidth:lineWidth
		//           },
		//           shape:{
		//           	 x1,
		//           	 y1,
		//           	 x2,
		//           	 y2
		//           }
		//   });

		me.group.line(x1, y1, x2, y2)
			.stroke({
				color: '#333',
				width: lineWidth,
				linecap: 'round',
				linejoin: 'round'
			});



		var points1 = [rootPos.x - nodeBox.width + 40, y1];
		var points2 = [points1[0] - 60, points1[1] - 30];
		var points3 = [points1[0] - 60, points1[1] + 30];

		//   var s=new zrender.Polygon({
		//   	 style:{
		//   	 	fill:'transparent',
		// 		stroke,
		// 		lineWidth
		//   	 },
		//   	 shape:{
		//   	 	points:[points1,points2,points3]
		//   	 }
		//   })
		//   this.boneGroup.add(line);
		//   this.boneGroup.add(s);

		me.group.polygon([points1, points2, points3])
			.fill('lightskyblue')
			.stroke({
				color: '#333',
				width: 2,
				linecap: 'round',
				linejoin: 'round'
			});
	}

	refresh() {

		this.tops = [];
		this.bottoms = [];
		this.layout(this.root, this.direct);
		this.createLink();
	}



}