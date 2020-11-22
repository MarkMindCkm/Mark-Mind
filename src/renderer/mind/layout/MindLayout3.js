import MindLayout from './MindLayout';
import {
	theme
} from '../config'

export default class MindLayout3 extends MindLayout {
	constructor() {
		super();
		this.firstLevelDis = 80;
		this.levelDis = 30;
		this.nodeDis = 10;
		this.type = 'minder';
		this.layoutName = "minder3";
	}

	createLink() {
		
		var me = this;
		var dis = this.levelDis;

		if (!this.group) {
			return
		}

		this.group && this.group.clear();
		var root = this.root;
		var c = theme.use().config;
		var stroke = c['stroke'] || '#666';
		var lineWidth = c['lineWidth'];

		var rootLevel = this.root.getLevel();


		function createLine(node) {
			if (node == me.root) {

			} else {
				if (node.layout) {
					return;
				}
			}
			if (!node.isExpand()) {
				return;
			}
			var children = node.getChildren();
			var pos = node.getPosition();
			var box = {
				...node.getBox()
			};
			box.height = box.height + lineWidth;
			var level = node.getLevel();

			children.length && children.forEach(function (child) {
				var direct = child.direct;
				var childPos = child.getPosition();
				var childBox = {
					...child.getBox()
				};
				childBox.height = childBox.height + lineWidth;
				let _stroke = child.stroke || stroke || 'rgb(160,160,160)';
				if (level == rootLevel) {
					var from = {
						x: pos.x + box.width / 2,
						y: pos.y + box.height / 2
					};
				} else if (level == 1 + rootLevel) {
					if (direct == 'right') {
						var from = {
							x: pos.x + box.width,
							y: pos.y + box.height / 2
						};
					} else {
						var from = {
							x: pos.x,
							y: pos.y + box.height / 2
						}
					}

				} else {
					if (direct == 'right') {
						var from = {
							x: pos.x + box.width,
							y: pos.y + box.height
						};
					} else {
						var from = {
							x: pos.x,
							y: pos.y + box.height
						};
					}
				}

				if (level == rootLevel) {
					if (direct == 'right') {
						var to = {
							x: childPos.x,
							y: childBox.height / 2 + childPos.y
						};
					} else {
						var to = {
							x: childPos.x + childBox.width,
							y: childBox.height / 2 + childPos.y
						};
					}
				} else {
					if (direct == 'right') {
						var to = {
							x: childPos.x,
							y: childBox.height + childPos.y
						};
					} else {
						var to = {
							x: childPos.x + childBox.width,
							y: childBox.height + childPos.y
						};
					}
				}


				if (lineWidth % 2 == 1) {

					var x1 = parseInt(from.x) - 0.5;
					var x2 = parseInt(to.x) - 0.5;

					var y1 = parseInt(from.y) - 0.5;
					var y2 = parseInt(to.y) - 0.5;
				} else {
					var x1 = parseInt(from.x);
					var y1 = parseInt(from.y);
					var x2 = parseInt(to.x);
					var y2 = parseInt(to.y);
				}
				if (level == rootLevel) {

					var line1 = me.group.path().stroke({
						color: _stroke,
						width: lineWidth + 1,
						linecap: 'round',
						linejoin: 'round'
					}).fill('none');
				} else {
					var line1 = me.group.path().stroke({
						color: _stroke,
						width: lineWidth,
						linecap: 'round',
						linejoin: 'round'
					}).fill('none');
				}

				if (lineWidth % 2 == 1) {
					var x11 = parseInt(childPos.x) - 0.5;
					var x22 = parseInt(childPos.x + childBox.width) - 0.5;

					var y11 = y2;
					var y22 = y2;

				} else {
					var x11 = parseInt(childPos.x)
					var y11 = parseInt(childBox.height + childPos.y)
					var x22 = parseInt(childPos.x + childBox.width)
					var y22 = parseInt(childBox.height + childPos.y)
				}

				if (level == rootLevel) {
					
					var cpx1 = parseInt(from.x) + (to.x - from.x) / 9;
					var cpy1 = parseInt(from.y) + (to.y - from.y) / 9 * 8;
					var cpx2 = parseInt(from.x + (to.x - from.x) / 9 * 8);
					var cpy2 = parseInt(to.y);


					var pathStr = `M${x1} ${y1}  C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${x2} ${y2}`;
					line1.plot(pathStr);

				} else {

					me.group.line(x11, y11, x22, y22).stroke({
						color: _stroke,
						width: lineWidth,
						linecap: 'miter',
						linejoin: 'miter'
					}).fill('none');

					var c = parseInt((to.y - from.y) / 6);
					var cpx1 = {
						x: from.x + dis / 2,
						y: from.y
					}
					var cpx2 = {
						x: from.x + dis / 2,
						y: to.y
					}
					if (direct == 'left') {
						cpx1.x = from.x - dis / 2;
						cpx2.x = from.x - dis / 2;
					}

					cpx1.x = parseInt(cpx1.x);
					cpx1.y = parseInt(cpx1.y);
					cpx2.x = parseInt(cpx2.x);
					cpx2.y = parseInt(cpx2.y);

					var path = `M${x1} ${y1}  C ${cpx1.x} ${cpx1.y}, ${cpx2.x} ${cpx2.y}, ${x2} ${y2}`;

					line1.plot(path);

				}

				createLine(child);
			});
		}

		createLine(root);

		me.root.children.forEach(c => {
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