import Layout from './layout';
import theme from '../theme'
export default class FishLayout extends Layout {
	constructor(isCache = true) {
		super();
		this.tops = [];
		this.bottoms = [];
		this.dis = 10;
		this.levelDis = 20;
		this.firstLevelDis = 20;
		this.layoutName = 'fish';
		this.direct = 'left';
		this.type = 'fish';
		this.angle = this.deg = Math.PI * 7 / 18;
		this.isCache = isCache;
	}
	layout(node, direct) {
		this.direct=direct||'right';

		this.tops = [];
		this.bottoms = [];
		this.root = node || this.root;
		if (!this.root.isExpand()) return;
		if (!this.group) this.group = this.root.getMind().edgeGroup.group();

		this.root.layout = this;
		if (!this.root.parent) {
			this.root.dom.classList.add('node-root');
		}

		var len = this.root.children.length;

		this.root.getChildren().forEach((child, index) => {
			if (index < Math.ceil(len / 2)) {
				this.tops.push(child);
				child.getNodeList().forEach((n) => {
					n.mark = 'top';
					n.dom.classList = [];
					n.dom.classList.add('node');
					n.dom.classList.add('node-' + this.direct);
					n.direct = this.direct;
					if (n.isLeaf() && !n.dom.classList.contains('node-leaf')) {
						n.dom.classList.add('node-leaf');
					} else {
						if (n.dom.classList.contains('node-leaf')) {
							n.dom.classList.remove('node-leaf')
						}
					}
				});
			} else {
				this.bottoms.push(child);
				child.getNodeList().forEach((n) => {
					n.mark = 'bottom';
					n.dom.classList = [];
					n.dom.classList.add('node');
					n.dom.classList.add('node-' + this.direct);
					n.direct = this.direct;
					if (n.isLeaf() && !n.dom.classList.contains('node-leaf')) {
						n.dom.classList.add('node-leaf');
					} else {
						if (n.dom.classList.contains('node-leaf')) {
							n.dom.classList.remove('node-leaf')
						}
					}
				});
			}
		});
		if (this.direct == 'left') {
			this._layoutRight();
		} else if (this.direct == 'right') {
			this._layoutLeft();
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
			child.direct = 'top';
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
			child.direct = 'down';
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

		this.tops.forEach((n, index) => {
			if (index > 0) {
				var nodeBox = mind.getBBox(this.tops[index - 1])
				var pos = n.getPosition();
				var dx = nodeBox.right - pos.x + this.dis + 40;
				
				this.moveNode(n, dx, 0);
			}
		});

		this.bottoms.forEach((n, index) => {
			if (index > 0) {
				var nodeBox = mind.getBBox(this.bottoms[index - 1])
				var pos = n.getPosition();
				var dx = nodeBox.right - pos.x + this.dis + 40;
				this.moveNode(n, dx, 0);
			}
		});

		this.tops.forEach(t => {
			this._updateNodeAssist(t, this.root);
		});

		this.bottoms.forEach(t => {
			this._updateNodeAssist(t, this.root);
		});


		this._updateRootAssist();

	}


	_layoutRight() {

		var me = this;
		var root = this.root;
		var mind = root.getMind();
		var box = root.getBox();
		var rootPos = root.getPosition();
		var centerY = rootPos.y + box.height / 2;
		var next = [];
		
		this.tops.forEach((child, index) => {
			child.direct = 'top';
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


		this.bottoms.forEach((child, index) => {
			child.direct = 'down';
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

		this.tops.forEach((n, index) => {
			if (index > 0) {
				var nodeBox = mind.getBBox(this.tops[index - 1])
				var pos = n.getPosition();
				var box = n.getBox();
				var dx = pos.x - nodeBox.x + this.dis + box.width + 40;
				this.moveNode(n, -dx, 0);
			}

		});

		this.bottoms.forEach((n, index) => {
			if (index > 0) {
				var nodeBox = mind.getBBox(this.bottoms[index - 1]);
				var pos = n.getPosition();
				var box = n.getBox();
				var dx = pos.x - nodeBox.x + this.dis + box.width + 40;
				this.moveNode(n, -dx, 0);
			}
		});


		this.tops.forEach(t => {
			this._updateNodeAssist(t);
		})

		this.bottoms.forEach(t => {
			this._updateNodeAssist(t);
		})

		this._updateRootAssist();

	}
	_layout(node, type) {
		if (!node.isExpand()) {
			return;
		}
		if (node.layout) {
			if (node.layout.group) {
				node.layout.group.clear();
				node.layout.group.remove();
				node.layout.group = null;
			}
		}

		var me = this;
		var mind = node.getMind();
		if (type == 'top') {
			var box = node.getBox();
			var pos = node.getPosition();
			var x = box.width + pos.x + me.dis;
			var children = node.getChildren();
			var firsty = 0,
				firstx = 0;
			children.forEach((child, index) => {
				if (!child.isShow()) {
					return
				}
				if (child.callout) {
					child.callout.refresh()
				}
				var childBox = child.getCBox();
				if (index == 0) {
					firstx = x + (me.dis + box.height + childBox.bh) / Math.tan(me.angle);
					firsty = pos.y - childBox.height - childBox.bh - me.dis;
					child.setPosition(firstx, firsty);
				} else {
					
					var b = mind.getBBox(children[index - 1]);
					
					var bpos = children[index - 1].getCBox();
					var h = bpos.y - b.y;
					var dx = (h + me.dis + childBox.bh + bpos.height) / Math.tan(me.angle);
					var nx = bpos.x + dx;
					var ny = b.y - me.dis - childBox.height - childBox.bh;
					child.setPosition(nx, ny);
				}

				me._updateNodeAssist(child, me.root);

				me._layout(child, type);

			});

		} else {
			var box = node.getBox();
			var pos = node.getPosition();
			var x = box.width + pos.x + me.dis;
			var firsty = 0,
				firstx = 0;
			var children = node.getChildren();
			node.getChildren().forEach((child, index) => {

				if (!child.isShow()) {
					return
				}
				if (child.callout) {
					child.callout.refresh()
				}

				var childBox = child.getCBox();
				var wh = 0;
		
				if (index == 0) {
					var dx = (me.dis + childBox.th + childBox.height) / Math.tan(me.angle);
					firstx = x + dx;
					firsty = pos.y + box.height + me.dis + childBox.th + wh;
					child.setPosition(firstx, firsty);
				} else {
					
					var b = mind.getBBox(children[index - 1]);
					var bb = children[index - 1].getCBox();
					
					var h = me.dis + childBox.th + childBox.height + b.y + b.height - bb.y - bb.height;
					var dx = h / Math.tan(me.angle);

					var nx = bb.x + dx;
					var ny = b.y + b.height + me.dis + childBox.th;
					child.setPosition(nx, ny);
					
				}

				me._updateNodeAssist(child, me.root);

				me._layout(child, type);

			});

			
		}
	}

	_layout1(node, type) {
		if (!node.isExpand()) {
			return;
		}
		if (node.layout) {
			if (node.layout.group) {
				node.layout.group.clear();
				node.layout.group.remove();
				node.layout.group = null;
			}
		}

		var me = this;
		var mind = node.getMind();
		var children = node.getChildren();
		if (type == 'top') {
			var box = node.getBox();
			var pos = node.getPosition();

			var x = pos.x - me.dis;

			children.forEach((child, index) => {
				if (!child.isShow()) {
					return
				}
				if (child.callout) {
					child.callout.refresh()
				}

				var childBox = child.getCBox();
				if (index == 0) {
					var firstx = x - childBox.width - (box.height + me.dis + childBox.bh) / Math.tan(me.angle);
					var firsty = pos.y - childBox.height - childBox.bh - me.dis;
					child.setPosition(firstx, firsty);
				} else {
					var wh = 0;
				
					var b = mind.getBBox(children[index - 1]);
					
					var bpos = children[index - 1].getBox();
					var h = bpos.y - b.y;
					var dx = (h + me.dis + bpos.height + childBox.bh + wh) / Math.tan(me.angle);
					var nx = bpos.x + bpos.width - childBox.width - dx;
					var ny = b.y - me.dis - childBox.height - childBox.bh - wh;
					child.setPosition(nx, ny);
				}

				me._updateNodeAssist(child, me.root);

				me._layout1(child, type);

			});

			
		} else {
			var box = node.getBox();
			var pos = node.getPosition();
			var x = pos.x - me.dis;
			node.getChildren().forEach((child, index) => {
				if (!child.isShow()) {
					return
				}
				if (child.callout) {
					child.callout.refresh()
				}
				var childBox = child.getCBox();
				var wh = 0;

				if (index == 0) {
					var firstx = x - childBox.width - (childBox.height + me.dis + childBox.th + wh) / Math.tan(me.angle);
					var firsty = pos.y + box.height + me.dis + childBox.th + wh;
					child.setPosition(firstx, firsty);
					
				} else {

					var b = mind.getBBox(children[index - 1]);
					var bpos = children[index - 1].getBox();
					var h = b.y + b.height - bpos.y - bpos.height;
					var dx = (h + me.dis + childBox.th + wh + childBox.height) / Math.tan(me.angle);
					var nx = bpos.x + bpos.width - childBox.width - dx;
					var ny = bpos.y + me.dis + h + childBox.th + wh + bpos.height;
					child.setPosition(nx, ny);
				}

				me._updateNodeAssist(child, me.root);

				me._layout1(child, type);
			});
		
		}
	}

	

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
	
		this.group && this.group.clear();

		if (!this.group) {
			return
		}
		if (this.root.getChildren().length == 0) {
			return;
		}
		if (this.direct == 'left') {
			this.createLink1();
			return;
		}
		var me = this;
		var dis = this.dis;
	
		let config = theme.use().config;
		let stroke = config['stroke'];
		let lineWidth = config['lineWidth'];
		// var lineWidth=2,stroke='#666';
		var rootLevel = this.root.getLevel();

		function createLine(node, type) {

			var box = node.getBox();
			var pos = node.getPosition();
			stroke = node.stroke || stroke || 'rgb(160,160,160)';

			if (node.getLevel() == rootLevel + 1) {
				if (type == 'top') {
					var fromPoint = [(pos.x - me.dis / Math.tan(me.angle)), parseInt(pos.y + box.height + me.dis)];
					var transPoint = [(pos.x), (pos.y + box.height) + 1];
					var toPoint = [(transPoint[0] + box.width) + 1, (transPoint[1])];
					
					var line = me.group.polyline(me.linePoint([fromPoint, transPoint, toPoint], lineWidth));
					line.fill('none');
					line.stroke({
						color: stroke,
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
						color: stroke,
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
					color: stroke,
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

		if (!this.group) {
			return
		}

		this.group && this.group.clear();
		if (this.root.getChildren().length == 0) {
			return;
		}
		let config = theme.use().config;
		let stroke = config['stroke'];
		let lineWidth = config['lineWidth'];
		var rootLevel = this.root.getLevel();

		function createLine(node, type) {

			var box = node.getBox();
			var pos = node.getPosition();

			stroke = node.stroke || stroke || 'rgb(160,160,160)';

			var len = node.getChildren().length;
			if (node.getLevel() == rootLevel + 1) {
				if (type == 'top') {
					var fromPoint = [(pos.x + box.width + me.dis / Math.tan(me.angle)), parseInt(pos.y + box.height + me.dis)];
					var transPoint = [(pos.x + box.width), (pos.y + box.height) + 1];
					var toPoint = [(pos.x - 1), transPoint[1]];
					var line = me.group.polyline(me.linePoint([fromPoint, transPoint, toPoint], lineWidth));
					line.fill('none');
					line.stroke({
						color: stroke,
						width: lineWidth,
						linecap: 'round',
						linejoin: 'round'
					});

				} else if (type == 'bottom') {
					var fromPoint = [(pos.x + box.width + (me.dis + box.height) / Math.tan(me.angle)), parseInt(pos.y - me.dis)];
					var transPoint = [(pos.x + box.width), (pos.y + box.height) + 1];
					var toPoint = [(pos.x - 1), transPoint[1]];
					var line = me.group.polyline(me.linePoint([fromPoint, transPoint, toPoint], lineWidth));
					line.fill('none');
					line.stroke({
						color: stroke,
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

				var line = me.group.polyline(me.linePoint(point, lineWidth));
				line.fill('none');
				line.stroke({
					color: stroke,
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

		this.creatBone1();
	}

	creatBone() {
		var me = this;
		if (!this.isShow) {
			return;
		}
		if (!this.group) return;

		var mind = this.root.getMind();
		var root = this.root;
		var rootBox = root.getBox();
		var rootPos = root.getPosition();

		var nodeBox = mind.getBoundingRect(root.getShowNodeList());
		let config = theme.use().config;
		let stroke = config['stroke'];
		let lineWidth = config['lineWidth'];
		// var lineWidth=2;

		let _stroke = root.stroke || stroke || 'rgb(160,160,160)';

		if (lineWidth % 2 == 1) {
			var x1 = parseInt(rootPos.x + rootBox.width) + 0.5;
			var y1 = parseInt(rootPos.y + rootBox.height / 2) + 0.5;
			var x2 = parseInt(rootPos.x + nodeBox.width + 30) + 0.5;
			var y2 = y1;
		} else {
			var x1 = parseInt(rootPos.x + rootBox.width);
			var y1 = parseInt(rootPos.y + rootBox.height / 2);
			var x2 = parseInt(rootPos.x + nodeBox.width + 30);
			var y2 = y1;
		}

		me.group.line(x1, y1, x2, y2)
			.stroke({
				color: _stroke,
				width: lineWidth,
				linecap: 'round',
				linejoin: 'round'
			});


		var points1 = [rootPos.x + nodeBox.width + 30, y1];
		var points2 = [points1[0] + 60, points1[1] - 30];
		var points3 = [points1[0] + 60, points1[1] + 30];

		me.fishTail = me.group.polygon([points1, points2, points3])
			.fill('lightskyblue')
			.stroke({
				color: _stroke,
				width: 2,
				linecap: 'round',
				linejoin: 'round'
			});

	}

	creatBone1() {
		var me = this;
		if (!this.group) {
			return;
		}

		var root = this.root;
		var mind = root.getMind();
		var rootBox = root.getBox();
		var rootPos = root.getPosition();
		var nodeBox = mind.getBoundingRect(root.getShowNodeList());


		let config = theme.use().config;
		let stroke = config['stroke'];
		let lineWidth = config['lineWidth'];


		let _stroke = root.stroke || stroke || 'rgb(160,160,160)';
		if (lineWidth % 2 == 1) {
			var x1 = parseInt(rootPos.x) + 0.5;
			var y1 = parseInt(rootPos.y + rootBox.height / 2) + 0.5;
			var x2 = parseInt(nodeBox.x - 40) + 0.5;
			var y2 = y1;
		} else {
			var x1 = parseInt(rootPos.x);
			var y1 = parseInt(rootPos.y + rootBox.height / 2);
			var x2 = parseInt(nodeBox.x - 40);
			var y2 = y1;
		}

		me.group.line(x1, y1, x2, y2)
			.stroke({
				color: _stroke,
				width: lineWidth,
				linecap: 'round',
				linejoin: 'round'
			});

		var points1 = [nodeBox.x - 40, y1];
		var points2 = [points1[0] - 60, points1[1] - 30];
		var points3 = [points1[0] - 60, points1[1] + 30];

		me.fishTail = me.group.polygon([points1, points2, points3])
			.fill('lightskyblue')
			.stroke({
				color: _stroke,
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