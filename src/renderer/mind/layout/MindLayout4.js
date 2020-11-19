import MinderLayout from './MindLayout';
import {theme} from '../config'

export default class MindLayout4 extends MinderLayout {
	constructor() {
		super();
		this.firstLevelDis = 50;
		this.levelDis = 20;
		this.nodeDis = 10;
		this.type = 'minder';
		this.layoutName = "minder4";
	}

	createLink() {
		var me = this;
		var dis = this.levelDis;
		var directName = this.direct;
		var root = this.root;
		this.group && this.group.clear();
	

		if (!this.group) {
			return
		}

		var rootLevel = this.root.getLevel();

		var c = theme.use().config;
		var stroke = c['stroke'];
		var lineWidth = c['lineWidth'];

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
			var box = {
				...{},
				...node.getBox()
			};
			box.height = box.height + lineWidth;
			var level = node.getLevel();

			children.length && children.forEach(function (child) {
				var direct = child.direct;
				var childPos = child.getPosition();
				var childBox = {
					...{},
					...child.getBox()
				};
				childBox.height = childBox.height + lineWidth;

				let _stroke = child.stroke || stroke || 'rgb(160,160,160)';

				var a = 1,
					b = 2,
					c = 1,
					d = 2;

				if (level == rootLevel) {
					if (directName == 'minder') {
						if (direct == 'right') {
							var from = {
								x: pos.x + box.width * a / b,
								y: pos.y + box.height / 2
							};
						} else {
							var from = {
								x: pos.x + box.width * c / d,
								y: pos.y + box.height / 2
							};
						}
					} else {
						var from = {
							x: pos.x + box.width / 2,
							y: pos.y + box.height / 2
						};
					}

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


				if (level == rootLevel) {
				
					var polyon = me.group.path().stroke({
						color: _stroke,
						width: lineWidth,
						linecap: 'round',
						linejoin: 'round'
					}).fill(_stroke);
				} else {
				
					var line = me.group.polyline().stroke({
						color: _stroke,
						width: lineWidth,
						linecap: 'round',
						linejoin: 'round'
					}).fill('none');
				}

				if (level == rootLevel) {
					if (direct == 'right') {
						var cpx = from.x + Math.abs(to.x - from.x) / 8;
						var cpy = to.y;
						polyon.plot(`M${from.x},${from.y},Q${cpx},${cpy},${to.x},${to.y},Q${cpx+6},${cpy},${from.x+8},${from.y}z`);
					} else {
						var cpx = from.x - Math.abs(to.x - from.x) / 8;
						var cpy = to.y;
						polyon.plot(`M${from.x},${from.y},Q${cpx},${cpy},${to.x},${to.y},Q${cpx+6},${cpy},${from.x+8},${from.y}z`);
					}
				} else {
					var type = to.y < from.y ? 'top' : 'bottom';
					if (direct == 'right') {
						if (type == 'top') {
							if (len == 1) {
								var p1 = [from.x - 1, from.y];
								var p2 = [from.x + dis / 2, from.y];
								var p3 = [to.x, to.y];
								var p4 = [to.x + childBox.width + 1, to.y];
								if (level > 1) {
									if (Math.abs(p1[1] - p4[1]) > 2) {
										var p = [p1, p3, p4];
									} else {
										var p = [p1, p4];
									}
								} else {
									var p = [p1, p2, p3, p4]
								}
								line.plot(me.linePoint(p, lineWidth));

							} else {
								var p1 = [from.x, from.y];
								var p2 = [from.x + dis / 2, from.y];
								var p5 = [to.x + childBox.width, to.y];
								if (child.isFirst()) {
									var p3 = [from.x + dis / 2, to.y + 2];
									var p4 = [from.x + dis / 2 + 2, to.y];
									var point = [p1, p2, p3, p4, p5];
								} else {
									var p4 = [from.x + dis / 2, to.y];
									var point = [p4, p5];
								}
								
								line.plot(me.linePoint(point, lineWidth));
							}

						} else {
							if (len == 1) {
								var p1 = [from.x - 1, from.y];
								var p2 = [from.x + dis / 2, from.y];
								var p3 = [to.x, to.y];
								var p4 = [to.x + childBox.width + 1, to.y];
								if (level > 1) {
									if (Math.abs(p1[1] - p4[1]) > 2) {
										var p = [p1, p3, p4];
									} else {
										var p = [p1, p4];
									}
								} else {
									var p = [p1, p2, p3, p4]
								}
							
								line.plot(me.linePoint(p, lineWidth));
							} else {
								var p1 = [from.x, from.y];
								var p2 = [from.x + dis / 2, from.y];
								var p5 = [to.x + childBox.width, to.y];
								if (child.isLast()) {
									var p3 = [from.x + dis / 2, to.y - 2];
									var p4 = [from.x + dis / 2 + 2, to.y];
									var point = [p1, p2, p3, p4, p5];
								} else {
									var p4 = [from.x + dis / 2, to.y];
									var point = [p4, p5];
								}

								line.plot(me.linePoint(point, lineWidth));
							}
						}
					} else {

						var type = to.y < from.y ? 'top' : 'bottom';
						if (type == 'top') {
							if (len == 1) {
								var p1 = [from.x + 1, from.y];
								var p2 = [from.x - dis / 2, from.y];
								var p3 = [to.x, to.y];
								var p4 = [to.x - childBox.width - 1, to.y];
								if (level > 1) {
									if (Math.abs(p1[1] - p4[1]) > 2) {
										var p = [p1, p3, p4];
									} else {
										var p = [p1, p4];
									}
								} else {
									var p = [p1, p2, p3, p4]
								}

								line.plot(me.linePoint(p, lineWidth));

							} else {
								var p1 = [from.x, from.y];
								var p2 = [from.x - dis / 2, from.y];
								var p5 = [to.x - childBox.width, to.y];
								if (child.isFirst()) {
									var p3 = [from.x - dis / 2, to.y + 2];
									var p4 = [from.x - dis / 2 - 2, to.y];
									var point = [p1, p2, p3, p4, p5];
								} else {
									var p4 = [from.x - dis / 2, to.y];
									var point = [p4, p5];
								}
							
								line.plot(me.linePoint(point, lineWidth));
							}

						} else {
							if (len == 1) {
								var p1 = [from.x + 1, from.y];
								var p2 = [from.x - dis / 2, from.y];
								var p3 = [to.x, to.y];
								var p4 = [to.x - childBox.width - 1, to.y];
								if (level > 1) {
									if (Math.abs(p1[1] - p4[1]) > 2) {
										var p = [p1, p3, p4];
									} else {
										var p = [p1, p4];
									}
								} else {
									var p = [p1, p2, p3, p4]
								}
							
								line.plot(me.linePoint(p, lineWidth));
							} else {
								var p1 = [from.x + 1, from.y];
								var p2 = [from.x - dis / 2, from.y];

								var p5 = [to.x - childBox.width, to.y];
								if (child.isLast()) {
									var p3 = [from.x - dis / 2, to.y - 2];
									var p4 = [from.x - dis / 2 - 2, to.y];
									var point = [p1, p2, p3, p4, p5];
								} else {
									var p4 = [from.x - dis / 2, to.y];
									var point = [p4, p5];
								}
							
								line.plot(me.linePoint(point, lineWidth));
							}
						}

					}
				}

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
		};

	}


}