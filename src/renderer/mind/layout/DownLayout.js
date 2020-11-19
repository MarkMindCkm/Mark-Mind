import layout from './layout';
import theme from '../theme'

export default class DownLayout extends layout {
  constructor() {
    super();
    this.layoutName = 'down';
    this.firstLevelDis = 30;
    this.dis = 10;
  }

  layout(node, direct) {
    this.root = node || this.root;
    this.direct = direct || '';
    this.root.layout = this;
    if (!this.group) this.group = this.root.getMind().edgeGroup.group();
    this._layoutTwoLevel(this.root);
    this._updateRootAssist();
  }

  _layoutTwoLevel(node) {
    var w = 0;
    var me = this;
    node.getChildren().forEach(function (child) {
      var childBox = child.getBox();
      w = w + childBox.width;
    });
    w = w + (node.getChildren().length - 1) * me.dis;

    var pos = node.getPosition();
    var box = node.getBox();

    var firstPoint = {
      x: pos.x + box.width / 2 - w / 2,
      y: pos.y + box.height + me.firstLevelDis
    };

    node.getChildren().forEach(function (child, index) {
      if (index == 0) {
        child.setPosition(firstPoint.x, firstPoint.y);
      } else {
        var prevPos = node.getChildren()[index - 1].getPosition();
        var prevBox = node.getChildren()[index - 1].getBox();
        child.setPosition(prevPos.x + prevBox.width + me.dis, firstPoint.y);
      }
    });

    node.getChildren().forEach(function (child) {
      me._doLayout(child);
    });

    var w = 0;
    if (node.getChildren().length <= 1) {
      return;
    }
    var mind = this.root.getMind();
    node.getChildren().forEach(function (child) {
      var box = mind.getBoundingRect(child.getShowNodeList());
      if (child.isLast()) {
        w = w + box.width / 2;
      } else {
        w = w + box.width;
      }
    });

    w = w + (node.getChildren().length - 1) * 30;
    var firstPoint = {
      x: pos.x + box.width / 2 - w / 2,
      y: pos.y + box.height + me.firstLevelDis
    };

    node.getChildren().forEach((child, index) => {
      if (index == 0) {
        var childPos = child.getPosition();
        var dx = firstPoint.x - childPos.x;
        me.moveNode(child, dx, 0);
      } else {
        var prevNodeBox = mind.getBoundingRect(node.getChildren()[index - 1].getShowNodeList());
        var prevNodePos = node.getChildren()[index - 1].getPosition();
        var childPos = child.getPosition();
        var x = prevNodePos.x + prevNodeBox.width + 20;
        var dx = x - childPos.x;
        me.moveNode(child, dx, 0);
      }

      // minder.updateAssist()
      //this.root.getMinder().updateAssist();
    });

  }

  _doLayout(node) {
    var me = this;
    var pos = node.getPosition();
    var box = node.getBox();
    // var maxWidth=me._getMaxWidthFromSameLevel(node);
    var x = pos.x + box.width / 3 + this.dis;
    var y = pos.y + box.height + this.dis;
    var children = node.getChildren();

    children.forEach(function (child, index) {
      if (index == 0) {
        if (child.wireFrame) {
          var tbox = child.wireFrame.getTextBox();
          child.setPosition(x, y + tbox.height + 8);
        } else {
          child.setPosition(x, y);
        }
      } else {
        var prevNode = children[index - 1];
        var prevNodePos = prevNode.getPosition();
        var prevNodeBox = prevNode.getBox();
        if (child.wireFrame) {
          var tbox = child.wireFrame.getTextBox();
          child.setPosition(x, prevNodePos.y + prevNodeBox.height + me.dis + tbox.height + 8);
        } else {
          child.setPosition(x, prevNodePos.y + prevNodeBox.height + me.dis);
        }
      }
      me._adjustNode(child);
    });

    children.forEach(function (child) {
      if (!child.isExpand()) {
        return
      }
      me._doLayout(child);
    });

  }

  _getTwoNode(node) {
    var filterNode = null
    if (node.getLevel() == 1) {
      return node;
    } else {
      while (node.getLevel() > 0) {
        if (node.getLevel() == 1) {
          filterNode = node;
        }
        node = node.getParent();
      }
    }
    return filterNode;
  }

  _getMaxWidthFromSameLevel(node) {
    var level = node.getLevel();
    var node = this._getTwoNode(node);
    var maxWidth = 0
    node.getNodeList().forEach(function (n) {
      if (n.getLevel() == level) {
        var box = n.getBox();
        if (box.width > maxWidth) {
          maxWidth = box.width;
        }
      }
    });
    return maxWidth;
  }

