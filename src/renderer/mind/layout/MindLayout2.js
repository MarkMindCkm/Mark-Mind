import MindLayout from './MindLayout';
import theme from '../theme'

export default class MindLayout1 extends MindLayout {
	constructor() {
		super();
		this.firstLevelDis = 40;
		this.levelDis = 30;
		this.nodeDis = 10;
		this.type = 'minder';
		this.layoutName = "minder2";
		this.during = 50;
	}

	createLink() {
		var me = this;
		var dis = this.levelDis;

		var root = this.root;
		if (!this.group) {
			return;
		}

		this.group.clear();

		if (!this.root.isExpand()) {
			return;
		}
		var lineWidth = theme.use().config['lineWidth'] || 2;
		var stroke = theme.use().config['stroke'];

		var rights = root.children.filter((item) => {
			return item.direct == 'right'
		});

		var lefts = root.children.filter((item) => {
			return item.direct == 'left'
		});

		var rootBox = root.getBox();
		var rootPos = root.getPosition();

		var rlen = rights.length;
		var llen = lefts.length;

		function createFirstLine() {
			var rt = [];
			var rb = [];
			rights.forEach(c => {
				if (c.getPosition().y + c.getBox().height / 2 > rootBox.height / 2 + rootPos.y) {
					rb.push(c);
				} else {
					rt.push(c);
				}
			});
			var rtlen = rt.length;
			var rblen = rb.length;
			var rtd = parseInt((rootBox.width / 2 - 6) / rtlen);
			var rbd = parseInt((rootBox.width / 2 - 6) / rblen);

			rt.forEach((child, i) => {
				var childBox = child.getBox();

				var childPos = child.getPosition();

				var toy = childBox.height / 2 + childPos.y;
				var c = toy - (rootBox.height / 2 + rootPos.y);
				var p1 = [rootPos.x + rootBox.width / 2 + 6 + rtd * i, rootPos.y + rootBox.height / 2];

				if (Math.abs(c) > 2) {
					var p2 = [p1[0], toy - 2 * c / Math.abs(c)];
					var p3 = [p1[0] + 2, toy]
				} else {
					var p2 = [p1[0], toy - c / 2];
					var p3 = [p1[0] + Math.abs(c) / 2, toy];
				}
				var p4 = [childPos.x, toy];
			
				let _stroke = child.stroke || stroke || 'rgb(160,160,160)';
				var line = me.group.polyline(me.linePoint([p1, p2, p3, p4], lineWidth + 2)).stroke({
					color: _stroke,
					width: lineWidth + 2,
					linecap: 'round',
					linejoin: 'round'
				}).fill('none');
				child.line = line;
			
			});

			rb.reverse().forEach((child, i) => {
				var childBox = child.getBox();
				var childPos = child.getPosition();
	
				var toy = childBox.height / 2 + childPos.y;
				var c = toy - (rootBox.height / 2 + rootPos.y);
				var p1 = [rootPos.x + rootBox.width / 2 + 6 + rbd * i, rootPos.y + rootBox.height / 2];

				if (Math.abs(c) > 2) {
					var p2 = [p1[0], toy - 2 * c / Math.abs(c)];
					var p3 = [p1[0] + 2, toy]
				} else {
					var p2 = [p1[0], toy - c / 2];
					var p3 = [p1[0] + Math.abs(c) / 2, toy];
				}
				var p4 = [childPos.x, toy];
				
				let _stroke = child.stroke || stroke || 'rgb(160,160,160)';
				var line = me.group.polyline(me.linePoint([p1, p2, p3, p4], lineWidth + 2)).stroke({
					color: _stroke,
					width: lineWidth + 2,
					linecap: 'round',
					linejoin: 'round'
				}).fill('none');
				child.line = line;
				
			});


			var lt = [];
			var lb = [];
			lefts.forEach(c => {
				if (c.getPosition().y + c.getBox().height / 2 > rootBox.height / 2 + rootPos.y) {
					lb.push(c);
				} else {
					lt.push(c);
				}
			});
			var ltlen = lt.length;
			var lblen = lb.length;
			var ltd = parseInt((rootBox.width / 2 - 12) / ltlen);
			var lbd = parseInt((rootBox.width / 2 - 12) / lblen);

			lt.forEach((child, i) => {
				var childBox = child.getBox();
				var childPos = child.getPosition();
			
				var toy = childBox.height / 2 + childPos.y;
				var c = toy - (rootBox.height / 2 + rootPos.y);
				var p1 = [rootPos.x + rootBox.width / 2 - 6 - ltd * i, rootPos.y + rootBox.height / 2];

				if (Math.abs(c) > 2) {
					var p2 = [p1[0], toy - 2 * c / Math.abs(c)];
					var p3 = [p1[0] - 2, toy]
				} else {
					var p2 = [p1[0], toy - c / 2];
					var p3 = [p1[0] - Math.abs(c) / 2, toy];
				}
				var p4 = [childPos.x + childBox.width, toy];
		
				let _stroke = child.stroke || stroke || 'rgb(160,160,160)';
				var line = me.group.polyline(me.linePoint([p1, p2, p3, p4], lineWidth + 2)).stroke({
					color: _stroke,
					width: lineWidth + 2,
					linecap: 'round',
					linejoin: 'round'
				}).fill('none');
				child.line = line;
			
			});

			lb.reverse().forEach((child, i) => {
				var childBox = child.getBox();
				var childPos = child.getPosition();
			
				var toy = childBox.height / 2 + childPos.y;
				var c = toy - (rootBox.height / 2 + rootPos.y);
				var p1 = [rootPos.x + rootBox.width / 2 - 6 - lbd * i, rootPos.y + rootBox.height / 2];
				if (Math.abs(c) > 2) {
					var p2 = [p1[0], toy - 2 * c / Math.abs(c)];
					var p3 = [p1[0] - 2, toy]
				} else {
					var p2 = [p1[0], toy - c / 2];
					var p3 = [p1[0] - Math.abs(c) / 2, toy];
				}
				var p4 = [childPos.x + childBox.width, toy];
				
				let _stroke = child.stroke || stroke || 'rgb(160,160,160)';
				var line = me.group.polyline(me.linePoint([p1, p2, p3, p4], lineWidth + 2)).stroke({
					color: _stroke,
					width: lineWidth + 2,
					linecap: 'round',
					linejoin: 'round'
				}).fill('none');
				child.line = line;
			
			});

		}

		createFirstLine();

		function createLine(node) {
			if (node.layout) {
				return;
			}

			if (!node.isExpand()) {
				return;
			}

			var children = node.getChildren();
			var len = children.length;
			var pos = node.getPosition();
			var box = node.getBox();

			children.length && children.forEach(function (child) {
				var direct = child.direct;
				var childPos = child.getPosition();
				var childBox = child.getBox();

				let _stroke = child.stroke || stroke || 'rgb(160,160,160)';

				if (direct == 'right') {
					var from = {
						x: pos.x + box.width,
						y: pos.y + box.height / 2
					};
					var to = {
						x: childPos.x,
						y: childBox.height / 2 + childPos.y
					};

				} else {
					var from = {
						x: pos.x,
						y: pos.y + box.height / 2
					}
					var to = {
						x: childPos.x + childBox.width,
						y: childBox.height / 2 + childPos.y
					};
				}



				if (len == 1) {
					var point = [
						[from.x, from.y],
						[to.x, to.y]
					];
				} else {
					var type = to.y < from.y ? 'top' : 'bottom';
					if (direct == 'right') {
						if (type == 'top') {
							var p1 = [from.x, from.y];
							var p2 = [from.x + dis / 2, from.y];
							var p5 = [to.x, to.y];
							if (child.isFirst()) {
								var p3 = [from.x + dis / 2, to.y + 2];
								var p4 = [from.x + dis / 2 + 2, to.y];
								var point = [p1, p2, p3, p4, p5];
							} else {
								var p4 = [from.x + dis / 2, to.y];
								var point = [p1, p2, p4, p5];
							}

						} else {
							var p1 = [from.x, from.y];
							var p2 = [from.x + dis / 2, from.y];
							var p5 = [to.x, to.y];
							if (child.isLast()) {
								var p3 = [from.x + dis / 2, to.y - 2];
								var p4 = [from.x + dis / 2 + 2, to.y];
								var point = [p1, p2, p3, p4, p5];
							} else {
								var p4 = [from.x + dis / 2, to.y];
								var point = [p1, p2, p4, p5];
							}

						}
					} else {

						if (type == 'top') {
							var p1 = [from.x, from.y];
							var p2 = [from.x - dis / 2, from.y];
							var p5 = [to.x, to.y];
							if (child.isFirst()) {
								var p3 = [from.x - dis / 2, to.y + 2];
								var p4 = [from.x - dis / 2 - 2, to.y];
								var point = [p1, p2, p3, p4, p5];
							} else {
								var p4 = [from.x - dis / 2, to.y];
								var point = [p1, p2, p4, p5];
							}


						} else {
							var p1 = [from.x + 1, from.y];
							var p2 = [from.x - dis / 2, from.y];
							var p5 = [to.x, to.y];
							if (child.isLast()) {
								var p3 = [from.x - dis / 2, to.y - 2];
								var p4 = [from.x - dis / 2 - 2, to.y];
								var point = [p1, p2, p3, p4, p5];
							} else {
								var p4 = [from.x - dis / 2, to.y];
								var point = [p1, p2, p4, p5];
							}

						}
					}
				}
			
				var line = me.group.polyline(me.linePoint(point, lineWidth));
				line.fill('none');
				line.stroke({
					color: _stroke,
					width: lineWidth,
					linecap: 'round',
					linejoin: 'round'
				});
				child.line = line;
			
				createLine(child);
			});
		}

		root.children.forEach(c => {
			createLine(c);
			createLayoutLine(c);
		});

		function createLayoutLine(node) {
			if (node.isExpand()) {
				if (node.layout) {
					node.layout.createLink();
					return;
				}
				node.children.forEach(c => {
					createLayoutLine(c);
				});
			}
		}

	}
}