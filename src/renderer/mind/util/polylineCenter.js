//get polyline center
//https://rbrundritt.wordpress.com/2008/10/14/calculating-the-midpoint-of-a-line-segment/
//https://rbrundritt.wordpress.com/2008/10/14/calculate-midpoint-of-polyline/

function polylineCenter(points){   
    var totalDistance = PolylineLength(points);
    var midpoint = FindMidPoint(points,totalDistance);   
    return midpoint;
};
   
function PolylineLength(points){   
    var distance = 0;
    for(var i=0;i<points.length-1;i++){       
        distance += haversineDistance(points[i],points[i+1]);   
    }
    return distance;
};
   
function FindMidPoint(points,totalDistance){ 
        var midDistance = totalDistance/2;
        var distance = 0;   
        var subDistance = 0;   
        var i;

        for(i=0;i<points.length-1;i++){       
            subDistance = haversineDistance(points[i],points[i+1]);
            if(subDistance+distance<midDistance) {
                distance += subDistance;       
            }          
            else{
                break;   
            }
        }
        return [(points[i][0]+points[i+1][0])/2,(points[i][1]+points[i+1][1])/2];
   };

   function haversineDistance(p1,p2){
       var dx=p1[0]-p2[0];
       var dy=p1[1]-p2[1];
       return Math.sqrt(dx*dx+dy*dy);
   };

   export default polylineCenter;