  _adjustNode(node) {
    var me = this;
    var parent = node.getParent();
    var pos = parent.getPosition();
    var box = node.getBox();

    while (parent.getLevel() > 1) {
      var siblings = parent.getSiblings();
      siblings.forEach(function (sib) {
        var sibPos = sib.getPosition();
        if (pos.y < sibPos.y) {
          me.moveNode(sib, 0, box.height + me.dis);
        }
      });
      parent = parent.getParent();
    }
  }

  createLink() {
    var me = this;
    var minder = this.root.getMind();

    this.group && this.group.clear();

    let config = theme.use().config;
    let stroke = config['stroke'];
    let lineWidth = config['lineWidth'];


    var root = this.root;
    var rootPos = root.getPosition();
    var rootBox = root.getBox();
    var rootCenter = {
      x: rootPos.x + rootBox.width / 2,
      y: rootPos.y + rootBox.height / 2
    }
    root.getChildren().forEach(function (child) {
      var childPos = child.getPosition();
      var childBox = child.getBox();
      var childcenter = {
        x: childPos.x + childBox.width / 2,
        y: childPos.y + childBox.height / 2
      };

      //    stroke=child.stroke||stroke||'rgb(160,160,160)';

      if (root.getChildren().length == 1) {

        var line = me.group.line(rootPos.x + rootBox.width / 2, rootPos.y + rootBox.height, childPos.x + childBox.width / 2, childPos.y)
          .stroke({
            color: stroke,
            width: lineWidth,
            linecap: 'round',
            linejoin: 'round'
          });
      } else {
        var fromPoint = [rootPos.x + rootBox.width / 2, rootPos.y + rootBox.height];
        var transPoint = [rootPos.x + rootBox.width / 2, rootPos.y + rootBox.height + me.firstLevelDis / 2];
        var toPoint = [childPos.x + childBox.width / 2, childPos.y];
        if (child.isFirst() || child.isLast()) {
          if (fromPoint[0] > toPoint[0]) {
            var transPoint1 = [childPos.x + childBox.width / 2 + 2, rootPos.y + rootBox.height + me.firstLevelDis / 2];
            var transPoint2 = [childPos.x + childBox.width / 2, rootPos.y + rootBox.height + me.firstLevelDis / 2 + 2];
          } else {
            var transPoint1 = [childPos.x + childBox.width / 2 - 2, rootPos.y + rootBox.height + me.firstLevelDis / 2];
            var transPoint2 = [childPos.x + childBox.width / 2, rootPos.y + rootBox.height + me.firstLevelDis / 2 + 2];
          }
          var points = [fromPoint, transPoint, transPoint1, transPoint2, toPoint];
        } else {
          var transPoint = [childPos.x + childBox.width / 2, rootPos.y + rootBox.height + me.firstLevelDis / 2];
          var points = [transPoint, toPoint];
        }


        var line = me.group.polyline(me.linePoint(points, lineWidth));
        line.fill('none');
        line.stroke({
          color: stroke,
          width: lineWidth,
          linecap: 'round',
          linejoin: 'round'
        });
      }
      createLine(child);
    });

    function createLine(node) {
      if (!node.isExpand()) {
        return;
      }
      var box = node.getBox();
      var pos = node.getPosition();
      var fromPoint = [parseInt(pos.x + box.width / 3), parseInt(pos.y + box.height)];
      node.getChildren().forEach(function (child) {
        var childBox = child.getBox();
        var childPos = child.getPosition();
        var toPoint = [parseInt(childPos.x), parseInt(childPos.y + childBox.height / 2)];
        var transPoint = [fromPoint[0], toPoint[1]];
        //  let theme=me.getConfig();
        // if(theme){
        //   var  stroke=theme.data.lineColor;
        // }else{
        //  stroke=stroke||child.stroke||'rgb(160,160,160)';;
        //}

        if (child.isLast()) {
          var points = [fromPoint, [fromPoint[0], transPoint[1] - 2],
            [fromPoint[0] + 2, transPoint[1]], toPoint
          ]
          // var points= []
        } else {
          var points = [transPoint, toPoint]
        }

        var line = me.group.polyline(me.linePoint(points, lineWidth));
        line.fill('none');
        line.stroke({
          color: stroke,
          width: lineWidth,
          linecap: 'round',
          linejoin: 'round'
        });
        createLine(child);
      });
    }

  }


  refresh() {
    var root = this.root;
    // root.getNodeList().forEach(function(child){
    // 	child.setPosition(0,0);
    // });
    this.layout(root, this.direct);
    this.createLink();
  }
}