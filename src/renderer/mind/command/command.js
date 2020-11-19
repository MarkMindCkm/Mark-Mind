class Command {
    constructor(name) {
        this.name = name;
    }
    execute() { }
    undo() { }
    redo() {
        this.execute();
    }
    updateItems(node) {
        var anchor = node || this.parent;
        while (anchor) {
            if (anchor.wireFrames.length) {
                anchor.wireFrames.forEach(wf => {
                    wf.refreshItems();
                });
            }
            if (anchor.summaries.length) {
                anchor.summaries.forEach(ind => {
                    ind.refreshItems();
                });
            }

            if (anchor.belongInduce) {
                anchor = anchor.belongInduce.node;
            } else {
                anchor = anchor.parent;
            }
        }
    }

    refresh(node) {

        if (node) {
            var mind = node.getMind();

            mind.emit('refresh', { node });
        }

    }

}

export default Command;

