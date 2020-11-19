//Rectangles intersect ( Multiple select node )
var collideCheck = function(box1,box2) {
    var c1={
        x:box1.x+box1.width/2,
        y:box1.y+box1.height/2
    };

    var c2={
      x:box2.x+box2.width/2,
      y:box2.y+box2.height/2
    };

    var x1=Math.abs(c1.x-c2.x);
    var y1=Math.abs(c1.y-c2.y);

    if((x1<=box1.width/2+box2.width/2)&&(y1<box1.height/2+box2.height/2)){
        return true;
    }else{
        return false;
    }
}

export default collideCheck;