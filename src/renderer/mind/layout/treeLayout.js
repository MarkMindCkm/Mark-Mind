import Layout from './layout';
export default class TreeLayout extends Layout {
	constructor(isCache = true) {
		super()
		this.cache = {};
		this.type = 'tree';
		this.layoutName = "tree";
		this.dis = 10;
		this.levelDis = 30;
		this.firstLevel = 60;
		this.direct = 'down';
		this.isCache = isCache;
		this._t = +new Date();
	}

	layout(node, direct) {
		if (direct == 'down' || direct == 'top') {
			this.direct = direct
		} else {
			this.direct = 'down';
		}
		this.root = node;
		node.layout = this;
		
		if (!this.root.parent) {
			this.root.dom.classList.add('node-root');
		}
		if (!this.group) this.group = this.root.getMind().edgeGroup.group();
		
		this._doLayout(node);
		
		this.doLayout(node);
		
		if (this.root.data && this.root.nodeType != 'induce') {
			this.refreshLayout();
		}

	

		this._updateRootAssist();
	}
	_doLayout(node) {
		var me = this;
		var levelDis = this.levelDis;
		var box = node.getBox();
		var pos = node.getPosition();
		node.dom.classList = [];
		node.dom.classList.add('node');
		node.dom.classList.add('node-' + this.direct);
		node.direct = this.direct;
		if (node.belongInduce) {
			node.dom.classList.add('node-induce');
		}

		if (node.isLeaf() && !node.dom.classList.contains('node-leaf')) {
			node.dom.classList.add('node-leaf');
		} else {
			if (node.dom.classList.contains('node-leaf')) {
				node.dom.classList.remove('node-leaf')
			}
		}


		if (node.getLevel() == 0) {
			levelDis = this.firstLevel;
		}

		let w = 0;
		node.getChildren().forEach(function (child) {
			let childBox = child.getBox();
			w = w + childBox.width + me.dis;
		});
		if (node.getChildren().length) {
			w = w - this.dis;
		}
		if (this.direct == 'down') {
			let y = pos.y + box.height + levelDis;
			let firstX = (pos.x + box.width / 2) - w / 2;
			let nextX = 0;
			node.getChildren().forEach(function (child, i) {
				if (child.callout) {
					child.callout.refresh();
				}
			
				let childBox = child.getCBox();

				
				var t = y + childBox.th;

				if (i == 0) {
					child.setPosition(firstX, t);
					nextX = firstX + childBox.width + me.dis;
				} else {
					child.setPosition(nextX, t);
					nextX = nextX + childBox.width + me.dis;
				}
			});

		} else {

			let y = pos.y - levelDis;
			let firstX = (pos.x + box.width / 2) - w / 2;
			let nextX = 0,
				nextY = 0;
			node.getChildren().forEach(function (child, i) {
				
				if (child.callout) {
					child.callout.refresh();
				}
				if (child.wireFrame) {
					child.wireFrame.refresh();
				}
				let childBox = child.getCBox();
				if (i == 0) {
					child.setPosition(firstX, y - childBox.height - childBox.bh);
					nextX = firstX + childBox.width + me.dis;
				} else {
					child.setPosition(nextX, y - childBox.height - childBox.bh);
					nextX = nextX + childBox.width + me.dis;
				}
			});
		}

		if (this.direct == 'down') {
			if (node.layout && node != this.root) {
				node.layout.layout(node, node.layout.direct || '');
				
				var mind = node.getMind();
				var box = mind.getBBox(node);
				var th = node.getCBox().th;

				var dy = Math.abs(Math.abs(pos.y - box.y) - th);
				this.moveNode(node, 0, dy);

				node.boundingRect = null;
				node.direct = 'down';

				return;
			}
		}

		if (node.isExpand()) {
			node.getChildren().forEach(function (child, i) {
			
				me._doLayout(child);
				
			});
		}


	}

