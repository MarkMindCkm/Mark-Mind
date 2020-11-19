class Layout {
    constructor(name) {
        this.name = name;
        this.edges = [];
        this.isShow = true;
        this.linkWeight = true; //默认开启 线条渐细
    }

    layout() {}
    refresh() {}
    addEdge(edge) {
        this.edges.push(edge);
    }
    removeEdge(edge) {
        var index = this.edges.indexOf(edge);
        if (index > -1) {
            this.edges.splice(index, i);
        }
    }

    moveNode(node, dx, dy) {
        node && node.move(dx, dy);

        if (node.callout) {
            node.callout.refresh();
        }

        if (node.wfs) {
            node.wfs.forEach(wf => {
                wf.move(dx, dy);
            });
        }

        if (node.induces) {
            node.induces.forEach((induce) => {
                induce.move(dx, dy);
                this.moveNode(induce.root, dx, dy);
            })
        }

        node && node.children.forEach((child) => {
            this.moveNode(child, dx, dy);
        });

    }
    linePoint(arr, lineWidth) {
        let num = 0;
        var func = Math.ceil;
        if (lineWidth % 2 == 1) {
            num = 0.5
            func = parseInt;
        }
        var p = arr.map((item) => {
            return [func(item[0]) + num, func(item[1]) + num]
        });
        return p;
    }
    _updateNodeAssist(node, root) {
        var anchor = node;

        while (anchor) {
            if (anchor.callout) {
                anchor.callout.refresh()
            }
        
            var wfs = anchor.wireFrames;
            var summaries = anchor.summaries;
            wfs.length && wfs.forEach((wf) => {
                if (wf.items.indexOf(node) > -1) {
                    wf.refreshNode();
                    wf.refresh();
                }
               
            });

            summaries.length && summaries.forEach(ind => {
                if (ind.items.indexOf(node) > -1) {
                    ind.refreshNode();
                    ind.refresh();
                }
            });

            if (root) {
                if (anchor != root) {
                    anchor = anchor.parent;
                } else {
                    break;
                }
            } else {
                anchor = anchor.parent;
            }
        }

    }
    _updateRootAssist() {
       
        if (this.root.induce) {
            this.root.induce.refreshItems();
            this.root.induce.refresh();
        }

        if (this.root.wireFrame) {
            this.root.wireFrame.refreshItems();
            this.root.wireFrame.refresh();
        }
    }
}

export default Layout;