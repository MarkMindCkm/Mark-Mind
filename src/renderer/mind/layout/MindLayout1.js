import MindLayout from './MindLayout';
import theme from '../theme'

export default class MindLayout1 extends MindLayout {
	constructor() {
		super();
		this.firstLevelDis = 50;
		this.levelDis = 30;
		this.nodeDis = 10;
		this.type = 'minder';
		this.layoutName = "minder1";
	}

	createLink() {
		var me = this;
		var dis = this.levelDis;
		var directName = this.direct;
		this.group && this.group.clear();
		var root = this.root;
		if (!this.group) {
			return
		}

		var c = theme.use().config;
		var stroke = c['stroke'];
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
			var len = children.length;
			var pos = node.getPosition();
			var box = node.getBox();
			var level = node.getLevel();

			children.length && children.forEach(function (child) {
				var direct = child.direct;
				var childPos = child.getPosition();
				var childBox = child.getBox();

				let _stroke = child.stroke || stroke || 'rgb(160,160,160)';
				if (level == rootLevel) {
					if (directName == 'minder') {
						if (direct == 'right') {
							var from = {
								x: pos.x + box.width / 2,
								y: pos.y + box.height / 2
							};
							var to = {
								x: childPos.x,
								y: childBox.height / 2 + childPos.y
							};
						} else {
							var from = {
								x: pos.x + box.width / 2,
								y: pos.y + box.height / 2
							};
							var to = {
								x: parseInt(childPos.x + childBox.width),
								y: parseInt(childBox.height / 2 + childPos.y)
							};
						}
					} else {
						var from = {
							x: pos.x + box.width / 2,
							y: pos.y + box.height / 2
						};
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
					}

				} else {
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
				}

				if (level == rootLevel) {

					var line = me.group.path();
				} else {
				
					var line = me.group.polyline();

				}

				line.fill('none');
				line.stroke({
					color: _stroke,
					width: lineWidth,
					linecap: 'round',
					linejoin: 'round'
				});


				if (level == rootLevel) {
					if (direct == 'right') {
						var cpx1 = parseInt((from.x + to.x) / 2 - 30);
						var cpy1 = parseInt(from.y + (to.y - from.y) / 1.1);
						var pathStr = `M ${from.x} ${from.y} Q ${cpx1 } ${cpy1},${to.x} ${to.y} `;
						line.plot(pathStr);
					} else {
						var cpx1 = parseInt((from.x + to.x) / 2 + 30);
						var cpy1 = parseInt(from.y + (to.y - from.y) / 1.1);
						var pathStr = `M ${from.x} ${from.y} Q ${cpx1} ${cpy1},${to.x} ${to.y} `;
						line.plot(pathStr);
					}
				} else {
					var type = to.y < from.y ? 'top' : 'bottom';
					if (len == 1) {
						var point = [
							[from.x, from.y],
							[to.x, to.y]
						]
					} else {

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
									var point = [p4, p5];
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
									var point = [p4, p5];
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
									var point = [p4, p5];
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
									var point = [p4, p5];
								}

							}
						}
					}


					line.plot(me.linePoint(point, lineWidth));

				}
				var lineData = {
					from: node,
					to: child
				};
				line.lineData = lineData;
				createLine(child);
			});

		}

		createLine(root);

		root.children.forEach(c => {
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