	doLayout(node) {

		if (!node) {
			return
		}
		if (!node.isExpand()) return;

		var me = this;
		var mind = node.getMind();

		mind.traverseDF(n => {
			if (n == me.root) return;
		
			if (!n.isShow()) {
				return
			}
	
			if (n.layout) {
				if ((n.layout != me) && (n.getTopLayout() != me)) {
					return;
				}
			} else {
				if (n.getLayout() != me && me.direct == 'down') return;
			}

			if (n.callout && n.callout.isShow) {
				n.callout.refresh();
			}
			
			var topInfo = {};


			var p = n.parent;
			if (p) {
				var wfs = p.wireFrames;
				var summaries = p.summaries;
				wfs.length && wfs.forEach((wf) => {

					if (wf.node == n) {
						wf.refreshNode();
						wf.refresh();
						if (wf.data && wf.data.text) {
							if (topInfo[n.getId()]) {
								topInfo[n.getId()].rangeNode = topInfo[n].rangeNode.concat(wf.rangeNode.slice());
								topInfo[n.getId()].rangeNode.unique();
							} else {
								var topDy = wf.getTextBox().height;
								var rn = wf.rangeNode.slice();
								topInfo[n.getId()] = {
									node: n,
									wf: wf,
									topDy: topDy + 4,
									rangeNode: rn
								};
							}
						}
					}
				});

				summaries.length && summaries.forEach(ind => {
					if (ind.node == n) {
						ind.refreshNode();
						ind.refresh();
					}
				});
			}

			var box = n.getBox();

			if (me.isCache && n.boundingRect) {
				var cbox = n.boundingRect;
			} else {
				var list = n.getShowNodeList();
				var wf = [],
					induces = [],
					callouts = [],
					layout = [];
				list.forEach(ns => {
					if (ns.callout && ns.callout.isShow) {
						callouts.push(ns.callout)
					
					}
				
					if (ns.layout && ns.layout.isShow) {
					
						layout.push(ns.layout);
					
					}

					var wfs = ns.wireFrames;
					var summaries = ns.summaries;
				
					summaries.forEach(su => {
						if (su.isShow()) {
							induces.push(su);
						}
					})
					wfs.forEach(w => {
						if (!w.isHide) {
							wf.push(w);
						}
					});
				});
				wf.unique();
				induces.unique();


				list = list.concat(wf).concat(callouts);

				induces.forEach(ind => {
					list = list.concat(ind.getAllItem());
				});

			
				if (list.length) {
					var cbox = mind.getBoundingRect(list);
				
					if (layout.length) {
					
						layout.forEach(g => {
						
							if (g.layoutName == 'fish' && me.direct == 'down') {
								if (g.direct == 'right') {
									g.creatBone()
								} else {
									g.creatBone1();
								}
								if (g.fishTail) {
									var b = g.fishTail.bbox();
									if (b.x < cbox.x) {
										cbox.x = b.x
									}
									if (b.y < cbox.y) {
										cbox.y = b.y
									}
									if (b.x + b.width > cbox.right) {
										cbox.right = b.x + b.width;
									}
									if (b.y + b.height > cbox.bottom) {
										cbox.bottom = b.y + b.height;
									}
									cbox.width = cbox.right - cbox.x;
									cbox.height = cbox.bottom - cbox.y;
								}
							}
						});
					}
				}
			}

		
			if (me.isCache && n.boundingRect) {
				var leftDx = n.boundingRect.leftDx,
					rightDx = n.boundingRect.rightDx;
			} else {
				var leftDx = Math.abs(cbox.x - box.x);
				var rightDx = Math.abs(cbox.right - box.x - box.width);

				var tobj = {},
					bobj = {};

				if (wfs && wfs.length) {
					wfs.forEach(wf => {
						var leftNode = wf.leftNode;

						if (wf.node == n) {
							if (tobj[leftNode]) {
								return
							} else {
								tobj[leftNode] = true;
							}

							leftDx += 6;
						
						}

						if (wf.endNode && wf.endNode == n) {

							var rightNode = wf.rightNode;
							if (bobj[rightNode]) {
								return
							} else {
								bobj[rightNode] = true;
							}

						
							rightDx += 6;

						}
					});
				}

			

				cbox.leftDx = leftDx;
				cbox.rightDx = rightDx;
				n.boundingRect = cbox;
			}
			me.adjustNode(n, leftDx, rightDx, 0);

			if (n.direct !== 'top') {
				for (let item in topInfo) {
					me.adjustNode(item.node, 0, 0, topInfo[item].topDy, topInfo[item]);
				}
			}

			if (wfs && wfs.length) {
			
				wfs.forEach(wf => {
					if (wf.endNode == n) {
						wf.refresh();
					}
				});
			}

			if (summaries && summaries.length) {
				summaries.forEach(wf => {
					if (wf.endNode == n) {
						wf.refresh();
					}
				});
			}
			//  }

		}, node);


	}

	adjustNode(node, dx1, dx2, dy, item) {

		var me = this;

		if (item) {

			item.rangeNode.forEach(n => {
				if (me.direct == 'down') {
					me.moveNode(n, 0, dy);
				} else {
					me.moveNode(n, 0, -dy);
				}
			});
			return;
		}

		if (node && node != this.root) {
			var pos = node.getPosition();
			var siblings = node.getSiblings();
			siblings.forEach(function (sib) {
				let sibPos = sib.getPosition();
				if (pos.x > sibPos.x) {
					me.moveNode(sib, -dx1, 0);
				} else {
					me.moveNode(sib, dx2, 0);
				}
			});


		}

	}

	refreshLayout() {
		var root = this.root;
		var rootPos = root.getPosition();
		var rootBox = root.getBox();
		var center = rootPos.x + rootBox.width / 2;
		var children = root.getChildren();
		if (children.length >= 2) {
			var firstNode = children[0];
			var lastNode = children[children.length - 1];
			var firstPos = firstNode.getPosition();
			var lastPos = lastNode.getPosition();
			var lastBox = lastNode.getBox();
			var dis1 = lastPos.x + lastBox.width - center;
			var dis2 = center - firstPos.x;
			if (Math.abs(dis1) != Math.abs(dis2)) {
				var dx = Math.abs(Math.abs(dis1) - Math.abs(dis2)) / 2;
				if (Math.abs(dis1) > Math.abs(dis2)) {
					children.forEach(c => {
						this.moveNode(c, -dx, 0)
					});
				} else {
					children.forEach(c => {
						this.moveNode(c, dx, 0)
					});
				}
			}
		}

	}

	createLink() {
		if (this.direct == 'down') {
			this.createDownLink();
		} else {
			this.createUpLink();
		}
	}


	refresh() {
		var root = this.root;
		var nodeList = root.getNodeList();
		nodeList.forEach(function (node, i) {
			if (i != 0) {
				node.setPosition(0, 0);
			}
		});
		this.layout(root, this.direct);
		this.createLink();
	}
}