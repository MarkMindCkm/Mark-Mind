const transferData=(list)=>{
    var data=null;
    var obj={};
    list.forEach(function(d){
        obj[d.id]=[];
        if(!d.pid){
            data=d;
            data.children=[];
        }else{
            d.children=[];
        }
    });
    
    list.forEach(function(d){
        if(d.pid){
            obj[d.pid].push(d);
        }
        for(var key in obj){
            if(key==d.id){
                d.children=obj[key]
            }
        }
    });
    return data;
}

export default transferData;